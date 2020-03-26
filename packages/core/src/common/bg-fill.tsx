import { h } from '../vdom'
import { EventRoot } from './EventRoot'
import { Seg } from '../component/DateComponent'
import { EventMeta } from '../component/event-rendering'


export function renderFill(fillType: string, extraClassNames: string[]) { // TODO: kill extraClassNames
  return (
    <div class={[ `fc-${fillType}` ].concat(extraClassNames).join(' ')} />
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
    timeText={'' /* weird */}
    disableDragging={true}
    disableResizing={true}
    isDragging={false}
    isResizing={false}
    isDateSelecting={false}
    isSelected={false}
    isPast={props.isPast}
    isFuture={props.isFuture}
    isToday={props.isToday}
  >
    {(rootElRef, classNames, style, innerElRef, innerContent) => (
      <div ref={rootElRef} className={[ 'fc-bgevent' ].concat(classNames).join(' ')} style={style}>
        {innerContent}
      </div>
    )}
  </EventRoot>
)

function renderInnerContent(props: EventMeta) {
  let title = props.event.title

  return title && (
    <div class='fc-event-title'>{props.event.title}</div>
  )
}
