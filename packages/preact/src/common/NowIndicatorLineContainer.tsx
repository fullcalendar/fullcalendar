import { DateMarker } from '@full-ui/headless-calendar'
import { ViewContextType } from '../ViewContext'
import { ViewApi } from '../api/ViewApi'
import { ElProps } from '../content-inject/ContentInjector'
import { InnerContainerFunc, ContentContainer } from '../content-inject/ContentContainer'

export interface NowIndicatorLineContainerProps extends Partial<ElProps> {
  date: DateMarker
  children?: InnerContainerFunc<NowIndicatorLineInfo>
}

export interface NowIndicatorLineInfo {
  date: Date
  view: ViewApi
}

export const NowIndicatorLineContainer = (props: NowIndicatorLineContainerProps) => (
  <ViewContextType.Consumer
    children={(context) => {
      let { options } = context
      let renderProps: NowIndicatorLineInfo = {
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
          generatorName="nowIndicatorLineContent"
          customGenerator={options.nowIndicatorLineContent}
          classNameGenerator={options.nowIndicatorLineClass}
          didMount={options.nowIndicatorLineDidMount}
          willUnmount={options.nowIndicatorLineWillUnmount}
        >{props.children}</ContentContainer>
      )
    }}
  />
)
