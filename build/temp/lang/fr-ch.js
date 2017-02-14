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
//! locale : French (Switzerland) [fr-ch]
//! author : Gaspard Bucher : https://github.com/gaspard

; 'use strict';


    var fr_ch = (moment.defineLocale || moment.lang).call(moment, 'fr-ch', {
        months : 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
        monthsShort : 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
        monthsParseExact : true,
        weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
        weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
        weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
        weekdaysParseExact : true,
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Aujourd\'hui à] LT',
            nextDay: '[Demain à] LT',
            nextWeek: 'dddd [à] LT',
            lastDay: '[Hier à] LT',
            lastWeek: 'dddd [dernier à] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'dans %s',
            past : 'il y a %s',
            s : 'quelques secondes',
            m : 'une minute',
            mm : '%d minutes',
            h : 'une heure',
            hh : '%d heures',
            d : 'un jour',
            dd : '%d jours',
            M : 'un mois',
            MM : '%d mois',
            y : 'un an',
            yy : '%d ans'
        },
        ordinalParse: /\d{1,2}(er|e)/,
        ordinal : function (number) {
            return number + (number === 1 ? 'er' : 'e');
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    return fr_ch;

})();

/* Swiss-French initialisation for the jQuery UI date picker plugin. */
/* Written Martin Voelkle (martin.voelkle@e-tc.ch). */
$.fullCalendar.datepickerLang('fr-ch', 'fr-CH', {
closeText: 'Fermer',
prevText: '&#x3C;Préc',
nextText: 'Suiv&#x3E;',
currentText: 'Courant',
monthNames: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
	'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
monthNamesShort: ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin',
	'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
dayNamesShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
weekHeader: 'Sm',
dateFormat: 'dd.mm.yy',
firstDay: 1,
isRTL: false,
showMonthAfterYear: false,
yearSuffix: ''});


$.fullCalendar.lang("fr-ch", {
	buttonText: {
		year: "Année",
		month: "Mois",
		week: "Semaine",
		day: "Jour",
		list: "Mon planning"
	},
	allDayHtml: "Toute la<br/>journée",
	eventLimitText: "en plus"
});


});