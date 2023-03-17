import {
  SlotLabelContentArg,
} from '@fullcalendar/core'
import {
  ViewContext,
  createFormatter,
  ViewContextType,
  ContentContainer,
} from '@fullcalendar/core/internal'
import {
  createElement,
} from '@fullcalendar/core/preact'
import { TimeSlatMeta } from './time-slat-meta.js'

const DEFAULT_SLAT_LABEL_FORMAT = createFormatter({
  hour: 'numeric',
  minute: '2-digit',
  omitZeroMinute: true,
  meridiem: 'short',
})

export function TimeColsAxisCell(props: TimeSlatMeta) {
  let classNames = [
    'fc-timegrid-slot',
    'fc-timegrid-slot-label',
    props.isLabeled ? 'fc-scrollgrid-shrink' : 'fc-timegrid-slot-minor',
  ]

  return (
    <ViewContextType.Consumer>
      {(context: ViewContext) => {
        if (!props.isLabeled) {
          return (
            <td className={classNames.join(' ')} data-time={props.isoTimeStr} />
          )
        }

        let { dateEnv, options, viewApi } = context
        let labelFormat = // TODO: fully pre-parse
          options.slotLabelFormat == null ? DEFAULT_SLAT_LABEL_FORMAT :
            Array.isArray(options.slotLabelFormat) ? createFormatter(options.slotLabelFormat[0]) :
              createFormatter(options.slotLabelFormat)

        let renderProps: SlotLabelContentArg = {
          level: 0,
          time: props.time,
          date: dateEnv.toDate(props.date),
          view: viewApi,
          text: dateEnv.format(props.date, labelFormat),
        }

        return (
          <ContentContainer
            elTag="td"
            elClasses={classNames}
            elAttrs={{
              'data-time': props.isoTimeStr,
            }}
            renderProps={renderProps}
            generatorName="slotLabelContent"
            customGenerator={options.slotLabelContent}
            defaultGenerator={renderInnerContent}
            classNameGenerator={options.slotLabelClassNames}
            didMount={options.slotLabelDidMount}
            willUnmount={options.slotLabelWillUnmount}
          >
            {(InnerContent) => (
              <div className="fc-timegrid-slot-label-frame fc-scrollgrid-shrink-frame">
                <InnerContent
                  elTag="div"
                  elClasses={[
                    'fc-timegrid-slot-label-cushion',
                    'fc-scrollgrid-shrink-cushion',
                  ]}
                />
              </div>
            )}
          </ContentContainer>
        )
      }}
    </ViewContextType.Consumer>
  )
}

function renderInnerContent(props) { // TODO: add types
  return props.text
}
