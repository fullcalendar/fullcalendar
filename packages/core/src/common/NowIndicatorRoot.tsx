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
      let classNames = [
        props.isAxis ? 'fc-now-indicator-axis' : 'fc-now-indicator-line',
        'fc-now-indicator'
      ]

      return (
        <RenderHook name='nowIndicator' hookProps={hookProps}>
          {(rootElRef, customClassNames, innerElRef, innerContent) => props.children(
            rootElRef, classNames.concat(customClassNames), innerElRef, innerContent
          )}
        </RenderHook>
      )
    }}
  </ComponentContextType.Consumer>
)
