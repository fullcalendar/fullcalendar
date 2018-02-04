import 'moment/locale/kk';
import * as FullCalendar from 'fullcalendar';


/* Kazakh (UTF-8) initialisation for the jQuery UI date picker plugin. */
/* Written by Dmitriy Karasyov (dmitriy.karasyov@gmail.com). */
FullCalendar.datepickerLocale('kk', 'kk', {
  closeText: "Жабу",
  prevText: "&#x3C;Алдыңғы",
  nextText: "Келесі&#x3E;",
  currentText: "Бүгін",
  monthNames: [ "Қаңтар","Ақпан","Наурыз","Сәуір","Мамыр","Маусым",
  "Шілде","Тамыз","Қыркүйек","Қазан","Қараша","Желтоқсан" ],
  monthNamesShort: [ "Қаң","Ақп","Нау","Сәу","Мам","Мау",
  "Шіл","Там","Қыр","Қаз","Қар","Жел" ],
  dayNames: [ "Жексенбі","Дүйсенбі","Сейсенбі","Сәрсенбі","Бейсенбі","Жұма","Сенбі" ],
  dayNamesShort: [ "жкс","дсн","ссн","срс","бсн","жма","снб" ],
  dayNamesMin: [ "Жк","Дс","Сс","Ср","Бс","Жм","Сн" ],
  weekHeader: "Не",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("kk", {
  buttonText: {
    month: "Ай",
    week: "Апта",
    day: "Күн",
    list: "Күн тәртібі"
  },
  allDayText: "Күні бойы",
  eventLimitText: function(n) {
    return "+ тағы " + n;
  },
  noEventsMessage: "Көрсету үшін оқиғалар жоқ"
});
