import 'moment/locale/cs';
import * as FullCalendar from 'fullcalendar';


/* Czech initialisation for the jQuery UI date picker plugin. */
/* Written by Tomas Muller (tomas@tomas-muller.net). */
FullCalendar.datepickerLocale('cs', 'cs', {
  closeText: "Zavřít",
  prevText: "&#x3C;Dříve",
  nextText: "Později&#x3E;",
  currentText: "Nyní",
  monthNames: [ "leden","únor","březen","duben","květen","červen",
  "červenec","srpen","září","říjen","listopad","prosinec" ],
  monthNamesShort: [ "led","úno","bře","dub","kvě","čer",
  "čvc","srp","zář","říj","lis","pro" ],
  dayNames: [ "neděle", "pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota" ],
  dayNamesShort: [ "ne", "po", "út", "st", "čt", "pá", "so" ],
  dayNamesMin: [ "ne","po","út","st","čt","pá","so" ],
  weekHeader: "Týd",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("cs", {
  buttonText: {
    month: "Měsíc",
    week: "Týden",
    day: "Den",
    list: "Agenda"
  },
  allDayText: "Celý den",
  eventLimitText: function(n) {
    return "+další: " + n;
  },
  noEventsMessage: "Žádné akce k zobrazení"
});
