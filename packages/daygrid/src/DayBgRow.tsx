import {
  h, VNode,
  ComponentContext,
  DateMarker,
  DateProfile,
  BaseComponent,
  RefMap
} from '@fullcalendar/core'
import DayBgCell from './DayBgCell'


export interface DayBgRowProps {
  cells: DayBgCellModel[]
  dateProfile: DateProfile
  cellElRefs: RefMap<HTMLTableCellElement>
  renderIntro?: () => VNode[]
}

export interface DayBgCellModel {
  date: DateMarker
  htmlAttrs?: object
}


export default class DayBgRow extends BaseComponent<DayBgRowProps> {


  render(props: DayBgRowProps, state: {}, context: ComponentContext) {
    let { cells } = props
    let parts: VNode[] = []

    if (props.renderIntro) {
      parts.push(...props.renderIntro())
    }

    for (let i = 0; i < cells.length; i++) {
      let cell = cells[i]

      parts.push(
        <DayBgCell
          date={cell.date}
          dateProfile={props.dateProfile}
          otherAttrs={cell.htmlAttrs}
          elRef={props.cellElRefs.createRef(i)}
        />
      )
    }

    if (!cells.length) {
      parts.push(
        <td class='fc-day'></td>
      )
    }

    return (<tr>{parts}</tr>)
  }

}
