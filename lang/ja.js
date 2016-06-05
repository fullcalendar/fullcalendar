
jQuery.fullCalendar.lang("ja", {
    buttonText: {
        month: "月",
        week: "週",
        day: "日",
        list: "予定リスト"
    },
    titleFormat: 'YYYY年 MMMM',
    monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
    allDayText: "終日",
    eventLimitText: function(n) {
        return "他 " + n + " 件";
    }
});
