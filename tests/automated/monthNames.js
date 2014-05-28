// FIX: some tests are skipped from time to time, as if this file isn't even loaded by the test runner
describe('month name', function() {
  var settings = {};
  var referenceDate = '2014-01-01 06:00'; // The day the world is hung-over
  var languages = [ 'es', 'fr', 'de', 'zh-cn', 'nl' ];

  beforeEach(function() {
    affix('#cal');
    settings = {
      now: moment(referenceDate).toISOString()
    };
  });

  afterEach(function() {
    moment.lang('en'); // reset moment's global language
  });

  describe('when view is month', function() {
    beforeEach(function() {
      settings.defaultView = 'month';
    });

    describe('when lang is default', function() {
      beforeEach(function() {
        settings.lang = 'en';
        moment.lang('en')
      });

      moment.months().forEach(function(month, index, months) {
        it('should be ' + months[index], function(done) {
          settings.now = moment(referenceDate).add('months', index);
          settings.eventAfterAllRender = function() {
            expect($('.fc-header-title')[0]).toContainText(moment.months()[index]);
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
          moment.lang(language)
        });

        moment.months().forEach(function(month, index, months) {
          it('should be the translated name for ' + months[index], function(done) {
            settings.now = moment(referenceDate).add('months', index);
            settings.eventAfterAllRender = function() {
              expect($('.fc-header-title')[0]).toContainText(moment.months()[index]);
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

      months.forEach(function(month, index, months) {
        it('should be the translated name for ' + months[index], function(done) {
          settings.now = moment(referenceDate).add('months', index);
          settings.monthNames = months;
          settings.eventAfterAllRender = function() {
            expect($('.fc-header-title')[0]).toContainText(month);
            done();
          };
          
          $('#cal').fullCalendar(settings);
        });
      });
    });
  });
});
