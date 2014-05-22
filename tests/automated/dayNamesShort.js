describe('day names', function() {
  var settings = {};

  beforeEach(function() {
    affix('#cal');
    settings = {
    }
  });

  //describe('when view is basic');
  //describe('when view is agenda');
  describe('when view is month', function() {
    describe('when lang is default', function() {
      beforeEach(function() {
        moment.lang();
      });

      it('should be in the default language and order', function() {
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
