import 'moment/locale/el';
import * as FullCalendar from 'fullcalendar';


/* Greek (el) initialisation for the jQuery UI date picker plugin. */
/* Written by Alex Cicovic (http://www.alexcicovic.com) */
FullCalendar.datepickerLocale('el', 'el', {
  closeText: "Κλείσιμο",
  prevText: "Προηγούμενος",
  nextText: "Επόμενος",
  currentText: "Σήμερα",
  monthNames: [ "Ιανουάριος","Φεβρουάριος","Μάρτιος","Απρίλιος","Μάιος","Ιούνιος",
  "Ιούλιος","Αύγουστος","Σεπτέμβριος","Οκτώβριος","Νοέμβριος","Δεκέμβριος" ],
  monthNamesShort: [ "Ιαν","Φεβ","Μαρ","Απρ","Μαι","Ιουν",
  "Ιουλ","Αυγ","Σεπ","Οκτ","Νοε","Δεκ" ],
  dayNames: [ "Κυριακή","Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο" ],
  dayNamesShort: [ "Κυρ","Δευ","Τρι","Τετ","Πεμ","Παρ","Σαβ" ],
  dayNamesMin: [ "Κυ","Δε","Τρ","Τε","Πε","Πα","Σα" ],
  weekHeader: "Εβδ",
  dateFormat: "dd/mm/yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("el", {
  buttonText: {
    month: "Μήνας",
    week: "Εβδομάδα",
    day: "Ημέρα",
    list: "Ατζέντα"
  },
  allDayText: "Ολοήμερο",
  eventLimitText: "περισσότερα",
  noEventsMessage: "Δεν υπάρχουν γεγονότα για να εμφανιστεί"
});
