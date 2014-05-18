
describe('button text', function() {

  var settings = {};

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

  describe('with buttonIcons', function() {
    describe('when lang is default', function() {
      it('should have no text', function() {
        expect($('.fc-button-next')).toHaveText('');
        expect($('.fc-button-nextYear')).toHaveText('');
        expect($('.fc-button-prev')).toHaveText('');
        expect($('.fc-button-prevYear')).toHaveText('');
      });
    });

    describe('when lang is not default', function() {
      it('should have no text', function() {
        settings.lang = 'nl';
        $('#cal').fullCalendar(settings);

        expect($('.fc-button-next')).toHaveText('');
        expect($('.fc-button-nextYear')).toHaveText('');
        expect($('.fc-button-prev')).toHaveText('');
        expect($('.fc-button-prevYear')).toHaveText('');
      });
    });

    describe('when buttonText is set to custom value', function() {
      it('should have no text', function() {
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

        expect($('.fc-button-next')).toHaveText('');
        expect($('.fc-button-nextYear')).toHaveText('');
        expect($('.fc-button-prev')).toHaveText('');
        expect($('.fc-button-prevYear')).toHaveText('');
      });
    });
  });
  describe('without buttonIcons', function() {
    beforeEach(function() {
      settings.buttonIcons = {
        prev: null,
        next: null,
        prevYear: null,
        nextYear: null
      };
    });

    describe('when lang is default', function() {
      beforeEach(function() {
        $('#cal').fullCalendar(settings);
      });

      it('should contain the default text values', function() {
        expect($('.fc-button-today')).toHaveText('today');

        expect($('.fc-button-next')).toHaveText('next');
        expect($('.fc-button-nextYear')).toHaveText('next year');
        expect($('.fc-button-prev')).toHaveText('prev');
        expect($('.fc-button-prevYear')).toHaveText('prev year');

        expect($('.fc-button-month')).toHaveText('month');

        expect($('.fc-button-basicWeek')).toHaveText('week');
        expect($('.fc-button-agendaWeek')).toHaveText('week');

        expect($('.fc-button-basicDay')).toHaveText('day');
        expect($('.fc-button-agendaDay')).toHaveText('day');
      });
    });

    describe('when buttonText is specified', function() {
      beforeEach(function() {
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
      });

      it('should contain the specified text values', function() {
        expect($('.fc-button-today')).toHaveText('tidei');

        expect($('.fc-button-next')).toHaveText('->');
        expect($('.fc-button-nextYear')).toHaveText('-->');
        expect($('.fc-button-prev')).toHaveText('<-');
        expect($('.fc-button-prevYear')).toHaveText('<--');

        expect($('.fc-button-month')).toHaveText('mun');

        expect($('.fc-button-agendaDay')).toHaveText('dei');
        expect($('.fc-button-agendaWeek')).toHaveText('wiki');

        expect($('.fc-button-basicDay')).toHaveText('dei');
        expect($('.fc-button-basicWeek')).toHaveText('wiki');
      });
    });

    describe('when lang is not default', function() {

      beforeEach(function() {
        settings.lang = 'nl';
        $('#cal').fullCalendar(settings);
      });

      it('should contain the default text values', function() {
        expect($('.fc-button-today')).toHaveText('Vandaag');

        expect($('.fc-button-month')).toHaveText('Maand');

        expect($('.fc-button-basicWeek')).toHaveText('Week');
        expect($('.fc-button-agendaWeek')).toHaveText('Week');

        expect($('.fc-button-basicDay')).toHaveText('Dag');
        expect($('.fc-button-agendaDay')).toHaveText('Dag');
      });
    });
  });
});
