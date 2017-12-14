import 'moment/locale/ro';
import * as FullCalendar from 'fullcalendar';


/* Romanian initialisation for the jQuery UI date picker plugin.
 *
 * Written by Edmond L. (ll_edmond@walla.com)
 * and Ionut G. Stan (ionut.g.stan@gmail.com)
 */
FullCalendar.datepickerLocale('ro', 'ro', {
  closeText: "Închide",
  prevText: "&#xAB; Luna precedentă",
  nextText: "Luna următoare &#xBB;",
  currentText: "Azi",
  monthNames: [ "Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie",
  "Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie" ],
  monthNamesShort: [ "Ian", "Feb", "Mar", "Apr", "Mai", "Iun",
  "Iul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
  dayNames: [ "Duminică", "Luni", "Marţi", "Miercuri", "Joi", "Vineri", "Sâmbătă" ],
  dayNamesShort: [ "Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm" ],
  dayNamesMin: [ "Du","Lu","Ma","Mi","Jo","Vi","Sâ" ],
  weekHeader: "Săpt",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("ro", {
  buttonText: {
    prev: "precedentă", // override JQUI's translations, which contains the word "month"
    next: "următoare",  // "
    month: "Lună",
    week: "Săptămână",
    day: "Zi",
    list: "Agendă"
  },
  allDayText: "Toată ziua",
  eventLimitText: function(n) {
    return "+alte " + n;
  },
  noEventsMessage: "Nu există evenimente de afișat"
});
