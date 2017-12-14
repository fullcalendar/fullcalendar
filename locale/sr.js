import 'moment/locale/sr';
import * as FullCalendar from 'fullcalendar';


/* Serbian i18n for the jQuery UI date picker plugin. */
/* Written by Dejan Dimić. */
FullCalendar.datepickerLocale('sr', 'sr-SR', {
  closeText: "Zatvori",
  prevText: "&#x3C;",
  nextText: "&#x3E;",
  currentText: "Danas",
  monthNames: [ "Januar","Februar","Mart","April","Maj","Jun",
  "Jul","Avgust","Septembar","Oktobar","Novembar","Decembar" ],
  monthNamesShort: [ "Jan","Feb","Mar","Apr","Maj","Jun",
  "Jul","Avg","Sep","Okt","Nov","Dec" ],
  dayNames: [ "Nedelja","Ponedeljak","Utorak","Sreda","Četvrtak","Petak","Subota" ],
  dayNamesShort: [ "Ned","Pon","Uto","Sre","Čet","Pet","Sub" ],
  dayNamesMin: [ "Ne","Po","Ut","Sr","Če","Pe","Su" ],
  weekHeader: "Sed",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("sr", {
  buttonText: {
    prev: "Prethodna",
    next: "Sledeći",
    month: "Mеsеc",
    week: "Nеdеlja",
    day: "Dan",
    list: "Planеr"
  },
  allDayText: "Cеo dan",
  eventLimitText: function(n) {
    return "+ još " + n;
  },
  noEventsMessage: "Nеma događaja za prikaz"
});
