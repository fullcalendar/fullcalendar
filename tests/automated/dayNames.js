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
  var languages = [ 'es', 'fr', 'de', 'zh-cn', 'nl' ];

  beforeEach(function() {
    affix('#cal');
    moment.lang();
    settings = {
      now: moment(referenceDate).toISOString()
    };
  });

  describe('when view is basicDay', function() {
    beforeEach(function() {
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

          expect($('.fc-day-header')[0]).toHaveText(weekday);
        });
      });
    });

    $.each(languages, function(index, language) {
      describe('when lang is ' + language, function() {
        beforeEach(function() {
          moment.lang(language);
        });

        $.each(moment.weekdays(), function(index, weekday) {
          it('should be the translation for ' + weekday, function() {
            var weekdays = moment.weekdays();

            settings.lang = language;
            settings.now = moment(referenceDate).add('days', index);
            $('#cal').fullCalendar(settings);

            expect($('.fc-day-header')[0]).toHaveText(weekdays[index]);
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

          expect($('.fc-day-header')[0]).toHaveText(weekday);
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

      $.each(moment.weekdays(), function(index, weekday) {
        it('should be ' + weekday, function() {
          settings.lang = 'en';
          settings.now = moment(referenceDate).add('days', index);
          $('#cal').fullCalendar(settings);

          var itemClasses = '.fc-col0.fc-widget-header';
          expect($(itemClasses)[0]).toContainText(weekday);
        });
      });
    });

    $.each(languages, function(index, language) {
      describe('when lang is ' + language, function() {
        beforeEach(function() {
          moment.lang(language);
        });

        $.each(moment.weekdays(), function(index, weekday) {
          it('should be the translation for ' + weekday, function() {
            var weekdays = moment.weekdays();

            settings.lang = language;
            settings.now = moment(referenceDate).add('days', index); // move to beforeEach
            $('#cal').fullCalendar(settings);

            var dayClasses = '.fc-col0.fc-widget-header';
            expect($(dayClasses)[0]).toContainText(weekdays[index]);
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

          var dayClasses = '.fc-col0.fc-widget-header';
          expect($(dayClasses)[0]).toContainText(weekday);
        });
      });
    });
  });
});
