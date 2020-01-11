import {
  h, VNode,
  ComponentContext,
  DateMarker,
  DateProfile,
  BaseComponent,
  RefMap
} from '@fullcalendar/core'
import DayBgCell from './DayBgCell'


export interface DayBgCellModel {
  date: DateMarker
  htmlAttrs?: object
}

export interface DayBgRowProps {
  cells: DayBgCellModel[]
  dateProfile: DateProfile
  renderIntro?: () => VNode[]
  onReceiveCellEls?: (cellEls: HTMLElement[] | null) => void
}


export default class DayBgRow extends BaseComponent<DayBgRowProps> {

  cellElRefs = new RefMap<HTMLTableCellElement>()


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
          elRef={this.cellElRefs.createRef(i)}
        />
      )
    }

    if (!cells.length) {
      parts.push(
        <td class={'fc-day ' + context.theme.getClass('tableCellNormal')}></td>
      )
    }

    return (<tr>{parts}</tr>)
  }


  componentDidMount() {
    this.sendDom()
  }


  componentDidUpdate() {
    this.sendDom()
  }


  componentWillUnmount() {
    let { onReceiveCellEls } = this.props
    if (onReceiveCellEls) {
      onReceiveCellEls(null)
    }
  }


  sendDom() {
    let { onReceiveCellEls } = this.props
    if (onReceiveCellEls) {
      onReceiveCellEls(this.cellElRefs.collect())
    }
  }

}

DayBgRow.addPropsEquality({
  onReceiveCellEls: true
})
