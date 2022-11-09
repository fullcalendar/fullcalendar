import { BaseComponent } from '@fullcalendar/core/internal'
import { createElement } from '@fullcalendar/core/preact'
import { TimeColsAxisCell } from './TimeColsAxisCell.js'
import { TimeSlatMeta } from './time-slat-meta.js'

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
