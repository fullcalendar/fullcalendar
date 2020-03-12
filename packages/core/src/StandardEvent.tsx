import { ComponentContext, h, Fragment, VNode } from '@fullcalendar/core'
import { BaseComponent, setRef } from './vdom-util'
import { createFormatter } from './datelib/formatting'
import { Seg } from './component/DateComponent'
import { EventInnerContentProps, setElSeg, getEventClassNames, getSkinCss, computeSegDraggable, computeSegStartResizable, computeSegEndResizable, buildSegTimeText } from './component/event-rendering'
import { MountHook, ClassNamesHook, InnerContentHook } from './render-hook'
import EventApi from './api/EventApi'


export interface StandardEventProps extends MinimalEventProps {
  extraClassNames: string[]
  defaultTimeFormat: any // date-formatter INPUT
  defaultDisplayEventTime?: boolean // default true
  defaultDisplayEventEnd?: boolean // default true
  disableDragging?: boolean // default false
  disableResizing?: boolean // default false
  defaultInnerContent?: (innerProps: EventInnerContentProps) => VNode // not used by anyone yet
}

export interface MinimalEventProps {
  seg: Seg
  isDragging: boolean      // rename to isMirrorDragging? make optional?
  isResizing: boolean      // rename to isMirrorResizing? make optional?
  isDateSelecting: boolean // rename to isMirrorDateSelecting? make optional?
  isSelected: boolean
  isPast: boolean
  isFuture: boolean
  isToday: boolean
}


// should not be a purecomponent
export default class StandardEvent extends BaseComponent<StandardEventProps> {


  render(props: StandardEventProps, state: {}, context: ComponentContext) {
    let { options } = context
    let { seg } = props

    let staticInnerProps = {
      event: new EventApi(context.calendar, seg.eventRange.def, seg.eventRange.instance),
      view: context.view
    }

    // TODO: avoid createFormatter, cache!!!
    // SOLUTION: require that props.defaultTimeFormat is a real formatter, a top-level const,
    // which will require that defaultRangeSeparator be part of the DateEnv (possible already?),
    // and have options.eventTimeFormat be preprocessed.
    let timeFormat = createFormatter(
      options.eventTimeFormat || props.defaultTimeFormat,
      options.defaultRangeSeparator
    )

    let innerProps: EventInnerContentProps = {
      ...staticInnerProps,
      timeText: buildSegTimeText(seg, timeFormat, context, props.defaultDisplayEventTime, props.defaultDisplayEventEnd),
      isDraggable: !props.disableDragging && computeSegDraggable(seg, context),
      isStartResizable: !props.disableResizing && computeSegStartResizable(seg, context),
      isEndResizable: !props.disableResizing && computeSegEndResizable(seg, context),
      isMirror: props.isDragging || props.isResizing || props.isDateSelecting,
      isStart: seg.isStart,
      isEnd: seg.isEnd,
      isPast: props.isPast,
      isFuture: props.isFuture,
      isToday: props.isToday,
      isSelected: props.isSelected,
      isDragging: props.isDragging,
      isResizing: props.isResizing
    }

    let url = seg.eventRange.def.url
    let anchorAttrs = url ? { href: url } : {}
    let style = getSkinCss(seg.eventRange.ui)
    let standardClassNames = props.extraClassNames.concat(
      getEventClassNames(innerProps),
    )

    return (
      <MountHook name='event' handlerProps={staticInnerProps}>
        {(rootElRef) => (
          <ClassNamesHook name='event' handlerProps={innerProps}>
            {(customClassNames) => (
              <a
                {...anchorAttrs}
                className={standardClassNames.concat(customClassNames).join(' ')}
                style={style}
                ref={(el: HTMLElement | null) => {
                  setRef(rootElRef, el)
                  if (el) { setElSeg(el, seg) }
                }}
              >
                <InnerContentHook name='event' innerProps={innerProps} defaultInnerContent={props.defaultInnerContent || renderInnerContent}>
                  {(innerContentParentRef, innerContent) => {
                    return [
                      <div class='fc-event-inner' ref={innerContentParentRef}>
                        {innerContent}
                      </div>,
                      innerProps.isStartResizable &&
                        <div class='fc-event-resizer fc-event-resizer-start' />,
                      innerProps.isEndResizable &&
                        <div class='fc-event-resizer fc-event-resizer-end' />
                    ]
                  }}
                </InnerContentHook>
              </a>
            )}
          </ClassNamesHook>
        )}
      </MountHook>
    )
  }

}


function renderInnerContent(innerProps: EventInnerContentProps) {
  return (
    <Fragment>
      {innerProps.timeText &&
        <div class='fc-event-time'>{innerProps.timeText}</div>
      }
      <div class='fc-event-title'>
        {innerProps.event.title || <Fragment>&nbsp;</Fragment>}
      </div>
    </Fragment>
  )
}
