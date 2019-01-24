import {
  createElement,
  removeElement,
  appendToElement,
  prependToElement,
  Seg
} from '@fullcalendar/core'
import DayGrid from './DayGrid'
import SimpleDayGridEventRenderer from './SimpleDayGridEventRenderer'


/* Event-rendering methods for the DayGrid class
----------------------------------------------------------------------------------------------------------------------*/

export default class DayGridEventRenderer extends SimpleDayGridEventRenderer {

  dayGrid: DayGrid
  rowStructs: any // an array of objects, each holding information about a row's foreground event-rendering


  constructor(dayGrid: DayGrid) {
    super(dayGrid.context)

    this.dayGrid = dayGrid
  }


  // Renders the given foreground event segments onto the grid
  attachSegs(segs: Seg[], mirrorInfo) {
    let rowStructs = this.rowStructs = this.renderSegRows(segs)

    // append to each row's content skeleton
    this.dayGrid.rowEls.forEach(function(rowNode, i) {
      rowNode.querySelector('.fc-content-skeleton > table').appendChild(
        rowStructs[i].tbodyEl
      )
    })

    // removes the "more.." events popover
    if (!mirrorInfo) {
      this.dayGrid.removeSegPopover()
    }
  }


  // Unrenders all currently rendered foreground event segments
  detachSegs() {
    let rowStructs = this.rowStructs || []
    let rowStruct

    while ((rowStruct = rowStructs.pop())) {
      removeElement(rowStruct.tbodyEl)
    }

    this.rowStructs = null
  }


  // Uses the given events array to generate <tbody> elements that should be appended to each row's content skeleton.
  // Returns an array of rowStruct objects (see the bottom of `renderSegRow`).
  // PRECONDITION: each segment shoud already have a rendered and assigned `.el`
  renderSegRows(segs: Seg[]) {
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
    let { dayGrid } = this
    let { colCnt, isRtl } = dayGrid
    let segLevels = this.buildSegLevels(rowSegs) // group into sub-arrays of levels
    let levelCnt = Math.max(1, segLevels.length) // ensure at least one level
    let tbody = document.createElement('tbody')
    let segMatrix = [] // lookup for which segments are rendered into which level+col cells
    let cellMatrix = [] // lookup for all <td> elements of the level+col matrix
    let loneCellMatrix = [] // lookup for <td> elements that only take up a single column
    let i
    let levelSegs
    let col
    let tr: HTMLTableRowElement
    let j
    let seg
    let td: HTMLTableCellElement

    // populates empty cells from the current column (`col`) to `endCol`
    function emptyCellsUntil(endCol) {
      while (col < endCol) {
        // try to grab a cell from the level above and extend its rowspan. otherwise, create a fresh cell
        td = (loneCellMatrix[i - 1] || [])[col]
        if (td) {
          td.rowSpan = (td.rowSpan || 1) + 1
        } else {
          td = document.createElement('td')
          tr.appendChild(td)
        }
        cellMatrix[i][col] = td
        loneCellMatrix[i][col] = td
        col++
      }
    }

    for (i = 0; i < levelCnt; i++) { // iterate through all levels
      levelSegs = segLevels[i]
      col = 0
      tr = document.createElement('tr')

      segMatrix.push([])
      cellMatrix.push([])
      loneCellMatrix.push([])

      // levelCnt might be 1 even though there are no actual levels. protect against this.
      // this single empty row is useful for styling.
      if (levelSegs) {
        for (j = 0; j < levelSegs.length; j++) { // iterate through segments in level
          seg = levelSegs[j]
          let leftCol = isRtl ? (colCnt - 1 - seg.lastCol) : seg.firstCol
          let rightCol = isRtl ? (colCnt - 1 - seg.firstCol) : seg.lastCol

          emptyCellsUntil(leftCol)

          // create a container that occupies or more columns. append the event element.
          td = createElement('td', { className: 'fc-event-container' }, seg.el) as HTMLTableCellElement
          if (leftCol !== rightCol) {
            td.colSpan = rightCol - leftCol + 1
          } else { // a single-column segment
            loneCellMatrix[i][col] = td
          }

          while (col <= rightCol) {
            cellMatrix[i][col] = td
            segMatrix[i][col] = seg
            col++
          }

          tr.appendChild(td)
        }
      }

      emptyCellsUntil(colCnt) // finish off the row

      let introHtml = dayGrid.renderProps.renderIntroHtml()
      if (introHtml) {
        if (dayGrid.isRtl) {
          appendToElement(tr, introHtml)
        } else {
          prependToElement(tr, introHtml)
        }
      }

      tbody.appendChild(tr)
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
  buildSegLevels(segs: Seg[]) {
    let { isRtl, colCnt } = this.dayGrid
    let levels = []
    let i
    let seg
    let j

    // Give preference to elements with certain criteria, so they have
    // a chance to be closer to the top.
    segs = this.sortEventSegs(segs)

    for (i = 0; i < segs.length; i++) {
      seg = segs[i]

      // loop through levels, starting with the topmost, until the segment doesn't collide with other segments
      for (j = 0; j < levels.length; j++) {
        if (!isDaySegCollision(seg, levels[j])) {
          break
        }
      }

      // `j` now holds the desired subrow index
      seg.level = j
      seg.leftCol = isRtl ? (colCnt - 1 - seg.lastCol) : seg.firstCol // for sorting only
      seg.rightCol = isRtl ? (colCnt - 1 - seg.firstCol) : seg.lastCol // for sorting only

      // create new level array if needed and append segment
      ;(levels[j] || (levels[j] = [])).push(seg)
    }

    // order segments left-to-right. very important if calendar is RTL
    for (j = 0; j < levels.length; j++) {
      levels[j].sort(compareDaySegCols)
    }

    return levels
  }


  // Given a flat array of segments, return an array of sub-arrays, grouped by each segment's row
  groupSegRows(segs: Seg[]) {
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


  // Computes a default `displayEventEnd` value if one is not expliclty defined
  computeDisplayEventEnd() {
    return this.dayGrid.colCnt === 1 // we'll likely have space if there's only one day
  }

}


// Computes whether two segments' columns collide. They are assumed to be in the same row.
function isDaySegCollision(seg: Seg, otherSegs: Seg) {
  let i
  let otherSeg

  for (i = 0; i < otherSegs.length; i++) {
    otherSeg = otherSegs[i]

    if (
      otherSeg.firstCol <= seg.lastCol &&
      otherSeg.lastCol >= seg.firstCol
    ) {
      return true
    }
  }

  return false
}


// A cmp function for determining the leftmost event
function compareDaySegCols(a: Seg, b: Seg) {
  return a.leftCol - b.leftCol
}
