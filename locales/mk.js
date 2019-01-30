import { createLocale } from '@fullcalendar/core';

export default createLocale("mk", {
  buttonText: {
    prev: "претходно",
    next: "следно",
    today: "Денес",
    month: "Месец",
    week: "Недела",
    day: "Ден",
    list: "График"
  },
  weekLabel: "Сед",
  allDayText: "Цел ден",
  eventLimitText: function(n) {
    return "+повеќе " + n;
  },
  noEventsMessage: "Нема настани за прикажување"
});
