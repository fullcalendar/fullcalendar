import 'moment/locale/es';
import * as FullCalendar from 'fullcalendar';


/* Inicialización en español para la extensión 'UI date picker' para jQuery. */
/* Traducido por Vester (xvester@gmail.com). */
FullCalendar.datepickerLocale('es', 'es', {
  closeText: "Cerrar",
  prevText: "&#x3C;Ant",
  nextText: "Sig&#x3E;",
  currentText: "Hoy",
  monthNames: [ "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre" ],
  monthNamesShort: [ "Ene","Feb","Mar","Abr","May","Jun",
  "Jul","Ago","Sep","Oct","Nov","Dic" ],
  dayNames: [ "Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado" ],
  dayNamesShort: [ "Dom","Lun","Mar","Mié","Jue","Vie","Sáb" ],
  dayNamesMin: [ "D","L","M","X","J","V","S" ],
  weekHeader: "Sm",
  dateFormat: "dd/mm/yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("es", {
  buttonText: {
    month: "Mes",
    week: "Semana",
    day: "Día",
    list: "Agenda"
  },
  allDayHtml: "Todo<br/>el día",
  eventLimitText: "más",
  noEventsMessage: "No hay eventos para mostrar"
});
