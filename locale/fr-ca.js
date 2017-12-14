import 'moment/locale/fr-ca';
import * as FullCalendar from 'fullcalendar';


/* Canadian-French initialisation for the jQuery UI date picker plugin. */
FullCalendar.datepickerLocale('fr-ca', 'fr-CA', {
  closeText: "Fermer",
  prevText: "Précédent",
  nextText: "Suivant",
  currentText: "Aujourd'hui",
  monthNames: [ "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre" ],
  monthNamesShort: [ "janv.", "févr.", "mars", "avril", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc." ],
  dayNames: [ "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi" ],
  dayNamesShort: [ "dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam." ],
  dayNamesMin: [ "D", "L", "M", "M", "J", "V", "S" ],
  weekHeader: "Sem.",
  dateFormat: "yy-mm-dd",
  firstDay: 0,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: ""
});


FullCalendar.locale("fr-ca", {
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
