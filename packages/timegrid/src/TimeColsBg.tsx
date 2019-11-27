import {
  BaseComponent,
  DateProfile,
  ComponentContext,
  DateMarker,
  findElements,
  guid
} from '@fullcalendar/core'
import { DayBgRow } from '@fullcalendar/daygrid'
import { h, VNode } from 'preact'


export interface TimeColsBgProps {
  dateProfile: DateProfile
  cells: TimeColsCell[]
  renderIntro: () => VNode[]
  handleDom?: (rootEl: HTMLElement | null, colEls: HTMLElement[] | null) => void
}

export interface TimeColsCell {
  date: DateMarker
  htmlAttrs?: object
}


export default class TimeColsBg extends BaseComponent<TimeColsBgProps> {


  render(props: TimeColsBgProps, state: {}, context: ComponentContext) {
    let { theme } = context

    return ( // guid rerenders whole DOM every time
      <div class='fc-bg' ref={this.handleRootEl} key={guid()}>
        <table class={theme.getClass('tableGrid')}>
          <DayBgRow
            cells={props.cells}
            dateProfile={props.dateProfile}
            renderIntro={props.renderIntro}
          />
        </table>
      </div>
    )
  }


  handleRootEl = (rootEl: HTMLDivElement | null) => {
    let { calendar, view, dateEnv, isRtl } = this.context
    let { cells, handleDom } = this.props
    let colEls = null

    if (rootEl) {
      colEls = findElements(rootEl, '.fc-day, .fc-disabled-day')

      for (let col = 0; col < cells.length; col++) {
        calendar.publiclyTrigger('dayRender', [
          {
            date: dateEnv.toDate(cells[col].date),
            el: colEls[col],
            view
          }
        ])
      }

      if (isRtl) {
        colEls.reverse()
      }
    }

    if (handleDom) {
      handleDom(rootEl, colEls)
    }
  }

}
