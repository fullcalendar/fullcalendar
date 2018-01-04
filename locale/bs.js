import 'moment/locale/bs';
import * as FullCalendar from 'fullcalendar';


/* Bosnian i18n for the jQuery UI date picker plugin. */
/* Written by Sabahuddin Sijamhodzic. */
FullCalendar.datepickerLocale('bs', 'bs', {
  closeText: "Zatvori",
  prevText: "&#x3C;",
  nextText: "&#x3E;",
  currentText: "Danas",
  monthNames: [ "Januar","Februar","Mart","April","Maj","Juni",
  "Juli","August","Septembar","Oktobar","Novmbar","Decembar" ],
  monthNamesShort: [ "Jan","Feb","Mar","Apr","Maj","Jun",
  "Jul","Aug","Sep","Okt","Nov","Dec" ],
  dayNames: [ "Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota" ],
  dayNamesShort: [ "Ned","Pon","Uto","Sri","Čet","Pet","Sub" ],
  dayNamesMin: [ "Ne","Po","Ut","Sr","Če","Pe","Su" ],
  weekHeader: "Sed",
  dateFormat: "dd.mm.yy.",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("bs", {
  buttonText: {
    prev: "Prošli", // jqui datepicker has weird html entities. override.
    next: "Sljedeći", // "
    month: "Mjesec",
    week: "Sedmica",
    day: "Dan",
    list: "Raspored"
  },
  allDayText: "Cijeli dan",
  eventLimitText: function(n) {
    return "+ još " + n;
  },
  noEventsMessage: "Nema događaja za prikazivanje"
});
