import 'moment/locale/pt';
import * as FullCalendar from 'fullcalendar';


/* Portuguese initialisation for the jQuery UI date picker plugin. */
FullCalendar.datepickerLocale('pt', 'pt', {
  closeText: "Fechar",
  prevText: "Anterior",
  nextText: "Seguinte",
  currentText: "Hoje",
  monthNames: [ "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro" ],
  monthNamesShort: [ "Jan","Fev","Mar","Abr","Mai","Jun",
  "Jul","Ago","Set","Out","Nov","Dez" ],
  dayNames: [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado"
  ],
  dayNamesShort: [ "Dom","Seg","Ter","Qua","Qui","Sex","Sáb" ],
  dayNamesMin: [ "Dom","Seg","Ter","Qua","Qui","Sex","Sáb" ],
  weekHeader: "Sem",
  dateFormat: "dd/mm/yy",
  firstDay: 0,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("pt", {
  buttonText: {
    month: "Mês",
    week: "Semana",
    day: "Dia",
    list: "Agenda"
  },
  allDayText: "Todo o dia",
  eventLimitText: "mais",
  noEventsMessage: "Não há eventos para mostrar"
});
