import { ComponentChildren, createElement } from '../vdom'
import { ViewApi } from '../ViewApi'
import { ViewContext, ViewContextType } from '../ViewContext'
import { MountArg, RenderHook, RenderHookPropsChildren } from './render-hook'

export interface MoreLinkRootProps { // what the MoreLinkRoot component receives
  moreCnt: number
  defaultContent?: (hookProps: MoreLinkContentArg) => ComponentChildren // not used by anyone yet
  children: RenderHookPropsChildren
}

export interface MoreLinkContentArg { // what the render-hooks receive
  num: number
  text: string
  shortText: string
  view: ViewApi
}

export type MoreLinkMountArg = MountArg<MoreLinkContentArg>

export const MoreLinkRoot = (props: MoreLinkRootProps) => (
  <ViewContextType.Consumer>
    {(context: ViewContext) => {
      let { viewApi, options, calendarApi } = context
      let { moreLinkText } = options
      let { moreCnt } = props

      let hookProps: MoreLinkContentArg = {
        num: moreCnt,
        shortText: `+${moreCnt}`, // TODO: offer hook or i18n?
        text: typeof moreLinkText === 'function'
          ? moreLinkText.call(calendarApi, moreCnt)
          : `+${moreCnt} ${moreLinkText}`,
        view: viewApi,
      }

      return (
        <RenderHook<MoreLinkContentArg>
          hookProps={hookProps}
          classNames={options.moreLinkClassNames}
          content={options.moreLinkContent}
          defaultContent={props.defaultContent || renderMoreLinkInner}
          didMount={options.moreLinkDidMount}
          willUnmount={options.moreLinkWillUnmount}
        >
          {(rootElRef, customClassNames, innerElRef, innerContent) => props.children(
            rootElRef, ['fc-event-more'].concat(customClassNames), innerElRef, innerContent,
          )}
        </RenderHook>
      )
    }}
  </ViewContextType.Consumer>
)

function renderMoreLinkInner(props: MoreLinkContentArg) {
  return props.text
}
