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
  var referenceDate = '2014-05-25 06:00'; // A sunday

  beforeEach(function() {
    affix('#cal');
    settings = { }
    settings.now = moment(referenceDate).toISOString();
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

      $.each(moment.weekdays(), function(index, weekday) {
        it('should be ' + weekday, function() {
          settings.now = moment(referenceDate).add('days', index);
          $('#cal').fullCalendar(settings);

          var weekdays = moment.weekdays();
  
          expect($('.fc-day-header')[0]).toHaveText(weekday);
        });
      });
    });
  
    var languages = [ 'es', 'fr', 'de', 'zh-cn', 'nl' ];
    $.each(languages, function(index, language) {
      describe('when lang is ' + language, function() {
        beforeEach(function() {
          moment.lang(language);
        });

        $.each(moment.weekdays(), function(index, weekday) {
          it('should be the translation for ' + weekday, function() {
            var weekdays = moment.weekdays();
            var dow = moment.langData(language)._week.dow
  
            settings.lang = language;
            settings.now = moment(referenceDate).add('days', index);
            $('#cal').fullCalendar(settings);
    
            expect($('.fc-day-header')[0]).toHaveText(weekdays[index])
          });
        });
      });
    });

    describe('when daynames are specified', function() {
      var weekdays = [
        'Hovjaj',
        'maSjaj',
        'veSjaj',
        'mechjaj',
        'jevjaj',
        'parmaqjaj',
        'HoSjaj'
      ];

      $.each(weekdays, function(index, weekday) {
        it('should be ' + weekday, function() {
          settings.dayNames = weekdays;
          settings.now = moment(referenceDate).add('days', index);

          $('#cal').fullCalendar(settings);
  
          expect($('.fc-day-header')[0]).toHaveText(weekday)
        });
      });
    });
  });

  // TODO: iterate over a entire week instead of just checking today
  /*describe('when view is agendaDay', function() {
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
  });*/
});
