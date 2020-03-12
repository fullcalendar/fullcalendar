import { Ref, h } from '../vdom'
import { DateMarker } from '../datelib/marker'
import { MountHook, ClassNamesHook, InnerContentHook, InnerContentHookOuterContent } from '../render-hook'
import { VNode } from 'preact'
import { ViewApi } from 'fullcalendar'


export interface DateHookProps {
  staticProps: DateStaticProps
  dynamicProps: DateDynamicProps
  children: (rootElRef: Ref<HTMLElement>, customClassNames: string[]) => VNode // TODO: ComponentChildren
}

interface DateStaticProps {
  date: DateMarker
  view: ViewApi
}

interface DateDynamicProps extends DateStaticProps {
  isOther: boolean
  isToday: boolean
  isPast: boolean
  isFuture: boolean
}


export default function DateHook(props: DateHookProps) {
  return (
    <MountHook name='dateCell' handlerProps={props.staticProps}>
      {(rootElRef: Ref<HTMLTableCellElement>) => (
        <ClassNamesHook name='dateCell' handlerProps={props.dynamicProps}>
          {(customClassNames) => (
            props.children(rootElRef, customClassNames)
          )}
        </ClassNamesHook>
      )}
    </MountHook>
  )
}


export interface DateInnerContentHookProps {
  dynamicProps: DateDynamicProps
  children: InnerContentHookOuterContent
}

export function DateInnerContentHook(props: DateInnerContentHookProps) {
  return (
    <InnerContentHook name='dateCell' innerProps={props.dynamicProps}>{props.children}</InnerContentHook>
  )
}

