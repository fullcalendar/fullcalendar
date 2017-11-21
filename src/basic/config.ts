import namespaceHooks from '../namespace-hooks'
import BasicView from './BasicView'
import MonthView from './MonthView'

const views = namespaceHooks.views as any

views.basic = {
	'class': BasicView
};

views.basicDay = {
	type: 'basic',
	duration: { days: 1 }
};

views.basicWeek = {
	type: 'basic',
	duration: { weeks: 1 }
};

views.month = {
	'class': MonthView,
	duration: { months: 1 }, // important for prev/next
	defaults: {
		fixedWeekCount: true
	}
};
