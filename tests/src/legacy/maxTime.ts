import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('slotMaxTime', () => { // TODO: rename file
  describe('when using the default settings', () => {
    describeOptions('initialView', {
      'in week': 'timeGridWeek',
      'in day': 'timeGridDay',
    }, () => {
      it('should start at 12am', () => {
        let calendar = initCalendar({
          initialView: 'timeGridWeek',
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let lastMajor = timeGridWrapper.getLastMajorAxisInfo()
        expect(lastMajor.text).toEqual('11pm')
      })
    })
  })

  describe('when using a whole number', () => {
    let hourNumbers = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]

    describe('in week', () => {
      hourNumbers.forEach((hourNumber) => {
        it('should end at ' + hourNumber, () => {
          let calendar = initCalendar({
            initialView: 'timeGridWeek',
            slotMaxTime: { hours: hourNumber },
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
          let lastMajor = timeGridWrapper.getLastMajorAxisInfo()
          let expected = numToStringConverter(hourNumber - 1)
          expect(lastMajor.text).toEqual(expected)
        })
      })
    })

    describe('in day', () => {
      hourNumbers.forEach((hourNumber) => {
        it('should end at ' + hourNumber, () => {
          let calendar = initCalendar({
            initialView: 'timeGridDay',
            slotMaxTime: hourNumber + ':00', // in addition, test string duration input
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
          let lastMajor = timeGridWrapper.getLastMajorAxisInfo()
          let expected = numToStringConverter(hourNumber - 1)
          expect(lastMajor.text).toEqual(expected)
        })
      })
    })
  })

  describe('when using default slotInterval and \'uneven\' slotMaxTime', () => {
    let hourNumbers = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]

    describe('in week', () => {
      hourNumbers.forEach((hourNumber) => {
        it('should end at ' + hourNumber + ':20', () => {
          let calendar = initCalendar({
            initialView: 'timeGridWeek',
            slotMaxTime: { hours: hourNumber, minutes: 20 },
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
          let lastMajor = timeGridWrapper.getLastMajorAxisInfo()
          // since exclusive end is :20, last slot will be on the current hour's 00:00
          let expected = numToStringConverter(hourNumber)
          expect(lastMajor.text).toEqual(expected)
        })
      })
    })

    describe('in day', () => {
      hourNumbers.forEach((hourNumber) => {
        it('should end at ' + hourNumber + ':20', () => {
          let calendar = initCalendar({
            initialView: 'timeGridDay',
            slotMaxTime: { hours: hourNumber, minutes: 20 },
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
          let lastMajor = timeGridWrapper.getLastMajorAxisInfo()
          // since exclusive end is :20, last slot will be on the current hour's 00:00
          let expected = numToStringConverter(hourNumber)
          expect(lastMajor.text).toEqual(expected)
        })
      })
    })
  })

  function numToStringConverter(timeIn) {
    let time = (timeIn % 12) || 12
    let amPm = 'am'
    if ((timeIn % 24) > 11) {
      amPm = 'pm'
    }
    return time + amPm
  }
})
