import 'moment/locale/nn';
import * as FullCalendar from 'fullcalendar';


/* Norwegian Nynorsk initialisation for the jQuery UI date picker plugin. */
/* Written by Bjørn Johansen (post@bjornjohansen.no). */
FullCalendar.datepickerLocale('nn', 'nn', {
  closeText: "Lukk",
  prevText: "&#xAB;Førre",
  nextText: "Neste&#xBB;",
  currentText: "I dag",
  monthNames: [
    "januar",
    "februar",
    "mars",
    "april",
    "mai",
    "juni",
    "juli",
    "august",
    "september",
    "oktober",
    "november",
    "desember"
  ],
  monthNamesShort: [ "jan","feb","mar","apr","mai","jun","jul","aug","sep","okt","nov","des" ],
  dayNamesShort: [ "sun","mån","tys","ons","tor","fre","lau" ],
  dayNames: [ "sundag","måndag","tysdag","onsdag","torsdag","fredag","laurdag" ],
  dayNamesMin: [ "su","må","ty","on","to","fr","la" ],
  weekHeader: "Veke",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: ""
});

FullCalendar.locale("nn", {
  buttonText: {
    month: "Månad",
    week: "Veke",
    day: "Dag",
    list: "Agenda"
  },
  allDayText: "Heile dagen",
  eventLimitText: "til",
  noEventsMessage: "Ingen hendelser å vise"
});
