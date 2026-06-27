import { ViewContextType } from '../ViewContext'
import { joinClassNames } from '../util/html'

export interface NowIndicatorDotProps {
  className?: string
  style?: any
}

export const NowIndicatorDot = (props: NowIndicatorDotProps) => (
  <ViewContextType.Consumer
    children={(context) => {
      let { options } = context

      return (
        <div
          className={joinClassNames(
            props.className,
            options.nowIndicatorDotClass,
          )}
          style={props.style}
        />
      )
    }}
  />
)
