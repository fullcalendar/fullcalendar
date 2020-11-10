import {
  createElement,
  BaseComponent,
  RefMap,
  RenderHook,
  SlotLaneContentArg,
} from '@fullcalendar/common'
import { TimeColsAxisCell } from './TimeColsAxisCell'
import { TimeSlatMeta } from './time-slat-meta'

export interface TimeColsSlatsBodyProps {
  axis: boolean
  slatMetas: TimeSlatMeta[]
  slatElRefs: RefMap<HTMLTableRowElement>
}

export class TimeColsSlatsBody extends BaseComponent<TimeColsSlatsBodyProps> {
  render() {
    let { props, context } = this
    let { options } = context
    let { slatElRefs } = props

    return (
      <tbody>
        {props.slatMetas.map((slatMeta, i) => {
          let hookProps: SlotLaneContentArg = {
            time: slatMeta.time,
            date: context.dateEnv.toDate(slatMeta.date),
            view: context.viewApi,
          }

          let classNames = [
            'fc-timegrid-slot',
            'fc-timegrid-slot-lane',
            slatMeta.isLabeled ? '' : 'fc-timegrid-slot-minor',
          ]

          return (
            <tr
              key={slatMeta.key}
              ref={slatElRefs.createRef(slatMeta.key)}
            >
              {props.axis && (
                <TimeColsAxisCell {...slatMeta} />
              )}
              <RenderHook
                hookProps={hookProps}
                classNames={options.slotLaneClassNames}
                content={options.slotLaneContent}
                didMount={options.slotLaneDidMount}
                willUnmount={options.slotLaneWillUnmount}
              >
                {(rootElRef, customClassNames, innerElRef, innerContent) => (
                  <td
                    ref={rootElRef}
                    className={classNames.concat(customClassNames).join(' ')}
                    data-time={slatMeta.isoTimeStr}
                  >
                    {innerContent}
                  </td>
                )}
              </RenderHook>
            </tr>
          )
        })}
      </tbody>
    )
  }
}
