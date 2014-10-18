# FullCalendar
This fork is fullcalendar version 2.1.1 with support of Persian Jalali calendar.
Everything is like fullcalendar mainline but:
  - For persian jalali calendar to be enabled you have to just use "lang:'persianJalali'" in your fullcalendar object definition. It is added by me and it is not in mainline of fullcalendar development yet. and it has no interfere with any other fullcalendar configuration object.
  - Becareful of using "lang:fa" because it does not convert fullcalendar to Jalali format, it just translates default fullcalendar to persian language as it does before.
  - I used "viewRender" and "eventAfterAllRender" fullcalendar object elements for this conversion so PLEASE BE CAREFUL FOR OVERRIDING THEM.
  - I even used [this pwt-datpicker](http://babakhani.github.io/PersianWebToolkit/datepicker.html) jquery library for my date conversions so it is my fork new dependancy so add it before using this fork.
  - Some tests are changed for Jalali calendare test.

A full-sized drag & drop event calendar (jQuery plugin).

- [Project website and demos](http://arshaw.com/fullcalendar/)
- [Documentation](http://arshaw.com/fullcalendar/docs/)
- [Support](http://arshaw.com/fullcalendar/support/)
- [Changelog](changelog.md)
- [License](license.txt)

For contributors:

- [Ways to contribute](http://arshaw.com/fullcalendar/wiki/Contributing/)
- [General coding guidelines](https://github.com/arshaw/fullcalendar/wiki/Contributing-Code)
- [Contributing features](https://github.com/arshaw/fullcalendar/wiki/Contributing-Features)
- [Contributing bugfixes](https://github.com/arshaw/fullcalendar/wiki/Contributing-Bugfixes)
