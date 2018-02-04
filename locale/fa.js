import 'moment/locale/fa';
import * as FullCalendar from 'fullcalendar';


/* Persian (Farsi) Translation for the jQuery UI date picker plugin. */
/* Javad Mowlanezhad -- jmowla@gmail.com */
/* Jalali calendar should supported soon! (Its implemented but I have to test it) */
FullCalendar.datepickerLocale('fa', 'fa', {
  closeText: "بستن",
  prevText: "&#x3C;قبلی",
  nextText: "بعدی&#x3E;",
  currentText: "امروز",
  monthNames: [
    "ژانویه",
    "فوریه",
    "مارس",
    "آوریل",
    "مه",
    "ژوئن",
    "ژوئیه",
    "اوت",
    "سپتامبر",
    "اکتبر",
    "نوامبر",
    "دسامبر"
  ],
  monthNamesShort: [ "1","2","3","4","5","6","7","8","9","10","11","12" ],
  dayNames: [
    "يکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
    "شنبه"
  ],
  dayNamesShort: [
    "ی",
    "د",
    "س",
    "چ",
    "پ",
    "ج",
    "ش"
  ],
  dayNamesMin: [
    "ی",
    "د",
    "س",
    "چ",
    "پ",
    "ج",
    "ش"
  ],
  weekHeader: "هف",
  dateFormat: "yy/mm/dd",
  firstDay: 6,
  isRTL: true,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("fa", {
  buttonText: {
    month: "ماه",
    week: "هفته",
    day: "روز",
    list: "برنامه"
  },
  allDayText: "تمام روز",
  eventLimitText: function(n) {
    return "بیش از " + n;
  },
  noEventsMessage: "هیچ رویدادی به نمایش"
});
