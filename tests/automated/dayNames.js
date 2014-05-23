// TODO: fix dates in moment
describe('day names', function() {
  var settings = {};
  var dayClasses = [
    '.fc-sun',
    '.fc-mon',
    '.fc-tue',
    '.fc-wed',
    '.fc-thu',
    '.fc-fri',
    '.fc-sat',
  ];

  beforeEach(function() {
    affix('#cal');
    settings = { }
  });

  describe('when view is basicDay', function() {
    beforeEach(function() {
      moment.lang();
      settings.defaultView = 'basicDay';
    });

    describe('when lang is default', function() {
      beforeEach(function() {
        settings.lang = 'en';
      });

      it('should be in the default language and order', function() {
        $('#cal').fullCalendar(settings);
        var weekdays = moment.weekdays();

        $('.fc-day-header').each(function(index, item) {
          expect(item).toHaveText(weekdays[moment().weekday()]);
        });
      });
    });
  
    describe('when lang is not default', function() {

      var languages = [ 'es', 'fr', 'de', 'zh-cn', 'es' ];
  
      $.each(languages, function(index, language) {
        it('should be in the selected language and corresponding order', function() {
          settings.lang = language;
          $('#cal').fullCalendar(settings);
  
          moment.lang(language);
          var dow = moment.langData(language)._week.dow
          var weekdays = moment.weekdays();
  
          $('.fc-day-header').each(function(index, item) {
            expect(item).toContainText(weekdays[(moment().weekday() + dow) % 7]);
          });
        });
      });
    });

    describe('when daynames are specified', function() {
      it('should contain the specified names in the given order', function() {
        var days = [
          'Hovjaj', 'maSjaj', 'veSjaj', 'mechjaj', 'jevjaj', 'parmaqjaj', 'HoSjaj'
        ];

        moment.lang('en'); // TODO: figure out why 'en' is explicitely needed to get dow set
        settings.dayNames = days;

        $('#cal').fullCalendar(settings);

        $('.fc-day-header').each(function(index, item) {
          expect(item).toContainText(days[moment().weekday()]);
        });
      });
    });
  });

  describe('when view is agendaDay', function() {
    beforeEach(function() {
      settings.defaultView = 'agendaDay';
    });

    describe('when lang is default', function() {
      beforeEach(function() {
        moment.lang('en');
      });

      it('should contain the proper dayname', function() {
        $('#cal').fullCalendar(settings);

        var currentWeekday = moment.weekdays()[moment().weekday()];
        var itemClasses = '.fc-col0.fc-widget-header';
        expect($(itemClasses)[0]).toContainText(currentWeekday);
      });
    });

    describe('when lang is not default', function() {
      it('should contain the dayname in the selected lang', function() {
        var language = 'es';
        settings.lang = language;
        moment.lang(language);

        $('#cal').fullCalendar(settings);

        var dow = moment.langData(language)._week.dow
        console.log('dow is ' + dow);

        var currentWeekday = moment.weekdays()[(moment().weekday() + dow) % 7];
        var dayClasses = '.fc-col0.fc-widget-header';

        console.log('today is ' + currentWeekday + ' UI:' + $(dayClasses)[0].innerHTML);
        expect($(dayClasses)[0]).toContainText(currentWeekday);
      });
    });

    describe('when daynames are specified', function() {
      it('should contain the specified names in the given order', function() {
        
        var days = [
          'Hovjaj', 'maSjaj', 'veSjaj', 'mechjaj', 'jevjaj', 'parmaqjaj', 'HoSjaj'
        ];

        settings.dayNames = days;
        moment.lang('en'); // TODO: figure out how to reload moment.js defauls

        $('#cal').fullCalendar(settings);

        var currentWeekday = days[moment().weekday()];
        var dayClasses = '.fc-col0.fc-widget-header';
        expect($(dayClasses)[0]).toContainText(currentWeekday);
      });
    });
  });
});
