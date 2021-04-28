import { createElement } from '../vdom'
import { ViewApi } from '../ViewApi'
import { ViewContext, ViewContextType } from '../ViewContext'
import { MountArg, RenderHook, RenderHookPropsChildren } from './render-hook'

export interface MoreLinkRootProps { // what the MoreLinkRoot component receives
  moreCnt: number
  buildMoreLinkText: (moreCnt: number) => string
  children: RenderHookPropsChildren
}

export interface MoreLinkContentArg { // what the render-hooks receive
  num: number
  text: string
  view: ViewApi
}

export type MoreLinkMountArg = MountArg<MoreLinkContentArg>

export const MoreLinkRoot = (props: MoreLinkRootProps) => (
  <ViewContextType.Consumer>
    {(context: ViewContext) => {
      let { viewApi, options } = context
      let hookProps: MoreLinkContentArg = {
        num: props.moreCnt,
        text: props.buildMoreLinkText(props.moreCnt),
        view: viewApi,
      }

      return (
        <RenderHook<MoreLinkContentArg>
          hookProps={hookProps}
          classNames={options.moreLinkClassNames}
          content={options.moreLinkContent}
          defaultContent={renderMoreLinkInner}
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

function renderMoreLinkInner(props) {
  return props.text
}
