import 'moment/locale/sq';
import * as FullCalendar from 'fullcalendar';


/* Albanian initialisation for the jQuery UI date picker plugin. */
/* Written by Flakron Bytyqi (flakron@gmail.com). */
FullCalendar.datepickerLocale('sq', 'sq', {
  closeText: "mbylle",
  prevText: "&#x3C;mbrapa",
  nextText: "Përpara&#x3E;",
  currentText: "sot",
  monthNames: [ "Janar","Shkurt","Mars","Prill","Maj","Qershor",
  "Korrik","Gusht","Shtator","Tetor","Nëntor","Dhjetor" ],
  monthNamesShort: [ "Jan","Shk","Mar","Pri","Maj","Qer",
  "Kor","Gus","Sht","Tet","Nën","Dhj" ],
  dayNames: [ "E Diel","E Hënë","E Martë","E Mërkurë","E Enjte","E Premte","E Shtune" ],
  dayNamesShort: [ "Di","Hë","Ma","Më","En","Pr","Sh" ],
  dayNamesMin: [ "Di","Hë","Ma","Më","En","Pr","Sh" ],
  weekHeader: "Ja",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });

FullCalendar.locale("sq", {
  buttonText: {
    month: "Muaj",
    week: "Javë",
    day: "Ditë",
    list: "Listë"
  },
  allDayHtml: "Gjithë<br/>ditën",
  eventLimitText: function(n) {
    return "+më tepër " + n;
  },
  noEventsMessage: "Nuk ka evente për të shfaqur"
});
