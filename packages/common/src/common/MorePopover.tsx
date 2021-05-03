import { DateComponent } from '../component/DateComponent'
import { DateRange } from '../datelib/date-range'
import { addDays, DateMarker } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import { Hit } from '../interactions/hit'
import { Dictionary } from '../options'
import { createElement, ComponentChildren } from '../vdom'
import { DayCellContent } from './DayCellContent'
import { DayCellRoot } from './DayCellRoot'
import { Popover } from './Popover'

export interface MorePopoverProps {
  date: DateMarker
  dateProfile: DateProfile
  alignmentEl: HTMLElement
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
    let { date, todayRange, dateProfile } = props
    let title = dateEnv.format(date, options.dayPopoverFormat)

    return (
      <DayCellRoot date={date} dateProfile={dateProfile} todayRange={todayRange} elRef={this.handleRootEl}>
        {(rootElRef, dayClassNames, dataAttrs) => (
          <Popover
            elRef={rootElRef}
            title={title}
            extraClassNames={['fc-more-popover'].concat(dayClassNames)}
            extraAttrs={dataAttrs}
            alignmentEl={props.alignmentEl}
            onClose={props.onClose}
          >
            <DayCellContent date={date} dateProfile={dateProfile} todayRange={todayRange}>
              {(innerElRef, innerContent) => (
                innerContent &&
                  <div className="fc-more-popover-misc" ref={innerElRef}>{innerContent}</div>
              )}
            </DayCellContent>
            {props.children}
          </Popover>
        )}
      </DayCellRoot>
    )
  }

  handleRootEl = (rootEl: HTMLDivElement | null) => {
    this.rootEl = rootEl
    if (rootEl) {
      this.context.registerInteractiveComponent(this, { el: rootEl })
    } else {
      this.context.unregisterInteractiveComponent(this)
    }
  }

  queryHit(positionLeft: number, positionTop: number, elWidth: number, elHeight: number): Hit {
    let { rootEl, props } = this
    let { date } = props

    if (
      positionLeft >= 0 && positionLeft < elWidth &&
      positionTop >= 0 && positionTop < elHeight
    ) {
      return {
        dateProfile: props.dateProfile,
        dateSpan: {
          allDay: true,
          range: { start: date, end: addDays(date, 1) },
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
