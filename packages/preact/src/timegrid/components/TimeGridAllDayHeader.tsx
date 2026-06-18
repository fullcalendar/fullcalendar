import { AllDayHeaderInfo } from '../../render-hook-misc'
import { joinClassNames } from '../../util/html'
import { type ReactNode, type Ref, createRef } from 'react'
import { BaseComponent, setRef } from '../../vdom-util'
import { ContentContainer, generateClassName } from '../../content-inject/ContentContainer'
import { watchWidth } from '../../component-util/resize-observer'
import classNames from '../../styles.module.css'

export interface TimeGridAllDayHeaderProps {
  // dimension
  width: number | undefined
  isNarrow: boolean

  // refs
  innerWidthRef?: Ref<number>
}

export class TimeGridAllDayHeader extends BaseComponent<TimeGridAllDayHeaderProps> {
  // ref
  private innerElRef = createRef<HTMLDivElement>()

  // internal
  private _isUnmounting: boolean
  private disconnectInnerWidth?: () => void

  render() {
    let { props } = this
    let { options, viewApi } = this.context
    let renderProps: AllDayHeaderInfo = {
      text: options.allDayText,
      view: viewApi,
      isNarrow: props.isNarrow,
    }

    return (
      <ContentContainer
        tag="div"
        attrs={{
          role: 'rowheader',
        }}
        className={joinClassNames(
          classNames.flexRow,
          classNames.noMargin,
          classNames.noPadding,
          classNames.contentBox,
        )}
        style={{
          width: props.width,
        }}
        renderProps={renderProps}
        generatorName="allDayHeaderContent"
        customGenerator={options.allDayHeaderContent}
        defaultGenerator={renderAllDayInner}
        classNameGenerator={options.allDayHeaderClass}
        didMount={options.allDayHeaderDidMount}
        willUnmount={options.allDayHeaderWillUnmount}
      >
        {(InnerContent) => (
          <div
            className={joinClassNames(
              classNames.flexRow,
              classNames.noShrink,
              classNames.whiteSpacePre, // respects line-breaks for localized text
            )}
            ref={this.innerElRef}
          >
            <InnerContent
              tag='div'
              className={generateClassName(options.allDayHeaderInnerClass, renderProps)}
            />
          </div>
        )}
      </ContentContainer>
    )
  }

  componentDidMount(): void {
    this._isUnmounting = false
    const { props } = this
    const innerEl = this.innerElRef.current // TODO: make dynamic with useEffect

    // TODO: only attach this if refs props present
    this.disconnectInnerWidth = watchWidth(innerEl, (width) => {
      if (this._isUnmounting) return
      setRef(props.innerWidthRef, width)
    })
  }

  componentWillUnmount(): void {
    this._isUnmounting = true
    this.disconnectInnerWidth()
    setRef(this.props.innerWidthRef, null)
  }
}

function renderAllDayInner(renderProps: AllDayHeaderInfo): ReactNode {
  return renderProps.text
}
