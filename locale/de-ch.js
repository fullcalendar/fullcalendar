import 'moment/locale/de-ch';
import * as FullCalendar from 'fullcalendar';


/* German initialisation for the jQuery UI date picker plugin. */
/* Written by Milian Wolff (mail@milianw.de). */
FullCalendar.datepickerLocale('de-ch', 'de', {
  closeText: "Schließen",
  prevText: "&#x3C;Zurück",
  nextText: "Vor&#x3E;",
  currentText: "Heute",
  monthNames: [ "Januar","Februar","März","April","Mai","Juni",
  "Juli","August","September","Oktober","November","Dezember" ],
  monthNamesShort: [ "Jan","Feb","Mär","Apr","Mai","Jun",
  "Jul","Aug","Sep","Okt","Nov","Dez" ],
  dayNames: [ "Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag" ],
  dayNamesShort: [ "So","Mo","Di","Mi","Do","Fr","Sa" ],
  dayNamesMin: [ "So","Mo","Di","Mi","Do","Fr","Sa" ],
  weekHeader: "KW",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("de-ch", {
  buttonText: {
	  year: "Jahr",
    month: "Monat",
    week: "Woche",
    day: "Tag",
    list: "Terminübersicht"
  },
  allDayText: "Ganztägig",
  eventLimitText: function(n) {
    return "+ weitere " + n;
  },
  noEventsMessage: "Keine Ereignisse anzuzeigen"
});
