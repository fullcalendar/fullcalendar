
$.fullCalendar.locale("sr-Latn", {
  buttonText: {
    month: "Mesec",
    week: "Nedelja",
    day: "Dan",
    list: "Planer"
  },
  allDayText: "Ceo dan",
  eventLimitText: function(n) {
    return "+ još " + n;
  },
  noEventsMessage: "Nema događaja za prikaz"
});
