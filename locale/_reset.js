import * as moment from 'moment';
import * as FullCalendar from 'fullcalendar';

moment.locale('en');
FullCalendar.locale('en');

if (window.jQuery.datepicker) {
  window.jQuery.datepicker.setDefaults(window.jQuery.datepicker.regional['']);
}
