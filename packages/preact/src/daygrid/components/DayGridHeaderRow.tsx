import { afterSize } from '../../component-util/resize-observer'
import { BaseComponent, setRef } from '../../vdom-util'
import { joinClassNames } from '../../util/html'
import { RefMap } from '../../util/RefMap'
import type { Ref } from 'react'
import { RowConfig } from '../header-tier'
import { DayGridHeaderCell } from './DayGridHeaderCell'
import classNames from '../../styles.module.css'

export interface DayGridHeaderRowProps<BaseRenderProps, RenderProps> extends RowConfig<BaseRenderProps, RenderProps> {
  cellIsNarrow: boolean
  cellIsMicro: boolean
  className?: string
  height?: number
  colWidth?: number
  viewportWidth?: number
  innerHeightRef?: Ref<number>
  role?: string
  rowIndex?: number // 0-based ... optional?... for aria only?
  rowLevel: number // 0 is closest to body, higher-up is ++
  borderBottom?: boolean
}

export class DayGridHeaderRow<BaseRenderProps extends { isDisabled: boolean }, RenderProps extends { text: string, isDisabled: boolean }> extends BaseComponent<DayGridHeaderRowProps<BaseRenderProps, RenderProps>> {
  // ref
  private innerHeightRefMap = new RefMap<string, number>(() => {
    afterSize(this.handleInnerHeights)
  })

  // internal
  private _isUnmounting: boolean
  private currentInnerHeight?: number

  render() {
    const { props, context } = this
    const { options } = context

    return (
      <div
        role={props.role as any /* !!! */}
        aria-rowindex={props.rowIndex != null ? 1 + props.rowIndex : undefined}
        className={joinClassNames(
          options.dayHeaderRowClass,
          props.className,
          classNames.flexRow,
          classNames.contentBox,
          props.borderBottom ? classNames.borderOnlyB : classNames.borderNone,
        )}
        style={{
          height: props.height,
        }}
      >
        {props.dataConfigs.map((dataConfig, cellI) => (
          <DayGridHeaderCell
            key={dataConfig.key}
            renderConfig={props.renderConfig}
            dataConfig={dataConfig}
            borderStart={Boolean(cellI)}
            colWidth={props.colWidth}
            viewportWidth={props.viewportWidth}
            innerHeightRef={this.innerHeightRefMap.createRef(dataConfig.key)}
            cellIsNarrow={props.cellIsNarrow}
            cellIsMicro={props.cellIsMicro}
            rowLevel={props.rowLevel}
          />
        ))}
      </div>
    )
  }

  componentDidMount(): void {
    this._isUnmounting = false
  }

  private handleInnerHeights = () => {
    if (this._isUnmounting) return
    const innerHeightMap = this.innerHeightRefMap.current
    let max = 0

    for (const innerHeight of innerHeightMap.values()) {
      max = Math.max(max, innerHeight)
    }

    if (this.currentInnerHeight !== max) {
      this.currentInnerHeight = max
      setRef(this.props.innerHeightRef, max)
    }
  }

  componentWillUnmount(): void {
    this._isUnmounting = true
    this.currentInnerHeight = undefined
    setRef(this.props.innerHeightRef, null)
  }
}
