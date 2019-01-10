import 'moment/locale/zh-hk';
import * as FullCalendar from 'fullcalendar';


/* Chinese initialisation for the jQuery UI date picker plugin. */
/* Written by Raymond (mathsgod@yahoo.com). */
FullCalendar.datepickerLocale('zh-hk', 'zh-HK', {
  closeText: "關閉",
  prevText: "&#x3C;上月",
  nextText: "下月&#x3E;",
  currentText: "今天",
  monthNames: [ "一月","二月","三月","四月","五月","六月",
  "七月","八月","九月","十月","十一月","十二月" ],
  monthNamesShort: [ "一月","二月","三月","四月","五月","六月",
  "七月","八月","九月","十月","十一月","十二月" ],
  dayNames: [ "星期日","星期一","星期二","星期三","星期四","星期五","星期六" ],
  dayNamesShort: [ "周日","周一","周二","周三","周四","周五","周六" ],
  dayNamesMin: [ "日","一","二","三","四","五","六" ],
  weekHeader: "周",
  dateFormat: "yy/mm/dd",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: true,
  yearSuffix: "年" });


FullCalendar.locale("zh-hk", {
  buttonText: {
    month: "月",
    week: "週",
    day: "天",
    list: "活動列表"
  },
  allDayText: "整天",
  eventLimitText: '顯示更多',
  noEventsMessage: "没有任何活動"
});
