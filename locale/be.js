import 'moment/locale/be';
import * as FullCalendar from 'fullcalendar';


/* Belarusian (UTF-8) initialisation for the jQuery UI date picker plugin. */
/* Written by All Fill  */
FullCalendar.datepickerLocale('be', 'be', {
  closeText: "Зачыніць",
  prevText: "&#x3C;Папярэд",
  nextText: "След&#x3E;",
  currentText: "Сёння",
  monthNames: ["Студзень", "Люты", "Сакавік", "Красавік", "Трав", "Чэрвень", "Ліпень", "Жнівень", "Верасень", "Кастрычнік", "Лістапад", "Снежань"],
  monthNamesShort: ["Студ", "Лют", "Сак", "Крас", "Трав", "Чэрв", "Ліп", "Жнів", "Вер", "Каст", "Ліст", "Снеж"],
  dayNames: ["нядзеля", "панядзелак", "аўторак", "серада", "чацвер", "пятніца", "субота"],
  dayNamesShort: ["ндз", "пнд", "аўт", "срд", "чцв", "птн", "сбт"],
  dayNamesMin: ["Нд","Пн","Ат","Ср","Чц","Пт","Сб"],
  weekHeader: "Ндз",
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
  allDayHtml: "Увесь<br />дзень",
  eventLimitText: function(n) {
    return "+ яшчэ " + n;
  },
  noEventsMessage: "Няма падзей для адлюстравання"
});
