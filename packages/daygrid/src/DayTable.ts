import {
  DateProfile,
  EventStore,
  EventUiHash,
  DateSpan,
  EventInteractionState,
  DayTableModel,
  Duration,
  DateComponent,
  DateRange,
  Slicer,
  Hit,
  ComponentContext,
  renderer
} from '@fullcalendar/core'
import { default as Table, TableSeg, TableRenderProps } from './Table'

export interface DayTableProps {
  renderProps: TableRenderProps
  dateProfile: DateProfile | null
  dayTableModel: DayTableModel
  nextDayThreshold: Duration
  businessHours: EventStore
  eventStore: EventStore
  eventUiBases: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
  isRigid: boolean
}

export default class DayTable extends DateComponent<DayTableProps> {

  private renderTable = renderer(Table)
  private registerInteractive = renderer(this._registerInteractive, this._unregisterInteractive)

  private slicer = new DayTableSlicer()
  table: Table


  render(props: DayTableProps, context: ComponentContext) {
    let { dateProfile, dayTableModel } = props

    let table = this.renderTable(true, {
      ...this.slicer.sliceProps(props, dateProfile, props.nextDayThreshold, context.calendar, dayTableModel),
      dateProfile,
      cells: dayTableModel.cells,
      isRigid: props.isRigid,
      renderProps: props.renderProps
    })

    this.registerInteractive(true, {
      el: table.rootEl
    })

    this.table = table
    return table
  }


  _registerInteractive({ el }: { el: HTMLElement }, context: ComponentContext) {
    context.calendar.registerInteractiveComponent(this, { el })
  }


  _unregisterInteractive(funcState: void, context: ComponentContext) {
    context.calendar.unregisterInteractiveComponent(this)
  }


  updateSize(isResize: boolean) {
    this.table.updateSize(isResize)
  }


  buildPositionCaches() {
    this.table.buildPositionCaches()
  }


  queryHit(positionLeft: number, positionTop: number): Hit {
    let rawHit = this.table.positionToHit(positionLeft, positionTop)

    if (rawHit) {
      return {
        component: this,
        dateSpan: rawHit.dateSpan,
        dayEl: rawHit.dayEl,
        rect: {
          left: rawHit.relativeRect.left,
          right: rawHit.relativeRect.right,
          top: rawHit.relativeRect.top,
          bottom: rawHit.relativeRect.bottom
        },
        layer: 0
      }
    }
  }

}


export class DayTableSlicer extends Slicer<TableSeg, [DayTableModel]> {

  sliceRange(dateRange: DateRange, dayTableModel: DayTableModel): TableSeg[] {
    return dayTableModel.sliceRange(dateRange)
  }

}
