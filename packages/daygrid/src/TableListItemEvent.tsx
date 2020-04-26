import { h, BaseComponent, Seg, EventRoot, createFormatter, buildSegTimeText, EventMeta, Fragment } from '@fullcalendar/common'
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

    // TODO: avoid createFormatter, cache!!!
    // SOLUTION: require that props.defaultTimeFormat is a real formatter, a top-level const,
    // which will require that defaultRangeSeparator be part of the DateEnv (possible already?),
    // and have options.eventTimeFormat be preprocessed.
    let timeFormat = createFormatter(
      context.options.eventTimeFormat || DEFAULT_TABLE_EVENT_TIME_FORMAT,
      context.options.defaultRangeSeparator
    )

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
        {(rootElRef, classNames, style, innerElRef, innerContent, innerProps) => ( // we don't use styles!
          <a
            className={[ 'fc-daygrid-event', 'fc-daygrid-dot-event' ].concat(classNames).join(' ')}
            ref={rootElRef}
            style={{ color: innerProps.textColor }}
            {...getSegAnchorAttrs(props.seg)}
          >
            {innerContent}
          </a>
        )}
      </EventRoot>
    )
  }

}


function renderInnerContent(innerProps: EventMeta) {
  return [
    <div
      className='fc-daygrid-event-dot'
      style={{ backgroundColor: innerProps.backgroundColor || innerProps.borderColor }}
    />,
    innerProps.timeText &&
      <div className='fc-event-time'>{innerProps.timeText}</div>
    ,
    <div className='fc-event-title'>
      {innerProps.event.title || <Fragment>&nbsp;</Fragment>}
    </div>
  ]
}


function getSegAnchorAttrs(seg: Seg) { // not dry. in StandardEvent too
  let url = seg.eventRange.def.url
  return url ? { href: url } : {}
}
