
describe('button text', function() {

  var settings = {};

  beforeEach(function() {
    affix('#cal');
    settings = {
      header: {
        left: 'prevYear,prev,today,next,nextYear',
        center: '',
        right: 'month,basicWeek,basicDay,agendaWeek,agendaDay'
      },
      buttonIcons: {
        prev: null,
        next: null,
        prevYear: null,
        nextYear: null
      }
    };
  });

  describe('when lang is default', function() {
    beforeEach(function() {
      $('#cal').fullCalendar(settings);
    });

    it('should contain the default text values', function() {
      expect($('.fc-button-today')).toContainText('today');

      expect($('.fc-button-next')).toContainText('next');
      expect($('.fc-button-nextYear')).toContainText('next year');
      expect($('.fc-button-prev')).toContainText('prev');
      expect($('.fc-button-prevYear')).toContainText('prev year');

      expect($('.fc-button-month')).toContainText('month');

      expect($('.fc-button-basicWeek')).toContainText('week');
      expect($('.fc-button-agendaWeek')).toContainText('week');

      expect($('.fc-button-basicDay')).toContainText('day');
      expect($('.fc-button-agendaDay')).toContainText('day');
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
      }
      $('#cal').fullCalendar(settings);
    });
    
    it('should contain the specified text values', function() {
      expect($('.fc-button-today')).toContainText('tidei');

      expect($('.fc-button-next')).toContainText('->');
      expect($('.fc-button-nextYear')).toContainText('-->');
      expect($('.fc-button-prev')).toContainText('<-');
      expect($('.fc-button-prevYear')).toContainText('<--');

      expect($('.fc-button-month')).toContainText('mun');

      expect($('.fc-button-agendaDay')).toContainText('dei');
      expect($('.fc-button-agendaWeek')).toContainText('wiki');

      expect($('.fc-button-basicDay')).toContainText('dei');
      expect($('.fc-button-basicWeek')).toContainText('wiki');
    });
  });

  describe('when lang is not default', function() {

    beforeEach(function() {
      settings.lang = 'nl';
      $('#cal').fullCalendar(settings);
    });
 
    it('should contain the default text values', function() {
      expect($('.fc-button-today')).toContainText('Vandaag');

      expect($('.fc-button-month')).toContainText('Maand');

      expect($('.fc-button-basicWeek')).toContainText('Week');
      expect($('.fc-button-agendaWeek')).toContainText('Week');

      expect($('.fc-button-basicDay')).toContainText('Dag');
      expect($('.fc-button-agendaDay')).toContainText('Dag');
    });
  });

});
