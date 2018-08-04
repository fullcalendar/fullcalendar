import 'moment/locale/be';
import * as FullCalendar from 'fullcalendar';


/* Belarusian (UTF-8) initialisation for the jQuery UI date picker plugin. */
/* Written by All Fill  */
FullCalendar.datepickerLocale('be', 'be', {
  closeText: "Зачыніць",
  prevText: "&#x3C;Папярэд",
  nextText: "След&#x3E;",
  currentText: "Сёння",
  monthNames: [ "Студзень", "Люты", "Сакавік", "Красавік", "Май", "Чэрвень",
  "Ліпень", "Аўгуст", "Верасень", "Кастрычнік", "Лістапад", "Снежань" ],
  monthNamesShort: [  "Студ", "Лют", "Мар", "Крас", "Май", "Чэр",
  "Ліп", "Жнів", "Вер", "Кас", "Ліс", "Снеж" ],
  dayNames: [ "нядзеля", "панядзелак", "аўторак", "серада", "чацвер", "пятніца", "субота" ],
  dayNamesShort: [ "ндз", "пнд", "аўт", "срд", "чтв", "птн", "сбт" ],
  dayNamesMin: [ "Вс","Пн","Вт","Ср","Чт","Пт","Сб" ],
  weekHeader: "Нед",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("be", {
  buttonText: {
    month: "Месяц",
    week: "Тыдзень",
    day: "Дзень",
    list: "Парадак дня"
  },
  allDayText: "Увесь дзень",
  eventLimitText: function(n) {
    return "+ яшчэ " + n;
  },
  noEventsMessage: "Няма падзей для адлюстравання"
});