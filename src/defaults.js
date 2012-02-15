
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
		day: 'dddd, MMM d, yyyy'
	},
	columnFormat: {
		month: 'ddd',
		week: 'ddd M/d',
		day: 'dddd M/d'
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
		day: 'day'
	},
	
	// jquery-ui theming
	theme: false,
	buttonIcons: {
		prev: 'circle-triangle-w',
		next: 'circle-triangle-e'
	},
	
	//selectable: false,
	unselectAuto: true,
	
	dropAccept: '*',
	
	dateFormatters: {
		s	: function(d)	{ return d.getSeconds() },
		ss	: function(d)	{ return zeroPad(d.getSeconds()) },
		m	: function(d)	{ return d.getMinutes() },
		mm	: function(d)	{ return zeroPad(d.getMinutes()) },
		h	: function(d)	{ return d.getHours() % 12 || 12 },
		hh	: function(d)	{ return zeroPad(d.getHours() % 12 || 12) },
		H	: function(d)	{ return d.getHours() },
		HH	: function(d)	{ return zeroPad(d.getHours()) },
		d	: function(d)	{ return d.getDate() },
		dd	: function(d)	{ return zeroPad(d.getDate()) },
		ddd	: function(d,o)	{ return o.dayNamesShort[d.getDay()] },
		dddd: function(d,o)	{ return o.dayNames[d.getDay()] },
		M	: function(d)	{ return d.getMonth() + 1 },
		MM	: function(d)	{ return zeroPad(d.getMonth() + 1) },
		MMM	: function(d,o)	{ return o.monthNamesShort[d.getMonth()] },
		MMMM: function(d,o)	{ return o.monthNames[d.getMonth()] },
		yy	: function(d)	{ return (d.getFullYear()+'').substring(2) },
		yyyy: function(d)	{ return d.getFullYear() },
		t	: function(d)	{ return d.getHours() < 12 ? 'a' : 'p' },
		tt	: function(d)	{ return d.getHours() < 12 ? 'am' : 'pm' },
		T	: function(d)	{ return d.getHours() < 12 ? 'A' : 'P' },
		TT	: function(d)	{ return d.getHours() < 12 ? 'AM' : 'PM' },
		u	: function(d)	{ return formatDate(d, "yyyy-MM-dd'T'HH:mm:ss'Z'") },
		S	: function(d)	{
			var date = d.getDate();
			if (date > 10 && date < 20) {
				return 'th';
			}
			return ['st', 'nd', 'rd'][date%10-1] || 'th';
		}
	}
	
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


