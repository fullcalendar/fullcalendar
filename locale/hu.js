import 'moment/locale/hu';
import * as FullCalendar from 'fullcalendar';


/* Hungarian initialisation for the jQuery UI date picker plugin. */
FullCalendar.datepickerLocale('hu', 'hu', {
  closeText: "bezár",
  prevText: "vissza",
  nextText: "előre",
  currentText: "ma",
  monthNames: [ "Január", "Február", "Március", "Április", "Május", "Június",
  "Július", "Augusztus", "Szeptember", "Október", "November", "December" ],
  monthNamesShort: [ "Jan", "Feb", "Már", "Ápr", "Máj", "Jún",
  "Júl", "Aug", "Szep", "Okt", "Nov", "Dec" ],
  dayNames: [ "Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat" ],
  dayNamesShort: [ "Vas", "Hét", "Ked", "Sze", "Csü", "Pén", "Szo" ],
  dayNamesMin: [ "V", "H", "K", "Sze", "Cs", "P", "Szo" ],
  weekHeader: "Hét",
  dateFormat: "yy.mm.dd.",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: true,
  yearSuffix: "" });


FullCalendar.locale("hu", {
  buttonText: {
    month: "Hónap",
    week: "Hét",
    day: "Nap",
    list: "Napló"
  },
  allDayText: "Egész nap",
  eventLimitText: "további",
  noEventsMessage: "Nincs megjeleníthető esemény"
});
