(function(factory) {
    if (typeof define === "function" && define.amd) {
        define([ "jquery", "moment" ], factory);
    }
    else if (typeof exports === "object") {
        module.exports = factory(require("jquery"), require("moment"));
    }
    else {
        factory(jQuery, moment);
    }
})(function($, moment) {

(function() {
//! moment.js locale configuration
//! locale : Portuguese (Brazil) [pt-br]
//! author : Caio Ribeiro Pereira : https://github.com/caio-ribeiro-pereira

; 'use strict';


    var pt_br = (moment.defineLocale || moment.lang).call(moment, 'pt-br', {
        months : 'Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
        monthsShort : 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
        weekdays : 'Domingo_Segunda-feira_Terça-feira_Quarta-feira_Quinta-feira_Sexta-feira_Sábado'.split('_'),
        weekdaysShort : 'Dom_Seg_Ter_Qua_Qui_Sex_Sáb'.split('_'),
        weekdaysMin : 'Dom_2ª_3ª_4ª_5ª_6ª_Sáb'.split('_'),
        weekdaysParseExact : true,
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D [de] MMMM [de] YYYY',
            LLL : 'D [de] MMMM [de] YYYY [às] HH:mm',
            LLLL : 'dddd, D [de] MMMM [de] YYYY [às] HH:mm'
        },
        calendar : {
            sameDay: '[Hoje às] LT',
            nextDay: '[Amanhã às] LT',
            nextWeek: 'dddd [às] LT',
            lastDay: '[Ontem às] LT',
            lastWeek: function () {
                return (this.day() === 0 || this.day() === 6) ?
                    '[Último] dddd [às] LT' : // Saturday + Sunday
                    '[Última] dddd [às] LT'; // Monday - Friday
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'em %s',
            past : '%s atrás',
            s : 'poucos segundos',
            m : 'um minuto',
            mm : '%d minutos',
            h : 'uma hora',
            hh : '%d horas',
            d : 'um dia',
            dd : '%d dias',
            M : 'um mês',
            MM : '%d meses',
            y : 'um ano',
            yy : '%d anos'
        },
        ordinalParse: /\d{1,2}º/,
        ordinal : '%dº'
    });

    return pt_br;

})();

/* Brazilian initialisation for the jQuery UI date picker plugin. */
/* Written by Leonildo Costa Silva (leocsilva@gmail.com). */
$.fullCalendar.datepickerLang('pt-br', 'pt-BR', {
closeText: 'Fechar',
prevText: '&#x3C;Anterior',
nextText: 'Próximo&#x3E;',
currentText: 'Hoje',
monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun',
'Jul','Ago','Set','Out','Nov','Dez'],
dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
dayNamesMin: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
weekHeader: 'Sm',
dateFormat: 'dd/mm/yy',
firstDay: 0,
isRTL: false,
showMonthAfterYear: false,
yearSuffix: ''});


$.fullCalendar.lang("pt-br", {
	buttonText: {
		month: "Mês",
		week: "Semana",
		day: "Dia",
		list: "Compromissos"
	},
	allDayText: "dia inteiro",
	eventLimitText: function(n) {
		return "mais +" + n;
	}
});


});