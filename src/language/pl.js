/**
 * fullCalendar Polish Translation
 * Łukasz Schab 
 * 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 **/

$.fullCalendarDefaultsLang = {
	// display
	defaultView: 'month', //agendaWeek
	aspectRatio: 1.228,
	header: {
		left: 'title',
		center: '',
		right: 'today prev,next'
	},
	weekends: true,
	weekNumbers: false,
	weekNumberCalculation: 'iso',
	weekNumberTitle: 'W',

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
		day: 'dddd, d MMMM yyyy'
	},
	columnFormat: {
		month: 'dddd',
		week: 'ddd dd-MM',
		day: 'dddd dd-MM-yyyy'
	},
	timeFormat: {// for event elements
		'': 'HH:mm', // default
		agenda: 'HH:mm{ - HH:mm}'
	},
	// locale
	isRTL: false,
	firstDay: 1,
	monthNames: ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"],
	monthNamesShort: ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"],
	dayNames: ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"],
	dayNamesShort: ["Nie", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"],
	buttonText: {
		prev: "<span class='fc-text-arrow'>&lsaquo;</span>",
		next: "<span class='fc-text-arrow'>&rsaquo;</span>",
		prevYear: "<span class='fc-text-arrow'>&laquo;</span>",
		nextYear: "<span class='fc-text-arrow'>&raquo;</span>",
		today: 'dziś',
		month: 'miesiąc',
		week: 'tydzień',
		day: 'dni'
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
	
//	For agenda
	allDaySlot: true,
	allDayText: '',
	firstHour: 8,
	slotMinutes: 15,
	defaultEventMinutes: 30,
	axisFormat: 'HH:mm',
	dragOpacity: {
		agenda: .5
	},
	minTime: 6,
	maxTime: 20
}
