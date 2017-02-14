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
//! locale : Arabic (Morocco) [ar-ma]
//! author : ElFadili Yassine : https://github.com/ElFadiliY
//! author : Abdel Said : https://github.com/abdelsaid

; 'use strict';


    var ar_ma = (moment.defineLocale || moment.lang).call(moment, 'ar-ma', {
        months : 'يناير_فبراير_مارس_أبريل_ماي_يونيو_يوليوز_غشت_شتنبر_أكتوبر_نونبر_دجنبر'.split('_'),
        monthsShort : 'يناير_فبراير_مارس_أبريل_ماي_يونيو_يوليوز_غشت_شتنبر_أكتوبر_نونبر_دجنبر'.split('_'),
        weekdays : 'الأحد_الإتنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت'.split('_'),
        weekdaysShort : 'احد_اتنين_ثلاثاء_اربعاء_خميس_جمعة_سبت'.split('_'),
        weekdaysMin : 'ح_ن_ث_ر_خ_ج_س'.split('_'),
        weekdaysParseExact : true,
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[اليوم على الساعة] LT',
            nextDay: '[غدا على الساعة] LT',
            nextWeek: 'dddd [على الساعة] LT',
            lastDay: '[أمس على الساعة] LT',
            lastWeek: 'dddd [على الساعة] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'في %s',
            past : 'منذ %s',
            s : 'ثوان',
            m : 'دقيقة',
            mm : '%d دقائق',
            h : 'ساعة',
            hh : '%d ساعات',
            d : 'يوم',
            dd : '%d أيام',
            M : 'شهر',
            MM : '%d أشهر',
            y : 'سنة',
            yy : '%d سنوات'
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });

    return ar_ma;

})();

/* Arabic Translation for jQuery UI date picker plugin. */
/* Used in most of Arab countries, primarily in Bahrain, Kuwait, Oman, Qatar, Saudi Arabia and the United Arab Emirates, Egypt, Sudan and Yemen. */
/* Written by Mohammed Alshehri -- m@dralshehri.com */

$.fullCalendar.datepickerLang('ar-ma', 'ar', {
closeText: 'إغلاق',
prevText: '&#x3C;السابق',
nextText: 'التالي&#x3E;',
currentText: 'اليوم',
monthNames: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
monthNamesShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
dayNames: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
dayNamesShort: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
dayNamesMin: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
weekHeader: 'أسبوع',
dateFormat: 'dd/mm/yy',
firstDay: 0,
	isRTL: true,
showMonthAfterYear: false,
yearSuffix: ''});


$.fullCalendar.lang("ar-ma", {
	buttonText: {
		month: "شهر",
		week: "أسبوع",
		day: "يوم",
		list: "أجندة"
	},
	allDayText: "اليوم كله",
	eventLimitText: "أخرى"
});


});