var Scene2d = require('../')

// create a scene
customElements.define('scene-2d', Scene2d)
var scene = document.createElement('scene-2d')
scene.addEventListener('select', () => console.log('scene selection state changed', scene.selections))
scene.addEventListener('scale', () => console.log('scene zoomed', scene.scale))
scene.addEventListener('move', () => console.log('scene panned', scene.origin))

// add scene to display
var reference = document.querySelector('#reference')
reference.appendChild(scene)

// define an object to use in the scene
customElements.define('object-2d', class extends HTMLElement {
  constructor () {
    super()
    this.origin = [0,0,0]
    this.touchable = true
    this.selectable = true
    this.addEventListener('origin', () => this.render())
    this.addEventListener('select', () => this.render())
    this.addEventListener('move', () => {
      console.log('object moved', this.origin)
    })
  }

  connectedCallback () {
    this.classList.add('object-2d')
    this.innerHTML = `<div id=handle></div>`
    var handle = this.querySelector('#handle')
    handle.touchable = true
    handle.movable = true
    handle.object = this
  }

  render () {
    this.classList[this.selected ? 'add' : 'remove']('selected')
    this.style.transform = `translate3d(${this.origin[0]}px,${this.origin[1]}px,${this.origin[2]}px)`
  }
})

// create and add some objects to the scene
scene.objects.appendChild(document.createElement('object-2d'))
scene.objects.appendChild(document.createElement('object-2d'))
scene.objects.appendChild(document.createElement('object-2d'))
