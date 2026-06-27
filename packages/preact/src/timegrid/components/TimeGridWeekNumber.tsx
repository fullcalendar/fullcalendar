import { WeekNumberHeaderInfo } from '../../common/WeekNumberContainer'
import { joinClassNames } from '../../util/html'
import { BaseComponent, setRef } from '../../vdom-util'
import { ContentContainer, renderText, generateClassName } from '../../content-inject/ContentContainer'
import { DateProfile } from '../../DateProfileGenerator'
import { buildDateStr, buildNavLinkAttrs } from '../../common/nav-link'
import { createFormatter } from '../../datelib/formatting'
import { diffDays, joinDateTimeFormatParts } from '@full-ui/headless-calendar'
import { watchSize } from '../../component-util/resize-observer'
import classNames from '../../styles.module.css'
import { type Ref, createRef } from 'react'

export interface TimeGridWeekNumberProps {
  dateProfile: DateProfile

  // dimensions
  width: number | undefined
  isLiquid: boolean
  isNarrow: boolean

  // ref
  innerWidthRef?: Ref<number>
  innerHeightRef?: Ref<number>
}

const DEFAULT_WEEK_NUM_FORMAT = createFormatter({ week: 'short' })

export class TimeGridWeekNumber extends BaseComponent<TimeGridWeekNumberProps> {
  // ref
  private innerElRef = createRef<HTMLDivElement>()

  // internal
  private _isUnmounting: boolean
  private disconnectInnerSize?: () => void

  render() {
    let { props, context } = this
    let { options, dateEnv } = context
    let range = props.dateProfile.renderRange
    let dayCnt = diffDays(range.start, range.end)

    // HACK: only make week-number a nav-link when NOT in week-view
    let hasNavLink = dayCnt === 1 && options.navLinks

    let weekDateMarker = range.start
    let fullDateStr = buildDateStr(context, weekDateMarker, 'week')

    let weekNum = dateEnv.computeWeekNumber(weekDateMarker)
    let weekTextParts = dateEnv.formatToParts(
      weekDateMarker,
      options.weekNumberFormat || DEFAULT_WEEK_NUM_FORMAT,
    )
    let weekText = joinDateTimeFormatParts(weekTextParts)
    let weekDateZoned = dateEnv.toDate(weekDateMarker)

    const weekNumberRenderProps = {
      num: weekNum,
      text: weekText,
      textParts: weekTextParts,
      date: weekDateZoned,
      isNarrow: props.isNarrow,
      hasNavLink,
      options: { dayMinWidth: options.dayMinWidth },
    }

    return (
      <ContentContainer<WeekNumberHeaderInfo>
        tag='div'
        attrs={{
          role: 'gridcell', // doesn't always describe other cells in row, so make generic
          'aria-label': fullDateStr,
        }}
        className={joinClassNames(
          classNames.flexRow,
          classNames.noMargin,
          classNames.noPadding,
          props.isLiquid ? classNames.liquid : classNames.contentBox,
        )}
        style={{
          width: props.width,
        }}
        renderProps={weekNumberRenderProps}
        generatorName="weekNumberHeaderContent"
        customGenerator={options.weekNumberHeaderContent}
        defaultGenerator={renderText}
        classNameGenerator={options.weekNumberHeaderClass}
        didMount={options.weekNumberHeaderDidMount}
        willUnmount={options.weekNumberHeaderWillUnmount}
      >
        {(InnerContent) => (
          <div
            ref={this.innerElRef}
            className={joinClassNames(
              classNames.flexRow,
              classNames.noShrink,
              classNames.whiteSpaceNoWrap,
            )}
          >
            <InnerContent
              tag='div'
              attrs={
                hasNavLink
                  ? buildNavLinkAttrs(context, range.start, 'week', fullDateStr)
                  : { 'aria-label': fullDateStr }
              }
              className={generateClassName(options.weekNumberHeaderInnerClass, weekNumberRenderProps)}
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
    // TODO: handle width/height independently?
    this.disconnectInnerSize = watchSize(innerEl, (width, height) => {
      if (this._isUnmounting) return
      setRef(props.innerWidthRef, width)
      setRef(props.innerHeightRef, height)
    })
  }

  componentWillUnmount(): void {
    const { props } = this

    this._isUnmounting = true
    this.disconnectInnerSize()
    setRef(props.innerWidthRef, null)
    setRef(props.innerHeightRef, null)
  }
}
