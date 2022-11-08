import { createElement } from '../preact.js'
import { BaseComponent } from '../vdom-util.js'
import { Seg } from '../component/DateComponent.js'
import { EventContentArg } from '../component/event-rendering.js'
import { EventContainer } from './EventContainer.js'

export interface BgEventProps {
  seg: Seg
  isPast: boolean
  isFuture: boolean
  isToday: boolean
}

export class BgEvent extends BaseComponent<BgEventProps> {
  render() {
    let { props } = this
    let { seg } = props

    return (
      <EventContainer
        elTag="div"
        elClasses={['fc-bg-event']}
        elStyle={{ backgroundColor: seg.eventRange.ui.backgroundColor }}
        defaultGenerator={renderInnerContent}
        seg={seg}
        timeText=""
        isDragging={false}
        isResizing={false}
        isDateSelecting={false}
        isSelected={false}
        isPast={props.isPast}
        isFuture={props.isFuture}
        isToday={props.isToday}
        disableDragging={true}
        disableResizing={true}
      />
    )
  }
}

function renderInnerContent(props: EventContentArg) {
  let { title } = props.event

  return title && (
    <div className="fc-event-title">{props.event.title}</div>
  )
}

export function renderFill(fillType: string) {
  return (
    <div className={`fc-${fillType}`} />
  )
}
