import 'moment/locale/mk';
import * as FullCalendar from 'fullcalendar';


/* Macedonian i18n for the jQuery UI date picker plugin. */
/* Written by Stojce Slavkovski. */
FullCalendar.datepickerLocale('mk', 'mk', {
  closeText: "Затвори",
  prevText: "&#x3C;",
  nextText: "&#x3E;",
  currentText: "Денес",
  monthNames: [ "Јануари","Февруари","Март","Април","Мај","Јуни",
  "Јули","Август","Септември","Октомври","Ноември","Декември" ],
  monthNamesShort: [ "Јан","Фев","Мар","Апр","Мај","Јун",
  "Јул","Авг","Сеп","Окт","Ное","Дек" ],
  dayNames: [ "Недела","Понеделник","Вторник","Среда","Четврток","Петок","Сабота" ],
  dayNamesShort: [ "Нед","Пон","Вто","Сре","Чет","Пет","Саб" ],
  dayNamesMin: [ "Не","По","Вт","Ср","Че","Пе","Са" ],
  weekHeader: "Сед",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("mk", {
  buttonText: {
    month: "Месец",
    week: "Недела",
    day: "Ден",
    list: "График"
  },
  allDayText: "Цел ден",
  eventLimitText: function(n) {
    return "+повеќе " + n;
  },
  noEventsMessage: "Нема настани за прикажување"
});
