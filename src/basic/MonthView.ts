import * as moment from 'moment'
import { distributeHeight } from '../util'
import UnzonedRange from '../models/UnzonedRange'
import BasicView from './BasicView'
import BasicViewDateProfileGenerator from './BasicViewDateProfileGenerator'


/* A month view with day cells running in rows (one-per-week) and columns
----------------------------------------------------------------------------------------------------------------------*/


class MonthViewDateProfileGenerator extends BasicViewDateProfileGenerator {

	// Computes the date range that will be rendered.
	buildRenderRange(currentUnzonedRange, currentRangeUnit, isRangeAllDay) {
		var renderUnzonedRange = super.buildRenderRange(currentUnzonedRange, currentRangeUnit, isRangeAllDay);
		var start = this.msToUtcMoment(renderUnzonedRange.startMs, isRangeAllDay);
		var end = this.msToUtcMoment(renderUnzonedRange.endMs, isRangeAllDay);
		var rowCnt;

		// ensure 6 weeks
		if (this.opt('fixedWeekCount')) {
			rowCnt = Math.ceil( // could be partial weeks due to hiddenDays
				end.diff(start, 'weeks', true) // dontRound=true
			);
			end.add(6 - rowCnt, 'weeks');
		}

		return new UnzonedRange(start, end);
	}

}


export default class MonthView extends BasicView {

	// Overrides the default BasicView behavior to have special multi-week auto-height logic
	setGridHeight(height, isAuto) {

		// if auto, make the height of each row the height that it would be if there were 6 weeks
		if (isAuto) {
			height *= this.dayGrid.rowCnt / 6;
		}

		distributeHeight(this.dayGrid.rowEls, height, !isAuto); // if auto, don't compensate for height-hogging rows
	}


	isDateInOtherMonth(date, dateProfile) {
		return date.month() !== moment.utc(dateProfile.currentUnzonedRange.startMs).month(); // TODO: optimize
	}

}


MonthView.prototype.dateProfileGeneratorClass = MonthViewDateProfileGenerator
