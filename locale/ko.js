import 'moment/locale/ko';
import * as FullCalendar from 'fullcalendar';


/* Korean initialisation for the jQuery calendar extension. */
/* Written by DaeKwon Kang (ncrash.dk@gmail.com), Edited by Genie and Myeongjin Lee. */
FullCalendar.datepickerLocale('ko', 'ko', {
  closeText: "닫기",
  prevText: "이전달",
  nextText: "다음달",
  currentText: "오늘",
  monthNames: [ "1월","2월","3월","4월","5월","6월",
  "7월","8월","9월","10월","11월","12월" ],
  monthNamesShort: [ "1월","2월","3월","4월","5월","6월",
  "7월","8월","9월","10월","11월","12월" ],
  dayNames: [ "일요일","월요일","화요일","수요일","목요일","금요일","토요일" ],
  dayNamesShort: [ "일","월","화","수","목","금","토" ],
  dayNamesMin: [ "일","월","화","수","목","금","토" ],
  weekHeader: "주",
  dateFormat: "yy. m. d.",
  firstDay: 0,
  isRTL: false,
  showMonthAfterYear: true,
  yearSuffix: "년" });


FullCalendar.locale("ko", {
  buttonText: {
    month: "월",
    week: "주",
    day: "일",
    list: "일정목록"
  },
  allDayText: "종일",
  eventLimitText: "개",
  noEventsMessage: "일정이 없습니다"
});
