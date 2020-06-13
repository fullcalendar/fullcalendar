import { createElement, BaseComponent, Seg, EventRoot, buildSegTimeText, EventContentArg, Fragment } from '@fullcalendar/common'
import { DEFAULT_TABLE_EVENT_TIME_FORMAT } from './event-rendering'


export interface DotTableEventProps {
  seg: Seg
  isDragging: boolean
  isSelected: boolean
  isPast: boolean
  isFuture: boolean
  isToday: boolean
  defaultDisplayEventEnd: boolean
}

export class TableListItemEvent extends BaseComponent<DotTableEventProps> {

  render() {
    let { props, context } = this
    let timeFormat = context.options.eventTimeFormat || DEFAULT_TABLE_EVENT_TIME_FORMAT
    let timeText = buildSegTimeText(props.seg, timeFormat, context, true, props.defaultDisplayEventEnd)

    return (
      <EventRoot
        seg={props.seg}
        timeText={timeText}
        defaultContent={renderInnerContent}
        isDragging={props.isDragging}
        isResizing={false}
        isDateSelecting={false}
        isSelected={props.isSelected}
        isPast={props.isPast}
        isFuture={props.isFuture}
        isToday={props.isToday}
      >
        {(rootElRef, classNames, innerElRef, innerContent, hookProps) => ( // we don't use styles!
          <a
            className={[ 'fc-daygrid-event', 'fc-daygrid-dot-event' ].concat(classNames).join(' ')}
            ref={rootElRef}
            style={{ color: hookProps.textColor }}
            {...getSegAnchorAttrs(props.seg)}
          >
            {innerContent}
          </a>
        )}
      </EventRoot>
    )
  }

}


function renderInnerContent(innerProps: EventContentArg) {
  return (
    <Fragment>
      <div
        className='fc-daygrid-event-dot'
        style={{ backgroundColor: innerProps.backgroundColor || innerProps.borderColor }}
      />
      {innerProps.timeText &&
        <div className='fc-event-time'>{innerProps.timeText}</div>
      }
      <div className='fc-event-title'>
        {innerProps.event.title || <Fragment>&nbsp;</Fragment>}
      </div>
    </Fragment>
  )
}


function getSegAnchorAttrs(seg: Seg) { // not dry. in StandardEvent too
  let url = seg.eventRange.def.url
  return url ? { href: url } : {}
}
