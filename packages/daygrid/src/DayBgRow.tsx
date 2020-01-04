import {
  h, VNode,
  ComponentContext,
  DateMarker,
  getDayClasses,
  rangeContainsMarker,
  DateProfile,
  BaseComponent
} from '@fullcalendar/core'


export interface DayBgCell {
  date: DateMarker
  htmlAttrs?: object
}

export interface DayBgRowProps {
  cells: DayBgCell[]
  dateProfile: DateProfile
  renderIntro?: () => VNode[]
}


export default class DayBgRow extends BaseComponent<DayBgRowProps> {

  render(props: DayBgRowProps, state: {}, context: ComponentContext) {
    let parts: VNode[] = []

    if (props.renderIntro) {
      parts.push(...props.renderIntro())
    }

    for (let cell of props.cells) {
      parts.push(
        renderCell(
          cell.date,
          props.dateProfile,
          context,
          cell.htmlAttrs
        )
      )
    }

    if (!props.cells.length) {
      parts.push(
        <td class={'fc-day ' + context.theme.getClass('tableCellNormal')}></td>
      )
    }

    if (context.options.dir === 'rtl') {
      parts.reverse()
    }

    return (
      <tr>{parts}</tr>
    )
  }

}


function renderCell(date: DateMarker, dateProfile: DateProfile, context: ComponentContext, otherAttrs?: object) {
  let { dateEnv, theme } = context
  let isDateValid = rangeContainsMarker(dateProfile.activeRange, date) // TODO: called too frequently. cache somehow.
  let classes = getDayClasses(date, dateProfile, context)
  let dataAttrs = isDateValid ? { 'data-date': dateEnv.formatIso(date, { omitTime: true }) } : {}

  classes.unshift('fc-day', theme.getClass('tableCellNormal'))

  return (
    <td
      class={classes.join(' ')}
      { ...dataAttrs }
      {...otherAttrs }></td>
  )
}
