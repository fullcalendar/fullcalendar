import { RenderHook, RenderHookPropsChildren, MountArg } from './render-hook.js'
import { DateMarker } from '../datelib/marker.js'
import { ViewContext, ViewContextType } from '../ViewContext.js'
import { createElement } from '../preact/index.js'
import { ViewApi } from '../ViewApi.js'

export interface NowIndicatorRootProps {
  isAxis: boolean
  date: DateMarker
  children: RenderHookPropsChildren
}

export interface NowIndicatorContentArg {
  isAxis: boolean
  date: Date
  view: ViewApi
}

export type NowIndicatorMountArg = MountArg<NowIndicatorContentArg>

export const NowIndicatorRoot = (props: NowIndicatorRootProps) => (
  <ViewContextType.Consumer>
    {(context: ViewContext) => {
      let { options } = context
      let hookProps: NowIndicatorContentArg = {
        isAxis: props.isAxis,
        date: context.dateEnv.toDate(props.date),
        view: context.viewApi,
      }

      return (
        <RenderHook
          hookProps={hookProps}
          classNames={options.nowIndicatorClassNames}
          content={options.nowIndicatorContent}
          didMount={options.nowIndicatorDidMount}
          willUnmount={options.nowIndicatorWillUnmount}
        >
          {props.children}
        </RenderHook>
      )
    }}
  </ViewContextType.Consumer>
)
