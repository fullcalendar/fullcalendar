import ViewWrapper from './ViewWrapper'
import TimeGridWrapper from './TimeGridWrapper'
import DayGridWrapper from './DayGridWrapper'

export default class TimeGridViewWrapper extends ViewWrapper {

  constructor(calendar) {
    super(calendar, 'fc-timeGrid-view')
  }

  get timeGrid() {
    return new TimeGridWrapper(this.el.querySelector('.fc-time-grid'))
  }

  get dayGrid() { // the all-day area
    return new DayGridWrapper(this.el.querySelector('.fc-day-grid'))
  }

}
