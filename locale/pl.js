import 'moment/locale/pl';
import * as FullCalendar from 'fullcalendar';


/* Polish initialisation for the jQuery UI date picker plugin. */
/* Written by Jacek Wysocki (jacek.wysocki@gmail.com). */
FullCalendar.datepickerLocale('pl', 'pl', {
  closeText: "Zamknij",
  prevText: "&#x3C;Poprzedni",
  nextText: "Następny&#x3E;",
  currentText: "Dziś",
  monthNames: [ "Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec",
  "Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień" ],
  monthNamesShort: [ "Sty","Lu","Mar","Kw","Maj","Cze",
  "Lip","Sie","Wrz","Pa","Lis","Gru" ],
  dayNames: [ "Niedziela","Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota" ],
  dayNamesShort: [ "Nie","Pn","Wt","Śr","Czw","Pt","So" ],
  dayNamesMin: [ "N","Pn","Wt","Śr","Cz","Pt","So" ],
  weekHeader: "Tydz",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("pl", {
  buttonText: {
    month: "Miesiąc",
    week: "Tydzień",
    day: "Dzień",
    list: "Plan dnia"
  },
  allDayText: "Cały dzień",
  eventLimitText: "więcej",
  noEventsMessage: "Brak wydarzeń do wyświetlenia"
});
