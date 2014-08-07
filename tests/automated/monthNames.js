describe('month name', function() {
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

  [ 'month', 'agendaDay', 'basicDay' ].forEach(function(viewClass, index, viewClasses) {
    describe('when view is ' + viewClass, function() {
      beforeEach(function() {
        settings.defaultView = viewClass;
      });

      describe('when lang is default', function() {
        beforeEach(function() {
          settings.lang = 'en';
          moment.lang('en');
        });

        moment.months().forEach(function(month, index, months) {
          it('should be ' + month, function(done) {
            settings.defaultDate = $.fullCalendar.moment(referenceDate).add(index, 'months');
            settings.eventAfterAllRender = function() {
              expect($('.fc-toolbar h2')).toContainText(month);
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

          moment.months().forEach(function(month, index, months) { // `month` will always be English
            it('should be the translated name for ' + month, function(done) {
              var langMonths = moment.months();
              var langMonth = langMonths[index];

              settings.defaultDate = $.fullCalendar.moment(referenceDate).add(index, 'months');
              settings.eventAfterAllRender = function() {
                if (viewClass == 'month') { // with month view check for occurence of the monthname in the title
                  expect($('.fc-toolbar h2')).toContainText(langMonth);
                }
                else { // with day views ensure that title contains the properly formatted phrase
                  expect($('.fc-toolbar h2')).toHaveText(settings.defaultDate.format('LL'));
                }
                done();
              };

              $('#cal').fullCalendar(settings);
            });
          });
        });
      });

      describe('when names are specified', function() {
        var months = [
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

        months.forEach(function(month, index, months) { // `month` is our custom month name
          it('should be the translated name for ' + month, function(done) {
            settings.defaultDate = $.fullCalendar.moment(referenceDate).add(index, 'months');
            settings.monthNames = months;
            settings.eventAfterAllRender = function() {
              expect($('.fc-toolbar h2')).toContainText(month);
              done();
            };

            $('#cal').fullCalendar(settings);
          });
        });
      });
    });
  });

});
