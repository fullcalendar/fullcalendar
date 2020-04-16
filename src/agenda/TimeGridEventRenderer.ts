import { htmlEscape, cssToStr, proxy } from '../util'
import EventRenderer from '../component/renderers/EventRenderer'

/*
Only handles foreground segs.
Does not own rendering. Use for low-level util methods by TimeGrid.
*/
export default class TimeGridEventRenderer extends EventRenderer {

  timeGrid: any


  constructor(timeGrid, fillRenderer) {
    super(timeGrid, fillRenderer)
    this.timeGrid = timeGrid
  }


  renderFgSegs(segs) {
    this.renderFgSegsIntoContainers(segs, this.timeGrid.fgContainerEls)
  }


  // Given an array of foreground segments, render a DOM element for each, computes position,
  // and attaches to the column inner-container elements.
  renderFgSegsIntoContainers(segs, containerEls) {
    let segsByCol
    let col

    segsByCol = this.timeGrid.groupSegsByCol(segs)

    for (col = 0; col < this.timeGrid.colCnt; col++) {
      this.updateFgSegCoords(segsByCol[col])
    }

    this.timeGrid.attachSegsByCol(segsByCol, containerEls)
  }


  unrenderFgSegs() {
    if (this.fgSegs) { // hack
      this.fgSegs.forEach(function(seg) {
        seg.el.remove()
      })
    }
  }


  // Computes a default event time formatting string if `timeFormat` is not explicitly defined
  computeEventTimeFormat() {
    return this.opt('noMeridiemTimeFormat') // like "6:30" (no AM/PM)
  }


  // Computes a default `displayEventEnd` value if one is not expliclty defined
  computeDisplayEventEnd() {
    return true
  }


  // Renders the HTML for a single event segment's default rendering
  fgSegHtml(seg, disableResizing) {
    let view = this.view
    let calendar = view.calendar
    let componentFootprint = seg.footprint.componentFootprint
    let isAllDay = componentFootprint.isAllDay
    let eventDef = seg.footprint.eventDef
    let isDraggable = view.isEventDefDraggable(eventDef)
    let isResizableFromStart = !disableResizing && seg.isStart && view.isEventDefResizableFromStart(eventDef)
    let isResizableFromEnd = !disableResizing && seg.isEnd && view.isEventDefResizableFromEnd(eventDef)
    let classes = this.getSegClasses(seg, isDraggable, isResizableFromStart || isResizableFromEnd)
    let skinCss = cssToStr(this.getSkinCss(eventDef))
    let timeText
    let fullTimeText // more verbose time text. for the print stylesheet
    let startTimeText // just the start time text

    classes.unshift('fc-time-grid-event', 'fc-v-event')

    // if the event appears to span more than one day...
    if (view.isMultiDayRange(componentFootprint.unzonedRange)) {
      // Don't display time text on segments that run entirely through a day.
      // That would appear as midnight-midnight and would look dumb.
      // Otherwise, display the time text for the *segment's* times (like 6pm-midnight or midnight-10am)
      if (seg.isStart || seg.isEnd) {
        let zonedStart = calendar.msToMoment(seg.startMs)
        let zonedEnd = calendar.msToMoment(seg.endMs)
        timeText = this._getTimeText(zonedStart, zonedEnd, isAllDay)
        fullTimeText = this._getTimeText(zonedStart, zonedEnd, isAllDay, 'LT')
        startTimeText = this._getTimeText(zonedStart, zonedEnd, isAllDay, null, false) // displayEnd=false
      }
    } else {
      // Display the normal time text for the *event's* times
      timeText = this.getTimeText(seg.footprint)
      fullTimeText = this.getTimeText(seg.footprint, 'LT')
      startTimeText = this.getTimeText(seg.footprint, null, false) // displayEnd=false
    }

    return '<a class="' + classes.join(' ') + '"' +
      (eventDef.url ?
        ' href="' + htmlEscape(eventDef.url) + '"' :
        ''
        ) +
      (skinCss ?
        ' style="' + skinCss + '"' :
        ''
        ) +
      '>' +
        '<div class="fc-content">' +
          (timeText ?
            '<div class="fc-time"' +
            ' data-start="' + htmlEscape(startTimeText) + '"' +
            ' data-full="' + htmlEscape(fullTimeText) + '"' +
            '>' +
              '<span>' + htmlEscape(timeText) + '</span>' +
            '</div>' :
            ''
            ) +
          (eventDef.title ?
            '<div class="fc-title">' +
              htmlEscape(eventDef.title) +
            '</div>' :
            ''
            ) +
        '</div>' +
        '<div class="fc-bg"></div>' +
        /* TODO: write CSS for this
        (isResizableFromStart ?
          '<div class="fc-resizer fc-start-resizer"></div>' :
          ''
          ) +
        */
        (isResizableFromEnd ?
          '<div class="fc-resizer fc-end-resizer"></div>' :
          ''
          ) +
      '</a>'
  }


  // Given segments that are assumed to all live in the *same column*,
  // compute their verical/horizontal coordinates and assign to their elements.
  updateFgSegCoords(segs) {
    this.timeGrid.computeSegVerticals(segs) // horizontals relies on this
    this.computeFgSegHorizontals(segs) // compute horizontal coordinates, z-index's, and reorder the array
    this.timeGrid.assignSegVerticals(segs)
    this.assignFgSegHorizontals(segs)
  }


  // Given an array of segments that are all in the same column, sets the backwardCoord and forwardCoord on each.
  // NOTE: Also reorders the given array by date!
  computeFgSegHorizontals(segs) {
    let levels
    let level0
    let i

    this.sortEventSegs(segs) // order by certain criteria
    levels = buildSlotSegLevels(segs)
    computeForwardSlotSegs(levels)

    if ((level0 = levels[0])) {

      for (i = 0; i < level0.length; i++) {
        computeSlotSegPressures(level0[i])
      }

      for (i = 0; i < level0.length; i++) {
        this.computeFgSegForwardBack(level0[i], 0, 0)
      }
    }
  }


  // Calculate seg.forwardCoord and seg.backwardCoord for the segment, where both values range
  // from 0 to 1. If the calendar is left-to-right, the seg.backwardCoord maps to "left" and
  // seg.forwardCoord maps to "right" (via percentage). Vice-versa if the calendar is right-to-left.
  //
  // The segment might be part of a "series", which means consecutive segments with the same pressure
  // who's width is unknown until an edge has been hit. `seriesBackwardPressure` is the number of
  // segments behind this one in the current series, and `seriesBackwardCoord` is the starting
  // coordinate of the first segment in the series.
  computeFgSegForwardBack(seg, seriesBackwardPressure, seriesBackwardCoord) {
    let forwardSegs = seg.forwardSegs
    let i

    if (seg.forwardCoord === undefined) { // not already computed

      if (!forwardSegs.length) {

        // if there are no forward segments, this segment should butt up against the edge
        seg.forwardCoord = 1
      } else {

        // sort highest pressure first
        this.sortForwardSegs(forwardSegs)

        // this segment's forwardCoord will be calculated from the backwardCoord of the
        // highest-pressure forward segment.
        this.computeFgSegForwardBack(forwardSegs[0], seriesBackwardPressure + 1, seriesBackwardCoord)
        seg.forwardCoord = forwardSegs[0].backwardCoord
      }

      // calculate the backwardCoord from the forwardCoord. consider the series
      seg.backwardCoord = seg.forwardCoord -
        (seg.forwardCoord - seriesBackwardCoord) / // available width for series
        (seriesBackwardPressure + 1) // # of segments in the series

      // use this segment's coordinates to computed the coordinates of the less-pressurized
      // forward segments
      for (i = 0; i < forwardSegs.length; i++) {
        this.computeFgSegForwardBack(forwardSegs[i], 0, seg.forwardCoord)
      }
    }
  }


  sortForwardSegs(forwardSegs) {
    forwardSegs.sort(proxy(this, 'compareForwardSegs'))
  }


  // A cmp function for determining which forward segment to rely on more when computing coordinates.
  compareForwardSegs(seg1, seg2) {
    // put higher-pressure first
    return seg2.forwardPressure - seg1.forwardPressure ||
      // put segments that are closer to initial edge first (and favor ones with no coords yet)
      (seg1.backwardCoord || 0) - (seg2.backwardCoord || 0) ||
      // do normal sorting...
      this.compareEventSegs(seg1, seg2)
  }


  // Given foreground event segments that have already had their position coordinates computed,
  // assigns position-related CSS values to their elements.
  assignFgSegHorizontals(segs) {
    let i
    let seg

    for (i = 0; i < segs.length; i++) {
      seg = segs[i]
      seg.el.css(this.generateFgSegHorizontalCss(seg))

      // if the event is short that the title will be cut off,
      // attach a className that condenses the title into the time area.
      if (seg.footprint.eventDef.title && seg.bottom - seg.top < 30) {
        seg.el.addClass('fc-short') // TODO: "condensed" is a better name
      }
    }
  }


  // Generates an object with CSS properties/values that should be applied to an event segment element.
  // Contains important positioning-related properties that should be applied to any event element, customized or not.
  generateFgSegHorizontalCss(seg) {
    let shouldOverlap = this.opt('slotEventOverlap')
    let backwardCoord = seg.backwardCoord // the left side if LTR. the right side if RTL. floating-point
    let forwardCoord = seg.forwardCoord // the right side if LTR. the left side if RTL. floating-point
    let props = this.timeGrid.generateSegVerticalCss(seg) // get top/bottom first
    let isRTL = this.timeGrid.isRTL
    let left // amount of space from left edge, a fraction of the total width
    let right // amount of space from right edge, a fraction of the total width

    if (shouldOverlap) {
      // double the width, but don't go beyond the maximum forward coordinate (1.0)
      forwardCoord = Math.min(1, backwardCoord + (forwardCoord - backwardCoord) * 2)
    }

    if (isRTL) {
      left = 1 - forwardCoord
      right = backwardCoord
    } else {
      left = backwardCoord
      right = 1 - forwardCoord
    }

    props.zIndex = seg.level + 1 // convert from 0-base to 1-based
    props.left = left * 100 + '%'
    props.right = right * 100 + '%'

    if (shouldOverlap && seg.forwardPressure) {
      // add padding to the edge so that forward stacked events don't cover the resizer's icon
      props[isRTL ? 'marginLeft' : 'marginRight'] = 10 * 2 // 10 is a guesstimate of the icon's width
    }

    return props
  }

}


// Builds an array of segments "levels". The first level will be the leftmost tier of segments if the calendar is
// left-to-right, or the rightmost if the calendar is right-to-left. Assumes the segments are already ordered by date.
function buildSlotSegLevels(segs) {
  let levels = []
  let i
  let seg
  let j

  for (i = 0; i < segs.length; i++) {
    seg = segs[i]

    // go through all the levels and stop on the first level where there are no collisions
    for (j = 0; j < levels.length; j++) {
      if (!computeSlotSegCollisions(seg, levels[j]).length) {
        break
      }
    }

    seg.level = j;

    (levels[j] || (levels[j] = [])).push(seg)
  }

  return levels
}


// For every segment, figure out the other segments that are in subsequent
// levels that also occupy the same vertical space. Accumulate in seg.forwardSegs
function computeForwardSlotSegs(levels) {
  let i
  let level
  let j
  let seg
  let k

  for (i = 0; i < levels.length; i++) {
    level = levels[i]

    for (j = 0; j < level.length; j++) {
      seg = level[j]

      seg.forwardSegs = []
      for (k = i + 1; k < levels.length; k++) {
        computeSlotSegCollisions(seg, levels[k], seg.forwardSegs)
      }
    }
  }
}


// Figure out which path forward (via seg.forwardSegs) results in the longest path until
// the furthest edge is reached. The number of segments in this path will be seg.forwardPressure
function computeSlotSegPressures(seg) {
  let forwardSegs = seg.forwardSegs
  let forwardPressure = 0
  let i
  let forwardSeg

  if (seg.forwardPressure === undefined) { // not already computed

    for (i = 0; i < forwardSegs.length; i++) {
      forwardSeg = forwardSegs[i]

      // figure out the child's maximum forward path
      computeSlotSegPressures(forwardSeg)

      // either use the existing maximum, or use the child's forward pressure
      // plus one (for the forwardSeg itself)
      forwardPressure = Math.max(
        forwardPressure,
        1 + forwardSeg.forwardPressure
      )
    }

    seg.forwardPressure = forwardPressure
  }
}


// Find all the segments in `otherSegs` that vertically collide with `seg`.
// Append into an optionally-supplied `results` array and return.
function computeSlotSegCollisions(seg, otherSegs, results= []) {

  for (let i = 0; i < otherSegs.length; i++) {
    if (isSlotSegCollision(seg, otherSegs[i])) {
      results.push(otherSegs[i])
    }
  }

  return results
}


// Do these segments occupy the same vertical space?
function isSlotSegCollision(seg1, seg2) {
  return seg1.bottom > seg2.top && seg1.top < seg2.bottom
}
