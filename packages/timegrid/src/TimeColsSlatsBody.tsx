import {
  SlotLaneContentArg,
} from '@fullcalendar/core'
import {
  BaseComponent,
  ContentContainer,
  RefMap,
} from '@fullcalendar/core/internal'
import {
  createElement,
} from '@fullcalendar/core/preact'
import { TimeColsAxisCell } from './TimeColsAxisCell.js'
import { TimeSlatMeta } from './time-slat-meta.js'

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
          let renderProps: SlotLaneContentArg = {
            time: slatMeta.time,
            date: context.dateEnv.toDate(slatMeta.date),
            view: context.viewApi,
          }

          return (
            <tr
              key={slatMeta.key}
              ref={slatElRefs.createRef(slatMeta.key)}
            >
              {props.axis && (
                <TimeColsAxisCell {...slatMeta} />
              )}
              <ContentContainer
                elTag="td"
                elClasses={[
                  'fc-timegrid-slot',
                  'fc-timegrid-slot-lane',
                  !slatMeta.isLabeled && 'fc-timegrid-slot-minor',
                ]}
                elAttrs={{
                  'data-time': slatMeta.isoTimeStr,
                }}
                renderProps={renderProps}
                generatorName="slotLaneContent"
                customGenerator={options.slotLaneContent}
                classNameGenerator={options.slotLaneClassNames}
                didMount={options.slotLaneDidMount}
                willUnmount={options.slotLaneWillUnmount}
              />
            </tr>
          )
        })}
      </tbody>
    )
  }
}
