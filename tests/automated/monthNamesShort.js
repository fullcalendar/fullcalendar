describe('short month name', function() {
  var settings = {};
  var referenceDate = '2014-01-01'; // The day the world is hung-over
  var languages = [ 'es', 'fr', 'de', 'zh-cn', 'nl' ];

  beforeEach(function() {
    affix('#cal');
    settings = {
      defaultDate: referenceDate
    };
  });

  afterEach(function() {
    moment.lang('en'); // reset moment's global language
  });

  [ 'agendaWeek', 'basicWeek' ].forEach(function(viewClass, index, viewClasses) {
    describe('when view is ' + viewClass, function() {
      beforeEach(function() {
        settings.defaultView = viewClass;
      });

      describe('when lang is default', function() {
        beforeEach(function() {
          settings.lang = 'en';
          moment.lang('en');
        });

        moment.monthsShort().forEach(function(monthShort, index) {
          it('should be ' + monthShort, function(done) {
            settings.defaultDate = $.fullCalendar.moment(referenceDate).add(index, 'months');
            settings.eventAfterAllRender = function() {
              expect($('.fc-toolbar h2')).toContainText(monthShort);
              done();
            };

            $('#cal').fullCalendar(settings);
          });
        });
      });

      languages.forEach(function(language, index, languages) {
        describe('when lang is ' + language, function() {
          beforeEach(function() {
            settings.lang = language;
            moment.lang(language);
          });

          moment.monthsShort().forEach(function(monthShort, index) { // `monthShort` will always be English
            it('should be the translated name for ' + monthShort, function(done) {
              var langMonthsShort = moment.monthsShort();
              var langMonthShort = langMonthsShort[index];

              settings.defaultDate = $.fullCalendar.moment(referenceDate).add(index, 'months');
              settings.eventAfterAllRender = function() {
                expect($('.fc-toolbar h2')).toContainText(langMonthShort);
                done();
              };

              $('#cal').fullCalendar(settings);
            });
          });
        });
      });

      describe('when names are specified', function() {
        var monthsShort = [
          'I',
          'II',
          'III',
          'IV',
          'V',
          'VI',
          'VII',
          'IIX',
          'IX',
          'X',
          'XI',
          'XII'
        ];

        monthsShort.forEach(function(monthShort, index) { // `monthShort` will be our custom month name
          it('should be the translated name for ' + monthShort, function(done) {
            settings.defaultDate = $.fullCalendar.moment(referenceDate).add(index, 'months');
            settings.monthNamesShort = monthsShort;
            settings.eventAfterAllRender = function() {
              expect($('.fc-toolbar h2')).toContainText(monthShort);
              done();
            };

            $('#cal').fullCalendar(settings);
          });
        });
      });
    });
  });

});
