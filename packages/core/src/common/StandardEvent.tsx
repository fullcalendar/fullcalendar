
import { ComponentChildren, h, Fragment } from '../vdom'
import { BaseComponent } from '../vdom-util'
import { createFormatter } from '../datelib/formatting'
import { buildSegTimeText, EventMeta } from '../component/event-rendering'
import { EventRoot, MinimalEventProps } from './EventRoot'
import { Seg } from '../component/DateComponent'
import ComponentContext from '../component/ComponentContext'


export interface StandardEventProps extends MinimalEventProps {
  extraClassNames: string[]
  defaultTimeFormat: any // date-formatter INPUT
  defaultDisplayEventTime?: boolean // default true
  defaultDisplayEventEnd?: boolean // default true
  disableDragging?: boolean // default false
  disableResizing?: boolean // default false
  defaultContent?: (hookProps: EventMeta) => ComponentChildren // not used by anyone yet
}


// should not be a purecomponent
export default class StandardEvent extends BaseComponent<StandardEventProps> {

  render(props: StandardEventProps, state: {}, context: ComponentContext) {
    let { options } = context

    // TODO: avoid createFormatter, cache!!!
    // SOLUTION: require that props.defaultTimeFormat is a real formatter, a top-level const,
    // which will require that defaultRangeSeparator be part of the DateEnv (possible already?),
    // and have options.eventTimeFormat be preprocessed.
    let timeFormat = createFormatter(
      options.eventTimeFormat || props.defaultTimeFormat,
      options.defaultRangeSeparator
    )

    let timeText = buildSegTimeText(props.seg, timeFormat, context, props.defaultDisplayEventTime, props.defaultDisplayEventEnd)

    return (
      <EventRoot
        seg={props.seg}
        timeText={timeText}
        disableDragging={props.disableDragging}
        disableResizing={props.disableResizing}
        defaultContent={props.defaultContent || renderInnerContent}
        isDragging={props.isDragging}
        isResizing={props.isResizing}
        isDateSelecting={props.isDateSelecting}
        isSelected={props.isSelected}
        isPast={props.isPast}
        isFuture={props.isFuture}
        isToday={props.isToday}
      >
        {(rootElRef, classNames, style, innerElRef, innerContent, hookProps) => (
          <a
            className={props.extraClassNames.concat(classNames).join(' ')}
            style={style}
            ref={rootElRef}
            {...getSegAnchorAttrs(props.seg)}
          >
            <div class='fc-event-main' ref={innerElRef}>
              {innerContent}
            </div>
            {hookProps.isStartResizable &&
              <div class='fc-event-resizer fc-event-resizer-start' />
            }
            {hookProps.isEndResizable &&
              <div class='fc-event-resizer fc-event-resizer-end' />
            }
          </a>
        )}
      </EventRoot>
    )
  }

}


function renderInnerContent(innerProps: EventMeta) {
  return [
    innerProps.timeText &&
      <div class='fc-event-time'>{innerProps.timeText}</div>
    ,
    <div class='fc-event-title'>
      {innerProps.event.title || <Fragment>&nbsp;</Fragment>}
    </div>
  ]
}


function getSegAnchorAttrs(seg: Seg) {
  let url = seg.eventRange.def.url
  return url ? { href: url } : {}
}
