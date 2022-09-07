import { BaseComponent } from '@fullcalendar/core'
import { createElement } from '@fullcalendar/core/preact'
import { TimeColsAxisCell } from './TimeColsAxisCell'
import { TimeSlatMeta } from './time-slat-meta'

/* Thin Axis
------------------------------------------------------------------------------------------------------------------*/

interface TimeBodyAxisProps {
  slatMetas: TimeSlatMeta[]
}

export class TimeBodyAxis extends BaseComponent<TimeBodyAxisProps> { // just <tr> content
  render() {
    return this.props.slatMetas.map((slatMeta: TimeSlatMeta) => (
      <tr key={slatMeta.key}>
        <TimeColsAxisCell {...slatMeta} />
      </tr>
    ))
  }
}
