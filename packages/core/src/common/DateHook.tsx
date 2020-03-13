import { Ref, h } from '../vdom'
import { DateMarker } from '../datelib/marker'
import { MountHook, ClassNamesHook, InnerContentHook, InnerContentHookOuterContent } from '../render-hook'
import { VNode } from 'preact'
import { ViewApi } from 'fullcalendar'


export interface DateHookProps {
  staticProps: DateHookStaticProps
  dynamicProps: DateHookDynamicProps
  children: (rootElRef: Ref<HTMLElement>, customClassNames: string[]) => VNode // TODO: ComponentChildren
}

interface DateHookStaticProps {
  date: DateMarker
  view: ViewApi
}

interface DateHookDynamicProps extends DateHookStaticProps {
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
  dynamicProps: DateHookDynamicProps
  children: InnerContentHookOuterContent
}

export function DateInnerContentHook(props: DateInnerContentHookProps) {
  return (
    <InnerContentHook name='dateCell' innerProps={props.dynamicProps}>{props.children}</InnerContentHook>
  )
}

