import 'moment/locale/et';
import * as FullCalendar from 'fullcalendar';


/* Estonian initialisation for the jQuery UI date picker plugin. */
/* Written by Mart Sõmermaa (mrts.pydev at gmail com). */
FullCalendar.datepickerLocale('et', 'et', {
  closeText: "Sulge",
  prevText: "Eelnev",
  nextText: "Järgnev",
  currentText: "Täna",
  monthNames: [ "Jaanuar","Veebruar","Märts","Aprill","Mai","Juuni",
  "Juuli","August","September","Oktoober","November","Detsember" ],
  monthNamesShort: [ "Jaan", "Veebr", "Märts", "Apr", "Mai", "Juuni",
  "Juuli", "Aug", "Sept", "Okt", "Nov", "Dets" ],
  dayNames: [
    "Pühapäev",
    "Esmaspäev",
    "Teisipäev",
    "Kolmapäev",
    "Neljapäev",
    "Reede",
    "Laupäev"
  ],
  dayNamesShort: [ "Pühap", "Esmasp", "Teisip", "Kolmap", "Neljap", "Reede", "Laup" ],
  dayNamesMin: [ "P","E","T","K","N","R","L" ],
  weekHeader: "näd",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("et", {
  buttonText: {
    month: "Kuu",
    week: "Nädal",
    day: "Päev",
    list: "Päevakord"
  },
  allDayText: "Kogu päev",
  eventLimitText: function(n) {
    return "+ veel " + n;
  },
  noEventsMessage: "Kuvamiseks puuduvad sündmused"
});
