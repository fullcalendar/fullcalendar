describe('button text', function() {

  var settings;

  beforeEach(function() {
    affix('#cal');
    settings = {
      header: {
        left: 'prevYear,prev,today,next,nextYear',
        center: '',
        right: 'month,basicWeek,basicDay,agendaWeek,agendaDay'
      }
    };
  });

  describe('with default language', function() {

    describe('with default buttonIcons', function() {

      it('should contain default text values', function() {
        $('#cal').fullCalendar(settings);

        // will have button icons, to text will be empty
        expect($('.fc-next-button')).toHaveText('');
        expect($('.fc-nextYear-button')).toHaveText('');
        expect($('.fc-prev-button')).toHaveText('');
        expect($('.fc-prevYear-button')).toHaveText('');

        expect($('.fc-today-button')).toHaveText('today');
        expect($('.fc-month-button')).toHaveText('month');
        expect($('.fc-basicWeek-button')).toHaveText('week');
        expect($('.fc-agendaWeek-button')).toHaveText('week');
        expect($('.fc-basicDay-button')).toHaveText('day');
        expect($('.fc-agendaDay-button')).toHaveText('day');
      });

      it('should contain specified text values', function() {
        settings.buttonText = {
          prev: '<-',
          next: '->',
          prevYear: '<--',
          nextYear: '-->',
          today: 'tidei',
          month: 'mun',
          week: 'wiki',
          day: 'dei'
        };
        $('#cal').fullCalendar(settings);

        expect($('.fc-next-button')).toHaveText('->');
        expect($('.fc-nextYear-button')).toHaveText('-->');
        expect($('.fc-prev-button')).toHaveText('<-');
        expect($('.fc-prevYear-button')).toHaveText('<--');

        expect($('.fc-today-button')).toHaveText('tidei');
        expect($('.fc-month-button')).toHaveText('mun');
        expect($('.fc-agendaDay-button')).toHaveText('dei');
        expect($('.fc-agendaWeek-button')).toHaveText('wiki');
        expect($('.fc-basicDay-button')).toHaveText('dei');
        expect($('.fc-basicWeek-button')).toHaveText('wiki');
      });

    });

    describe('with buttonIcons turned off', function() {

      beforeEach(function() {
        settings.buttonIcons = false;
      });

      it('should contain default text values', function() {
        $('#cal').fullCalendar(settings);

        // will have actual text now
        expect($('.fc-next-button')).toHaveText('next');
        expect($('.fc-nextYear-button')).toHaveText('next year');
        expect($('.fc-prev-button')).toHaveText('prev');
        expect($('.fc-prevYear-button')).toHaveText('prev year');

        expect($('.fc-today-button')).toHaveText('today');
        expect($('.fc-month-button')).toHaveText('month');
        expect($('.fc-basicWeek-button')).toHaveText('week');
        expect($('.fc-agendaWeek-button')).toHaveText('week');
        expect($('.fc-basicDay-button')).toHaveText('day');
        expect($('.fc-agendaDay-button')).toHaveText('day');
      });

      it('should contain specified text values', function() {
        settings.buttonText = {
          prev: '<-',
          next: '->',
          prevYear: '<--',
          nextYear: '-->',
          today: 'tidei',
          month: 'mun',
          week: 'wiki',
          day: 'dei'
        };
        $('#cal').fullCalendar(settings);

        expect($('.fc-next-button')).toHaveText('->');
        expect($('.fc-nextYear-button')).toHaveText('-->');
        expect($('.fc-prev-button')).toHaveText('<-');
        expect($('.fc-prevYear-button')).toHaveText('<--');

        expect($('.fc-today-button')).toHaveText('tidei');
        expect($('.fc-month-button')).toHaveText('mun');
        expect($('.fc-agendaDay-button')).toHaveText('dei');
        expect($('.fc-agendaWeek-button')).toHaveText('wiki');
        expect($('.fc-basicDay-button')).toHaveText('dei');
        expect($('.fc-basicWeek-button')).toHaveText('wiki');
      });

    });

  });

  describe('when lang is not default', function() {

    beforeEach(function() {
      settings.lang = 'fr';
    });

    describe('with default buttonIcons', function() {

      it('should contain default text values', function() {
        $('#cal').fullCalendar(settings);

        // will contain icons, so will contain no text
        expect($('.fc-next-button')).toHaveText('');
        expect($('.fc-nextYear-button')).toHaveText('');
        expect($('.fc-prev-button')).toHaveText('');
        expect($('.fc-prevYear-button')).toHaveText('');

        expect($('.fc-today-button')).toHaveText('Aujourd\'hui');
        expect($('.fc-month-button')).toHaveText('Mois');
        expect($('.fc-basicWeek-button')).toHaveText('Semaine');
        expect($('.fc-agendaWeek-button')).toHaveText('Semaine');
        expect($('.fc-basicDay-button')).toHaveText('Jour');
        expect($('.fc-agendaDay-button')).toHaveText('Jour');
      });

      it('should contain specified text values', function() {
        settings.buttonText = {
          prev: '<-',
          next: '->',
          prevYear: '<--',
          nextYear: '-->',
          today: 'tidei',
          month: 'mun',
          week: 'wiki',
          day: 'dei'
        };
        $('#cal').fullCalendar(settings);

        expect($('.fc-next-button')).toHaveText('->');
        expect($('.fc-nextYear-button')).toHaveText('-->');
        expect($('.fc-prev-button')).toHaveText('<-');
        expect($('.fc-prevYear-button')).toHaveText('<--');

        expect($('.fc-today-button')).toHaveText('tidei');
        expect($('.fc-month-button')).toHaveText('mun');
        expect($('.fc-agendaDay-button')).toHaveText('dei');
        expect($('.fc-agendaWeek-button')).toHaveText('wiki');
        expect($('.fc-basicDay-button')).toHaveText('dei');
        expect($('.fc-basicWeek-button')).toHaveText('wiki');
      });

    });

    describe('with buttonIcons turned off', function() {

      beforeEach(function() {
        settings.buttonIcons = false;
      });

      it('should contain default text values', function() {
        $('#cal').fullCalendar(settings);

        // will have the language's actual text now
        expect($('.fc-next-button')).toHaveText('Suivant');
        expect($('.fc-prev-button')).toHaveText('Précédent');
        //// languages files don't have data for prev/next *year*
        //expect($('.fc-nextYear-button')).toHaveText('Suivant');
        //expect($('.fc-prevYear-button')).toHaveText('Précédent');

        expect($('.fc-today-button')).toHaveText('Aujourd\'hui');
        expect($('.fc-month-button')).toHaveText('Mois');
        expect($('.fc-basicWeek-button')).toHaveText('Semaine');
        expect($('.fc-agendaWeek-button')).toHaveText('Semaine');
        expect($('.fc-basicDay-button')).toHaveText('Jour');
        expect($('.fc-agendaDay-button')).toHaveText('Jour');
      });

      it('should contain specified text values', function() {
        settings.buttonText = {
          prev: '<-',
          next: '->',
          prevYear: '<--',
          nextYear: '-->',
          today: 'tidei',
          month: 'mun',
          week: 'wiki',
          day: 'dei'
        };
        $('#cal').fullCalendar(settings);

        expect($('.fc-next-button')).toHaveText('->');
        expect($('.fc-nextYear-button')).toHaveText('-->');
        expect($('.fc-prev-button')).toHaveText('<-');
        expect($('.fc-prevYear-button')).toHaveText('<--');

        expect($('.fc-today-button')).toHaveText('tidei');
        expect($('.fc-month-button')).toHaveText('mun');
        expect($('.fc-agendaDay-button')).toHaveText('dei');
        expect($('.fc-agendaWeek-button')).toHaveText('wiki');
        expect($('.fc-basicDay-button')).toHaveText('dei');
        expect($('.fc-basicWeek-button')).toHaveText('wiki');
      });

    });

  });

});
