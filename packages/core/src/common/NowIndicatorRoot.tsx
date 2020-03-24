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
      let mountProps = { isAxis: props.isAxis, view: context.view }
      let dynamicProps = { ...mountProps, date: context.dateEnv.toDate(props.date) }
      let classNames = [
        props.isAxis ? 'fc-now-indicator-axis' : 'fc-now-indicator-line',
        'fc-now-indicator'
      ]

      return (
        <RenderHook name='nowIndicator' mountProps={mountProps} dynamicProps={dynamicProps}>
          {(rootElRef, customClassNames, innerElRef, innerContent) => props.children(
            rootElRef, classNames.concat(customClassNames), innerElRef, innerContent
          )}
        </RenderHook>
      )
    }}
  </ComponentContextType.Consumer>
)
