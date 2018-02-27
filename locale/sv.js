import 'moment/locale/sv';
import * as FullCalendar from 'fullcalendar';


/* Swedish initialisation for the jQuery UI date picker plugin. */
/* Written by Anders Ekdahl ( anders@nomadiz.se). */
FullCalendar.datepickerLocale('sv', 'sv', {
  closeText: "Stäng",
  prevText: "&#xAB;Förra",
  nextText: "Nästa&#xBB;",
  currentText: "Idag",
  monthNames: [ "Januari","Februari","Mars","April","Maj","Juni",
  "Juli","Augusti","September","Oktober","November","December" ],
  monthNamesShort: [ "Jan","Feb","Mar","Apr","Maj","Jun",
  "Jul","Aug","Sep","Okt","Nov","Dec" ],
  dayNamesShort: [ "Sön","Mån","Tis","Ons","Tor","Fre","Lör" ],
  dayNames: [ "Söndag","Måndag","Tisdag","Onsdag","Torsdag","Fredag","Lördag" ],
  dayNamesMin: [ "Sö","Må","Ti","On","To","Fr","Lö" ],
  weekHeader: "v. ",
  dateFormat: "yy-mm-dd",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("sv", {
  buttonText: {
    month: "Månad",
    week: "Vecka",
    day: "Dag",
    list: "Program"
  },
  allDayText: "Heldag",
  eventLimitText: "till",
  noEventsMessage: "Inga händelser att visa"
});
