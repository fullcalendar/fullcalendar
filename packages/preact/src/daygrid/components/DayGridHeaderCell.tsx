import { joinClassNames } from '../../util/html'
import { ContentContainer, renderText, generateClassName } from '../../content-inject/ContentContainer'
import { setRef } from '../../vdom-util'
import { BaseComponent } from '../../vdom-util'
import { watchSize } from '../../component-util/resize-observer'
import { memoize } from '../../util/memoize'
import type { Ref } from 'react'
import { BaseDayHeaderData, CellDataConfig, CellRenderConfig } from '../header-tier'
import { dayHeaderMicroFormat } from './util'
import classNames from '../../styles.module.css'
import { DateFormatter, DateMarker, DateTimeFormatPartWithWeek, joinDateTimeFormatParts } from '@full-ui/headless-calendar'
import { findDayNumberText, findWeekdayText } from '../../util/date-format'

export interface DayGridHeaderCellProps<BaseRenderProps, RenderProps> {
  renderConfig: CellRenderConfig<BaseRenderProps, RenderProps>
  dataConfig: CellDataConfig<BaseRenderProps>
  borderStart: boolean
  colWidth?: number
  viewportWidth?: number
  innerHeightRef?: Ref<number>
  cellIsNarrow: boolean
  cellIsMicro: boolean
  rowLevel: number
  tableMode?: boolean
  borderBottom?: boolean
}

interface DayGridHeaderCellState {
  innerWidth?: number
}

export class DayGridHeaderCell<BaseRenderProps extends { isDisabled: boolean }, RenderProps extends { text: string, isDisabled: boolean }> extends BaseComponent<DayGridHeaderCellProps<BaseRenderProps, RenderProps>, DayGridHeaderCellState> {
  state = {} as DayGridHeaderCellState

  // memo
  private buildDayHeaderText = memoize(buildDayHeaderText)

  // internal
  private _isUnmounting: boolean
  private disconnectSize?: () => void

  render() {
    const { props, state, context } = this
    const { renderConfig, dataConfig, tableMode } = props
    const colSpan = dataConfig.colSpan || 1
    const totalColWidth = props.colWidth != null
      ? props.colWidth * colSpan
      : undefined
    const isLiquid = !tableMode && totalColWidth == null

    /*
    A liquid cell that spans multiple columns can't use the .liquid class, which gives every
    cell an equal share regardless of colSpan. Instead, grow proportionally to the columns
    covered. Like the body cells, use a zero basis so borders remain within the distributed
    border-box width.
    */
    const isSpanning = isLiquid && colSpan > 1
    const style = tableMode ? undefined : isSpanning ? {
      flexGrow: colSpan,
      flexBasis: 0,
      minWidth: 0,
    } : {
      width: totalColWidth,
    }

    // HACK
    const isDisabled = dataConfig.renderProps.isDisabled
    const finalRenderProps = renderConfig.dayHeaderFormat
      ? this.buildDayHeaderRenderProps(
          dataConfig.renderProps as unknown as BaseDayHeaderData,
          props.cellIsNarrow,
          props.rowLevel,
          props.cellIsMicro,
          dataConfig.dateMarker,
          renderConfig.dayHeaderFormat,
          Boolean(renderConfig.datesRepDistinctDays),
          context.dateEnv,
        ) as unknown as RenderProps
      : {
          ...(dataConfig.renderProps as any),
          isNarrow: props.cellIsNarrow,
          level: props.rowLevel,
        }

    /*
    TODO: DRY with TimelineHeaderCell
    */
    const alignInput = renderConfig.align
    const align = // normalized string-enum value
      typeof alignInput === 'function'
        ? alignInput({ level: props.rowLevel, inPopover: (dataConfig.renderProps as any).inPopover, isNarrow: props.cellIsNarrow })
        : alignInput
    const stickyInput = renderConfig.sticky
    const isSticky = !tableMode &&
      props.rowLevel > 0 &&
      stickyInput !== false && (
        // if center-aligned, and wants to be sticky, must be >75% viewport width,
        // to avoid looking awkwardly aligned
        align !== 'center' || (
          totalColWidth != null &&
          props.viewportWidth != null &&
          totalColWidth > props.viewportWidth * 0.75
        )
      )

    let edgeCoord: number | string | undefined
    if (isSticky) {
      if (align === 'center') {
        if (state.innerWidth != null) {
          edgeCoord = `calc(50% - ${state.innerWidth / 2}px)`
        }
      } else {
        edgeCoord = (
          typeof stickyInput === 'number' ||
          typeof stickyInput === 'string'
        ) ? stickyInput: 0
      }
    }

    /*
    In screen mode, alignment belongs on the outer flex cell so the inner element
    remains shrink-wrapped for sticky positioning measurements. In table mode, the
    <th> must remain a table cell, so alignment moves to its full-width inner flex
    element. That width cannot support sticky positioning, which table mode disables.
    */
    const alignClassName = align === 'center' ? classNames.alignCenter :
      align === 'end' ? classNames.alignEnd :
        classNames.alignStart

    const CellTag = tableMode ? 'th' : 'div'

    return (
      <ContentContainer
        tag={CellTag}
        attrs={{
          role: 'columnheader',
          'aria-colspan': dataConfig.colSpan,
          colSpan: tableMode ? colSpan : undefined,
          ...dataConfig.attrs,
        }}
        className={joinClassNames(
          dataConfig.className,
          classNames.noMargin,
          classNames.noPadding,
          !tableMode && classNames.flexCol,
          classNames.borderlessTop,
          classNames.borderlessEnd,
          !props.borderStart && classNames.borderlessStart,
          !(tableMode && props.borderBottom) && classNames.borderlessBottom,
          !tableMode && alignClassName,
          isLiquid && !isSpanning && classNames.liquid,
          !isSticky && classNames.crop,
        )}
        style={style}
        renderProps={finalRenderProps}
        generatorName={renderConfig.generatorName}
        customGenerator={renderConfig.customGenerator}
        defaultGenerator={renderText}
        classNameGenerator={
          // don't use custom classNames if disabled
          // TODO: make DRY with DayCellContainer
          isDisabled ? undefined : renderConfig.classNameGenerator
        }
        didMount={renderConfig.didMount}
        willUnmount={renderConfig.willUnmount}
      >
        {(InnerContainer) => (
          <div
            ref={this.handleInnerEl}
            className={joinClassNames(
              classNames.flexCol,
              classNames.noShrink,
              classNames.whiteSpaceNoWrap,
              tableMode && alignClassName,
              isSticky && classNames.sticky,
            )}
            style={{
              left: edgeCoord,
              right: edgeCoord,
            }}
          >
            <InnerContainer
              tag='div'
              attrs={dataConfig.innerAttrs}
              className={generateClassName(renderConfig.innerClassNameGenerator, finalRenderProps)}
            />
          </div>
        )}
      </ContentContainer>
    )
  }

  handleInnerEl = (innerEl: HTMLElement | null) => {
    if (this.disconnectSize) {
      this.disconnectSize()
      this.disconnectSize = undefined
    }
    if (innerEl) {
      this.disconnectSize = watchSize(innerEl, (width, height) => {
        if (this._isUnmounting) return
        setRef(this.props.innerHeightRef, height)
        this.setState({ innerWidth: width })
      })
    } else {
      setRef(this.props.innerHeightRef, null)
    }
  }

  componentDidMount(): void {
    this._isUnmounting = false
  }

  componentWillUnmount(): void {
    this._isUnmounting = true
  }

  private buildDayHeaderRenderProps(
    renderProps: BaseDayHeaderData,
    cellIsNarrow: boolean,
    rowLevel: number,
    cellIsMicro: boolean,
    dateMarker: DateMarker,
    dayHeaderFormat: DateFormatter,
    datesRepDistinctDays: boolean,
    dateEnv,
  ): DayHeaderRenderProps {
    const baseText = this.buildDayHeaderText(
      datesRepDistinctDays ? dateMarker : renderProps.date,
      dayHeaderFormat,
      datesRepDistinctDays,
      dateEnv,
    )

    const textData = cellIsMicro
      ? this.buildDayHeaderText(dateMarker, dayHeaderMicroFormat, false, dateEnv)
      : baseText

    return {
      ...renderProps,
      isNarrow: cellIsNarrow,
      level: rowLevel,
      text: textData.text,
      textParts: textData.textParts,
      weekdayText: cellIsMicro ? textData.text : baseText.weekdayText,
      dayNumberText: baseText.dayNumberText,
    }
  }
}

interface DayHeaderRenderProps extends BaseDayHeaderData {
  text: string
  textParts: DateTimeFormatPartWithWeek[]
  weekdayText: string
  dayNumberText: string
  isNarrow: boolean
  level: number
}

function buildDayHeaderText(
  date: DateMarker,
  formatter: DateFormatter,
  includeDayNumber: boolean,
  dateEnv,
) {
  const textParts = dateEnv.formatToParts(date, formatter)

  return {
    text: joinDateTimeFormatParts(textParts),
    textParts,
    weekdayText: findWeekdayText(textParts),
    dayNumberText: includeDayNumber ? findDayNumberText(textParts) : '',
  }
}
