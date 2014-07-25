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
        expect($('.fc-button-next')).toHaveText('');
        expect($('.fc-button-nextYear')).toHaveText('');
        expect($('.fc-button-prev')).toHaveText('');
        expect($('.fc-button-prevYear')).toHaveText('');

        expect($('.fc-button-today')).toHaveText('today');
        expect($('.fc-button-month')).toHaveText('month');
        expect($('.fc-button-basicWeek')).toHaveText('week');
        expect($('.fc-button-agendaWeek')).toHaveText('week');
        expect($('.fc-button-basicDay')).toHaveText('day');
        expect($('.fc-button-agendaDay')).toHaveText('day');
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

        expect($('.fc-button-next')).toHaveText('->');
        expect($('.fc-button-nextYear')).toHaveText('-->');
        expect($('.fc-button-prev')).toHaveText('<-');
        expect($('.fc-button-prevYear')).toHaveText('<--');

        expect($('.fc-button-today')).toHaveText('tidei');
        expect($('.fc-button-month')).toHaveText('mun');
        expect($('.fc-button-agendaDay')).toHaveText('dei');
        expect($('.fc-button-agendaWeek')).toHaveText('wiki');
        expect($('.fc-button-basicDay')).toHaveText('dei');
        expect($('.fc-button-basicWeek')).toHaveText('wiki');
      });

    });

    describe('with buttonIcons turned off', function() {

      beforeEach(function() {
        settings.buttonIcons = false;
      });

      it('should contain default text values', function() {
        $('#cal').fullCalendar(settings);

        // will have actual text now
        expect($('.fc-button-next')).toHaveText('next');
        expect($('.fc-button-nextYear')).toHaveText('next year');
        expect($('.fc-button-prev')).toHaveText('prev');
        expect($('.fc-button-prevYear')).toHaveText('prev year');

        expect($('.fc-button-today')).toHaveText('today');
        expect($('.fc-button-month')).toHaveText('month');
        expect($('.fc-button-basicWeek')).toHaveText('week');
        expect($('.fc-button-agendaWeek')).toHaveText('week');
        expect($('.fc-button-basicDay')).toHaveText('day');
        expect($('.fc-button-agendaDay')).toHaveText('day');
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

        expect($('.fc-button-next')).toHaveText('->');
        expect($('.fc-button-nextYear')).toHaveText('-->');
        expect($('.fc-button-prev')).toHaveText('<-');
        expect($('.fc-button-prevYear')).toHaveText('<--');

        expect($('.fc-button-today')).toHaveText('tidei');
        expect($('.fc-button-month')).toHaveText('mun');
        expect($('.fc-button-agendaDay')).toHaveText('dei');
        expect($('.fc-button-agendaWeek')).toHaveText('wiki');
        expect($('.fc-button-basicDay')).toHaveText('dei');
        expect($('.fc-button-basicWeek')).toHaveText('wiki');
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
        expect($('.fc-button-next')).toHaveText('');
        expect($('.fc-button-nextYear')).toHaveText('');
        expect($('.fc-button-prev')).toHaveText('');
        expect($('.fc-button-prevYear')).toHaveText('');

        expect($('.fc-button-today')).toHaveText('Aujourd\'hui');
        expect($('.fc-button-month')).toHaveText('Mois');
        expect($('.fc-button-basicWeek')).toHaveText('Semaine');
        expect($('.fc-button-agendaWeek')).toHaveText('Semaine');
        expect($('.fc-button-basicDay')).toHaveText('Jour');
        expect($('.fc-button-agendaDay')).toHaveText('Jour');
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

        expect($('.fc-button-next')).toHaveText('->');
        expect($('.fc-button-nextYear')).toHaveText('-->');
        expect($('.fc-button-prev')).toHaveText('<-');
        expect($('.fc-button-prevYear')).toHaveText('<--');

        expect($('.fc-button-today')).toHaveText('tidei');
        expect($('.fc-button-month')).toHaveText('mun');
        expect($('.fc-button-agendaDay')).toHaveText('dei');
        expect($('.fc-button-agendaWeek')).toHaveText('wiki');
        expect($('.fc-button-basicDay')).toHaveText('dei');
        expect($('.fc-button-basicWeek')).toHaveText('wiki');
      });

    });

    describe('with buttonIcons turned off', function() {

      beforeEach(function() {
        settings.buttonIcons = false;
      });

      it('should contain default text values', function() {
        $('#cal').fullCalendar(settings);

        // will have the language's actual text now
        expect($('.fc-button-next')).toHaveText('Suivant');
        expect($('.fc-button-prev')).toHaveText('Précédent');
        //// languages files don't have data for prev/next *year*
        //expect($('.fc-button-nextYear')).toHaveText('Suivant');
        //expect($('.fc-button-prevYear')).toHaveText('Précédent');

        expect($('.fc-button-today')).toHaveText('Aujourd\'hui');
        expect($('.fc-button-month')).toHaveText('Mois');
        expect($('.fc-button-basicWeek')).toHaveText('Semaine');
        expect($('.fc-button-agendaWeek')).toHaveText('Semaine');
        expect($('.fc-button-basicDay')).toHaveText('Jour');
        expect($('.fc-button-agendaDay')).toHaveText('Jour');
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

        expect($('.fc-button-next')).toHaveText('->');
        expect($('.fc-button-nextYear')).toHaveText('-->');
        expect($('.fc-button-prev')).toHaveText('<-');
        expect($('.fc-button-prevYear')).toHaveText('<--');

        expect($('.fc-button-today')).toHaveText('tidei');
        expect($('.fc-button-month')).toHaveText('mun');
        expect($('.fc-button-agendaDay')).toHaveText('dei');
        expect($('.fc-button-agendaWeek')).toHaveText('wiki');
        expect($('.fc-button-basicDay')).toHaveText('dei');
        expect($('.fc-button-basicWeek')).toHaveText('wiki');
      });

    });

  });

});
