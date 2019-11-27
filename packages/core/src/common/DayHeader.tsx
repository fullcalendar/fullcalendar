import { BaseComponent } from '../view-framework-util'
import ComponentContext from '../component/ComponentContext'
import { DateMarker } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import { createFormatter } from '../datelib/formatting'
import { computeFallbackHeaderFormat } from './table-utils'
import { VNode, h, createRef } from 'preact'
import { TableDateCell } from '@fullcalendar/core'

export interface DayHeaderProps {
  dates: DateMarker[]
  dateProfile: DateProfile
  datesRepDistinctDays: boolean
  renderIntro?: () => VNode[]
}

export default class DayHeader extends BaseComponent<DayHeaderProps> {

  private rootElRef = createRef<HTMLDivElement>()

  get rootEl() { return this.rootElRef.current }


  render(props: DayHeaderProps, state: {}, context: ComponentContext) {
    let { theme } = context
    let { dates, datesRepDistinctDays } = props
    let cells: VNode[] = []

    if (props.renderIntro) {
      cells = props.renderIntro()
    }

    let colHeadFormat = createFormatter(
      context.options.columnHeaderFormat ||
      computeFallbackHeaderFormat(datesRepDistinctDays, dates.length)
    )

    for (let date of dates) {
      cells.push(
        <TableDateCell
          dateMarker={date}
          dateProfile={props.dateProfile}
          datesRepDistinctDays={datesRepDistinctDays}
          colCnt={dates.length}
          colHeadFormat={colHeadFormat}
        />
      )
    }

    if (context.isRtl) {
      cells.reverse()
    }

    return (
      <div ref={this.rootElRef} class={'fc-row ' + theme.getClass('headerRow')}>
        <table class={theme.getClass('tableGrid')}>
          <thead>
            <tr>{cells}</tr>
          </thead>
        </table>
      </div>
    )
  }

}
