import { joinClassNames } from '../../util/html'
import { DateMarker } from '@full-ui/headless-calendar'
import { DateProfile } from '../../DateProfileGenerator'
import { NowIndicatorDot } from '../../common/NowIndicatorDot'
import { NowIndicatorLineContainer } from '../../common/NowIndicatorLineContainer'
import classNames from '../../styles.module.css'
import { computeDateTopFrac } from './util'

export interface TimeGridNowIndicatorLineProps {
  nowDate: DateMarker
  dayDate: DateMarker
  dateProfile: DateProfile
  totalHeight: number | undefined
  showDot?: boolean
}

/*
Renders both the line AND the dot
TODO: DRY with other NowIndicator components
*/
export function TimeGridNowIndicatorLine(props: TimeGridNowIndicatorLineProps) {
  const top = props.totalHeight != null
    ? props.totalHeight * computeDateTopFrac(props.nowDate, props.dateProfile, props.dayDate)
    : undefined

  return (
    <div
      className={classNames.fill}
      style={{
        zIndex: 2, // inlined from $now-indicator-z
        pointerEvents: 'none', // TODO: className
      }}
    >
      <NowIndicatorLineContainer
        className={joinClassNames(
          classNames.fillX,
          classNames.noMarginX,
          classNames.borderlessX,
        )}
        style={{ top }}
        date={props.nowDate}
      />
      {(props.showDot ?? true) && (
        <NowIndicatorDot
          className={joinClassNames(classNames.abs, classNames.start0)}
          style={{ top }}
        />
      )}
    </div>
  )
}
