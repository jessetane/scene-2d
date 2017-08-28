# scene-2d
Multitouch capable 2d scene implementing pan, zoom and object selection.

## How
Synthesizing touch events from mouse events.

## Example
``` javascript
var Scene2d = require('scene-2d')

// create a scene
customElements.define('scene-2d', Scene2d)
var scene = document.createElement('scene-2d')
scene.addEventListener('select', () => console.log('scene selection state changed', scene.selections))
scene.addEventListener('zoom', () => console.log('scene zoomed', scene.zoom))
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
```

You can run this example by doing:
``` shell
$ npm run example
```

## API (scene)
This is the API for the scene itself, see the [object API](api-objects) below for individual objects.

## Properties

### `scene.origin`
Array of pixel offsets (e.g. `[x,y,z]`) representing the current pan position.

### `scene.zoom`
Current zoom scale.

### `scene.selections`
Array of all currently selected objects.

### `scene.objects`
Container element for all objects in the scene.

## Methods

### `scene.render()`
Writes the scene's current `origin` and `zoom` to the display.

## Events

### `scene.dispatchEvent(new Event('move'))`
Dispatched when a pan operation ends.

### `scene.dispatchEvent(new Event('zoom'))`
Dispatched when a zoom operation ends.

### `scene.dispatchEvent(new Event('select'))`
Dispatched when the scene's selection state has changed.

## API (objects)
Any elements you append to `scene.objects` may implement these properties or listen for these events.

## Properties

### `object.origin`
Array of pixel offsets (e.g. `[x,y,z]`) representing the object's current position. Required if `object.movable` is set to true `true`.

### `object.selected`
Boolean representing the object's selection state.

### `object.touchable`
Boolean indicating whether the element should be considered touchable by the scene.

### `object.movable`
Boolean indicating whether the element should be considered draggable by the scene.

### `object.object`
Pointer to another element that should be moved or selected rather than target itself. Useful for implementing a grip or handle interfaces.

## Events

### `object.dispatchEvent(new Event('origin'))`
Dispatched during a drag operation.

### `object.dispatchEvent(new Event('move'))`
Dispatched when a drag operation ends.

### `object.dispatchEvent(new Event('select'))`
Dispatched when the object's selection state has changed.

## Releases
* 1.0
  * First release

## License
MIT
