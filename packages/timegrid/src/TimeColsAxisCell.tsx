import {
  createElement,
  ViewContext,
  createFormatter,
  ViewContextType,
  RenderHook,
  SlotLabelContentArg,
} from '@fullcalendar/common'
import { TimeSlatMeta } from './time-slat-meta'

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

        let hookProps: SlotLabelContentArg = {
          level: 0,
          time: props.time,
          date: dateEnv.toDate(props.date),
          view: viewApi,
          text: dateEnv.format(props.date, labelFormat),
        }

        return (
          <RenderHook<SlotLabelContentArg> // needed?
            hookProps={hookProps}
            classNames={options.slotLabelClassNames}
            content={options.slotLabelContent}
            defaultContent={renderInnerContent}
            didMount={options.slotLabelDidMount}
            willUnmount={options.slotLabelWillUnmount}
          >
            {(rootElRef, customClassNames, innerElRef, innerContent) => (
              <td ref={rootElRef} className={classNames.concat(customClassNames).join(' ')} data-time={props.isoTimeStr}>
                <div className="fc-timegrid-slot-label-frame fc-scrollgrid-shrink-frame">
                  <div className="fc-timegrid-slot-label-cushion fc-scrollgrid-shrink-cushion" ref={innerElRef}>
                    {innerContent}
                  </div>
                </div>
              </td>
            )}
          </RenderHook>
        )
      }}
    </ViewContextType.Consumer>
  )
}

function renderInnerContent(props) { // TODO: add types
  return props.text
}
