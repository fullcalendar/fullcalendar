import 'moment/locale/it';
import * as FullCalendar from 'fullcalendar';


/* Italian initialisation for the jQuery UI date picker plugin. */
/* Written by Antonello Pasella (antonello.pasella@gmail.com). */
FullCalendar.datepickerLocale('it', 'it', {
  closeText: "Chiudi",
  prevText: "&#x3C;Prec",
  nextText: "Succ&#x3E;",
  currentText: "Oggi",
  monthNames: [ "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
    "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre" ],
  monthNamesShort: [ "Gen","Feb","Mar","Apr","Mag","Giu",
    "Lug","Ago","Set","Ott","Nov","Dic" ],
  dayNames: [ "Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato" ],
  dayNamesShort: [ "Dom","Lun","Mar","Mer","Gio","Ven","Sab" ],
  dayNamesMin: [ "Do","Lu","Ma","Me","Gi","Ve","Sa" ],
  weekHeader: "Sm",
  dateFormat: "dd/mm/yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("it", {
  buttonText: {
    month: "Mese",
    week: "Settimana",
    day: "Giorno",
    list: "Agenda"
  },
  allDayHtml: "Tutto il<br/>giorno",
  eventLimitText: function(n) {
    return "+altri " + n;
  },
  noEventsMessage: "Non ci sono eventi da visualizzare"
});
