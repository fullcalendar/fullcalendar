import 'moment/locale/uk';
import * as FullCalendar from 'fullcalendar';


/* Ukrainian (UTF-8) initialisation for the jQuery UI date picker plugin. */
/* Written by Maxim Drogobitskiy (maxdao@gmail.com). */
/* Corrected by Igor Milla (igor.fsp.milla@gmail.com). */
FullCalendar.datepickerLocale('uk', 'uk', {
  closeText: "Закрити",
  prevText: "&#x3C;",
  nextText: "&#x3E;",
  currentText: "Сьогодні",
  monthNames: [ "Січень","Лютий","Березень","Квітень","Травень","Червень",
  "Липень","Серпень","Вересень","Жовтень","Листопад","Грудень" ],
  monthNamesShort: [ "Січ","Лют","Бер","Кві","Тра","Чер",
  "Лип","Сер","Вер","Жов","Лис","Гру" ],
  dayNames: [ "неділя","понеділок","вівторок","середа","четвер","п’ятниця","субота" ],
  dayNamesShort: [ "нед","пнд","вів","срд","чтв","птн","сбт" ],
  dayNamesMin: [ "Нд","Пн","Вт","Ср","Чт","Пт","Сб" ],
  weekHeader: "Тиж",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("uk", {
  buttonText: {
    month: "Місяць",
    week: "Тиждень",
    day: "День",
    list: "Порядок денний"
  },
  allDayText: "Увесь день",
  eventLimitText: function(n) {
    return "+ще " + n + "...";
  },
  noEventsMessage: "Немає подій для відображення"
});
