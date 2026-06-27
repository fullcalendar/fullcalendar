import { BaseComponent } from '../vdom-util'
import { EventDisplayInfo, EventRenderRange, setElEventRange } from '../component-util/event-rendering'
import { memoize } from '../util/memoize'
import { EventDef } from '../structs/event-def'
import { EventInstance } from '../structs/event-instance'
import { EventImpl } from '../api/EventImpl'
import { ViewContext } from '../ViewContext'
import { joinClassNames } from '../util/html'
import { ContentContainer, generateClassName } from '../content-inject/ContentContainer'
import { ViewOptionsRefined } from '../options'
import classNames from '../styles.module.css'

export interface BgEventProps {
  eventRange: EventRenderRange
  isStart: boolean
  isEnd: boolean
  isPast: boolean
  isFuture: boolean
  isToday: boolean
  isNarrow?: boolean
  isShort?: boolean
  isVertical: boolean
}

export class BgEvent extends BaseComponent<BgEventProps> {
  // memo
  private buildPublicEvent = memoize(
    (context: ViewContext, eventDef: EventDef, eventInstance: EventInstance) => new EventImpl(context, eventDef, eventInstance)
  )

  // ref
  private el: HTMLElement

  render() {
    const { props, context } = this
    const { eventRange } = props
    const { options } = context
    const eventUi = eventRange.ui

    const eventApi = this.buildPublicEvent(context, eventRange.def, eventRange.instance)
    const subcontentRenderProps = { // TODO: spread into renderProps?
      event: eventApi,
      isNarrow: props.isNarrow || false,
      isShort: props.isShort || false,
    }
    const renderProps: EventDisplayInfo = {
      event: eventApi,
      view: context.viewApi,
      timeText: '', // never display time
      color: eventUi.color || options.backgroundEventColor,
      contrastColor: eventUi.contrastColor,
      isDraggable: false,
      isStartResizable: false,
      isEndResizable: false,
      isMirror: false,
      isStart: props.isStart,
      isEnd: props.isEnd,
      isFirst: false,
      isLast: false,
      isPast: props.isPast,
      isFuture: props.isFuture,
      isToday: props.isToday,
      isSelected: false,
      isDragging: false,
      isResizing: false,
      isInteractive: false,
      level: 0,
      isNarrow: props.isNarrow || false,
      isShort: props.isShort || false,
      timeClass: '', // never display time
      titleClass: generateClassName(options.backgroundEventTitleClass, subcontentRenderProps),
      options: { eventOverlap: Boolean(options.eventOverlap) },
    }
    // does not include backgroundEventClass.. added below
    const outerClassName = joinClassNames(
      eventUi.className,
      classNames.fill,
      classNames.internalEvent,
      classNames.internalBgEvent,
      props.isVertical ? classNames.flexCol : classNames.flexRow,
    )
    const innerClassName = joinClassNames(
      generateClassName(options.backgroundEventInnerClass, renderProps),
      classNames.liquid,
    )

    return (
      <ContentContainer
        tag='div'
        className={outerClassName}
        style={{
          '--fc-event-color': renderProps.color,
          '--fc-event-contrast-color': renderProps.contrastColor,
        }}
        defaultGenerator={renderInnerContent}
        elRef={this.handleEl}
        renderProps={renderProps}
        generatorName="backgroundEventContent"
        customGenerator={options.backgroundEventContent}
        classNameGenerator={options.backgroundEventClass}
        didMount={options.backgroundEventDidMount}
        willUnmount={options.backgroundEventWillUnmount}
      >
        {(InnerContent) => (
          <InnerContent tag='div' className={innerClassName} />
        )}
      </ContentContainer>
    )
  }

  handleEl = (el: HTMLElement | null) => {
    this.el = el

    if (el) {
      setElEventRange(el, this.props.eventRange)
    }
  }

  componentDidUpdate(prevProps: BgEventProps): void {
    if (this.el && this.props.eventRange !== prevProps.eventRange) {
      setElEventRange(this.el, this.props.eventRange)
    }
  }
}

function renderInnerContent(props: EventDisplayInfo) {
  let { title } = props.event

  return title && (
    <div className={props.titleClass}>{props.event.title}</div>
  )
}

// Other types of fills
// -------------------------------------------------------------------------------------------------

export function renderFill(fillType: string, options: ViewOptionsRefined) {
  return (
    <div className={joinClassNames(
      fillType === 'non-business' ? options.nonBusinessHoursClass :
        fillType === 'highlight' ? options.highlightClass : undefined,
      classNames.fill,
    )} />
  )
}
