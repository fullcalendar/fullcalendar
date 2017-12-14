import 'moment/locale/ar-dz';
import * as FullCalendar from 'fullcalendar';


/* Algerian Arabic Translation for jQuery UI date picker plugin.
/* Used in most of Maghreb countries, primarily in Algeria, Tunisia, Morocco.
/* Mohamed Cherif BOUCHELAGHEM -- cherifbouchelaghem@yahoo.fr */
/* Mohamed Amine HADDAD -- zatamine@gmail.com */

FullCalendar.datepickerLocale('ar-dz', 'ar-DZ', {
  closeText: "إغلاق",
  prevText: "&#x3C;السابق",
  nextText: "التالي&#x3E;",
  currentText: "اليوم",
  monthNames: [ "جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان",
  "جويلية", "أوت", "سبتمبر","أكتوبر", "نوفمبر", "ديسمبر" ],
  monthNamesShort: [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12" ],
  dayNames: [ "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت" ],
  dayNamesShort: [ "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت" ],
  dayNamesMin: [ "ح", "ن", "ث", "ر", "خ", "ج", "س" ],
  weekHeader: "أسبوع",
  dateFormat: "dd/mm/yy",
  firstDay: 6,
    isRTL: true,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("ar-dz", {
  buttonText: {
    month: "شهر",
    week: "أسبوع",
    day: "يوم",
    list: "أجندة"
  },
  allDayText: "اليوم كله",
  eventLimitText: "أخرى",
  noEventsMessage: "أي أحداث لعرض"
});
