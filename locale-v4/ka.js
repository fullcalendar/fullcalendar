import * as FullCalendar from 'fullcalendar';

FullCalendar.locale("ka", {
  week: {
    dow: 1,
    doy: 7
  },
  buttonText: {
    prev: "წინა",
    next: "შემდეგი",
    today: "დღეს",
    month: "თვე",
    week: "კვირა",
    day: "დღე",
    list: "დღის წესრიგი"
  },
  allDayText: "მთელი დღე",
  eventLimitText: function(n) {
    return "+ კიდევ " + n;
  },
  noEventsMessage: "ღონისძიებები არ არის"
});
