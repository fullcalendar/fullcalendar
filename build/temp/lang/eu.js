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
//! locale : Basque [eu]
//! author : Eneko Illarramendi : https://github.com/eillarra

; 'use strict';


    var eu = (moment.defineLocale || moment.lang).call(moment, 'eu', {
        months : 'urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua'.split('_'),
        monthsShort : 'urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.'.split('_'),
        monthsParseExact : true,
        weekdays : 'igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata'.split('_'),
        weekdaysShort : 'ig._al._ar._az._og._ol._lr.'.split('_'),
        weekdaysMin : 'ig_al_ar_az_og_ol_lr'.split('_'),
        weekdaysParseExact : true,
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'YYYY-MM-DD',
            LL : 'YYYY[ko] MMMM[ren] D[a]',
            LLL : 'YYYY[ko] MMMM[ren] D[a] HH:mm',
            LLLL : 'dddd, YYYY[ko] MMMM[ren] D[a] HH:mm',
            l : 'YYYY-M-D',
            ll : 'YYYY[ko] MMM D[a]',
            lll : 'YYYY[ko] MMM D[a] HH:mm',
            llll : 'ddd, YYYY[ko] MMM D[a] HH:mm'
        },
        calendar : {
            sameDay : '[gaur] LT[etan]',
            nextDay : '[bihar] LT[etan]',
            nextWeek : 'dddd LT[etan]',
            lastDay : '[atzo] LT[etan]',
            lastWeek : '[aurreko] dddd LT[etan]',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s barru',
            past : 'duela %s',
            s : 'segundo batzuk',
            m : 'minutu bat',
            mm : '%d minutu',
            h : 'ordu bat',
            hh : '%d ordu',
            d : 'egun bat',
            dd : '%d egun',
            M : 'hilabete bat',
            MM : '%d hilabete',
            y : 'urte bat',
            yy : '%d urte'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    return eu;

})();

/* Karrikas-ek itzulia (karrikas@karrikas.com) */
$.fullCalendar.datepickerLang('eu', 'eu', {
closeText: 'Egina',
prevText: '&#x3C;Aur',
nextText: 'Hur&#x3E;',
currentText: 'Gaur',
monthNames: ['urtarrila','otsaila','martxoa','apirila','maiatza','ekaina',
	'uztaila','abuztua','iraila','urria','azaroa','abendua'],
monthNamesShort: ['urt.','ots.','mar.','api.','mai.','eka.',
	'uzt.','abu.','ira.','urr.','aza.','abe.'],
dayNames: ['igandea','astelehena','asteartea','asteazkena','osteguna','ostirala','larunbata'],
dayNamesShort: ['ig.','al.','ar.','az.','og.','ol.','lr.'],
dayNamesMin: ['ig','al','ar','az','og','ol','lr'],
weekHeader: 'As',
dateFormat: 'yy-mm-dd',
firstDay: 1,
isRTL: false,
showMonthAfterYear: false,
yearSuffix: ''});


$.fullCalendar.lang("eu", {
	buttonText: {
		month: "Hilabetea",
		week: "Astea",
		day: "Eguna",
		list: "Agenda"
	},
	allDayHtml: "Egun<br/>osoa",
	eventLimitText: "gehiago"
});


});