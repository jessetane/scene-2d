module.exports = class TouchableArea extends HTMLElement {
  constructor () {
    super()
    this.pointers = {}
    this.scale = 1
    this.mousedown = this.mousedown.bind(this)
    this.mousemove = this.mousemove.bind(this)
    this.mouseup = this.mouseup.bind(this)
    this.addEventListener('mousedown', this.mousedown)
    this.addEventListener('touchstart', this.touchstart)
    this.addEventListener('touchmove', this.touchmove)
    this.addEventListener('touchend', this.touchend)
  }

  mousedown (evt) {
    window.addEventListener('mousemove', this.mousemove)
    window.addEventListener('mouseup', this.mouseup)
    evt.identifier = 'mouse'
    evt.changedTouches = [evt]
    this.touchstart(evt)
  }

  mousemove (evt) {
    evt.identifier = 'mouse'
    evt.changedTouches = [evt]
    this.touchmove(evt)
  }

  mouseup (evt) {
    window.removeEventListener('mousemove', this.mousemove)
    window.removeEventListener('mouseup', this.mouseup)
    evt.identifier = 'mouse'
    evt.changedTouches = [evt]
    this.touchend(evt)
  }

  touchstart (originalEvent) {
    Array.from(originalEvent.changedTouches).forEach(touch => {
      var pointer = touch
      this.pointers[touch.identifier] = pointer
      this.generateEvent('pointerstart', originalEvent, pointer)
    })
  }

  touchmove (originalEvent) {
    Array.from(originalEvent.changedTouches).forEach(touch => {
      var pointer = this.pointers[touch.identifier]
      if (!pointer) return
      this.generateEvent('pointerchange', originalEvent, pointer, touch)
    })
  }

  touchend (originalEvent) {
    Array.from(originalEvent.changedTouches).forEach(touch => {
      var pointer = this.pointers[touch.identifier]
      if (!pointer) return
      delete this.pointers[touch.identifier]
      this.generateEvent('pointerend', originalEvent, pointer, touch)
    })
  }

  generateEvent (name, originalEvent, start, current) {
    if (!current) current = start
    var evt = new Event(name, { bubbles: true })
    evt.start = start
    evt.current = current
    evt.originalEvent = originalEvent
    evt.shiftKey = originalEvent.shiftKey
    evt.metaKey = originalEvent.metaKey
    evt.ctrlKey = originalEvent.ctrlKey
    evt.altKey = originalEvent.altKey
    evt.clientX = current.clientX
    evt.clientY = current.clientY
    evt.deltaX = (current.clientX - start.clientX) / this.scale
    evt.deltaY = (current.clientY - start.clientY) / this.scale
    var object = start.target.object || start.target
    object.dispatchEvent(evt)
  }
}
