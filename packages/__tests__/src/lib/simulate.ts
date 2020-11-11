/* General Utils
---------------------------------------------------------------------------------------------------------------------- */

$.simulateByPoint = (type, options) => {
  let docEl = $(document)
  let point = options.point
  let clientX
  let clientY
  let node

  if (point) {
    clientX = point.left - docEl.scrollLeft()
    clientY = point.top - docEl.scrollTop()
    node = document.elementFromPoint(clientX, clientY)
    $(node).simulate(type, options)
  }
}

/* Touch
---------------------------------------------------------------------------------------------------------------------- */

let origSimulateEvent = $.simulate.prototype.simulateEvent
let touchUID = Date.now()

$.simulate.prototype.simulateEvent = function (elem, type, options) { // eslint-disable-line func-names
  if (elem === window && type === 'resize') {
    return this.simulateWindowResize()
  } if (/^touch/.test(type)) {
    return this.simulateTouchEvent(elem, type, options)
  }
  return origSimulateEvent.apply(this, arguments) // eslint-disable-line prefer-rest-params
}

$.simulate.prototype.simulateWindowResize = function () { // eslint-disable-line func-names
  // from https://stackoverflow.com/a/1818513/96342
  let event

  if (typeof Event !== 'undefined') {
    try {
      event = new Event('resize')
    } catch (ex) {
      // why would fail?
    }
  }

  if (!event) {
    event = document.createEvent('UIEvents')
    event.initUIEvent('resize', true, false, window, 0)
  }

  this.dispatchEvent(window, 'resize', event)
}

$.simulate.prototype.simulateTouchEvent = function (elem, type, options) { // eslint-disable-line func-names
  // http://stackoverflow.com/a/29019278/96342
  let event = document.createEvent('Event')

  event.initEvent(type, true, true); // cancelable, bubbleable
  (event as any).touches = [{
    target: elem,
    identifier: touchUID,
    pageX: options.clientX,
    pageY: options.clientY,
    screenX: options.clientX,
    screenY: options.clientY,
    clientX: options.clientX,
    clientY: options.clientY,
  }]
  touchUID += 1

  this.dispatchEvent(elem, type, event, options)
}

$.simulateMouseClick = function (elem) { // eslint-disable-line func-names
  let $elem = $(elem)
  let clientCoords = {
    clientX: $elem.offset().left + $elem.outerWidth() / 2,
    clientY: $elem.offset().top + $elem.outerHeight() / 2,
  }
  $elem.simulate('mousemove', clientCoords)
  $elem.simulate('mousedown', clientCoords)
  $elem.simulate('mouseup', clientCoords)
  $elem.simulate('click', clientCoords)
}

$.simulateTouchClick = function (elem) { // eslint-disable-line func-names
  let $elem = $(elem)
  let clientCoords = {
    clientX: $elem.offset().left + $elem.outerWidth() / 2,
    clientY: $elem.offset().top + $elem.outerHeight() / 2,
  }
  $elem.simulate('touchstart', clientCoords)
  $elem.simulate('touchend', clientCoords)
  $elem.simulate('mousemove', clientCoords)
  $elem.simulate('mousedown', clientCoords)
  $elem.simulate('mouseup', clientCoords)
  $elem.simulate('click', clientCoords)
}

/* Drag-n-drop
---------------------------------------------------------------------------------------------------------------------- */

let DEBUG_DELAY = 500
let DEBUG_MIN_DURATION = 2000
let DEBUG_MIN_MOVES = 100
let DRAG_DEFAULTS = {
  point: null, // the start point
  localPoint: { left: '50%', top: '50%' },
  end: null, // can be a point or an el
  localEndPoint: { left: '50%', top: '50%' },
  dx: 0,
  dy: 0,
  moves: 5,
  duration: 100, // ms
}

let dragStackCnt = 0

$.simulate.prototype.simulateDrag = function () { // eslint-disable-line func-names
  let options = $.extend({}, DRAG_DEFAULTS, this.options)
  let targetNode = this.target // raw DOM node
  let targetEl = $(targetNode) // jq object
  let dx = options.dx
  let dy = options.dy
  let duration = options.duration
  let moves = options.moves
  let startPoint
  let endEl
  let endPoint
  let localPoint
  let offset

  // compute start point
  if (options.point) {
    startPoint = options.point
  } else {
    localPoint = normalizeElPoint(options.localPoint, targetEl)
    offset = targetEl.offset()
    startPoint = {
      left: offset.left + localPoint.left,
      top: offset.top + localPoint.top,
    }
  }

  // compute end point
  if (options.end) {
    if (isPoint(options.end)) {
      endPoint = options.end
    } else { // assume options.end is an element
      endEl = $(options.end)
      localPoint = normalizeElPoint(options.localEndPoint, endEl)
      offset = endEl.offset()
      endPoint = {
        left: offset.left + localPoint.left,
        top: offset.top + localPoint.top,
      }
    }
  }

  if (endPoint) {
    dx = endPoint.left - startPoint.left
    dy = endPoint.top - startPoint.top
  }

  moves = Math.max(moves, options.debug ? DEBUG_MIN_MOVES : 1)
  duration = Math.max(duration, options.debug ? DEBUG_MIN_DURATION : 10)

  simulateDrag(
    this,
    targetNode,
    startPoint,
    dx,
    dy,
    moves,
    duration,
    options,
  )
}

function simulateDrag(self, targetNode, startPoint, dx, dy, moveCnt, duration, options) {
  let debug = options.debug
  let isTouch = options.isTouch
  let docNode = targetNode.ownerDocument
  let docEl = $(docNode)
  let waitTime = duration / moveCnt
  let moveIndex = 0
  let clientCoords
  let intervalId
  let dotEl
  let dragId

  if (debug) {
    dotEl = $('<div>')
      .css({
        position: 'absolute',
        zIndex: 99999,
        border: '5px solid red',
        borderRadius: '5px',
        margin: '-5px 0 0 -5px',
      })
      .appendTo('body')
  }

  function updateCoords() {
    let progress = moveIndex / moveCnt
    let left = startPoint.left + dx * progress
    let top = startPoint.top + dy * progress

    clientCoords = {
      clientX: left - docEl.scrollLeft(),
      clientY: top - docEl.scrollTop(),
    }

    if (debug) {
      dotEl.css({ left, top })
    }
  }

  function startDrag() {
    updateCoords()
    dragStackCnt += 1
    dragId = dragStackCnt

    // simulate a drag-start only if another drag isn't already happening
    if (dragStackCnt === 1) {
      self.simulateEvent(
        targetNode, // can have an inner drag-start el. targetNode will still be source of emitted events
        isTouch ? 'touchstart' : 'mousedown',
        clientCoords,
      )
    }

    let delay = options.delay || 0
    if (debug) {
      delay = Math.max(delay, DEBUG_DELAY)
    }

    if (delay) {
      setTimeout(() => {
        startMoving()
      }, delay)
    } else {
      startMoving()
    }
  }

  function startMoving() {
    intervalId = setInterval(tick, waitTime)
  }

  function tick() { // called one interval after start
    moveIndex += 1
    updateCoords() // update clientCoords before mousemove

    if (isTouch) {
      // touchmove happens on the originating element
      self.simulateEvent(targetNode, 'touchmove', clientCoords)
    } else {
      self.simulateEvent(docNode, 'mousemove', clientCoords)
    }

    if (moveIndex >= moveCnt) {
      stopMoving()
    }
  }

  function stopMoving() {
    clearInterval(intervalId)
    if (debug) {
      setTimeout(() => {
        dotEl.remove() // do this before calling stopDrag/callback. don't want dot picked up by elementFromPoint
        stopDrag()
      }, DEBUG_DELAY)
    } else {
      stopDrag()
    }
  }

  function stopDrag() { // progress at 1, coords already up to date at this point
    (options.onBeforeRelease || (() => {}))()

    // only simulate a drop if the current drag is still the active one.
    // otherwise, this means another drag has begun via onBeforeRelease.
    if (dragId === dragStackCnt) {
      if (
        $.contains(docNode, targetNode) ||
        isTouch // touch will always first touchend on original node, even if removed from DOM
        // https://stackoverflow.com/a/45760014
      ) {
        self.simulateEvent(targetNode, isTouch ? 'touchend' : 'mouseup', clientCoords)
        self.simulateEvent(targetNode, 'click', clientCoords)
      } else {
        self.simulateEvent(docNode, isTouch ? 'touchend' : 'mouseup', clientCoords)
      }
    }

    dragStackCnt -= 1

    let callback: (() => void) = options.onRelease || options.callback || (() => {})

    // we wait because the there might be a FullCalendar drag interaction that finishes asynchronously
    // after the mouseend/touchend happens, and it's really convenient if our callback fires after that.
    setTimeout(callback, 0)
  }

  startDrag()
}

function normalizeElPoint(point, el) {
  let left = point.left
  let top = point.top

  if (/%$/.test(left)) {
    left = (parseInt(left, 10) / 100) * el.outerWidth()
  }
  if (/%$/.test(top)) {
    top = (parseInt(top, 10) / 100) * el.outerHeight()
  }

  return { left, top }
}

function isPoint(input) {
  return typeof input === 'object' && // `in` operator only works on objects
    'left' in input && 'top' in input
}
