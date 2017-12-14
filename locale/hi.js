import 'moment/locale/hi';
import * as FullCalendar from 'fullcalendar';


/* Hindi initialisation for the jQuery UI date picker plugin. */
/* Written by Michael Dawart. */
FullCalendar.datepickerLocale('hi', 'hi', {
  closeText: "बंद",
  prevText: "पिछला",
  nextText: "अगला",
  currentText: "आज",
  monthNames: [ "जनवरी ","फरवरी","मार्च","अप्रेल","मई","जून",
  "जूलाई","अगस्त ","सितम्बर","अक्टूबर","नवम्बर","दिसम्बर" ],
  monthNamesShort: [ "जन", "फर", "मार्च", "अप्रेल", "मई", "जून",
  "जूलाई", "अग", "सित", "अक्ट", "नव", "दि" ],
  dayNames: [ "रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार" ],
  dayNamesShort: [ "रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि" ],
  dayNamesMin: [ "रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि" ],
  weekHeader: "हफ्ता",
  dateFormat: "dd/mm/yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("hi", {
  buttonText: {
    month: "महीना",
    week: "सप्ताह",
    day: "दिन",
    list: "कार्यसूची"
  },
  allDayText: "सभी दिन",
  eventLimitText: function(n) {
    return "+अधिक " + n;
  },
  noEventsMessage: "कोई घटनाओं को प्रदर्शित करने के लिए"
});
