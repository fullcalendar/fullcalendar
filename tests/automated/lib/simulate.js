
/* General Utils
---------------------------------------------------------------------------------------------------------------------- */

$.simulateByPoint = function(type, options) {
  var docEl = $(document)
  var point = options.point
  var clientX, clientY
  var node

  if (point) {
    clientX = point.left - docEl.scrollLeft()
    clientY = point.top - docEl.scrollTop()
    node = document.elementFromPoint(clientX, clientY)
    $(node).simulate(type, options)
  }
}


/* Touch
---------------------------------------------------------------------------------------------------------------------- */

var origSimulateEvent = $.simulate.prototype.simulateEvent
var touchUID = Date.now()

$.simulate.prototype.simulateEvent = function(elem, type, options) {
  if (elem === window && type === 'resize') {
    return this.simulateWindowResize()
  } else if (/^touch/.test(type)) {
    return this.simulateTouchEvent(elem, type, options)
  } else {
    return origSimulateEvent.apply(this, arguments)
  }
}

$.simulate.prototype.simulateWindowResize = function() {
  // from https://stackoverflow.com/a/1818513/96342
  let event

  if (typeof Event !== 'undefined') {
    try {
      event = new Event('resize')
    } catch (ex) {}
  }

  if (!event) {
    event = document.createEvent('UIEvents')
    event.initUIEvent('resize', true, false, window, 0)
  }

  this.dispatchEvent(window, 'resize', event)
}

$.simulate.prototype.simulateTouchEvent = function(elem, type, options) {
  // http://stackoverflow.com/a/29019278/96342

  /** @type {any} */
  var event = document.createEvent('Event')

  event.initEvent(type, true, true) // cancelable, bubbleable
  event.touches = [{
    target: elem,
    identifier: touchUID++,
    pageX: options.clientX,
    pageY: options.clientY,
    screenX: options.clientX,
    screenY: options.clientY,
    clientX: options.clientX,
    clientY: options.clientY
  }]

  this.dispatchEvent(elem, type, event, options)
}

$.simulateMouseClick = function(elem) {
  var $elem = $(elem)
  var clientCoords = {
    clientX: $elem.offset().left + $elem.outerWidth() / 2,
    clientY: $elem.offset().top + $elem.outerHeight() / 2
  }
  $elem.simulate('mousemove', clientCoords)
  $elem.simulate('mousedown', clientCoords)
  $elem.simulate('mouseup', clientCoords)
  $elem.simulate('click', clientCoords)
}

$.simulateTouchClick = function(elem) {
  var $elem = $(elem)
  var clientCoords = {
    clientX: $elem.offset().left + $elem.outerWidth() / 2,
    clientY: $elem.offset().top + $elem.outerHeight() / 2
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

var DEBUG_DELAY = 500
var DEBUG_MIN_DURATION = 2000
var DEBUG_MIN_MOVES = 100
var DRAG_DEFAULTS = {
  point: null, // the start point
  localPoint: { left: '50%', top: '50%' },
  end: null, // can be a point or an el
  localEndPoint: { left: '50%', top: '50%' },
  dx: 0,
  dy: 0,
  moves: 5,
  duration: 100 // ms
}

var dragStackCnt = 0


$.simulate.prototype.simulateDrag = function() {
  var targetNode = this.target
  var targetEl = $(targetNode)
  var options = $.extend({}, DRAG_DEFAULTS, this.options)
  var dx = options.dx
  var dy = options.dy
  var duration = options.duration
  var moves = options.moves
  var startPoint
  var endEl
  var endPoint
  var localPoint
  var offset

  // compute start point
  if (options.point) {
    startPoint = options.point
  } else {
    localPoint = normalizeElPoint(options.localPoint, targetEl)
    offset = targetEl.offset()
    startPoint = {
      left: offset.left + localPoint.left,
      top: offset.top + localPoint.top
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
        top: offset.top + localPoint.top
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
    options
  )
}


function simulateDrag(self, targetNode, startPoint, dx, dy, moveCnt, duration, options) {
  var debug = options.debug
  var isTouch = options.isTouch
  var docNode = targetNode.ownerDocument
  var docEl = $(docNode)
  var waitTime = duration / moveCnt
  var moveIndex = 0
  var clientCoords
  var intervalId
  var dotEl
  var dragId

  if (debug) {
    dotEl = $('<div>')
      .css({
        position: 'absolute',
        zIndex: 99999,
        border: '5px solid red',
        borderRadius: '5px',
        margin: '-5px 0 0 -5px'
      })
      .appendTo('body')
  }

  function updateCoords() {
    var progress = moveIndex / moveCnt
    var left = startPoint.left + dx * progress
    var top = startPoint.top + dy * progress

    clientCoords = {
      clientX: left - docEl.scrollLeft(),
      clientY: top - docEl.scrollTop()
    }

    if (debug) {
      dotEl.css({ left: left, top: top })
    }
  }

  function startDrag() {
    updateCoords()
    dragId = ++dragStackCnt

    // simulate a drag-start only if another drag isn't already happening
    if (dragStackCnt === 1) {
      self.simulateEvent(targetNode, isTouch ? 'touchstart' : 'mousedown', clientCoords)
    }

    var delay = options.delay || 0
    if (debug) {
      delay = Math.max(delay, DEBUG_DELAY)
    }

    if (delay) {
      setTimeout(function() {
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
    moveIndex++
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
      setTimeout(function() {
        dotEl.remove() // do this before calling stopDrag/callback. don't want dot picked up by elementFromPoint
        stopDrag()
      }, DEBUG_DELAY)
    } else {
      stopDrag()
    }
  }

  function stopDrag() { // progress at 1, coords already up to date at this point

    (options.onBeforeRelease || function() {})()

    // only simulate a drop if the current drag is still the active one.
    // otherwise, this means another drag has begun via onBeforeRelease.
    if (dragId === dragStackCnt) {
      if ($.contains(docNode, targetNode)) {
        self.simulateEvent(targetNode, isTouch ? 'touchend' : 'mouseup', clientCoords)
        self.simulateEvent(targetNode, 'click', clientCoords)
      } else {
        self.simulateEvent(docNode, isTouch ? 'touchend' : 'mouseup', clientCoords)
      }
    }

    dragStackCnt--

    // we wait because the there might be a FullCalendar drag interaction that finishes asynchronously
    // after the mouseend/touchend happens, and it's really convenient if our callback fires after that.
    setTimeout(
      options.onRelease || options.callback || function() {}, // TODO: deprecate "callback" ?
      0
    )
  }

  startDrag()
}


function normalizeElPoint(point, el) {
  var left = point.left
  var top = point.top

  if (/%$/.test(left)) {
    left = parseInt(left) / 100 * el.outerWidth()
  }
  if (/%$/.test(top)) {
    top = parseInt(top) / 100 * el.outerHeight()
  }

  return { left: left, top: top }
}


function isPoint(input) {
  return typeof input === 'object' && // `in` operator only works on objects
    'left' in input && 'top' in input
}
