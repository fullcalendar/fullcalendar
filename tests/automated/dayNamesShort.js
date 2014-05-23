describe('short day names', function() {
  var settings = {};

  beforeEach(function() {
    affix('#cal');
    settings = {
    }
  });

  describe('when view is agendaWeek', function() {
    describe('when lang is default', function() {
      beforeEach(function() {
        moment.lang('en');
        settings.defaultView = 'agendaWeek';
      });

      it('should be in English, starting on Sunday', function() {
        $('#cal').fullCalendar(settings);
        var weekdays = moment.weekdaysShort();

        var dayClasses = [
          '.fc-sun',
          '.fc-mon',
          '.fc-tue',
          '.fc-wed',
          '.fc-thu',
          '.fc-fri',
          '.fc-sat'
        ];

        //expect($('.fc-agenda-days thead .fc-sun')[0]).toContainText(weekdays[0]);
        $.each(dayClasses, function(index, cls) {
          (function(){
            expect($('.fc-agenda-days thead ' + cls)[0]).toContainText(weekdays[index]);
          })();
          //console.log('dealing with ' + cls);
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
          var weekdays = moment.weekdaysShort();
  
          $('.fc-day-header').each(function(index, item) {
            expect(item).toContainText(weekdays[(index + dow) % 7]);
          });
        });
      });
    });
  
    describe('when specified', function() {
      it('should contain the specified names in the given order', function() {
        var days = [
          'Hovjaj', 'maSjaj', 'veSjaj', 'mechjaj', 'parmaqjaj', 'HoSjaj'
        ]
        settings.dayNamesShort = days;
        $('#cal').fullCalendar(settings);

        $('.fc-day-header').each(function(index, item) {
          expect(item).toContainText(days[index]);
        });
      });
    });
  });

  describe('when view is month', function() {
    describe('when lang is default', function() {
      beforeEach(function() {
        moment.lang('en');
      });

      it('should be in English, starting on Sunday', function() {
        $('#cal').fullCalendar(settings);
        var weekdays = moment.weekdaysShort();

        $('.fc-day-header').each(function(index, item) {
          expect(item).toHaveText(weekdays[index]);
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
          var weekdays = moment.weekdaysShort();
  
          $('.fc-day-header').each(function(index, item) {
            expect(item).toContainText(weekdays[(index + dow) % 7]);
          });
        });
      });
    });
  
    describe('when specified', function() {
      it('should contain the specified names in the given order', function() {
        var days = [
          'Hovjaj', 'maSjaj', 'veSjaj', 'mechjaj', 'parmaqjaj', 'HoSjaj'
        ]
        settings.dayNamesShort = days;
        $('#cal').fullCalendar(settings);

        $('.fc-day-header').each(function(index, item) {
          expect(item).toContainText(days[index]);
        });
      });
    });
  });
});
