import 'moment/locale/ms-my';
import * as FullCalendar from 'fullcalendar';


/* Malaysian initialisation for the jQuery UI date picker plugin. */
/* Written by Mohd Nawawi Mohamad Jamili (nawawi@ronggeng.net). */
FullCalendar.datepickerLocale('ms-my', 'ms', {
  closeText: "Tutup",
  prevText: "&#x3C;Sebelum",
  nextText: "Selepas&#x3E;",
  currentText: "hari ini",
  monthNames: [ "Januari","Februari","Mac","April","Mei","Jun",
  "Julai","Ogos","September","Oktober","November","Disember" ],
  monthNamesShort: [ "Jan","Feb","Mac","Apr","Mei","Jun",
  "Jul","Ogo","Sep","Okt","Nov","Dis" ],
  dayNames: [ "Ahad","Isnin","Selasa","Rabu","Khamis","Jumaat","Sabtu" ],
  dayNamesShort: [ "Aha","Isn","Sel","Rab","kha","Jum","Sab" ],
  dayNamesMin: [ "Ah","Is","Se","Ra","Kh","Ju","Sa" ],
  weekHeader: "Mg",
  dateFormat: "dd/mm/yy",
  firstDay: 0,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("ms-my", {
  buttonText: {
    month: "Bulan",
    week: "Minggu",
    day: "Hari",
    list: "Agenda"
  },
  allDayText: "Sepanjang hari",
  eventLimitText: function(n) {
    return "masih ada " + n + " acara";
  },
  noEventsMessage: "Tiada peristiwa untuk dipaparkan"
});
