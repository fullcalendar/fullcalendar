import { Seg } from '../component/DateComponent'
import { ComponentChildren, h, Ref } from '../vdom'
import ComponentContext, { ComponentContextType } from '../component/ComponentContext'
import EventApi from '../api/EventApi'
import { computeSegDraggable, computeSegStartResizable, computeSegEndResizable, setElSeg } from '../component/event-rendering'
import { EventMeta, getSkinCss, getEventClassNames } from '../component/event-rendering'
import { RenderHook } from './render-hook'


export interface MinimalEventProps {
  seg: Seg
  isDragging: boolean      // rename to isMirrorDragging? make optional?
  isResizing: boolean      // rename to isMirrorResizing? make optional?
  isDateSelecting: boolean // rename to isMirrorDateSelecting? make optional?
  isSelected: boolean
  isPast: boolean
  isFuture: boolean
  isToday: boolean
}

export interface EventRootProps extends MinimalEventProps {
  timeText: string
  disableDragging?: boolean
  disableResizing?: boolean
  defaultContent: (hookProps: EventMeta) => ComponentChildren
  children: (
    rootElRef: Ref<any>,
    classNames: string[],
    style: any,
    innerElRef: Ref<any>,
    innerContent: ComponentChildren,
    hookProps: EventMeta
  ) => ComponentChildren
}


export const EventRoot = (props: EventRootProps) => (
  <ComponentContextType.Consumer>
    {(context: ComponentContext) => {
      let { seg } = props
      let hookProps = {
        event: new EventApi(context.calendar, seg.eventRange.def, seg.eventRange.instance),
        view: context.view,
        timeText: props.timeText,
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
        isResizing: Boolean(props.isResizing)
      }

      let style = getSkinCss(seg.eventRange.ui)
      let standardClassNames = getEventClassNames(hookProps).concat(seg.eventRange.ui.classNames)

      return (
        <RenderHook
          name='event'
          hookProps={hookProps}
          defaultContent={props.defaultContent}
          elRef={(el: HTMLElement | null) => {
            if (el) {
              setElSeg(el, seg)
            }
          }}
        >
          {(rootElRef, customClassNames, innerElRef, innerContent) => props.children(
            rootElRef, standardClassNames.concat(customClassNames), style, innerElRef, innerContent, hookProps
          )}
        </RenderHook>
      )
    }}
  </ComponentContextType.Consumer>
)
