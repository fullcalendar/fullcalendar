import 'moment/locale/nl';
import * as FullCalendar from 'fullcalendar';


/* Dutch (UTF-8) initialisation for the jQuery UI date picker plugin. */
/* Written by Mathias Bynens <http://mathiasbynens.be/> */
FullCalendar.datepickerLocale('nl', 'nl', {
  closeText: "Sluiten",
  prevText: "←",
  nextText: "→",
  currentText: "Vandaag",
  monthNames: [ "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december" ],
  monthNamesShort: [ "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec" ],
  dayNames: [ "zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag" ],
  dayNamesShort: [ "zon", "maa", "din", "woe", "don", "vri", "zat" ],
  dayNamesMin: [ "zo", "ma", "di", "wo", "do", "vr", "za" ],
  weekHeader: "Wk",
  dateFormat: "dd-mm-yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("nl", {
  buttonText: {
    year: "Jaar",
    month: "Maand",
    week: "Week",
    day: "Dag",
    list: "Agenda"
  },
  allDayText: "Hele dag",
  eventLimitText: "extra",
  noEventsMessage: "Geen evenementen om te laten zien"
});
