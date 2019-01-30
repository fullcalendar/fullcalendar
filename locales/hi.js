
export default {
  code: "hi",
  week: {
    dow: 0, // Sunday is the first day of the week.
    doy: 6  // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: "पिछला",
    next: "अगला",
    today: "आज",
    month: "महीना",
    week: "सप्ताह",
    day: "दिन",
    list: "कार्यसूची"
  },
  weekLabel: "हफ्ता",
  allDayText: "सभी दिन",
  eventLimitText: function(n) {
    return "+अधिक " + n;
  },
  noEventsMessage: "कोई घटनाओं को प्रदर्शित करने के लिए"
};
