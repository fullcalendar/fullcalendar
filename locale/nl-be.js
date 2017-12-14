import 'moment/locale/nl-be';
import * as FullCalendar from 'fullcalendar';


/* Dutch (Belgium) initialisation for the jQuery UI date picker plugin. */
/* David De Sloovere @DavidDeSloovere */
FullCalendar.datepickerLocale('nl-be', 'nl-BE', {
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
  dateFormat: "dd/mm/yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("nl-be", {
  buttonText: {
    month: "Maand",
    week: "Week",
    day: "Dag",
    list: "Agenda"
  },
  allDayText: "Hele dag",
  eventLimitText: "extra",
  noEventsMessage: "Geen evenementen om te laten zien"
});
