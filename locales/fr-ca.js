import { createLocale } from '@fullcalendar/core';

export default createLocale("fr", {
  buttonText: {
    prev: "Précédent",
    next: "Suivant",
    today: "Aujourd'hui",
    year: "Année",
    month: "Mois",
    week: "Semaine",
    day: "Jour",
    list: "Mon planning"
  },
  weekLabel: "Sem.",
  allDayHtml: "Toute la<br/>journée",
  eventLimitText: "en plus",
  noEventsMessage: "Aucun événement à afficher"
});
