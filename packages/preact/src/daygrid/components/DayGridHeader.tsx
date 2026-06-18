import { joinClassNames } from '../../util/html'
import { BaseComponent } from '../../vdom-util'
import { DayGridHeaderRow } from './DayGridHeaderRow'
import { RowConfig } from '../header-tier'
import classNames from '../../styles.module.css'

export interface DayGridHeaderProps {
  headerTiers: RowConfig<any, { text: string, isDisabled: boolean }>[]
  className?: string
  cellIsNarrow: boolean
  cellIsMicro: boolean

  // dimensions
  width?: number
  colWidth?: number
  viewportWidth?: number
}

/*
TODO: kill this class in favor of DayGridHeaderRows?
*/
export class DayGridHeader extends BaseComponent<DayGridHeaderProps> {
  render() {
    const { props } = this
    const { headerTiers } = props

    return (
      <div
        role='rowgroup'
        className={joinClassNames(
          props.className,
          classNames.flexCol,
          props.width == null && classNames.liquid,
        )}
        style={{
          width: props.width,
        }}
      >
        {headerTiers.map((rowConfig, i) => (
          <DayGridHeaderRow
            {...rowConfig}
            key={i}
            role='row'
            borderBottom={i < headerTiers.length - 1}
            colWidth={props.colWidth}
            viewportWidth={props.viewportWidth}
            cellIsNarrow={props.cellIsNarrow}
            cellIsMicro={props.cellIsMicro}
            rowLevel={headerTiers.length - i - 1}
          />
        ))}
      </div>
    )
  }
}
