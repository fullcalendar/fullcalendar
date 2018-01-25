import 'moment/locale/ka';
import * as FullCalendar from 'fullcalendar';


/* Georgian initialisation for the jQuery UI date picker plugin. */
/* Written by Avtandil Kikabidze aka LONGMAN <akalongman@gmail.com>. */
FullCalendar.datepickerLocale('ka', 'ka', {
  closeText: "დახურვა",
  prevText: "წინა",
  nextText: "შემდეგი",
  currentText: "დღეს",
  monthNames: [ "იანვარი","თებერვალი","მარტი","აპრილი","მაისი","ივნისი",
  "ივლისი","აგვისტო","სექტემბერი","ოქტომბერი","ნოემბერი","დეკემბერი" ],
  monthNamesShort: [ "იან", "თებ", "მარ", "აპრ", "მაი", "ივნ",
  "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ" ],
  dayNames: [ "კვირა", "ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი" ],
  dayNamesShort: [ "კვი", "ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ" ],
  dayNamesMin: [ "კვ","ორ","სა","ოთ","ხუ","პა","შა" ],
  weekHeader: "კვ",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });

FullCalendar.locale("ka", {
  buttonText: {
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
