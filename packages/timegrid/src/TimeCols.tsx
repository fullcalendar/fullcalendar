import {
  removeElement,
  applyStyle,
  PositionCache,
  Duration,
  createDuration,
  addDurations,
  multiplyDuration,
  wholeDivideDurations,
  asRoughMs,
  startOfDay,
  DateMarker,
  ComponentContext,
  BaseComponent,
  Seg,
  EventSegUiInteractionState,
  DateProfile,
  sortEventSegs,
  memoize,
  subrenderer
} from '@fullcalendar/core'
import TimeColsEvents from './TimeColsEvents'
import TimeColsMirrorEvents from './TimeColsMirrorEvents'
import TimeColsFills from './TimeColsFills'
import TimeColsSlats from './TimeColsSlats'
import TimeColsBg, { TimeColsCell } from './TimeColsBg'
import TimeColsContentSkeleton, { TimeColsContentSkeletonContainers } from './TimeColsContentSkeleton'
import { h, VNode, createRef, Ref } from 'preact'
import { __assign } from 'tslib'


export interface TimeColsSeg extends Seg {
  col: number
  start: DateMarker
  end: DateMarker
}

export interface TimeColsProps {
  dateProfile: DateProfile
  cells: TimeColsCell[]
  businessHourSegs: TimeColsSeg[]
  bgEventSegs: TimeColsSeg[]
  fgEventSegs: TimeColsSeg[]
  dateSelectionSegs: TimeColsSeg[]
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
  rootElRef?: Ref<HTMLDivElement>
  renderBgIntro: () => VNode[]
  renderIntro: () => VNode[]
}


/* A component that renders one or more columns of vertical time slots
----------------------------------------------------------------------------------------------------------------------*/

export default class TimeCols extends BaseComponent<TimeColsProps> {

  private processOptions = memoize(this._processOptions)
  private renderMirrorEvents = subrenderer(TimeColsMirrorEvents)
  private renderFgEvents = subrenderer(TimeColsEvents)
  private renderBgEvents = subrenderer(TimeColsFills)
  private renderBusinessHours = subrenderer(TimeColsFills)
  private renderDateSelection = subrenderer(TimeColsFills)

  // computed options
  private slotDuration: Duration // duration of a "slot", a distinct time segment on given day, visualized by lines
  private snapDuration: Duration // granularity of time for dragging and selecting
  private snapsPerSlot: any

  private bottomRuleElRef = createRef<HTMLHRElement>()
  private contentSkeletonEl: HTMLElement
  private colContainerEls: HTMLElement[] // containers for each column
  private businessContainerEls: HTMLElement[]
  private highlightContainerEls: HTMLElement[]
  private bgContainerEls: HTMLElement[]
  private fgContainerEls: HTMLElement[]
  private mirrorContainerEls: HTMLElement[]
  public colEls: HTMLElement[] // cells elements in the day-row background
  private rootSlatEl: HTMLElement // div that wraps all the slat rows
  private slatEls: HTMLElement[] // elements running horizontally across all columns
  private nowIndicatorEls: HTMLElement[]

  private colPositions: PositionCache
  private slatPositions: PositionCache
  private isSlatSizesDirty: boolean = false
  private isColSizesDirty: boolean = false
  private segRenderers: (TimeColsEvents | TimeColsFills | null)[]

  get bottomRuleEl() { return this.bottomRuleElRef.current }


  /* Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  render(props: TimeColsProps, state: {}, context: ComponentContext) {

    this.processOptions(context.options)

    return (
      <div class='fc-time-grid' ref={props.rootElRef}>
        <TimeColsBg
          dateProfile={props.dateProfile}
          cells={props.cells}
          renderIntro={props.renderBgIntro}
          handleDom={this.handleBgDom}
        />
        <TimeColsSlats
          dateProfile={props.dateProfile}
          slotDuration={this.slotDuration}
          handleDom={this.handleSlatDom}
        />
        <TimeColsContentSkeleton
          colCnt={props.cells.length}
          renderIntro={props.renderIntro}
          handleDom={this.handleContentSkeletonDom}
        />
        <hr class={'fc-divider ' + context.theme.getClass('widgetHeader')} ref={this.bottomRuleElRef} />
      </div>
    )
  }


  // Parses various options into properties of this object
  // MUST have context already set
  _processOptions(options) {
    let { slotDuration, snapDuration } = options
    let snapsPerSlot

    slotDuration = createDuration(slotDuration)
    snapDuration = snapDuration ? createDuration(snapDuration) : slotDuration
    snapsPerSlot = wholeDivideDurations(slotDuration, snapDuration)

    if (snapsPerSlot === null) {
      snapDuration = slotDuration
      snapsPerSlot = 1
      // TODO: say warning?
    }

    this.slotDuration = slotDuration
    this.snapDuration = snapDuration
    this.snapsPerSlot = snapsPerSlot
  }


  handleBgDom = (bgEl: HTMLElement | null, colEls: HTMLElement[] | null) => {
    if (bgEl) {
      this.colEls = colEls
      this.isColSizesDirty = true
      this.colPositions = new PositionCache(
        bgEl,
        colEls,
        true, // horizontal
        false
      )
    }
  }


  handleSlatDom = (rootSlatEl: HTMLElement | null, slatEls: HTMLElement[] | null) => {
    if (rootSlatEl) {
      this.rootSlatEl = rootSlatEl
      this.slatEls = slatEls
      this.isSlatSizesDirty = true
      this.slatPositions = new PositionCache(
        rootSlatEl,
        slatEls,
        false,
        true // vertical
      )
    }
  }


  handleContentSkeletonDom = (contentSkeletonEl: HTMLElement | null, containers: TimeColsContentSkeletonContainers | null) => {
    if (!contentSkeletonEl) {
      this.subrenderDestroy()

    } else {
      this.contentSkeletonEl = contentSkeletonEl
      __assign(this, containers)
    }
  }


  componentDidMount() {
    this.subrender()
  }


  componentDidUpdate() {
    this.subrender()
  }


  subrender() {
    let { props } = this
    let { options } = this.context

    this.segRenderers = [
      this.renderBusinessHours({
        type: 'businessHours',
        containerEls: this.businessContainerEls,
        segs: props.businessHourSegs,
      }),
      this.renderDateSelection({
        type: 'highlight',
        containerEls: this.highlightContainerEls,
        segs: options.selectMirror ? null : props.dateSelectionSegs // do highlight if NO mirror
      }),
      this.renderBgEvents({
        type: 'bgEvent',
        containerEls: this.bgContainerEls,
        segs: props.bgEventSegs
      }),
      this.renderFgEvents({
        containerEls: this.fgContainerEls,
        segs: props.fgEventSegs,
        selectedInstanceId: props.eventSelection,
        hiddenInstances: // TODO: more convenient
          (props.eventDrag ? props.eventDrag.affectedInstances : null) ||
          (props.eventResize ? props.eventResize.affectedInstances : null)
      }),
      this.subrenderMirror(props, this.mirrorContainerEls, options)
    ]
  }


  subrenderMirror(props: TimeColsProps, mirrorContainerEls: HTMLElement[], options): TimeColsEvents | null {
    if (props.eventDrag) {
      return this.renderMirrorEvents({
        containerEls: mirrorContainerEls,
        segs: props.eventDrag.segs,
        mirrorInfo: { isDragging: true, sourceSeg: props.eventDrag.sourceSeg }
      })

    } else if (props.eventResize) {
      return this.renderMirrorEvents({
        containerEls: mirrorContainerEls,
        segs: props.eventResize.segs,
        mirrorInfo: { isDragging: true, sourceSeg: props.eventResize.sourceSeg }
      })

    } else if (options.selectMirror) {
      return this.renderMirrorEvents({
        containerEls: mirrorContainerEls,
        segs: props.dateSelectionSegs,
        mirrorInfo: { isSelecting: true }
      })

    } else {
      return this.renderMirrorEvents(false)
    }
  }


  updateSize(isResize: boolean) {
    let { segRenderers } = this

    if (isResize || this.isSlatSizesDirty) {
      this.buildSlatPositions()
      this.isSlatSizesDirty = false
    }

    if (isResize || this.isColSizesDirty) {
      this.buildColPositions()
      this.isColSizesDirty = false
    }

    for (let segRenderer of segRenderers) {
      if (segRenderer) {
        segRenderer.computeSizes(isResize, this)
      }
    }

    for (let segRenderer of segRenderers) {
      if (segRenderer) {
        segRenderer.assignSizes(isResize, this)
      }
    }
  }


  /* Now Indicator
  ------------------------------------------------------------------------------------------------------------------*/


  getNowIndicatorUnit() {
    return 'minute' // will refresh on the minute
  }


  renderNowIndicator(segs: TimeColsSeg[], date) {

    // HACK: if date columns not ready for some reason (scheduler)
    if (!this.colContainerEls) {
      return
    }

    let top = this.computeDateTop(date)
    let nodes = []
    let i

    // render lines within the columns
    for (i = 0; i < segs.length; i++) {
      let lineEl = document.createElement('div')
      lineEl.className = 'fc-now-indicator fc-now-indicator-line'
      lineEl.style.top = top + 'px'
      this.colContainerEls[segs[i].col].appendChild(lineEl)
      nodes.push(lineEl)
    }

    // render an arrow over the axis
    if (segs.length > 0) { // is the current time in view?
      let arrowEl = document.createElement('div')
      arrowEl.className = 'fc-now-indicator fc-now-indicator-arrow'
      arrowEl.style.top = top + 'px'
      this.contentSkeletonEl.appendChild(arrowEl)
      nodes.push(arrowEl)
    }

    this.nowIndicatorEls = nodes
  }


  unrenderNowIndicator() {
    if (this.nowIndicatorEls) {
      this.nowIndicatorEls.forEach(removeElement)
      this.nowIndicatorEls = null
    }
  }


  /* Coordinates
  ------------------------------------------------------------------------------------------------------------------*/


  getTotalSlatHeight() {
    return this.rootSlatEl.getBoundingClientRect().height
  }


  // Computes the top coordinate, relative to the bounds of the grid, of the given date.
  // A `startOfDayDate` must be given for avoiding ambiguity over how to treat midnight.
  computeDateTop(when: DateMarker, startOfDayDate?: DateMarker) {
    if (!startOfDayDate) {
      startOfDayDate = startOfDay(when)
    }
    return this.computeTimeTop(createDuration(when.valueOf() - startOfDayDate.valueOf()))
  }


  // Computes the top coordinate, relative to the bounds of the grid, of the given time (a Duration).
  computeTimeTop(duration: Duration) {
    let len = this.slatEls.length
    let dateProfile = this.props.dateProfile
    let slatCoverage = (duration.milliseconds - asRoughMs(dateProfile.minTime)) / asRoughMs(this.slotDuration) // floating-point value of # of slots covered
    let slatIndex
    let slatRemainder

    // compute a floating-point number for how many slats should be progressed through.
    // from 0 to number of slats (inclusive)
    // constrained because minTime/maxTime might be customized.
    slatCoverage = Math.max(0, slatCoverage)
    slatCoverage = Math.min(len, slatCoverage)

    // an integer index of the furthest whole slat
    // from 0 to number slats (*exclusive*, so len-1)
    slatIndex = Math.floor(slatCoverage)
    slatIndex = Math.min(slatIndex, len - 1)

    // how much further through the slatIndex slat (from 0.0-1.0) must be covered in addition.
    // could be 1.0 if slatCoverage is covering *all* the slots
    slatRemainder = slatCoverage - slatIndex

    return this.slatPositions.tops[slatIndex] +
      this.slatPositions.getHeight(slatIndex) * slatRemainder
  }


  // For each segment in an array, computes and assigns its top and bottom properties
  computeSegVerticals(segs: Seg[]) {
    let { options } = this.context
    let eventMinHeight = options.timeGridEventMinHeight
    let i
    let seg
    let dayDate

    for (i = 0; i < segs.length; i++) {
      seg = segs[i]
      dayDate = this.props.cells[seg.col].date

      seg.top = this.computeDateTop(seg.start, dayDate)
      seg.bottom = Math.max(
        seg.top + eventMinHeight,
        this.computeDateTop(seg.end, dayDate)
      )
    }
  }


  // Given segments that already have their top/bottom properties computed, applies those values to
  // the segments' elements.
  assignSegVerticals(segs) {
    let i
    let seg

    for (i = 0; i < segs.length; i++) {
      seg = segs[i]
      applyStyle(seg.el, this.generateSegVerticalCss(seg))
    }
  }


  // Generates an object with CSS properties for the top/bottom coordinates of a segment element
  generateSegVerticalCss(seg) {
    return {
      top: seg.top,
      bottom: -seg.bottom // flipped because needs to be space beyond bottom edge of event container
    }
  }


  /* Sizing
  ------------------------------------------------------------------------------------------------------------------*/


  buildPositionCaches() {
    this.buildColPositions()
    this.buildSlatPositions()
  }


  buildColPositions() {
    this.colPositions.build()
  }


  buildSlatPositions() {
    this.slatPositions.build()
  }


  /* Hit System
  ------------------------------------------------------------------------------------------------------------------*/

  positionToHit(positionLeft, positionTop) {
    let { dateEnv } = this.context
    let { snapsPerSlot, slatPositions, colPositions } = this

    let colIndex = colPositions.leftToIndex(positionLeft)
    let slatIndex = slatPositions.topToIndex(positionTop)

    if (colIndex != null && slatIndex != null) {
      let slatTop = slatPositions.tops[slatIndex]
      let slatHeight = slatPositions.getHeight(slatIndex)
      let partial = (positionTop - slatTop) / slatHeight // floating point number between 0 and 1
      let localSnapIndex = Math.floor(partial * snapsPerSlot) // the snap # relative to start of slat
      let snapIndex = slatIndex * snapsPerSlot + localSnapIndex

      let dayDate = this.props.cells[colIndex].date
      let time = addDurations(
        this.props.dateProfile.minTime,
        multiplyDuration(this.snapDuration, snapIndex)
      )

      let start = dateEnv.add(dayDate, time)
      let end = dateEnv.add(start, this.snapDuration)

      return {
        col: colIndex,
        dateSpan: {
          range: { start, end },
          allDay: false
        },
        dayEl: this.colEls[colIndex],
        relativeRect: {
          left: colPositions.lefts[colIndex],
          right: colPositions.rights[colIndex],
          top: slatTop,
          bottom: slatTop + slatHeight
        }
      }
    }
  }

}


// Given segments grouped by column, insert the segments' elements into a parallel array of container
// elements, each living within a column.
export function attachSegs({ segs, containerEls }: { segs: Seg[], containerEls: HTMLElement[] }, context: ComponentContext) {
  let segsByCol = groupSegsByCol(segs, containerEls.length)

  for (let col = 0; col < segsByCol.length; col++) {
    segsByCol[col] = sortEventSegs(segsByCol[col], context.eventOrderSpecs)
  }

  for (let col = 0; col < containerEls.length; col++) { // iterate each column grouping
    let segs = segsByCol[col]

    for (let seg of segs) {
      containerEls[col].appendChild(seg.el)
    }
  }

  return segsByCol
}


export function detachSegs(segsByCol: Seg[][]) {
  for (let segGroup of segsByCol) {
    for (let seg of segGroup) {
      removeElement(seg.el)
    }
  }
}


function groupSegsByCol(segs, colCnt) {
  let segsByCol = []
  let i

  for (i = 0; i < colCnt; i++) {
    segsByCol.push([])
  }

  for (i = 0; i < segs.length; i++) {
    segsByCol[segs[i].col].push(segs[i])
  }

  return segsByCol
}
