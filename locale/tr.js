import 'moment/locale/tr';
import * as FullCalendar from 'fullcalendar';


/* Turkish initialisation for the jQuery UI date picker plugin. */
/* Written by Izzet Emre Erkan (kara@karalamalar.net). */
FullCalendar.datepickerLocale('tr', 'tr', {
  closeText: "kapat",
  prevText: "&#x3C;geri",
  nextText: "ileri&#x3e",
  currentText: "bugün",
  monthNames: [ "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
  "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık" ],
  monthNamesShort: [ "Oca","Şub","Mar","Nis","May","Haz",
  "Tem","Ağu","Eyl","Eki","Kas","Ara" ],
  dayNames: [ "Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi" ],
  dayNamesShort: [ "Pz","Pt","Sa","Ça","Pe","Cu","Ct" ],
  dayNamesMin: [ "Pz","Pt","Sa","Ça","Pe","Cu","Ct" ],
  weekHeader: "Hf",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("tr", {
  buttonText: {
    next: "ileri", // override JQUI's, which has a non-closing HTML entity in it
    month: "Ay",
    week: "Hafta",
    day: "Gün",
    list: "Ajanda"
  },
  allDayText: "Tüm gün",
  eventLimitText: "daha fazla",
  noEventsMessage: "Gösterilecek etkinlik yok"
});
