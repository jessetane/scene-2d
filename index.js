var css = `.scene-2d {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  user-select: none;
}

.scene-2d #zoom {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: 50% 50%;
  pointer-events: none;
}

.scene-2d #objects {
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: all;
  transform-style: preserve-3d;
}

.scene-2d .selection-window {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(204,224,255, 0.5);
  border: 0.05rem solid rgba(119,139,255, 0.5);
}`

var style = document.createElement('style')
style.innerHTML = css
document.head.appendChild(style)

var TouchableArea = require('./touchable-area')

module.exports = class Scene2d extends TouchableArea {
  constructor () {
    super()
    this.origin = [0,0,0]
    this.scale = 1
    this.scaleMax = 2
    this.scaleMin = 0.1
    this.touchable = true
    this.movable = true
    this.selections = []
    this.addEventListener('origin', () => this.render())
  }

  connectedCallback () {
    this.classList.add('scene-2d')
    this.innerHTML = `<div id=zoom>
  <div id=objects></div>
</div>`
    this.zoom = this.querySelector('#zoom')
    this.objects = this.querySelector('#objects')
    this.addEventListener('wheel', evt => {
      var scale = this.scale - evt.deltaY / 500
      if (scale < this.scaleMin) scale = this.scaleMin
      else if (scale > this.scaleMax) scale = this.scaleMax
      this.scale = scale
      this.render()
      clearTimeout(this.zoomDebounce)
      this.zoomDebounce = setTimeout(() => {
        this.dispatchEvent(new Event('scale'))
      }, 30)
    })
    this.addEventListener('pointerstart', evt => {
      var target = evt.target 
      if (target === this && evt.shiftKey) {
        evt.start.boundingRect = this.getBoundingClientRect()
        evt.start.selectionWindow = document.createElement('div')
        var sw = evt.start.selectionWindow
        sw.classList.add('selection-window')
        this.appendChild(sw)
      } else {
        var object = target.object || target
        if (object.selected) {
          evt.start.origin = this.selections.map(o => o.origin.slice())
        } else {
          evt.start.origin = [object.origin.slice()]
        }
      }
    })
    this.addEventListener('pointerchange', evt => {
      var target = evt.target
      var sw = evt.start.selectionWindow
      if (target === this && sw) {
        var w = Math.abs(evt.deltaX * this.scale)
        var h = Math.abs(evt.deltaY * this.scale)
        sw.style.width = w + 'px'
        sw.style.height = h + 'px'
        var br = evt.start.boundingRect
        var x = evt.start.clientX - br.left - (evt.deltaX < 0 ? w : 0)
        var y = evt.start.clientY - br.top - (evt.deltaY < 0 ? h : 0)
        sw.style.transform = `translate3d(${x}px,${y}px,0px)`
      } else if (evt.start.target.movable) {
        evt.start.moved = true
        var object = target.object || target
        var selections = object.selected ? this.selections : [object]
        selections.forEach((object, i) => {
          object.origin = [
            evt.start.origin[i][0] + evt.deltaX,
            evt.start.origin[i][1] + evt.deltaY,
            evt.start.origin[i][2]
          ]
          object.dispatchEvent(new Event('origin'))
        })
      }
    })
    this.addEventListener('pointerend', evt => {
      var target = evt.target
      if (target === this) {
        var sw = evt.start.selectionWindow
        if (sw) {
          var swRect = sw.getBoundingClientRect()
          Array.from(this.objects.children).forEach(object => {
            if (!object.selectable) return
            var oRect = object.getBoundingClientRect()
            if (!intersects(oRect, swRect)) return
            if (object.selected) {
              object.selected = false
              this.selections = this.selections.filter(o => o !== object)
            } else {
              object.selected = true
              this.selections.push(object)
            }
            object.dispatchEvent(new Event('select'))
          })
          sw.remove()
          this.dispatchEvent(new Event('select'))
        } else if (evt.start.moved) {
          this.dispatchEvent(new Event('move'))
        } else {
          this.selections = this.selections.filter(o => {
            o.selected = false
            o.dispatchEvent(new Event('select'))
            return false
          })
          this.dispatchEvent(new Event('select'))
        }
      } else {
        var object = target.object || target
        if (evt.start.moved) {
          var selections = object.selected ? this.selections : [object]
          selections.forEach(object => object.dispatchEvent(new Event('move')))
        } else if (object.selectable) {
          if (object.selected) {
            if (evt.start.shiftKey) {
              object.selected = false
              this.selections = this.selections.filter(o => o !== object)
            } else if (this.selections.length > 1) {
              this.selections = this.selections.filter(o => {
                if (o === object) return true
                o.selected = false
                o.dispatchEvent(new Event('select'))
              })
            } else {
              object.selected = false
              this.selections = []
            }
          } else {
            object.selected = true
            if (evt.start.shiftKey) {
              this.selections.push(object)
            } else {
              this.selections.forEach(o => {
                o.selected = false
                o.dispatchEvent(new Event('select'))
              })
              this.selections = [object]
            }
          }
          object.dispatchEvent(new Event('select'))
          this.dispatchEvent(new Event('select'))
        }
      }
    })
    this.render()
  }

  render () {
    this.zoom.style.transform = `scale(${this.scale})`
    this.objects.style.transform = `translate3d(${this.origin[0]}px,${this.origin[1]}px,0px)`
  }
}

function intersects (a, b) {
  return a.left <= b.right
    && b.left <= a.right
    && a.top <= b.bottom
    && b.top <= a.bottom
}
