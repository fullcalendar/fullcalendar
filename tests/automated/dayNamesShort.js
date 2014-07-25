describe('short day names', function() {
  var settings = {};
  var testableClasses = [
    'month',
    'agendaWeek',
    'basicWeek'
  ];
  var dayClasses = [
    '.fc-sun',
    '.fc-mon',
    '.fc-tue',
    '.fc-wed',
    '.fc-thu',
    '.fc-fri',
    '.fc-sat'
  ];
  var languages = [ 'es', 'fr', 'de', 'zh-cn', 'es' ];

  beforeEach(function() {
    affix('#cal');
    settings = { };
  });

  afterEach(function() {
    moment.lang('en'); // reset moment's global language
  });

  testableClasses.forEach(function(viewClass, index, viewClasses) {
    describe('when view is ' + viewClass, function() {
      beforeEach(function() {
        settings.defaultView = viewClass;
      });

      describe('when lang is default', function() {
        it('should be in English', function() {
          moment.lang('en');
          $('#cal').fullCalendar(settings);
          var weekdays = moment.weekdaysShort();

          dayClasses.forEach(function(cls, index, classes) {
            expect($('.fc-view thead ' + cls)[0]).toContainText(weekdays[index]);
          });
        });
      });

      describe('when lang is not default', function() {
        languages.forEach(function(language, index, languages) {
          it('should be in the selected language', function() {
            settings.lang = language;
            $('#cal').fullCalendar(settings);

            moment.lang(language);
            var dow = moment.langData(language)._week.dow;
            var weekdays = moment.weekdaysShort();

            dayClasses.forEach(function(cls, index, classes) {
              expect($('.fc-view thead ' + cls)[0]).toContainText(weekdays[index]);
            });
          });
        });
      });

      describe('when specified', function() {
        it('should contain the specified names in the given order', function() {
          var days = [
            'Hov.', 'maS.', 'veS.', 'mech.', 'parmaq.', 'HoS.'
          ];
          settings.dayNamesShort = days;
          $('#cal').fullCalendar(settings);

          dayClasses.forEach(function(cls, index, classes) {
            expect($('.fc-view thead ' + cls)[0]).toContainText(days[index]);
          });
        });
      });
    });
  });
});
