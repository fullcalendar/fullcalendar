import {
  BaseComponent, DateMarker, createElement, DateRange, getDateMeta,
  RenderHook, DayHeaderContentArg, getDayClassNames, formatDayString, Fragment, buildNavLinkAttrs, getUniqueDomId
} from '@fullcalendar/common'

export interface ListViewHeaderRowProps {
  cellId: string
  dayDate: DateMarker
  todayRange: DateRange
}

interface HookProps extends DayHeaderContentArg { // doesn't enforce much since DayCellContentArg allow extra props
  textId: string // for aria-labeledby
  text: string
  sideText: string
}

export class ListViewHeaderRow extends BaseComponent<ListViewHeaderRowProps> {
  state = {
    textId: getUniqueDomId(),
  }

  render() {
    let { theme, dateEnv, options, viewApi } = this.context
    let { cellId, dayDate, todayRange } = this.props
    let { textId } = this.state
    let dayMeta = getDateMeta(dayDate, todayRange)

    // will ever be falsy?
    let text = options.listDayFormat ? dateEnv.format(dayDate, options.listDayFormat) : ''

    // will ever be falsy? also, BAD NAME "alt"
    let sideText = options.listDaySideFormat ? dateEnv.format(dayDate, options.listDaySideFormat) : ''

    let navLinkAttrs = buildNavLinkAttrs(this.context, dayDate)

    let hookProps: HookProps = {
      date: dateEnv.toDate(dayDate),
      view: viewApi,
      textId,
      text,
      sideText,
      navLinkAttrs,
      ...dayMeta,
    }

    let classNames = ['fc-list-day'].concat(
      getDayClassNames(dayMeta, theme),
    )

    // TODO: make a reusable HOC for dayHeader (used in daygrid/timegrid too)
    return (
      <RenderHook<HookProps>
        hookProps={hookProps}
        classNames={options.dayHeaderClassNames}
        content={options.dayHeaderContent}
        defaultContent={renderInnerContent}
        didMount={options.dayHeaderDidMount}
        willUnmount={options.dayHeaderWillUnmount}
      >
        {(rootElRef, customClassNames, innerElRef, innerContent) => (
          <tr
            ref={rootElRef}
            className={classNames.concat(customClassNames).join(' ')}
            data-date={formatDayString(dayDate)}
          >
            <th scope='colgroup' colSpan={3} id={cellId} aria-labeledby={textId}>{/* TODO: force-hide top border based on :first-child */}
              <div className={'fc-list-day-cushion ' + theme.getClass('tableCellShaded')} ref={innerElRef}>
                {innerContent}
              </div>
            </th>
          </tr>
        )}
      </RenderHook>
    )
  }
}

function renderInnerContent(props: HookProps) {
  let { navLinkAttrs } = props

  return (
    <Fragment>
      {props.text && (
        <a id={props.textId} className="fc-list-day-text" {...navLinkAttrs}>
          {props.text}
        </a>
      )}
      {props.sideText && (
        <a aria-hidden={true} className="fc-list-day-side-text" {...navLinkAttrs}>
          {props.sideText}
        </a>
      )}
    </Fragment>
  )
}
