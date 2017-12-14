import 'moment/locale/fr';
import * as FullCalendar from 'fullcalendar';


/* French initialisation for the jQuery UI date picker plugin. */
/* Written by Keith Wood (kbwood{at}iinet.com.au),
        Stéphane Nahmani (sholby@sholby.net),
        Stéphane Raimbault <stephane.raimbault@gmail.com> */
FullCalendar.datepickerLocale('fr', 'fr', {
  closeText: "Fermer",
  prevText: "Précédent",
  nextText: "Suivant",
  currentText: "Aujourd'hui",
  monthNames: [ "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre" ],
  monthNamesShort: [ "janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc." ],
  dayNames: [ "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi" ],
  dayNamesShort: [ "dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam." ],
  dayNamesMin: [ "D","L","M","M","J","V","S" ],
  weekHeader: "Sem.",
  dateFormat: "dd/mm/yy",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("fr", {
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
