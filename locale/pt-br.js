import 'moment/locale/pt-br';
import * as FullCalendar from 'fullcalendar';


/* Brazilian initialisation for the jQuery UI date picker plugin. */
/* Written by Leonildo Costa Silva (leocsilva@gmail.com). */
FullCalendar.datepickerLocale('pt-br', 'pt-BR', {
  closeText: "Fechar",
  prevText: "&#x3C;Anterior",
  nextText: "Próximo&#x3E;",
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
  weekHeader: "Sm",
  dateFormat: "dd/mm/yy",
  firstDay: 0,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("pt-br", {
  buttonText: {
    month: "Mês",
    week: "Semana",
    day: "Dia",
    list: "Compromissos"
  },
  allDayText: "dia inteiro",
  eventLimitText: function(n) {
    return "mais +" + n;
  },
  noEventsMessage: "Não há eventos para mostrar"
});
