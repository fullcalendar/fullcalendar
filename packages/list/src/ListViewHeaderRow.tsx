import {
  BaseComponent, DateMarker, DateRange, getDateMeta,
  RenderHook, DayHeaderContentArg, getDayClassNames, formatDayString, buildNavLinkAttrs, getUniqueDomId,
} from '@fullcalendar/core'
import {
  createElement, Fragment
} from '@fullcalendar/core/preact'

export interface ListViewHeaderRowProps {
  cellId: string
  dayDate: DateMarker
  todayRange: DateRange
}

interface HookProps extends DayHeaderContentArg { // doesn't enforce much since DayCellContentArg allow extra props
  textId: string // for aria-labelledby
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

    let hookProps: HookProps = {
      date: dateEnv.toDate(dayDate),
      view: viewApi,
      textId,
      text,
      sideText,
      navLinkAttrs: buildNavLinkAttrs(this.context, dayDate),
      sideNavLinkAttrs: buildNavLinkAttrs(this.context, dayDate, 'day', false),
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
            {/* TODO: force-hide top border based on :first-child */}
            <th scope="colgroup" colSpan={3} id={cellId} aria-labelledby={textId}>
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
  return (
    <Fragment>
      {props.text && (
        <a id={props.textId} className="fc-list-day-text" {...props.navLinkAttrs}>
          {props.text}
        </a>
      )}
      {props.sideText && (/* not keyboard tabbable */
        <a aria-hidden className="fc-list-day-side-text" {...props.sideNavLinkAttrs}>
          {props.sideText}
        </a>
      )}
    </Fragment>
  )
}
