import { joinClassNames } from '../../util/html'
import { BaseComponent } from '../../vdom-util'
import classNames from '../../styles.module.css'
import { DayGridHeaderRows, DayGridHeaderRowsProps } from './DayGridHeaderRows'

export interface DayGridHeaderProps extends Omit<DayGridHeaderRowsProps, 'tableMode'> {
  className?: string
  width?: number
}

/*
Used only for screen rendering. Print places DayGridHeaderRows directly inside a table header.
*/
export class DayGridHeader extends BaseComponent<DayGridHeaderProps> {
  render() {
    const { props } = this

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
        <DayGridHeaderRows
          headerTiers={props.headerTiers}
          colWidth={props.colWidth}
          viewportWidth={props.viewportWidth}
          cellIsNarrow={props.cellIsNarrow}
          cellIsMicro={props.cellIsMicro}
        />
      </div>
    )
  }
}
