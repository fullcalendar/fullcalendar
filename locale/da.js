import 'moment/locale/da';
import * as FullCalendar from 'fullcalendar';


/* Danish initialisation for the jQuery UI date picker plugin. */
/* Written by Jan Christensen ( deletestuff@gmail.com). */
FullCalendar.datepickerLocale('da', 'da', {
  closeText: "Luk",
  prevText: "&#x3C;Forrige",
  nextText: "Næste&#x3E;",
  currentText: "Idag",
  monthNames: [ "Januar","Februar","Marts","April","Maj","Juni",
  "Juli","August","September","Oktober","November","December" ],
  monthNamesShort: [ "Jan","Feb","Mar","Apr","Maj","Jun",
  "Jul","Aug","Sep","Okt","Nov","Dec" ],
  dayNames: [ "Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag" ],
  dayNamesShort: [ "Søn","Man","Tir","Ons","Tor","Fre","Lør" ],
  dayNamesMin: [ "Sø","Ma","Ti","On","To","Fr","Lø" ],
  weekHeader: "Uge",
  dateFormat: "dd-mm-yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("da", {
  buttonText: {
    month: "Måned",
    week: "Uge",
    day: "Dag",
    list: "Agenda"
  },
  allDayText: "Hele dagen",
  eventLimitText: "flere",
  noEventsMessage: "Ingen arrangementer at vise"
});
