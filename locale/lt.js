import 'moment/locale/lt';
import * as FullCalendar from 'fullcalendar';


/* Lithuanian (UTF-8) initialisation for the jQuery UI date picker plugin. */
/* @author Arturas Paleicikas <arturas@avalon.lt> */
FullCalendar.datepickerLocale('lt', 'lt', {
  closeText: "Uždaryti",
  prevText: "&#x3C;Atgal",
  nextText: "Pirmyn&#x3E;",
  currentText: "Šiandien",
  monthNames: [ "Sausis","Vasaris","Kovas","Balandis","Gegužė","Birželis",
  "Liepa","Rugpjūtis","Rugsėjis","Spalis","Lapkritis","Gruodis" ],
  monthNamesShort: [ "Sau","Vas","Kov","Bal","Geg","Bir",
  "Lie","Rugp","Rugs","Spa","Lap","Gru" ],
  dayNames: [
    "sekmadienis",
    "pirmadienis",
    "antradienis",
    "trečiadienis",
    "ketvirtadienis",
    "penktadienis",
    "šeštadienis"
  ],
  dayNamesShort: [ "sek","pir","ant","tre","ket","pen","šeš" ],
  dayNamesMin: [ "Se","Pr","An","Tr","Ke","Pe","Še" ],
  weekHeader: "SAV",
  dateFormat: "yy-mm-dd",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: true,
  yearSuffix: "" });


FullCalendar.locale("lt", {
  buttonText: {
    month: "Mėnuo",
    week: "Savaitė",
    day: "Diena",
    list: "Darbotvarkė"
  },
  allDayText: "Visą dieną",
  eventLimitText: "daugiau",
  noEventsMessage: "Nėra įvykių rodyti"
});
