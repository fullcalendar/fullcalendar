
var defaults = {

	// display
	defaultView: 'month',
	aspectRatio: 1.35,
	header: {
		left: 'title',
		center: '',
		right: 'today prev,next'
	},
	weekends: true,
	currentTimeIndicator: false,
	
	// editing
	//editable: false,
	//disableDragging: false,
	//disableResizing: false,
	
	allDayDefault: true,
	ignoreTimezone: true,
	
	// event ajax
	lazyFetching: true,
	startParam: 'start',
	endParam: 'end',
	
	// time formats
	titleFormat: {
		month: 'MMMM yyyy',
		week: "MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}",
		day: 'dddd, MMM d, yyyy',
		list: 'MMM d, yyyy',
		table: 'MMM d, yyyy'
	},
	columnFormat: {
		month: 'ddd',
		week: 'ddd M/d',
		day: 'dddd M/d',
		list: 'dddd, MMM d, yyyy',
		table: 'MMM d, yyyy'
	},
	timeFormat: { // for event elements
		'': 'h(:mm)t' // default
	},
	
	// locale
	isRTL: false,
	firstDay: 0,
	monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
	monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
	dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
	dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
	buttonText: {
		prev: '&nbsp;&#9668;&nbsp;',
		next: '&nbsp;&#9658;&nbsp;',
		prevYear: '&nbsp;&lt;&lt;&nbsp;',
		nextYear: '&nbsp;&gt;&gt;&nbsp;',
		today: 'today',
		month: 'month',
		week: 'week',
		day: 'day',
		list: 'list',
		table: 'table'
	},
	listTexts: {
		until: 'until',
		past: 'Past events',
		today: 'Today',
		tomorrow: 'Tomorrow',
		thisWeek: 'This week',
		nextWeek: 'Next week',
		thisMonth: 'This month',
		nextMonth: 'Next month',
		future: 'Future events',
		week: 'W'
	},
	
	// list/table options
	listSections: 'month',  // false|'day'|'week'|'month'|'smart'
	listRange: 30,  // number of days to be displayed
	listPage: 7,  // number of days to jump when paging
	tableCols: ['handle', 'date', 'time', 'title'],
	
	// jquery-ui theming
	theme: false,
	buttonIcons: {
		prev: 'circle-triangle-w',
		next: 'circle-triangle-e'
	},
	
	//selectable: false,
	unselectAuto: true,
	
	dropAccept: '*'
	
};

// right-to-left defaults
var rtlDefaults = {
	header: {
		left: 'next,prev today',
		center: '',
		right: 'title'
	},
	buttonText: {
		prev: '&nbsp;&#9658;&nbsp;',
		next: '&nbsp;&#9668;&nbsp;',
		prevYear: '&nbsp;&gt;&gt;&nbsp;',
		nextYear: '&nbsp;&lt;&lt;&nbsp;'
	},
	buttonIcons: {
		prev: 'circle-triangle-e',
		next: 'circle-triangle-w'
	}
};


