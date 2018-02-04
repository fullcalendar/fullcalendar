import 'moment/locale/fr-ch';
import * as FullCalendar from 'fullcalendar';


/* Swiss-French initialisation for the jQuery UI date picker plugin. */
/* Written Martin Voelkle (martin.voelkle@e-tc.ch). */
FullCalendar.datepickerLocale('fr-ch', 'fr-CH', {
  closeText: "Fermer",
  prevText: "&#x3C;Préc",
  nextText: "Suiv&#x3E;",
  currentText: "Courant",
  monthNames: [ "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre" ],
  monthNamesShort: [ "janv.", "févr.", "mars", "avril", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc." ],
  dayNames: [ "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi" ],
  dayNamesShort: [ "dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam." ],
  dayNamesMin: [ "D", "L", "M", "M", "J", "V", "S" ],
  weekHeader: "Sm",
  dateFormat: "dd.mm.yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("fr-ch", {
  buttonText: {
    year: "Année",
    month: "Mois",
    week: "Semaine",
    day: "Jour",
    list: "Mon planning"
  },
  allDayHtml: "Toute la<br/>journée",
  eventLimitText: "en plus",
  noEventsMessage: "Aucun événement à afficher"
});
