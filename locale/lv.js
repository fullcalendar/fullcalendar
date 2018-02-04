import 'moment/locale/lv';
import * as FullCalendar from 'fullcalendar';


/* Latvian (UTF-8) initialisation for the jQuery UI date picker plugin. */
/* @author Arturas Paleicikas <arturas.paleicikas@metasite.net> */
FullCalendar.datepickerLocale('lv', 'lv', {
  closeText: "Aizvērt",
  prevText: "Iepr.",
  nextText: "Nāk.",
  currentText: "Šodien",
  monthNames: [ "Janvāris","Februāris","Marts","Aprīlis","Maijs","Jūnijs",
  "Jūlijs","Augusts","Septembris","Oktobris","Novembris","Decembris" ],
  monthNamesShort: [ "Jan","Feb","Mar","Apr","Mai","Jūn",
  "Jūl","Aug","Sep","Okt","Nov","Dec" ],
  dayNames: [
    "svētdiena",
    "pirmdiena",
    "otrdiena",
    "trešdiena",
    "ceturtdiena",
    "piektdiena",
    "sestdiena"
  ],
  dayNamesShort: [ "svt","prm","otr","tre","ctr","pkt","sst" ],
  dayNamesMin: [ "Sv","Pr","Ot","Tr","Ct","Pk","Ss" ],
  weekHeader: "Ned.",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("lv", {
  buttonText: {
    month: "Mēnesis",
    week: "Nedēļa",
    day: "Diena",
    list: "Dienas kārtība"
  },
  allDayText: "Visu dienu",
  eventLimitText: function(n) {
    return "+vēl " + n;
  },
  noEventsMessage: "Nav notikumu"
});
