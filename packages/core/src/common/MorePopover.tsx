import { DateComponent } from '../component/DateComponent.js'
import { DateRange } from '../datelib/date-range.js'
import { DateMarker } from '../datelib/marker.js'
import { DateProfile } from '../DateProfileGenerator.js'
import { Hit } from '../interactions/hit.js'
import { Dictionary } from '../options.js'
import { createElement, ComponentChildren } from '../preact.js'
import { DayCellContainer, hasCustomDayCellContent } from './DayCellContainer.js'
import { Popover } from './Popover.js'

export interface MorePopoverProps {
  id: string
  startDate: DateMarker
  endDate: DateMarker
  dateProfile: DateProfile
  parentEl: HTMLElement
  alignmentEl: HTMLElement
  alignGridTop?: boolean
  forceTimed?: boolean
  todayRange: DateRange
  extraDateSpan: Dictionary
  children: ComponentChildren
  onClose?: () => void
}

export class MorePopover extends DateComponent<MorePopoverProps> {
  rootEl: HTMLElement

  render() {
    let { options, dateEnv } = this.context
    let { props } = this
    let { startDate, todayRange, dateProfile } = props
    let title = dateEnv.format(startDate, options.dayPopoverFormat)

    return (
      <DayCellContainer
        elRef={this.handleRootEl}
        date={startDate}
        dateProfile={dateProfile}
        todayRange={todayRange}
      >
        {(InnerContent, renderProps, elAttrs) => (
          <Popover
            elRef={elAttrs.ref}
            id={props.id}
            title={title}
            extraClassNames={
              ['fc-more-popover'].concat(
                (elAttrs.className as (string | undefined)) || [],
              )
            }
            extraAttrs={elAttrs /* TODO: make these time-based when not whole-day? */}
            parentEl={props.parentEl}
            alignmentEl={props.alignmentEl}
            alignGridTop={props.alignGridTop}
            onClose={props.onClose}
          >
            {hasCustomDayCellContent(options) && (
              <InnerContent
                elTag="div"
                elClasses={['fc-more-popover-misc']}
              />
            )}
            {props.children}
          </Popover>
        )}
      </DayCellContainer>
    )
  }

  handleRootEl = (rootEl: HTMLElement | null) => {
    this.rootEl = rootEl

    if (rootEl) {
      this.context.registerInteractiveComponent(this, {
        el: rootEl,
        useEventCenter: false,
      })
    } else {
      this.context.unregisterInteractiveComponent(this)
    }
  }

  queryHit(positionLeft: number, positionTop: number, elWidth: number, elHeight: number): Hit {
    let { rootEl, props } = this

    if (
      positionLeft >= 0 && positionLeft < elWidth &&
      positionTop >= 0 && positionTop < elHeight
    ) {
      return {
        dateProfile: props.dateProfile,
        dateSpan: {
          allDay: !props.forceTimed,
          range: {
            start: props.startDate,
            end: props.endDate,
          },
          ...props.extraDateSpan,
        },
        dayEl: rootEl,
        rect: {
          left: 0,
          top: 0,
          right: elWidth,
          bottom: elHeight,
        },
        layer: 1, // important when comparing with hits from other components
      }
    }

    return null
  }
}
