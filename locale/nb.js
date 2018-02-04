import 'moment/locale/nb';
import * as FullCalendar from 'fullcalendar';


/* Norwegian Bokmål initialisation for the jQuery UI date picker plugin. */
/* Written by Bjørn Johansen (post@bjornjohansen.no). */
FullCalendar.datepickerLocale('nb', 'nb', {
  closeText: "Lukk",
  prevText: "&#xAB;Forrige",
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
  dayNamesShort: [ "søn","man","tir","ons","tor","fre","lør" ],
  dayNames: [ "søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag" ],
  dayNamesMin: [ "sø","ma","ti","on","to","fr","lø" ],
  weekHeader: "Uke",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: ""
});


FullCalendar.locale("nb", {
  buttonText: {
    month: "Måned",
    week: "Uke",
    day: "Dag",
    list: "Agenda"
  },
  allDayText: "Hele dagen",
  eventLimitText: "til",
  noEventsMessage: "Ingen hendelser å vise"
});
