import { joinClassNames } from '../../util/html'
import { DateMarker } from '@full-ui/headless-calendar'
import { DateProfile } from '../../DateProfileGenerator'
import { NowIndicatorHeaderContainer } from '../../common/NowIndicatorHeaderContainer'
import { computeDateTopFrac } from './util'
import classNames from '../../styles.module.css'

export interface TimeGridNowIndicatorArrowProps {
  nowDate: DateMarker
  dateProfile: DateProfile
  totalHeight: number | undefined
}

/*
TODO: DRY with other NowIndicator components
*/
export function TimeGridNowIndicatorArrow(props: TimeGridNowIndicatorArrowProps) {
  return (
    <div
      // crop any overflow that the arrow/line might cause
      // TODO: just do this on the entire canvas within the scroller
      className={joinClassNames(classNames.fill, classNames.crop)}
      style={{
        zIndex: 2, // inlined from $now-indicator-z
        pointerEvents: 'none', // TODO: className
      }}
    >
      <NowIndicatorHeaderContainer
        className={classNames.abs}
        style={{
          top: props.totalHeight != null
            ? props.totalHeight * computeDateTopFrac(props.nowDate, props.dateProfile)
            : undefined
        }}
        date={props.nowDate}
      />
    </div>
  )
}
