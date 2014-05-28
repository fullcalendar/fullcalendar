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
        it('should be ' + months[index], function() {
          settings.now = moment(referenceDate).add('months', index);
          $('#cal').fullCalendar(settings);
          if(index == 0) console.log(moment.months());
          
          // FIX: Selector often appears to point to a undefined object, wait for a callback to ensure all items are available in the DOM
          expect($('.fc-header-title')[0]).toContainText(moment.months[index]);
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
          it('should be the translated name for ' + months[index], function() {
            settings.now = moment(referenceDate).add('months', index);
            $('#cal').fullCalendar(settings);
            if(index == 0) console.log(moment.months());
            if(index == 0) console.log(settings.now.toISOString());
            if(index == 0) console.log($('.fc-header-title')[0].innerHTML);
            
            //expect($('.fc-header-title')[0]).toContainText(moment.months[index]);
          });
        });
      });
    });

    describe('when names are specified', function() {});

  });
});
