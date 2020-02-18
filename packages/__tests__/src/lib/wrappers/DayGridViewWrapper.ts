import { Calendar } from '@fullcalendar/core'
import ViewWrapper from './ViewWrapper'
import DayGridWrapper from './DayGridWrapper'

export default class DayGridViewWrapper extends ViewWrapper {

  constructor(calendar: Calendar) {
    super(calendar, 'fc-dayGrid-view')
  }

  get dayGrid() {
    return new DayGridWrapper(this.el.querySelector('.fc-day-grid'))
  }

}
