import { ComponentChild, createElement } from '../preact.js'
import { BaseComponent, setRef } from '../vdom-util.js'
import { Seg } from '../component/DateComponent.js'
import { EventImpl } from '../api/EventImpl.js'
import {
  computeSegDraggable,
  computeSegStartResizable,
  computeSegEndResizable,
  EventContentArg,
  getEventClassNames,
  setElSeg,
} from '../component/event-rendering.js'
import { ContentContainer, InnerContainerFunc } from '../content-inject/ContentContainer.js'
import { ElProps } from '../content-inject/ContentInjector.js'
import { memoize } from '../util/memoize.js'
import { ViewContext } from '../ViewContext.js'
import { EventDef } from '../structs/event-def.js'
import { EventInstance } from '../structs/event-instance.js'

export interface MinimalEventProps {
  seg: Seg
  isDragging: boolean // rename to isMirrorDragging? make optional?
  isResizing: boolean // rename to isMirrorResizing? make optional?
  isDateSelecting: boolean // rename to isMirrorDateSelecting? make optional?
  isSelected: boolean
  isPast: boolean
  isFuture: boolean
  isToday: boolean
}

export type EventContainerProps = ElProps & MinimalEventProps & {
  defaultGenerator: (renderProps: EventContentArg) => ComponentChild
  disableDragging?: boolean
  disableResizing?: boolean
  timeText: string
  children?: InnerContainerFunc<EventContentArg>
}

export class EventContainer extends BaseComponent<EventContainerProps> {
  // memo
  private buildPublicEvent = memoize(
    (context: ViewContext, eventDef: EventDef, eventInstance: EventInstance) => new EventImpl(context, eventDef, eventInstance),
  )

  el: HTMLElement

  render() {
    const { props, context } = this
    const { options } = context
    const { seg } = props
    const { eventRange } = seg
    const { ui } = eventRange

    const renderProps: EventContentArg = {
      event: this.buildPublicEvent(context, eventRange.def, eventRange.instance),
      view: context.viewApi,
      timeText: props.timeText,
      textColor: ui.textColor,
      backgroundColor: ui.backgroundColor,
      borderColor: ui.borderColor,
      isDraggable: !props.disableDragging && computeSegDraggable(seg, context),
      isStartResizable: !props.disableResizing && computeSegStartResizable(seg, context),
      isEndResizable: !props.disableResizing && computeSegEndResizable(seg, context),
      isMirror: Boolean(props.isDragging || props.isResizing || props.isDateSelecting),
      isStart: Boolean(seg.isStart),
      isEnd: Boolean(seg.isEnd),
      isPast: Boolean(props.isPast), // TODO: don't cast. getDateMeta does it
      isFuture: Boolean(props.isFuture), // TODO: don't cast. getDateMeta does it
      isToday: Boolean(props.isToday), // TODO: don't cast. getDateMeta does it
      isSelected: Boolean(props.isSelected),
      isDragging: Boolean(props.isDragging),
      isResizing: Boolean(props.isResizing),
    }

    return (
      <ContentContainer
        elRef={this.handleEl}
        elTag={props.elTag}
        elAttrs={props.elAttrs}
        elClasses={[
          ...getEventClassNames(renderProps),
          ...seg.eventRange.ui.classNames,
          ...(props.elClasses || []),
        ]}
        elStyle={props.elStyle}
        renderProps={renderProps}
        generatorName="eventContent"
        customGenerator={options.eventContent}
        defaultGenerator={props.defaultGenerator}
        classNameGenerator={options.eventClassNames}
        didMount={options.eventDidMount}
        willUnmount={options.eventWillUnmount}
      >{props.children}</ContentContainer>
    )
  }

  handleEl = (el: HTMLElement | null) => {
    this.el = el

    setRef(this.props.elRef, el)

    if (el) {
      setElSeg(el, this.props.seg)
    }
  }

  componentDidUpdate(prevProps: EventContainerProps): void {
    if (this.el && this.props.seg !== prevProps.seg) {
      setElSeg(this.el, this.props.seg)
    }
  }
}
