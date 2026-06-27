import frLocale from 'fullcalendar/locales/fr'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('button text', () => {
  pushOptions({
    headerToolbar: {
      left: 'prevYear,prev,today,next,nextYear',
      center: '',
      right: 'dayGridMonth,dayGridWeek,dayGridDay,timeGridWeek,timeGridDay',
    },
  })

  describe('with default locale', () => {
    describe('with default buttonIcons', () => {
      it('should contain default text values', () => {
        let calendar = initCalendar()
        let toolbarWrapper = new CalendarWrapper(calendar).toolbar

        // will have button icons, to text will be empty
        expect(toolbarWrapper.getButtonInfo('next').text).toBe('')
        expect(toolbarWrapper.getButtonInfo('nextYear').text).toBe('')
        expect(toolbarWrapper.getButtonInfo('prev').text).toBe('')
        expect(toolbarWrapper.getButtonInfo('prevYear').text).toBe('')

        expect(toolbarWrapper.getButtonInfo('today').text).toBe('Today')
        expect(toolbarWrapper.getButtonInfo('dayGridMonth').text).toBe('Month')
        expect(toolbarWrapper.getButtonInfo('dayGridWeek').text).toBe('Week')
        expect(toolbarWrapper.getButtonInfo('timeGridWeek').text).toBe('Week')
        expect(toolbarWrapper.getButtonInfo('dayGridDay').text).toBe('Day')
      })

      it('should contain specified text values', () => {
        let calendar = initCalendar({
          buttonDisplay: 'text', // needed!
          buttons: {
            prev: { text: '<-' },
            next: { text: '->' },
            prevYear: { text: '<--' },
            nextYear: { text: '-->' },
            today: { text: 'tidei' },
          },
          // text for view-intervals must go here
          // unfortunately this muddles the meaning of the test
          monthText: 'mun',
          weekTextLong: 'wiki',
          dayText: 'dei',
        })
        let toolbarWrapper = new CalendarWrapper(calendar).toolbar

        expect(toolbarWrapper.getButtonInfo('next').text).toBe('->')
        expect(toolbarWrapper.getButtonInfo('nextYear').text).toBe('-->')
        expect(toolbarWrapper.getButtonInfo('prev').text).toBe('<-')
        expect(toolbarWrapper.getButtonInfo('prevYear').text).toBe('<--')

        expect(toolbarWrapper.getButtonInfo('today').text).toBe('tidei')
        expect(toolbarWrapper.getButtonInfo('dayGridMonth').text).toBe('mun')
        expect(toolbarWrapper.getButtonInfo('dayGridWeek').text).toBe('wiki')
        expect(toolbarWrapper.getButtonInfo('dayGridDay').text).toBe('dei')
        expect(toolbarWrapper.getButtonInfo('timeGridWeek').text).toBe('wiki')
      })
    })

    describe('with buttonIcons turned off', () => {
      pushOptions({
        buttonDisplay: 'text',
      })

      it('should contain default text values', () => {
        let calendar = initCalendar()
        let toolbarWrapper = new CalendarWrapper(calendar).toolbar

        // will have actual text now
        expect(toolbarWrapper.getButtonInfo('next').text).toBe('Next')
        expect(toolbarWrapper.getButtonInfo('nextYear').text).toBe('Next year')
        expect(toolbarWrapper.getButtonInfo('prev').text).toBe('Prev')
        expect(toolbarWrapper.getButtonInfo('prevYear').text).toBe('Prev year')

        expect(toolbarWrapper.getButtonInfo('today').text).toBe('Today')
        expect(toolbarWrapper.getButtonInfo('dayGridMonth').text).toBe('Month')
        expect(toolbarWrapper.getButtonInfo('dayGridWeek').text).toBe('Week')
        expect(toolbarWrapper.getButtonInfo('dayGridDay').text).toBe('Day')
        expect(toolbarWrapper.getButtonInfo('timeGridWeek').text).toBe('Week')
      })

      it('should contain specified text values', () => {
        let calendar = initCalendar({
          buttonDisplay: 'text', // needed!
          buttons: {
            prev: { text: '<-' },
            next: { text: '->' },
            prevYear: { text: '<--' },
            nextYear: { text: '-->' },
            today: { text: 'tidei' },
          },
          // text for view-intervals must go here
          // unfortunately this muddles the meaning of the test
          monthText: 'mun',
          weekTextLong: 'wiki',
          dayText: 'dei',
        })
        let toolbarWrapper = new CalendarWrapper(calendar).toolbar

        expect(toolbarWrapper.getButtonInfo('next').text).toBe('->')
        expect(toolbarWrapper.getButtonInfo('nextYear').text).toBe('-->')
        expect(toolbarWrapper.getButtonInfo('prev').text).toBe('<-')
        expect(toolbarWrapper.getButtonInfo('prevYear').text).toBe('<--')

        expect(toolbarWrapper.getButtonInfo('today').text).toBe('tidei')
        expect(toolbarWrapper.getButtonInfo('dayGridMonth').text).toBe('mun')
        expect(toolbarWrapper.getButtonInfo('dayGridWeek').text).toBe('wiki')
        expect(toolbarWrapper.getButtonInfo('dayGridDay').text).toBe('dei')
        expect(toolbarWrapper.getButtonInfo('timeGridWeek').text).toBe('wiki')
      })
    })
  })

  describe('when locale is not default', () => {
    pushOptions({
      locale: frLocale,
    })

    describe('with default buttonIcons', () => {
      it('should contain default text values', () => {
        let calendar = initCalendar()
        let toolbarWrapper = new CalendarWrapper(calendar).toolbar

        // will contain icons, so will contain no text
        expect(toolbarWrapper.getButtonInfo('next').text).toBe('')
        expect(toolbarWrapper.getButtonInfo('nextYear').text).toBe('')
        expect(toolbarWrapper.getButtonInfo('prev').text).toBe('')
        expect(toolbarWrapper.getButtonInfo('prevYear').text).toBe('')

        expect(toolbarWrapper.getButtonInfo('today').text).toBe('Aujourd\'hui')
        expect(toolbarWrapper.getButtonInfo('dayGridMonth').text).toBe('Mois')
        expect(toolbarWrapper.getButtonInfo('dayGridWeek').text).toBe('Semaine')
        expect(toolbarWrapper.getButtonInfo('dayGridDay').text).toBe('Jour')
        expect(toolbarWrapper.getButtonInfo('timeGridWeek').text).toBe('Semaine')
      })

      it('should contain specified text values', () => {
        let calendar = initCalendar({
          buttonDisplay: 'text', // needed!
          buttons: {
            prev: { text: '<-' },
            next: { text: '->' },
            prevYear: { text: '<--' },
            nextYear: { text: '-->' },
            today: { text: 'tidei' },
          },
          // text for view-intervals must go here
          // unfortunately this muddles the meaning of the test
          monthText: 'mun',
          weekTextLong: 'wiki',
          dayText: 'dei',
        })
        let toolbarWrapper = new CalendarWrapper(calendar).toolbar

        expect(toolbarWrapper.getButtonInfo('next').text).toBe('->')
        expect(toolbarWrapper.getButtonInfo('nextYear').text).toBe('-->')
        expect(toolbarWrapper.getButtonInfo('prev').text).toBe('<-')
        expect(toolbarWrapper.getButtonInfo('prevYear').text).toBe('<--')

        expect(toolbarWrapper.getButtonInfo('today').text).toBe('tidei')
        expect(toolbarWrapper.getButtonInfo('dayGridMonth').text).toBe('mun')
        expect(toolbarWrapper.getButtonInfo('dayGridWeek').text).toBe('wiki')
        expect(toolbarWrapper.getButtonInfo('dayGridDay').text).toBe('dei')
        expect(toolbarWrapper.getButtonInfo('timeGridWeek').text).toBe('wiki')
      })
    })

    describe('with buttonIcons turned off', () => {
      pushOptions({
        buttonDisplay: 'text',
      })

      it('should contain default text values', () => {
        let calendar = initCalendar()
        let toolbarWrapper = new CalendarWrapper(calendar).toolbar

        // will have the locale's actual text now
        expect(toolbarWrapper.getButtonInfo('next').text).toBe('Suivant')
        expect(toolbarWrapper.getButtonInfo('prev').text).toBe('Précédent')
        /// / locales files don't have data for prev/next *year*
        // expect(toolbarWrapper.getButtonInfo('nextYear').text).toBe('Suivant');
        // expect(toolbarWrapper.getButtonInfo('prevYear').text).toBe('Précédent');

        expect(toolbarWrapper.getButtonInfo('today').text).toBe('Aujourd\'hui')
        expect(toolbarWrapper.getButtonInfo('dayGridMonth').text).toBe('Mois')
        expect(toolbarWrapper.getButtonInfo('dayGridWeek').text).toBe('Semaine')
        expect(toolbarWrapper.getButtonInfo('timeGridWeek').text).toBe('Semaine')
        expect(toolbarWrapper.getButtonInfo('dayGridDay').text).toBe('Jour')
        expect(toolbarWrapper.getButtonInfo('dayGridDay').text).toBe('Jour')
      })

      it('should contain specified text values', () => {
        let calendar = initCalendar({
          buttonDisplay: 'text',
          buttons: {
            prev: { text: '<-' },
            next: { text: '->' },
            prevYear: { text: '<--' },
            nextYear: { text: '-->' },
            today: { text: 'tidei' },
          },
          // text for view-intervals must go here
          // unfortunately this muddles the meaning of the test
          monthText: 'mun',
          weekTextLong: 'wiki',
          dayText: 'dei',
        })
        let toolbarWrapper = new CalendarWrapper(calendar).toolbar

        expect(toolbarWrapper.getButtonInfo('next').text).toBe('->')
        expect(toolbarWrapper.getButtonInfo('nextYear').text).toBe('-->')
        expect(toolbarWrapper.getButtonInfo('prev').text).toBe('<-')
        expect(toolbarWrapper.getButtonInfo('prevYear').text).toBe('<--')

        expect(toolbarWrapper.getButtonInfo('today').text).toBe('tidei')
        expect(toolbarWrapper.getButtonInfo('dayGridMonth').text).toBe('mun')
        expect(toolbarWrapper.getButtonInfo('dayGridWeek').text).toBe('wiki')
        expect(toolbarWrapper.getButtonInfo('dayGridDay').text).toBe('dei')
        expect(toolbarWrapper.getButtonInfo('timeGridWeek').text).toBe('wiki')
      })
    })
  })
})
