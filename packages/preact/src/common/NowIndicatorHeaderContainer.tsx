import { DateMarker } from '@full-ui/headless-calendar'
import { ViewContextType } from '../ViewContext'
import { ViewApi } from '../api/ViewApi'
import { ElProps } from '../content-inject/ContentInjector'
import { InnerContainerFunc, ContentContainer } from '../content-inject/ContentContainer'

export interface NowIndicatorHeaderContainerProps extends Partial<ElProps> {
  date: DateMarker
  children?: InnerContainerFunc<NowIndicatorHeaderInfo>
}

export interface NowIndicatorHeaderInfo {
  date: Date
  view: ViewApi
}

export const NowIndicatorHeaderContainer = (props: NowIndicatorHeaderContainerProps) => (
  <ViewContextType.Consumer
    children={(context) => {
      let { options } = context
      let renderProps: NowIndicatorHeaderInfo = {
        date: context.dateEnv.toDate(props.date),
        view: context.viewApi,
      }

      return (
        <ContentContainer
          elRef={props.elRef}
          tag={props.tag || 'div'}
          attrs={props.attrs}
          className={props.className}
          style={props.style}
          renderProps={renderProps}
          generatorName="nowIndicatorHeaderContent"
          customGenerator={options.nowIndicatorHeaderContent}
          classNameGenerator={options.nowIndicatorHeaderClass}
          didMount={options.nowIndicatorHeaderDidMount}
          willUnmount={options.nowIndicatorHeaderWillUnmount}
        >{props.children}</ContentContainer>
      )
    }}
  />
)
