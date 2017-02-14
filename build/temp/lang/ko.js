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
//! locale : Korean [ko]
//!
//! authors
//!
//! - Kyungwook, Park : https://github.com/kyungw00k
//! - Jeeeyul Lee <jeeeyul@gmail.com>

; 'use strict';


    var ko = (moment.defineLocale || moment.lang).call(moment, 'ko', {
        months : '1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월'.split('_'),
        monthsShort : '1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월'.split('_'),
        weekdays : '일요일_월요일_화요일_수요일_목요일_금요일_토요일'.split('_'),
        weekdaysShort : '일_월_화_수_목_금_토'.split('_'),
        weekdaysMin : '일_월_화_수_목_금_토'.split('_'),
        longDateFormat : {
            LT : 'A h시 m분',
            LTS : 'A h시 m분 s초',
            L : 'YYYY.MM.DD',
            LL : 'YYYY년 MMMM D일',
            LLL : 'YYYY년 MMMM D일 A h시 m분',
            LLLL : 'YYYY년 MMMM D일 dddd A h시 m분'
        },
        calendar : {
            sameDay : '오늘 LT',
            nextDay : '내일 LT',
            nextWeek : 'dddd LT',
            lastDay : '어제 LT',
            lastWeek : '지난주 dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s 후',
            past : '%s 전',
            s : '몇 초',
            ss : '%d초',
            m : '일분',
            mm : '%d분',
            h : '한 시간',
            hh : '%d시간',
            d : '하루',
            dd : '%d일',
            M : '한 달',
            MM : '%d달',
            y : '일 년',
            yy : '%d년'
        },
        ordinalParse : /\d{1,2}일/,
        ordinal : '%d일',
        meridiemParse : /오전|오후/,
        isPM : function (token) {
            return token === '오후';
        },
        meridiem : function (hour, minute, isUpper) {
            return hour < 12 ? '오전' : '오후';
        }
    });

    return ko;

})();

/* Korean initialisation for the jQuery calendar extension. */
/* Written by DaeKwon Kang (ncrash.dk@gmail.com), Edited by Genie. */
$.fullCalendar.datepickerLang('ko', 'ko', {
closeText: '닫기',
prevText: '이전달',
nextText: '다음달',
currentText: '오늘',
monthNames: ['1월','2월','3월','4월','5월','6월',
'7월','8월','9월','10월','11월','12월'],
monthNamesShort: ['1월','2월','3월','4월','5월','6월',
'7월','8월','9월','10월','11월','12월'],
dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
dayNamesShort: ['일','월','화','수','목','금','토'],
dayNamesMin: ['일','월','화','수','목','금','토'],
weekHeader: 'Wk',
dateFormat: 'yy-mm-dd',
firstDay: 0,
isRTL: false,
showMonthAfterYear: true,
yearSuffix: '년'});


$.fullCalendar.lang("ko", {
	buttonText: {
		month: "월",
		week: "주",
		day: "일",
		list: "일정목록"
	},
	allDayText: "종일",
	eventLimitText: "개"
});


});