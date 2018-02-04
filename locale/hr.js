import 'moment/locale/hr';
import * as FullCalendar from 'fullcalendar';


/* Croatian i18n for the jQuery UI date picker plugin. */
/* Written by Vjekoslav Nesek. */
FullCalendar.datepickerLocale('hr', 'hr', {
  closeText: "Zatvori",
  prevText: "&#x3C;",
  nextText: "&#x3E;",
  currentText: "Danas",
  monthNames: [ "Siječanj","Veljača","Ožujak","Travanj","Svibanj","Lipanj",
  "Srpanj","Kolovoz","Rujan","Listopad","Studeni","Prosinac" ],
  monthNamesShort: [ "Sij","Velj","Ožu","Tra","Svi","Lip",
  "Srp","Kol","Ruj","Lis","Stu","Pro" ],
  dayNames: [ "Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota" ],
  dayNamesShort: [ "Ned","Pon","Uto","Sri","Čet","Pet","Sub" ],
  dayNamesMin: [ "Ne","Po","Ut","Sr","Če","Pe","Su" ],
  weekHeader: "Tje",
  dateFormat: "dd.mm.yy.",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("hr", {
  buttonText: {
    prev: "Prijašnji", // jqui datepicker has weird html entities. override.
    next: "Sljedeći", // "
    month: "Mjesec",
    week: "Tjedan",
    day: "Dan",
    list: "Raspored"
  },
  allDayText: "Cijeli dan",
  eventLimitText: function(n) {
    return "+ još " + n;
  },
  noEventsMessage: "Nema događaja za prikaz"
});
