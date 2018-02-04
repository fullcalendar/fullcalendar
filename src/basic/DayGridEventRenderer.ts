import * as $ from 'jquery'
import { htmlEscape, cssToStr } from '../util'
import EventRenderer from '../component/renderers/EventRenderer'


/* Event-rendering methods for the DayGrid class
----------------------------------------------------------------------------------------------------------------------*/

export default class DayGridEventRenderer extends EventRenderer {

  dayGrid: any
  rowStructs: any // an array of objects, each holding information about a row's foreground event-rendering


  constructor(dayGrid, fillRenderer) {
    super(dayGrid, fillRenderer)
    this.dayGrid = dayGrid
  }


  renderBgRanges(eventRanges) {
    // don't render timed background events
    eventRanges = $.grep(eventRanges, function(eventRange: any) {
      return eventRange.eventDef.isAllDay()
    })

    super.renderBgRanges(eventRanges)
  }


  // Renders the given foreground event segments onto the grid
  renderFgSegs(segs) {
    let rowStructs = this.rowStructs = this.renderSegRows(segs)

    // append to each row's content skeleton
    this.dayGrid.rowEls.each(function(i, rowNode) {
      $(rowNode).find('.fc-content-skeleton > table').append(
        rowStructs[i].tbodyEl
      )
    })
  }


  // Unrenders all currently rendered foreground event segments
  unrenderFgSegs() {
    let rowStructs = this.rowStructs || []
    let rowStruct

    while ((rowStruct = rowStructs.pop())) {
      rowStruct.tbodyEl.remove()
    }

    this.rowStructs = null
  }


  // Uses the given events array to generate <tbody> elements that should be appended to each row's content skeleton.
  // Returns an array of rowStruct objects (see the bottom of `renderSegRow`).
  // PRECONDITION: each segment shoud already have a rendered and assigned `.el`
  renderSegRows(segs) {
    let rowStructs = []
    let segRows
    let row

    segRows = this.groupSegRows(segs) // group into nested arrays

    // iterate each row of segment groupings
    for (row = 0; row < segRows.length; row++) {
      rowStructs.push(
        this.renderSegRow(row, segRows[row])
      )
    }

    return rowStructs
  }


  // Given a row # and an array of segments all in the same row, render a <tbody> element, a skeleton that contains
  // the segments. Returns object with a bunch of internal data about how the render was calculated.
  // NOTE: modifies rowSegs
  renderSegRow(row, rowSegs) {
    let colCnt = this.dayGrid.colCnt
    let segLevels = this.buildSegLevels(rowSegs) // group into sub-arrays of levels
    let levelCnt = Math.max(1, segLevels.length) // ensure at least one level
    let tbody = $('<tbody/>')
    let segMatrix = [] // lookup for which segments are rendered into which level+col cells
    let cellMatrix = [] // lookup for all <td> elements of the level+col matrix
    let loneCellMatrix = [] // lookup for <td> elements that only take up a single column
    let i
    let levelSegs
    let col
    let tr
    let j
    let seg
    let td

    // populates empty cells from the current column (`col`) to `endCol`
    function emptyCellsUntil(endCol) {
      while (col < endCol) {
        // try to grab a cell from the level above and extend its rowspan. otherwise, create a fresh cell
        td = (loneCellMatrix[i - 1] || [])[col]
        if (td) {
          td.attr(
            'rowspan',
            parseInt(td.attr('rowspan') || 1, 10) + 1
          )
        } else {
          td = $('<td/>')
          tr.append(td)
        }
        cellMatrix[i][col] = td
        loneCellMatrix[i][col] = td
        col++
      }
    }

    for (i = 0; i < levelCnt; i++) { // iterate through all levels
      levelSegs = segLevels[i]
      col = 0
      tr = $('<tr/>')

      segMatrix.push([])
      cellMatrix.push([])
      loneCellMatrix.push([])

      // levelCnt might be 1 even though there are no actual levels. protect against this.
      // this single empty row is useful for styling.
      if (levelSegs) {
        for (j = 0; j < levelSegs.length; j++) { // iterate through segments in level
          seg = levelSegs[j]

          emptyCellsUntil(seg.leftCol)

          // create a container that occupies or more columns. append the event element.
          td = $('<td class="fc-event-container"/>').append(seg.el)
          if (seg.leftCol !== seg.rightCol) {
            td.attr('colspan', seg.rightCol - seg.leftCol + 1)
          } else { // a single-column segment
            loneCellMatrix[i][col] = td
          }

          while (col <= seg.rightCol) {
            cellMatrix[i][col] = td
            segMatrix[i][col] = seg
            col++
          }

          tr.append(td)
        }
      }

      emptyCellsUntil(colCnt) // finish off the row
      this.dayGrid.bookendCells(tr)
      tbody.append(tr)
    }

    return { // a "rowStruct"
      row: row, // the row number
      tbodyEl: tbody,
      cellMatrix: cellMatrix,
      segMatrix: segMatrix,
      segLevels: segLevels,
      segs: rowSegs
    }
  }


  // Stacks a flat array of segments, which are all assumed to be in the same row, into subarrays of vertical levels.
  // NOTE: modifies segs
  buildSegLevels(segs) {
    let levels = []
    let i
    let seg
    let j

    // Give preference to elements with certain criteria, so they have
    // a chance to be closer to the top.
    this.sortEventSegs(segs)

    for (i = 0; i < segs.length; i++) {
      seg = segs[i]

      // loop through levels, starting with the topmost, until the segment doesn't collide with other segments
      for (j = 0; j < levels.length; j++) {
        if (!isDaySegCollision(seg, levels[j])) {
          break
        }
      }
      // `j` now holds the desired subrow index
      seg.level = j;

      // create new level array if needed and append segment
      (levels[j] || (levels[j] = [])).push(seg)
    }

    // order segments left-to-right. very important if calendar is RTL
    for (j = 0; j < levels.length; j++) {
      levels[j].sort(compareDaySegCols)
    }

    return levels
  }


  // Given a flat array of segments, return an array of sub-arrays, grouped by each segment's row
  groupSegRows(segs) {
    let segRows = []
    let i

    for (i = 0; i < this.dayGrid.rowCnt; i++) {
      segRows.push([])
    }

    for (i = 0; i < segs.length; i++) {
      segRows[segs[i].row].push(segs[i])
    }

    return segRows
  }


  // Computes a default event time formatting string if `timeFormat` is not explicitly defined
  computeEventTimeFormat() {
    return this.opt('extraSmallTimeFormat') // like "6p" or "6:30p"
  }


  // Computes a default `displayEventEnd` value if one is not expliclty defined
  computeDisplayEventEnd() {
    return this.dayGrid.colCnt === 1 // we'll likely have space if there's only one day
  }


  // Builds the HTML to be used for the default element for an individual segment
  fgSegHtml(seg, disableResizing) {
    let view = this.view
    let eventDef = seg.footprint.eventDef
    let isAllDay = seg.footprint.componentFootprint.isAllDay
    let isDraggable = view.isEventDefDraggable(eventDef)
    let isResizableFromStart = !disableResizing && isAllDay &&
      seg.isStart && view.isEventDefResizableFromStart(eventDef)
    let isResizableFromEnd = !disableResizing && isAllDay &&
      seg.isEnd && view.isEventDefResizableFromEnd(eventDef)
    let classes = this.getSegClasses(seg, isDraggable, isResizableFromStart || isResizableFromEnd)
    let skinCss = cssToStr(this.getSkinCss(eventDef))
    let timeHtml = ''
    let timeText
    let titleHtml

    classes.unshift('fc-day-grid-event', 'fc-h-event')

    // Only display a timed events time if it is the starting segment
    if (seg.isStart) {
      timeText = this.getTimeText(seg.footprint)
      if (timeText) {
        timeHtml = '<span class="fc-time">' + htmlEscape(timeText) + '</span>'
      }
    }

    titleHtml =
      '<span class="fc-title">' +
        (htmlEscape(eventDef.title || '') || '&nbsp;') + // we always want one line of height
      '</span>'

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
          (this.dayGrid.isRTL ?
            titleHtml + ' ' + timeHtml : // put a natural space in between
            timeHtml + ' ' + titleHtml   //
            ) +
        '</div>' +
        (isResizableFromStart ?
          '<div class="fc-resizer fc-start-resizer" />' :
          ''
          ) +
        (isResizableFromEnd ?
          '<div class="fc-resizer fc-end-resizer" />' :
          ''
          ) +
      '</a>'
  }

}


// Computes whether two segments' columns collide. They are assumed to be in the same row.
function isDaySegCollision(seg, otherSegs) {
  let i
  let otherSeg

  for (i = 0; i < otherSegs.length; i++) {
    otherSeg = otherSegs[i]

    if (
      otherSeg.leftCol <= seg.rightCol &&
      otherSeg.rightCol >= seg.leftCol
    ) {
      return true
    }
  }

  return false
}


// A cmp function for determining the leftmost event
function compareDaySegCols(a, b) {
  return a.leftCol - b.leftCol
}
