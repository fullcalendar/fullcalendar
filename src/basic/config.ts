import { register } from '../ViewRegistry'
import BasicView from './BasicView'
import MonthView from './MonthView'

register('basic', {
	'class': BasicView
});

register('basicDay', {
	type: 'basic',
	duration: { days: 1 }
});

register('basicWeek', {
	type: 'basic',
	duration: { weeks: 1 }
});

register('month', {
	'class': MonthView,
	duration: { months: 1 }, // important for prev/next
	defaults: {
		fixedWeekCount: true
	}
});
