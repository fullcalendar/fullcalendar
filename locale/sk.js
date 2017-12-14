import 'moment/locale/sk';
import * as FullCalendar from 'fullcalendar';


/* Slovak initialisation for the jQuery UI date picker plugin. */
/* Written by Vojtech Rinik (vojto@hmm.sk). */
FullCalendar.datepickerLocale('sk', 'sk', {
  closeText: "Zavrieť",
  prevText: "&#x3C;Predchádzajúci",
  nextText: "Nasledujúci&#x3E;",
  currentText: "Dnes",
  monthNames: [ "január","február","marec","apríl","máj","jún",
  "júl","august","september","október","november","december" ],
  monthNamesShort: [ "Jan","Feb","Mar","Apr","Máj","Jún",
  "Júl","Aug","Sep","Okt","Nov","Dec" ],
  dayNames: [ "nedeľa","pondelok","utorok","streda","štvrtok","piatok","sobota" ],
  dayNamesShort: [ "Ned","Pon","Uto","Str","Štv","Pia","Sob" ],
  dayNamesMin: [ "Ne","Po","Ut","St","Št","Pia","So" ],
  weekHeader: "Ty",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("sk", {
  buttonText: {
    month: "Mesiac",
    week: "Týždeň",
    day: "Deň",
    list: "Rozvrh"
  },
  allDayText: "Celý deň",
  eventLimitText: function(n) {
    return "+ďalšie: " + n;
  },
  noEventsMessage: "Žiadne akcie na zobrazenie"
});
