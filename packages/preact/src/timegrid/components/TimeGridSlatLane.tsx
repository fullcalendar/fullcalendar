import { SlotLaneInfo } from '../../render-hook-misc'
import { joinClassNames } from '../../util/html'
import { BaseComponent } from '../../vdom-util'
import { ContentContainer } from '../../content-inject/ContentContainer'
import { getDateMeta } from '../../component-util/date-rendering'
import { memoize } from '../../util/memoize'
import classNames from '../../styles.module.css'
import { TimeSlatMeta } from '../time-slat-meta'

export interface TimeGridSlatLaneProps extends TimeSlatMeta {
  borderTop: boolean
}

export class TimeGridSlatLane extends BaseComponent<TimeGridSlatLaneProps> {
  // memo
  private getDateMeta = memoize(getDateMeta)

  render() {
    let { props, context } = this
    let { options } = context
    let renderProps: SlotLaneInfo = {
      // this is a time-specific slot. not day-specific, so don't do today/nowRange
      ...this.getDateMeta(props.date, context.dateEnv),

      time: props.time,
      isMajor: false,
      isMinor: !props.isLabeled,
      view: context.viewApi,
    }

    return (
      <ContentContainer
        tag="div"
        attrs={{
          'data-time': props.isoTimeStr,
        }}
        className={joinClassNames(
          classNames.noMargin,
          classNames.noPadding,
          classNames.liquid,
          props.borderTop ? classNames.borderOnlyT : classNames.borderNone,
        )}
        renderProps={renderProps}
        generatorName={undefined}
        classNameGenerator={options.slotLaneClass}
        didMount={options.slotLaneDidMount}
        willUnmount={options.slotLaneWillUnmount}
      />
    )
  }
}
