import { createElement } from '../vdom'
import { EventRoot } from './EventRoot'
import { Seg } from '../component/DateComponent'
import { EventContentArg } from '../component/event-rendering'

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

export const BgEvent = (props: BgEventProps) => (
  <EventRoot
    defaultContent={renderInnerContent}
    seg={props.seg /* uselesss i think */}
    timeText=""
    disableDragging
    disableResizing
    isDragging={false}
    isResizing={false}
    isDateSelecting={false}
    isSelected={false}
    isPast={props.isPast}
    isFuture={props.isFuture}
    isToday={props.isToday}
  >
    {(rootElRef, classNames, innerElRef, innerContent, hookProps) => (
      <div
        ref={rootElRef}
        className={['fc-bg-event'].concat(classNames).join(' ')}
        style={{
          backgroundColor: hookProps.backgroundColor,
        }}
      >
        {innerContent}
      </div>
    )}
  </EventRoot>
)

function renderInnerContent(props: EventContentArg) {
  let { title } = props.event

  return title && (
    <div className="fc-event-title">{props.event.title}</div>
  )
}
