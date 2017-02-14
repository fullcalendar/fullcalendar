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
//! locale : Galician [gl]
//! author : Juan G. Hurtado : https://github.com/juanghurtado

; 'use strict';


    var gl = (moment.defineLocale || moment.lang).call(moment, 'gl', {
        months : 'Xaneiro_Febreiro_Marzo_Abril_Maio_Xuño_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro'.split('_'),
        monthsShort : 'Xan._Feb._Mar._Abr._Mai._Xuñ._Xul._Ago._Set._Out._Nov._Dec.'.split('_'),
        monthsParseExact: true,
        weekdays : 'Domingo_Luns_Martes_Mércores_Xoves_Venres_Sábado'.split('_'),
        weekdaysShort : 'Dom._Lun._Mar._Mér._Xov._Ven._Sáb.'.split('_'),
        weekdaysMin : 'Do_Lu_Ma_Mé_Xo_Ve_Sá'.split('_'),
        weekdaysParseExact : true,
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY H:mm',
            LLLL : 'dddd D MMMM YYYY H:mm'
        },
        calendar : {
            sameDay : function () {
                return '[hoxe ' + ((this.hours() !== 1) ? 'ás' : 'á') + '] LT';
            },
            nextDay : function () {
                return '[mañá ' + ((this.hours() !== 1) ? 'ás' : 'á') + '] LT';
            },
            nextWeek : function () {
                return 'dddd [' + ((this.hours() !== 1) ? 'ás' : 'a') + '] LT';
            },
            lastDay : function () {
                return '[onte ' + ((this.hours() !== 1) ? 'á' : 'a') + '] LT';
            },
            lastWeek : function () {
                return '[o] dddd [pasado ' + ((this.hours() !== 1) ? 'ás' : 'a') + '] LT';
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : function (str) {
                if (str === 'uns segundos') {
                    return 'nuns segundos';
                }
                return 'en ' + str;
            },
            past : 'hai %s',
            s : 'uns segundos',
            m : 'un minuto',
            mm : '%d minutos',
            h : 'unha hora',
            hh : '%d horas',
            d : 'un día',
            dd : '%d días',
            M : 'un mes',
            MM : '%d meses',
            y : 'un ano',
            yy : '%d anos'
        },
        ordinalParse : /\d{1,2}º/,
        ordinal : '%dº',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    return gl;

})();

/* Galician localization for 'UI date picker' jQuery extension. */
/* Translated by Jorge Barreiro <yortx.barry@gmail.com>. */
$.fullCalendar.datepickerLang('gl', 'gl', {
closeText: 'Pechar',
prevText: '&#x3C;Ant',
nextText: 'Seg&#x3E;',
currentText: 'Hoxe',
monthNames: ['Xaneiro','Febreiro','Marzo','Abril','Maio','Xuño',
'Xullo','Agosto','Setembro','Outubro','Novembro','Decembro'],
monthNamesShort: ['Xan','Feb','Mar','Abr','Mai','Xuñ',
'Xul','Ago','Set','Out','Nov','Dec'],
dayNames: ['Domingo','Luns','Martes','Mércores','Xoves','Venres','Sábado'],
dayNamesShort: ['Dom','Lun','Mar','Mér','Xov','Ven','Sáb'],
dayNamesMin: ['Do','Lu','Ma','Mé','Xo','Ve','Sá'],
weekHeader: 'Sm',
dateFormat: 'dd/mm/yy',
firstDay: 1,
isRTL: false,
showMonthAfterYear: false,
yearSuffix: ''});


$.fullCalendar.lang("gl", {
	buttonText: {
		month: "Mes",
		week: "Semana",
		day: "Día",
		list: "Axenda"
	},
	allDayHtml: "Todo<br/>o día",
	eventLimitText: "máis"
});


});