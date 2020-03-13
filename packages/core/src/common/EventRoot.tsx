import { Seg } from '../component/DateComponent'
import { ComponentChildren, h } from '../vdom'
import ComponentContext, { ComponentContextType } from '../component/ComponentContext'
import EventApi from '../api/EventApi'
import { computeSegDraggable, computeSegStartResizable, computeSegEndResizable, setElSeg } from '../component/event-rendering'
import { EventMeta, getSkinCss, getEventClassNames } from '../component/event-rendering'
import { Ref } from 'preact'
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
  defaultInnerContent: (dynamicProps: EventMeta) => ComponentChildren
  children: (
    rootElRef: Ref<any>,
    classNames: string[],
    style: any,
    innerElRef: Ref<any>,
    innerContent: ComponentChildren,
    dynamicProps: EventMeta
  ) => ComponentChildren
}


export const EventRoot = (props: EventRootProps) => (
  <ComponentContextType.Consumer>
    {(context: ComponentContext) => {
      let { seg } = props
      let mountProps = {
        event: new EventApi(context.calendar, seg.eventRange.def, seg.eventRange.instance),
        view: context.view
      }
      let dynamicProps: EventMeta = {
        ...mountProps,
        timeText: props.timeText,
        isDraggable: !props.disableDragging && computeSegDraggable(seg, context),
        isStartResizable: !props.disableResizing && computeSegStartResizable(seg, context),
        isEndResizable: !props.disableResizing && computeSegEndResizable(seg, context),
        isMirror: props.isDragging || props.isResizing || props.isDateSelecting,
        isStart: seg.isStart,
        isEnd: seg.isEnd,
        isPast: props.isPast,
        isFuture: props.isFuture,
        isToday: props.isToday,
        isSelected: props.isSelected,
        isDragging: props.isDragging,
        isResizing: props.isResizing
      }

      let style = getSkinCss(seg.eventRange.ui)
      let standardClassNames = getEventClassNames(dynamicProps)

      return (
        <RenderHook
          name='event'
          mountProps={mountProps}
          dynamicProps={dynamicProps}
          defaultInnerContent={props.defaultInnerContent}
          elRef={(el: HTMLElement | null) => {
            if (el) {
              setElSeg(el, seg)
            }
          }}
        >
          {(rootElRef, customClassNames, innerElRef, innerContent) => props.children(
            rootElRef, standardClassNames.concat(customClassNames), style, innerElRef, innerContent, dynamicProps
          )}
        </RenderHook>
      )
    }}
  </ComponentContextType.Consumer>
)
