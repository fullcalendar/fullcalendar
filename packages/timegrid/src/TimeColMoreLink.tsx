import {
  createElement, MoreLinkContentArg, MoreLinkRoot, BaseComponent, createRef, setRef,
} from '@fullcalendar/common'
import { TimeColsSeg } from './TimeColsSeg'

export interface TimeColMoreLinkProps {
  hiddenSegs: TimeColsSeg[]
  top: number
  bottom: number
}

export class TimeColMoreLink extends BaseComponent<TimeColMoreLinkProps> {
  rootElRef = createRef<HTMLElement>()

  render(props: TimeColMoreLinkProps) {
    return (
      <MoreLinkRoot
        allDayDate={null}
        allSegs={props.hiddenSegs}
        hiddenSegs={props.hiddenSegs}
        positionElRef={this.rootElRef}
        defaultContent={renderMoreLinkInner}
      >
        {(rootElRef, classNames, innerElRef, innerContent, handleClick) => (
          <a
            ref={(el: HTMLElement | null) => {
              setRef(rootElRef, el)
              setRef(this.rootElRef, el)
            }}
            className={['fc-timegrid-event-more'].concat(classNames).join(' ')}
            style={{ top: props.top, bottom: props.bottom }}
            onClick={handleClick}
          >
            <div ref={innerElRef} className="fc-timegrid-event-more-inner fc-sticky">
              {innerContent}
            </div>
          </a>
        )}
      </MoreLinkRoot>
    )
  }
}

function renderMoreLinkInner(props: MoreLinkContentArg) {
  return props.shortText
}

