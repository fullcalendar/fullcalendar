import { distributeHeight } from '../util/misc'
import BasicView from './BasicView'
import MonthViewDateProfileGenerator from './MonthViewDateProfileGenerator'
import { DateMarker } from '../datelib/marker'


/* A month view with day cells running in rows (one-per-week) and columns
----------------------------------------------------------------------------------------------------------------------*/

export default class MonthView extends BasicView {

  // Overrides the default BasicView behavior to have special multi-week auto-height logic
  setGridHeight(height, isAuto) {

    // if auto, make the height of each row the height that it would be if there were 6 weeks
    if (isAuto) {
      height *= this.dayGrid.rowCnt / 6
    }

    distributeHeight(this.dayGrid.rowEls, height, !isAuto) // if auto, don't compensate for height-hogging rows
  }


  isDateInOtherMonth(date: DateMarker, dateProfile) {
    let { dateEnv } = this

    return dateEnv.getMonth(date) !== dateEnv.getMonth(dateProfile.currentRange.start)
  }

}

MonthView.dateProfileGeneratorClass = MonthViewDateProfileGenerator
