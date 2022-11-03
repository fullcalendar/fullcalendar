import { createElement } from '../preact.js'
import { Seg } from '../component/DateComponent.js'
import { EventContentArg, getEventClassNames } from '../component/event-rendering.js'
import { LifecycleMonitor } from '../content-inject/LifecycleMonitor.js'
import { BaseComponent } from '../vdom-util.js'
import { buildEventContentArg } from './EventRoot.js'
import { ContentInjector } from '../content-inject/ContentInjector.js'

export function renderFill(fillType: string) {
  return (
    <div className={`fc-${fillType}`} />
  )
}

export interface BgEventProps {
  seg: Seg
  isPast: boolean
  isFuture: boolean
  isToday: boolean
}

export class BgEvent extends BaseComponent<BgEventProps> {
  render() {
    let { props, context } = this
    let { options } = context
    let { seg } = props
    let eventContentArg = buildEventContentArg({
      ...props,
      timeText: '',
      isDragging: false,
      isResizing: false,
      isDateSelecting: false,
      isSelected: false,
      disableDragging: true,
      disableResizing: true,
    }, context)
    let className = getEventClassNames(eventContentArg)
      .concat(seg.eventRange.ui.classNames)
      .concat(['fc-bg-event'])
      .join(' ')

    return (
      <LifecycleMonitor
        didMount={options.eventDidMount}
        willUnmount={options.eventWillUnmount}
        renderProps={eventContentArg}
      >
        <ContentInjector
          className={className}
          style={{ backgroundColor: eventContentArg.backgroundColor }}
          optionName="eventContent"
          renderProps={eventContentArg}
        >
          {renderInnerContent}
        </ContentInjector>
      </LifecycleMonitor>
    )
  }
}

function renderInnerContent(props: EventContentArg) {
  let { title } = props.event

  return title && (
    <div className="fc-event-title">{props.event.title}</div>
  )
}
