import 'moment/locale/eu';
import * as FullCalendar from 'fullcalendar';


/* Karrikas-ek itzulia (karrikas@karrikas.com) */
FullCalendar.datepickerLocale('eu', 'eu', {
  closeText: "Egina",
  prevText: "&#x3C;Aur",
  nextText: "Hur&#x3E;",
  currentText: "Gaur",
  monthNames: [ "urtarrila","otsaila","martxoa","apirila","maiatza","ekaina",
    "uztaila","abuztua","iraila","urria","azaroa","abendua" ],
  monthNamesShort: [ "urt.","ots.","mar.","api.","mai.","eka.",
    "uzt.","abu.","ira.","urr.","aza.","abe." ],
  dayNames: [ "igandea","astelehena","asteartea","asteazkena","osteguna","ostirala","larunbata" ],
  dayNamesShort: [ "ig.","al.","ar.","az.","og.","ol.","lr." ],
  dayNamesMin: [ "ig","al","ar","az","og","ol","lr" ],
  weekHeader: "As",
  dateFormat: "yy-mm-dd",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("eu", {
  buttonText: {
    month: "Hilabetea",
    week: "Astea",
    day: "Eguna",
    list: "Agenda"
  },
  allDayHtml: "Egun<br/>osoa",
  eventLimitText: "gehiago",
  noEventsMessage: "Ez dago ekitaldirik erakusteko"
});
