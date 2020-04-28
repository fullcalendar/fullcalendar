import { RenderHook, RenderHookPropsChildren } from './render-hook'
import { DateMarker } from '../datelib/marker'
import { ViewContext, ViewContextType } from '../ViewContext'
import { h } from '../vdom'


export interface NowIndicatorRootProps {
  isAxis: boolean
  date: DateMarker
  children: RenderHookPropsChildren
}


export const NowIndicatorRoot = (props: NowIndicatorRootProps) => (
  <ViewContextType.Consumer>
    {(context: ViewContext) => {
      let hookProps = {
        isAxis: props.isAxis,
        date: context.dateEnv.toDate(props.date),
        view: context.viewApi
      }

      return (
        <RenderHook name='nowIndicator' hookProps={hookProps}>
          {props.children}
        </RenderHook>
      )
    }}
  </ViewContextType.Consumer>
)
