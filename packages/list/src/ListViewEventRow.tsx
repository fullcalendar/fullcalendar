import {
  MinimalEventProps, BaseComponent, ComponentContext, MountHook, ClassNamesHook, InnerContentHook, setRef, h, Fragment,
  EventInnerContentProps, getEventClassNames, setElSeg, EventApi, Seg, isMultiDayRange, DateFormatter, buildSegTimeText, createFormatter
} from "@fullcalendar/core"


const DEFAULT_TIME_FORMAT = {
  hour: 'numeric',
  minute: '2-digit',
  meridiem: 'short'
}


export default class ListViewEventRow extends BaseComponent<MinimalEventProps> {


  render(props: MinimalEventProps, state: {}, context: ComponentContext) {
    let { options } = context
    let { seg } = props

    let staticInnerProps = {
      event: new EventApi(context.calendar, seg.eventRange.def, seg.eventRange.instance),
      view: context.view
    }

    // TODO: avoid createFormatter, cache!!! see TODO in StandardEvent
    let timeFormat = createFormatter(
      options.eventTimeFormat || DEFAULT_TIME_FORMAT,
      options.defaultRangeSeparator
    )

    let innerProps: EventInnerContentProps = {
      ...staticInnerProps,
      timeText: buildTimeText(seg, timeFormat, context),
      isDraggable: false,
      isStartResizable: false,
      isEndResizable: false,
      isMirror: false,
      isStart: seg.isStart,
      isEnd: seg.isEnd,
      isPast: props.isPast,
      isFuture: props.isFuture,
      isToday: props.isToday,
      isSelected: props.isSelected,
      isDragging: props.isDragging,
      isResizing: props.isResizing
    }

    return (
      <MountHook
        name='event'
        handlerProps={staticInnerProps}
        content={(rootElRef) => (
          <ClassNamesHook
            name='event'
            handlerProps={innerProps}
            content={(customClassNames) => (
              <InnerContentHook
                name='event'
                innerProps={innerProps}
                defaultInnerContent={renderInnerContent}
                outerContent={(innerContentParentRef, innerContent) => {
                  let classNames = [ 'fc-list-item' ].concat(
                    getEventClassNames(innerProps),
                    customClassNames
                  )

                  const rootRefFunc = (el: HTMLElement | null) => {
                    setRef(rootElRef, el)
                    setRef(innerContentParentRef, el)
                    if (el) { setElSeg(el, seg) }
                  }

                  return (
                    <tr className={classNames.join(' ')} ref={rootRefFunc}>
                      {innerContent}
                    </tr>
                  )
                }}
              />
            )}
          />
        )}
      />
    )
  }

}


function renderInnerContent(props: EventInnerContentProps) {
  let { event } = props
  let url = event.url
  let anchorAttrs = url ? { href: url } : {}

  return (
    <Fragment>
      {props.timeText &&
        <td class='fc-list-item-time'>
          {props.timeText}
        </td>
      }
      <td class='fc-list-item-marker'>
        <span class='fc-event-dot' style={{
          backgroundColor: event.backgroundColor
        }} />
      </td>
      <td class='fc-list-item-title'>
        <a {...anchorAttrs}>{/* TODO: document how whole row become clickable */}
          {event.title}
        </a>
      </td>
    </Fragment>
  )
}


function buildTimeText(seg: Seg, timeFormat: DateFormatter, context: ComponentContext) {
  let { displayEventTime, allDayText } = context.options
  let eventDef = seg.eventRange.def
  let eventInstance = seg.eventRange.instance

  if (displayEventTime !== false) {

    if (eventDef.allDay) {
      return allDayText // TODO: allDayHtml?

    } else if (isMultiDayRange(seg.eventRange.range)) { // TODO: use (!isStart || !isEnd) instead?

      if (seg.isStart) {
        return buildSegTimeText(
          seg,
          timeFormat,
          context,
          null,
          null,
          eventInstance.range.start,
          seg.end
        )

      } else if (seg.isEnd) {
        return buildSegTimeText(
          seg,
          timeFormat,
          context,
          null,
          null,
          seg.start,
          eventInstance.range.end
        )

      } else {
        return allDayText // TODO: allDayHtml?
      }

    } else {
      return buildSegTimeText(
        seg,
        timeFormat,
        context
      )
    }
  }

  return ''
}
