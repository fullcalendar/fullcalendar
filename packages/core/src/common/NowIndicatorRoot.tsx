import { RenderHook, RenderHookPropsChildren } from './render-hook'
import { DateMarker } from '../datelib/marker'
import ComponentContext, { ComponentContextType } from '../component/ComponentContext'
import { h } from '../vdom'


export interface NowIndicatorRootProps {
  isAxis: boolean
  date: DateMarker
  children: RenderHookPropsChildren
}


export const NowIndicatorRoot = (props: NowIndicatorRootProps) => (
  <ComponentContextType.Consumer>
    {(context: ComponentContext) => {
      let hookProps = {
        isAxis: props.isAxis,
        date: context.dateEnv.toDate(props.date),
        view: context.view
      }

      return (
        <RenderHook name='nowIndicator' hookProps={hookProps}>
          {props.children}
        </RenderHook>
      )
    }}
  </ComponentContextType.Consumer>
)
