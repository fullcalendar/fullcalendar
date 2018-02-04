import 'moment/locale/af';
import * as FullCalendar from 'fullcalendar';


/* Afrikaans initialisation for the jQuery UI date picker plugin. */
/* Written by Renier Pretorius. */
FullCalendar.datepickerLocale('af', 'af', {
  closeText: "Selekteer",
  prevText: "Vorige",
  nextText: "Volgende",
  currentText: "Vandag",
  monthNames: [ "Januarie","Februarie","Maart","April","Mei","Junie",
  "Julie","Augustus","September","Oktober","November","Desember" ],
  monthNamesShort: [ "Jan", "Feb", "Mrt", "Apr", "Mei", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Des" ],
  dayNames: [ "Sondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrydag", "Saterdag" ],
  dayNamesShort: [ "Son", "Maa", "Din", "Woe", "Don", "Vry", "Sat" ],
  dayNamesMin: [ "So","Ma","Di","Wo","Do","Vr","Sa" ],
  weekHeader: "Wk",
  dateFormat: "dd/mm/yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });

FullCalendar.locale("af", {
  buttonText: {
    year: "Jaar",
    month: "Maand",
    week: "Week",
    day: "Dag",
    list: "Agenda"
  },
  allDayHtml: "Heeldag",
  eventLimitText: "Addisionele",
  noEventsMessage: "Daar is geen gebeurtenisse nie"
});
