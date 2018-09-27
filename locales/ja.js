import { defineLocale } from 'fullcalendar';

defineLocale("ja", {
  buttonText: {
    prev: "前",
    next: "次",
    today: "今日",
    month: "月",
    week: "週",
    day: "日",
    list: "予定リスト"
  },
  weekLabel: "週",
  allDayText: "終日",
  eventLimitText: function(n) {
    return "他 " + n + " 件";
  },
  noEventsMessage: "イベントが表示されないように"
});
