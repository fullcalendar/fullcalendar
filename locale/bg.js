import 'moment/locale/bg';
import * as FullCalendar from 'fullcalendar';


/* Bulgarian initialisation for the jQuery UI date picker plugin. */
/* Written by Stoyan Kyosev (http://svest.org). */
FullCalendar.datepickerLocale('bg', 'bg', {
  closeText: "затвори",
  prevText: "&#x3C;назад",
  nextText: "напред&#x3E;",
  nextBigText: "&#x3E;&#x3E;",
  currentText: "днес",
  monthNames: [ "Януари","Февруари","Март","Април","Май","Юни",
  "Юли","Август","Септември","Октомври","Ноември","Декември" ],
  monthNamesShort: [ "Яну","Фев","Мар","Апр","Май","Юни",
  "Юли","Авг","Сеп","Окт","Нов","Дек" ],
  dayNames: [ "Неделя","Понеделник","Вторник","Сряда","Четвъртък","Петък","Събота" ],
  dayNamesShort: [ "Нед","Пон","Вто","Сря","Чет","Пет","Съб" ],
  dayNamesMin: [ "Не","По","Вт","Ср","Че","Пе","Съ" ],
  weekHeader: "Wk",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("bg", {
  buttonText: {
    month: "Месец",
    week: "Седмица",
    day: "Ден",
    list: "График"
  },
  allDayText: "Цял ден",
  eventLimitText: function(n) {
    return "+още " + n;
  },
  noEventsMessage: "Няма събития за показване"
});
