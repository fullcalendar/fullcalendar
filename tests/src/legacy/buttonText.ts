import frLocale from '@fullcalendar/core/locales/fr'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

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

        expect(toolbarWrapper.getButtonInfo('today').text).toBe('today')
        expect(toolbarWrapper.getButtonInfo('dayGridMonth').text).toBe('month')
        expect(toolbarWrapper.getButtonInfo('dayGridWeek').text).toBe('week')
        expect(toolbarWrapper.getButtonInfo('timeGridWeek').text).toBe('week')
        expect(toolbarWrapper.getButtonInfo('dayGridDay').text).toBe('day')
      })

      it('should contain specified text values', () => {
        let calendar = initCalendar({
          buttonText: {
            prev: '<-',
            next: '->',
            prevYear: '<--',
            nextYear: '-->',
            today: 'tidei',
            month: 'mun',
            week: 'wiki',
            day: 'dei',
          },
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
        buttonIcons: false,
      })

      it('should contain default text values', () => {
        let calendar = initCalendar()
        let toolbarWrapper = new CalendarWrapper(calendar).toolbar

        // will have actual text now
        expect(toolbarWrapper.getButtonInfo('next').text).toBe('next')
        expect(toolbarWrapper.getButtonInfo('nextYear').text).toBe('next year')
        expect(toolbarWrapper.getButtonInfo('prev').text).toBe('prev')
        expect(toolbarWrapper.getButtonInfo('prevYear').text).toBe('prev year')

        expect(toolbarWrapper.getButtonInfo('today').text).toBe('today')
        expect(toolbarWrapper.getButtonInfo('dayGridMonth').text).toBe('month')
        expect(toolbarWrapper.getButtonInfo('dayGridWeek').text).toBe('week')
        expect(toolbarWrapper.getButtonInfo('dayGridDay').text).toBe('day')
        expect(toolbarWrapper.getButtonInfo('timeGridWeek').text).toBe('week')
      })

      it('should contain specified text values', () => {
        let calendar = initCalendar({
          buttonText: {
            prev: '<-',
            next: '->',
            prevYear: '<--',
            nextYear: '-->',
            today: 'tidei',
            month: 'mun',
            week: 'wiki',
            day: 'dei',
          },
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
          buttonText: {
            prev: '<-',
            next: '->',
            prevYear: '<--',
            nextYear: '-->',
            today: 'tidei',
            month: 'mun',
            week: 'wiki',
            day: 'dei',
          },
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
        buttonIcons: false,
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
          buttonText: {
            prev: '<-',
            next: '->',
            prevYear: '<--',
            nextYear: '-->',
            today: 'tidei',
            month: 'mun',
            week: 'wiki',
            day: 'dei',
          },
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
