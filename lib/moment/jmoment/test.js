
var chai = require('chai')
  , moment = require('./index')

chai.should()

moment.locale('en'
, { week:
    { dow: 6
    , doy: 12
    }
  , longDateFormat:
    { LT: 'h:mm A'
    , L: 'jYYYY/jMM/jDD'
    , LL: 'jD jMMMM jYYYY'
    , LLL: 'jD jMMMM jYYYY LT'
    , LLLL: 'dddd, jD jMMMM jYYYY LT'
    }
  }
)

describe('moment', function() {
  describe('#parse', function() {
    it('should parse gregorian dates', function() {
      var m = moment('1981/8/17 07:10:20', 'YYYY/M/D hh:mm:ss')
      m.format('YYYY-MM-DD hh:mm:ss').should.be.equal('1981-08-17 07:10:20')
      m.milliseconds().should.be.equal(0)
    })

    it('should parse correctly when input is only time', function() {
      var m = moment('07:10:20', 'hh:mm:ss')
      m.format('YYYY-MM-DD hh:mm:ss').should.be.equal('0000-01-01 07:10:20')
    })

    it('should parse when only Jalaali year is in the format', function() {
      var m = moment('08 1360 17', 'MM jYYYY DD')
      m.format('YYYY-MM-DD').should.be.equal('1981-08-17')
      m = moment('08 60 17', 'MM jYY DD')
      m.format('YYYY-MM-DD').should.be.equal('1981-08-17')
    })

    it('should parse when only Jalaali month is in the format', function() {
      var m = moment('1981 5 17', 'YYYY jM D')
      m.format('YYYY-MM-DD').should.be.equal('1981-07-17')
    })

    it('should parse when only Jalaali month string is in the format', function() {
      var m = moment('1981 Amo 17', 'YYYY jMMM D')
      m.format('YYYY-MM-DD').should.be.equal('1981-07-17')
      m = moment('1981 Amordaad 17', 'YYYY jMMMM D')
      m.format('YYYY-MM-DD').should.be.equal('1981-07-17')
    })

    it('should parse when only Jalaali date is in the format', function() {
      var m = moment('1981 26 8', 'YYYY jD M')
      m.format('YYYY-MM-DD').should.be.equal('1981-08-15')
    })

    it('should parse when Jalaali year and month are in the format', function() {
      var m = moment('17 1360 5', 'D jYYYY jM')
      m.format('YYYY-MM-DD').should.be.equal('1981-07-17')
      m = moment('1392 7', 'jYYYY jM')
      m.format('YYYY-MM-DD').should.be.equal('2013-09-23')
    })

    it('should parse when Jalaali year and date are in the format', function() {
      var m = moment('26 1360 8', 'jD jYYYY M')
      m.format('YYYY-MM-DD').should.be.equal('1981-08-15')
    })

    it('should parse when Jalaali month and date are in the format', function() {
      var m = moment('26 1981 5', 'jD YYYY jM')
      m.format('YYYY-MM-DD').should.be.equal('1981-08-17')
    })

    it('should parse when Jalaali year, month and date are in the format', function() {
      var m = moment('26 1360 5', 'jD jYYYY jM')
      m.format('YYYY-MM-DD').should.be.equal('1981-08-17')
    })

    it('should parse with complex format', function() {
      var m = moment('17 26 50 1981 50 8 12', 'D jD jYYYY YYYY M M jM')
      m.format('YYYY-MM-DD').should.be.equal('1981-08-17')
    })

    it('should parse format result', function() {
      var f = 'jYYYY/jM/jD hh:mm:ss.SSS a'
        , m = moment()
      moment(m.format(f), f).isSame(m).should.be.true
    })

    it('should be able to parse in utc', function() {
      var m = moment.utc('1360/5/26 07:10:20', 'jYYYY/jM/jD hh:mm:ss')
      m.format('YYYY-MM-DD hh:mm:ss Z').should.be.equal('1981-08-17 07:10:20 +00:00')
    })

    it('should parse with a format array', function() {
      var p1 = 'jYY jM jD'
        , p2 = 'jM jD jYY'
        , p3 = 'jD jYY jM'
        , m
      m = moment('60 11 12', ['D YY M', 'M D YY', 'YY M D'])
      m.format('YY-MM-DD').should.be.equal('60-11-12')
      m = moment('10 11 12', [p1, p2, p3])
      m.format('jYY-jMM-jDD').should.be.equal('10-11-12')
      m = moment('10 11 12', [p2, p3, p1])
      m.format('jYY-jMM-jDD').should.be.equal('12-10-11')
      m = moment('10 11 12', [p3, p1, p2])
      m.format('jYY-jMM-jDD').should.be.equal('11-12-10')
      m = moment('10 11 12', [p3, p2, p1])
      m.format('jYY-jMM-jDD').should.be.equal('11-12-10')
      m = moment('60-11-12', [p3, p2, p1])
      m.format('jYY-jMM-jDD').should.be.equal('60-11-12')
      m = moment('60 11 12', [p3, p2, p1])
      m.format('jYY-jMM-jDD').should.be.equal('60-11-12')
      m = moment('60 8 31', ['YY M D', 'jYY jM jD'])
      m.format('YY-MM-DD').should.be.equal('60-08-31')
      m = moment('60 8 31', ['jYY jM jD', 'YY M D'])
      m.format('YY-MM-DD').should.be.equal('60-08-31')
      m = moment('60 5 31', ['YY M D', 'jYY jM jD'])
      m.format('YY-MM-DD').should.be.equal('60-05-31')
      m = moment('60 5 31', ['jYY jM jD', 'YY M D'])
      m.format('jYY-jMM-jDD').should.be.equal('60-05-31')
    })
  })

  describe('#format', function() {
    it('should work normally when there is no Jalaali token', function() {
      var m = moment('1981-08-17 07:10:20')
      m.format('YYYY-MM-DD hh:mm:ss').should.be.equal('1981-08-17 07:10:20')
    })

    it('should format to Jalaali with Jalaali tokens', function() {
      var m = moment('1981-08-17 07:10:20')
      m.format('jYYYY-jMM-jDD hh:mm:ss').should.be.equal('1360-05-26 07:10:20')
    })

    it('should format with escaped and unescaped tokens', function() {
      var m = moment('1981-08-17')
      m.format('[My] birt\\h y[ea]r [is] jYYYY or YYYY').should.be.equal('My birth year is 1360 or 1981')
    })

    it('should format with mixed tokens', function() {
      var m = moment('1981-08-17')
      m.format('jYYYY/jMM/jDD = YYYY-MM-DD').should.be.equal('1360/05/26 = 1981-08-17')
    })

    it('should format with jMo', function() {
      var m = moment('1981-08-17')
      m.format('jMo').should.be.equal('5th')
    })

    it('should format with jM', function() {
      var m = moment('1981-08-17')
      m.format('jM').should.be.equal('5')
    })

    it('should format with jMM', function() {
      var m = moment('1981-08-17')
      m.format('jMM').should.be.equal('05')
    })

    it('should format with jMMM', function() {
      var m = moment('1981-08-17')
      m.format('jMMM').should.be.equal('Amo')
    })

    it('should format with jMMMM', function() {
      var m = moment('1981-08-17')
      m.format('jMMMM').should.be.equal('Amordaad')
    })

    it('should format with jDo', function() {
      var m = moment('1981-08-17')
      m.format('jDo').should.be.equal('26th')
    })

    it('should format with jD', function() {
      var m = moment('1981-08-17')
      m.format('jD').should.be.equal('26')
    })

    it('should format with jDD', function() {
      var m = moment('1981-08-17')
      m.format('jDD').should.be.equal('26')
      m = moment('1981-08-23')
      m.format('jDD').should.be.equal('01')
    })

    it('should format with jDDD', function() {
      var m = moment('1981-08-17')
      m.format('jDDD').should.be.equal('150')
    })

    it('should format with jDDDo', function() {
      var m = moment('1981-08-17')
      m.format('jDDDo').should.be.equal('150th')
    })

    it('should format with jDDDD', function() {
      var m = moment('1981-08-17')
      m.format('jDDDD').should.be.equal('150')
      m = moment('1981-03-21')
      m.format('jDDDD').should.be.equal('001')
    })

    it('should format with jwo', function() {
      var m = moment('1981-08-17')
      m.format('jwo').should.be.equal('22nd')
    })

    it('should format with jw', function() {
      var m = moment('1981-08-17')
      m.format('jw').should.be.equal('22')
    })

    it('should format with jww', function() {
      var m = moment('1981-08-17')
      m.format('jww').should.be.equal('22')
      m = moment('1981-04-23')
      m.format('jww').should.be.equal('05')
    })

    it('should format with jYY', function() {
      var m = moment('1981-08-17')
      m.format('jYY').should.be.equal('60')
    })

    it('should format with jYYYY', function() {
      var m = moment('1981-08-17')
      m.format('jYYYY').should.be.equal('1360')
    })

    it('should format with jYYYYY', function() {
      var m = moment('1981-08-17')
      m.format('jYYYYY').should.be.equal('01360')
    })

    it('should format with jgg', function() {
      var m = moment('1981-08-17')
      m.format('jgg').should.be.equal('60')
    })

    it('should format with jgggg', function() {
      var m = moment('1981-08-17')
      m.format('jgggg').should.be.equal('1360')
    })

    it('should format with jggggg', function() {
      var m = moment('1981-08-17')
      m.format('jggggg').should.be.equal('01360')
    })

    it('should work with long date formats too', function() {
      var m = moment('1981-08-17')
      m.format('LT').should.be.equal('12:00 AM')
      m.format('L').should.be.equal('1360/05/26')
      m.format('l').should.be.equal('1360/5/26')
      m.format('LL').should.be.equal('26 Amordaad 1360')
      m.format('ll').should.be.equal('26 Amo 1360')
      m.format('LLL').should.be.equal('26 Amordaad 1360 12:00 AM')
      m.format('lll').should.be.equal('26 Amo 1360 12:00 AM')
      m.format('LLLL').should.be.equal('Monday, 26 Amordaad 1360 12:00 AM')
      m.format('llll').should.be.equal('Mon, 26 Amo 1360 12:00 AM')
    })
  })

  describe('#jYear', function() {
    it('should return Jalaali year', function() {
      var m = moment('1981-08-17')
      m.jYear().should.be.equal(1360)
    })

    it('should set Jalaali year', function() {
      var m = moment('1981-08-17')
      m.jYear(1392)
      m.format('jYYYY/jM/jD').should.be.equal('1392/5/26')
      m = moment('2013-03-20')
      m.format('jYY/jM/jD').should.be.equal('91/12/30')
      m.jYear(1392)
      m.format('jYY/jM/jD').should.be.equal('92/12/29')
    })

    it('should also has jYears alias', function() {
      moment.fn.jYear.should.be.equal(moment.fn.jYears)
    })
  })

  describe('#jMonth', function() {
    it('should return Jalaali month', function() {
      var m = moment('1981-08-17')
      m.jMonth().should.be.equal(4)
    })

    it('should set Jalaali month', function() {
      var m = moment('1981-08-17')
      m.jMonth(7)
      m.format('jYYYY/jM/jD').should.be.equal('1360/8/26')
      m = moment('2012-08-21')
      m.format('jYY/jM/jD').should.be.equal('91/5/31')
      m.jMonth(11)
      m.format('jYY/jM/jD').should.be.equal('91/12/30')
      m = moment('2013-08-22')
      m.format('jYY/jM/jD').should.be.equal('92/5/31')
      m.jMonth(11)
      m.format('jYY/jM/jD').should.be.equal('92/12/29')
    })

    it('should also has jMonths alias', function() {
      moment.fn.jMonth.should.be.equal(moment.fn.jMonths)
    })
  })

  describe('#jDate', function() {
    it('should return Jalaali date', function() {
      var m = moment('1981-08-17')
      m.jDate().should.be.equal(26)
    })

    it('should set Jalaali date', function() {
      var m = moment('1981-08-17')
      m.jDate(30)
      m.format('jYYYY/jM/jD').should.be.equal('1360/5/30')
      m = moment('2013-03-01')
      m.format('jYY/jM/jD').should.be.equal('91/12/11')
      m.jDate(29)
      m.format('jYY/jM/jD').should.be.equal('91/12/29')
      m.jDate(30)
      m.format('jYY/jM/jD').should.be.equal('91/12/30')
      m.jDate(30)
      m.format('jYY/jM/jD').should.be.equal('91/12/30')
      m.jDate(31)
      m.format('jYY/jM/jD').should.be.equal('92/1/1')
      m.jDate(90)
      m.format('jYY/jM/jD').should.be.equal('92/3/28')
    })

    it('should also has jDates alias', function() {
      moment.fn.jDate.should.be.equal(moment.fn.jDates)
    })
  })

  describe('#jDayOfYear', function() {
    it('should return Jalaali date of year', function() {
      var m = moment('1981-08-17')
      m.jDayOfYear().should.be.equal(150)
      m = moment('1981-03-21')
      m.jDayOfYear().should.be.equal(1)
      m = moment('1982-03-20')
      m.jDayOfYear().should.be.equal(365)
      m = moment('1984-03-20')
      m.jDayOfYear().should.be.equal(366)
    })

    it('should set Jalaali date of year', function() {
      var m = moment('1981-08-17')
      m.jDayOfYear(30)
      m.format('jYYYY/jM/jD').should.be.equal('1360/1/30')
      m.jDayOfYear(364)
      m.format('jYY/jM/jD').should.be.equal('60/12/28')
      m.jDayOfYear(365)
      m.format('jYY/jM/jD').should.be.equal('60/12/29')
      m.jDayOfYear(366)
      m.format('jYY/jM/jD').should.be.equal('61/1/1')
      m.jDayOfYear(1)
      m.format('jYY/jM/jD').should.be.equal('61/1/1')
      m.jDayOfYear(90)
      m.format('jYY/jM/jD').should.be.equal('61/3/28')
      m.jDayOfYear(365 + 366)
      m.format('jYY/jM/jD').should.be.equal('62/12/30')
    })
  })

  describe('#jWeek', function() {
    it('should return Jalaali week of year', function() {
      var m = moment('1981-08-17')
      m.jWeek().should.be.equal(22)
      m.jDayOfYear(1)
      m.format('jYY/jM/jD').should.be.equal('60/1/1')
      m.jWeek().should.be.equal(1)
      m.jDayOfYear(8)
      m.format('jYY/jM/jD').should.be.equal('60/1/8')
      m.jWeek().should.be.equal(2)
      m.jDayOfYear(14)
      m.format('jYY/jM/jD').should.be.equal('60/1/14')
      m.jWeek().should.be.equal(2)
      m.jDayOfYear(364)
      m.format('jYY/jM/jD').should.be.equal('60/12/28')
      m.jWeek().should.be.equal(52)
      m.jDayOfYear(365)
      m.format('jYY/jM/jD').should.be.equal('60/12/29')
      m.jWeek().should.be.equal(1)
      m.jDayOfYear(366)
      m.format('jYY/jM/jD').should.be.equal('61/1/1')
      m.jWeek().should.be.equal(1)
      m.jDayOfYear(363)
      m.format('jYY/jM/jD').should.be.equal('61/12/27')
      m.jWeek().should.be.equal(52)
      m.jDayOfYear(365)
      m.format('jYY/jM/jD').should.be.equal('61/12/29')
      m.jWeek().should.be.equal(1)
      m.jDayOfYear(366)
      m.format('jYY/jM/jD').should.be.equal('62/1/1')
      m.jWeek().should.be.equal(1)
      m.jDayOfYear(365)
      m.format('jYY/jM/jD').should.be.equal('62/12/29')
      m.jWeek().should.be.equal(1)
      m.jDayOfYear(366)
      m.format('jYY/jM/jD').should.be.equal('62/12/30')
      m.jWeek().should.be.equal(1)
      m.jDayOfYear(367)
      m.format('jYY/jM/jD').should.be.equal('63/1/1')
      m.jWeek().should.be.equal(1)
      m.jDayOfYear(365)
      m.format('jYY/jM/jD').should.be.equal('63/12/29')
      m.jWeek().should.be.equal(1)
      m.jDayOfYear(366)
      m.format('jYY/jM/jD').should.be.equal('64/1/1')
      m.jWeek().should.be.equal(1)
      m.jDayOfYear(365)
      m.format('jYY/jM/jD').should.be.equal('64/12/29')
      m.jWeek().should.be.equal(1)
      m.jDayOfYear(366)
      m.format('jYY/jM/jD').should.be.equal('65/1/1')
      m.jWeek().should.be.equal(1)
      m.jDayOfYear(358)
      m.format('jYY/jM/jD').should.be.equal('65/12/22')
      m.jWeek().should.be.equal(52)
      m.jDayOfYear(359)
      m.format('jYY/jM/jD').should.be.equal('65/12/23')
      m.jWeek().should.be.equal(53)
      m.jDayOfYear(360)
      m.format('jYY/jM/jD').should.be.equal('65/12/24')
      m.jWeek().should.be.equal(53)
      m.jDayOfYear(361)
      m.format('jYY/jM/jD').should.be.equal('65/12/25')
      m.jWeek().should.be.equal(53)
      m.jDayOfYear(362)
      m.format('jYY/jM/jD').should.be.equal('65/12/26')
      m.jWeek().should.be.equal(53)
      m.jDayOfYear(363)
      m.format('jYY/jM/jD').should.be.equal('65/12/27')
      m.jWeek().should.be.equal(53)
      m.jDayOfYear(364)
      m.format('jYY/jM/jD').should.be.equal('65/12/28')
      m.jWeek().should.be.equal(53)
      m.jDayOfYear(365)
      m.format('jYY/jM/jD').should.be.equal('65/12/29')
      m.jWeek().should.be.equal(53)
    })

    it('should set Jalaali week of year', function() {
      var m = moment('1981-08-17')
      m.jWeek(1)
      m.format('jYY/jM/jD').should.be.equal('60/1/3')
      m.jWeek(22)
      m.format('jYY/jM/jD').should.be.equal('60/5/26')
      m.jWeek(52)
      m.format('jYY/jM/jD').should.be.equal('60/12/24')
      m.jWeek(53)
      m.format('jYY/jM/jD').should.be.equal('61/1/2')
      m.jWeek(1)
      m.format('jYY/jM/jD').should.be.equal('61/1/2')
      m.jWeek(0)
      m.format('jYY/jM/jD').should.be.equal('60/12/24')
      m.jWeek(-1)
      m.format('jYY/jM/jD').should.be.equal('59/12/18')
    })
  })

  describe('#jWeekYear', function() {
    it('should return Jalaali week year', function() {
      var m = moment('1981-08-17')
      m.jWeekYear().should.be.equal(1360)
      m.jDayOfYear(1)
      m.format('jYY/jM/jD').should.be.equal('60/1/1')
      m.jWeekYear().should.be.equal(1360)
      m.jDayOfYear(364)
      m.format('jYY/jM/jD').should.be.equal('60/12/28')
      m.jWeekYear().should.be.equal(1360)
      m.jDayOfYear(365)
      m.format('jYY/jM/jD').should.be.equal('60/12/29')
      m.jWeekYear().should.be.equal(1361)
      m.jDayOfYear(366)
      m.format('jYY/jM/jD').should.be.equal('61/1/1')
      m.jWeekYear().should.be.equal(1361)
      m.jDayOfYear(363)
      m.format('jYY/jM/jD').should.be.equal('61/12/27')
      m.jWeekYear().should.be.equal(1361)
      m.jDayOfYear(365)
      m.format('jYY/jM/jD').should.be.equal('61/12/29')
      m.jWeekYear().should.be.equal(1362)
      m.jDayOfYear(366)
      m.format('jYY/jM/jD').should.be.equal('62/1/1')
      m.jWeekYear().should.be.equal(1362)
      m.jDayOfYear(365)
      m.format('jYY/jM/jD').should.be.equal('62/12/29')
      m.jWeekYear().should.be.equal(1363)
      m.jDayOfYear(366)
      m.format('jYY/jM/jD').should.be.equal('62/12/30')
      m.jWeekYear().should.be.equal(1363)
      m.jDayOfYear(367)
      m.format('jYY/jM/jD').should.be.equal('63/1/1')
      m.jWeekYear().should.be.equal(1363)
      m.jDayOfYear(365)
      m.format('jYY/jM/jD').should.be.equal('63/12/29')
      m.jWeekYear().should.be.equal(1364)
      m.jDayOfYear(366)
      m.format('jYY/jM/jD').should.be.equal('64/1/1')
      m.jWeekYear().should.be.equal(1364)
      m.jDayOfYear(365)
      m.format('jYY/jM/jD').should.be.equal('64/12/29')
      m.jWeekYear().should.be.equal(1365)
      m.jDayOfYear(366)
      m.format('jYY/jM/jD').should.be.equal('65/1/1')
      m.jWeekYear().should.be.equal(1365)
      m.jDayOfYear(358)
      m.format('jYY/jM/jD').should.be.equal('65/12/22')
      m.jWeekYear().should.be.equal(1365)
      m.jDayOfYear(359)
      m.format('jYY/jM/jD').should.be.equal('65/12/23')
      m.jWeekYear().should.be.equal(1365)
      m.jDayOfYear(365)
      m.format('jYY/jM/jD').should.be.equal('65/12/29')
      m.jWeekYear().should.be.equal(1365)
      m.jDayOfYear(366)
      m.format('jYY/jM/jD').should.be.equal('66/1/1')
      m.jWeekYear().should.be.equal(1366)
    })

    it('should set Jalaali week year', function() {
      var m = moment('1981-08-17')
      m.jWeekYear(1361)
      m.format('jYY/jM/jD').should.be.equal('61/5/26')
      m.jWeekYear(1364)
      m.format('jYY/jM/jD').should.be.equal('64/5/26')
      m.jDayOfYear(365)
      m.format('jYY/jM/jD').should.be.equal('64/12/29')
      m.jWeekYear(1364)
      m.format('jYY/jM/jD').should.be.equal('63/12/29')
      m.jWeekYear(1365)
      m.format('jYY/jM/jD').should.be.equal('64/12/29')
    })
  })

  describe('#startOf', function() {
    it('should work as expected without jYear and jMonth', function() {
      var m = moment('1981-08-17 07:10:20')
      m.startOf('year').format('YYYY-MM-DD HH:mm:ss').should.be.equal('1981-01-01 00:00:00')
      m = moment('1981-08-17 07:10:20')
      m.startOf('month').format('YYYY-MM-DD HH:mm:ss').should.be.equal('1981-08-01 00:00:00')
      m = moment('1981-08-17 07:10:20')
      m.startOf('day').format('YYYY-MM-DD HH:mm:ss').should.be.equal('1981-08-17 00:00:00')
      m = moment('1981-08-17 07:10:20')
      m.startOf('week').format('YYYY-MM-DD HH:mm:ss').should.be.equal('1981-08-15 00:00:00')
    })

    it('should return start of Jalaali year, month and date', function() {
      var m = moment('1981-08-17 07:10:20')
      m.startOf('jYear').format('jYYYY-jMM-jDD HH:mm:ss').should.be.equal('1360-01-01 00:00:00')
      m = moment('1981-08-17 07:10:20')
      m.startOf('jMonth').format('jYYYY-jMM-jDD HH:mm:ss').should.be.equal('1360-05-01 00:00:00')
      m = moment('1981-08-17 07:10:20')
      m.startOf('day').format('jYYYY-jMM-jDD HH:mm:ss').should.be.equal('1360-05-26 00:00:00')
      m = moment('1981-08-17 07:10:20')
      m.startOf('week').format('jYYYY-jMM-jDD HH:mm:ss').should.be.equal('1360-05-24 00:00:00')
    })
  })

  describe('#endOf', function() {
    it('should work as expected without jYear and jMonth', function() {
      var m = moment('1981-08-17 07:10:20')
      m.endOf('year').format('YYYY-MM-DD HH:mm:ss').should.be.equal('1981-12-31 23:59:59')
      m = moment('1981-08-17 07:10:20')
      m.endOf('month').format('YYYY-MM-DD HH:mm:ss').should.be.equal('1981-08-31 23:59:59')
      m = moment('1981-08-17 07:10:20')
      m.endOf('day').format('YYYY-MM-DD HH:mm:ss').should.be.equal('1981-08-17 23:59:59')
      m = moment('1981-08-17 07:10:20')
      m.endOf('week').format('YYYY-MM-DD HH:mm:ss').should.be.equal('1981-08-21 23:59:59')
    })

    it('should return end of Jalaali year, month and date', function() {
      var m = moment('1981-08-17 07:10:20')
      m.endOf('jYear').format('jYYYY-jMM-jDD HH:mm:ss').should.be.equal('1360-12-29 23:59:59')
      m = moment('1981-08-17 07:10:20')
      m.endOf('jMonth').format('jYYYY-jMM-jDD HH:mm:ss').should.be.equal('1360-05-31 23:59:59')
      m = moment('1981-08-17 07:10:20')
      m.endOf('day').format('jYYYY-jMM-jDD HH:mm:ss').should.be.equal('1360-05-26 23:59:59')
      m = moment('1981-08-17 07:10:20')
      m.endOf('week').format('jYYYY-jMM-jDD HH:mm:ss').should.be.equal('1360-05-30 23:59:59')
    })
  })

  describe('#isValid', function() {
    it('should return true when a valid date is parsed and false otherwise', function() {
      var jf = 'jYYYY/jMM/jDD'
        , gf = 'YYYY-MM-DD'
      moment('1981-08-17', gf).isValid().should.be.true
      moment('1981-08-31', gf).isValid().should.be.true
      moment('1981-09-31', gf).isValid().should.be.false
      moment('1360 mordaad 26', 'jYYYY jMMMM jD').isValid().should.be.false
      moment('1360/05/26', jf).isValid().should.be.true
      moment('1360/05/31', jf).isValid().should.be.true
      moment('1360/07/30', jf).isValid().should.be.true
      moment('1360/07/31', jf).isValid().should.be.false
      moment('1360/12/29', jf).isValid().should.be.true
      moment('1360/12/30', jf).isValid().should.be.false
      moment('1360/12/31', jf).isValid().should.be.false
      moment('1360/13/01', jf).isValid().should.be.false
      moment('1393/11/00', jf).isValid().should.be.false
    })
  })

  describe('#isValid-strict', function () {
    it('should return false when gregorian date is not strictly valid', function () {
      var gf = 'YYYY-MM-DD'
      moment('1981-08-17', gf).isValid().should.be.true
      moment('1981-08-31', gf).isValid().should.be.true
      moment('1981-08-311', gf).isValid().should.be.true
      moment('1981-08-311', gf, true).isValid().should.be.false
    })

    it('should return false when jalaali date is not strictly valid', function () {
      var jf = 'jYYYY/jMM/jDD'
      moment('1360/05/26', jf).isValid().should.be.true
      moment('1360/05/31', jf).isValid().should.be.true
      moment('1360/05/311', jf, true).isValid().should.be.false
    })
  })

  describe('#clone', function() {
    it('should return a cloned instance', function() {
      var m = moment('1360/5/26', 'jYYYY/jM/jD')
        , c = m.clone()
      m.add(1, 'jYear')
      m.add(4, 'day')
      m.format('jYY/jM/jD').should.be.equal('61/5/30')
      c.format('jYY/jM/jD').should.be.equal('60/5/26')
    })
  })

  describe('#add', function () {
    it('should add gregorian dates correctly', function () {
      var gf = 'YYYY-M-D'
        , m = moment('1981-8-17', 'YYYY-M-D')
      moment(m).add(1, 'day').format(gf).should.be.equal('1981-8-18')
      moment(m).add(10, 'days').format(gf).should.be.equal('1981-8-27')
      moment(m).add(30, 'days').format(gf).should.be.equal('1981-9-16')
      moment(m).add(60, 'days').format(gf).should.be.equal('1981-10-16')

      moment(m).add(1, 'month').format(gf).should.be.equal('1981-9-17')
      moment(m).add(2, 'months').format(gf).should.be.equal('1981-10-17')
      moment(m).add(10, 'months').format(gf).should.be.equal('1982-6-17')
      moment(m).add(20, 'months').format(gf).should.be.equal('1983-4-17')

      moment(m).add(1, 'year').format(gf).should.be.equal('1982-8-17')
      moment(m).add(2, 'years').format(gf).should.be.equal('1983-8-17')
      moment(m).add(10, 'years').format(gf).should.be.equal('1991-8-17')
      moment(m).add(20, 'years').format(gf).should.be.equal('2001-8-17')
    })

    it('should add jalaali dates correctly', function () {
      var jf = 'jYYYY/jM/jD'
        , m = moment('1360/5/26', 'jYYYY/jM/jD')
      moment(m).add(1, 'day').format(jf).should.be.equal('1360/5/27')
      moment(m).add(4, 'days').format(jf).should.be.equal('1360/5/30')
      moment(m).add(10, 'days').format(jf).should.be.equal('1360/6/5')
      moment(m).add(30, 'days').format(jf).should.be.equal('1360/6/25')
      moment(m).add(60, 'days').format(jf).should.be.equal('1360/7/24')
      moment(m).add(365, 'days').format(jf).should.be.equal('1361/5/26')

      moment(m).add(1, 'jmonth').format(jf).should.be.equal('1360/6/26')
      moment(m).add(2, 'jmonths').format(jf).should.be.equal('1360/7/26')
      moment(m).add(10, 'jmonths').format(jf).should.be.equal('1361/3/26')
      moment(m).add(20, 'jmonths').format(jf).should.be.equal('1362/1/26')

      moment(m).add(1, 'jyear').format(jf).should.be.equal('1361/5/26')
      moment(m).add(2, 'jyears').format(jf).should.be.equal('1362/5/26')
      moment(m).add(3, 'jyears').format(jf).should.be.equal('1363/5/26')
      moment(m).add(4, 'jyears').format(jf).should.be.equal('1364/5/26')
      moment(m).add(10, 'jyears').format(jf).should.be.equal('1370/5/26')
      moment(m).add(20, 'jyears').format(jf).should.be.equal('1380/5/26')
    })

    it('should retain last day of month when adding months or years', function () {
      var jf = 'jYYYY/jM/jD'
        , m = moment('1393/6/31', jf)
      moment(m).add(1, 'jmonth').format(jf).should.be.equal('1393/7/30')
      moment(m).add(5, 'jmonth').format(jf).should.be.equal('1393/11/30')
      moment(m).add(6, 'jmonth').format(jf).should.be.equal('1393/12/29')

      m = moment('1391/12/30', jf)
      moment(m).add(1, 'jyear').format(jf).should.be.equal('1392/12/29')
      moment(m).add(2, 'jyear').format(jf).should.be.equal('1393/12/29')
      moment(m).add(3, 'jyear').format(jf).should.be.equal('1394/12/29')
      moment(m).add(4, 'jyear').format(jf).should.be.equal('1395/12/30')
    })
  })

  describe('#subtract', function () {
    it('should subtract gregorian dates correctly', function () {
      var gf = 'YYYY-M-D'
        , m = moment('1981-8-17', 'YYYY-M-D')
      moment(m).subtract(1, 'day').format(gf).should.be.equal('1981-8-16')
      moment(m).subtract(10, 'days').format(gf).should.be.equal('1981-8-7')
      moment(m).subtract(30, 'days').format(gf).should.be.equal('1981-7-18')
      moment(m).subtract(60, 'days').format(gf).should.be.equal('1981-6-18')

      moment(m).subtract(1, 'month').format(gf).should.be.equal('1981-7-17')
      moment(m).subtract(2, 'months').format(gf).should.be.equal('1981-6-17')
      moment(m).subtract(10, 'months').format(gf).should.be.equal('1980-10-17')
      moment(m).subtract(20, 'months').format(gf).should.be.equal('1979-12-17')

      moment(m).subtract(1, 'year').format(gf).should.be.equal('1980-8-17')
      moment(m).subtract(2, 'years').format(gf).should.be.equal('1979-8-17')
      moment(m).subtract(10, 'years').format(gf).should.be.equal('1971-8-17')
      moment(m).subtract(20, 'years').format(gf).should.be.equal('1961-8-17')
    })

    it('should subtract jalaali dates correctly', function () {
      var jf = 'jYYYY/jM/jD'
        , m = moment('1360/5/26', 'jYYYY/jM/jD')
      moment(m).subtract(1, 'day').format(jf).should.be.equal('1360/5/25')
      moment(m).subtract(4, 'days').format(jf).should.be.equal('1360/5/22')
      moment(m).subtract(10, 'days').format(jf).should.be.equal('1360/5/16')
      moment(m).subtract(30, 'days').format(jf).should.be.equal('1360/4/27')
      moment(m).subtract(60, 'days').format(jf).should.be.equal('1360/3/28')
      moment(m).subtract(365, 'days').format(jf).should.be.equal('1359/5/26')

      moment(m).subtract(1, 'jmonth').format(jf).should.be.equal('1360/4/26')
      moment(m).subtract(2, 'jmonths').format(jf).should.be.equal('1360/3/26')
      moment(m).subtract(10, 'jmonths').format(jf).should.be.equal('1359/7/26')
      moment(m).subtract(20, 'jmonths').format(jf).should.be.equal('1358/9/26')

      moment(m).subtract(1, 'jyear').format(jf).should.be.equal('1359/5/26')
      moment(m).subtract(2, 'jyears').format(jf).should.be.equal('1358/5/26')
      moment(m).subtract(3, 'jyears').format(jf).should.be.equal('1357/5/26')
      moment(m).subtract(4, 'jyears').format(jf).should.be.equal('1356/5/26')
      moment(m).subtract(10, 'jyears').format(jf).should.be.equal('1350/5/26')
      moment(m).subtract(20, 'jyears').format(jf).should.be.equal('1340/5/26')
    })

    it('should retain last day of month when subtracting months or years', function () {
      var jf = 'jYYYY/jM/jD'
        , m = moment('1393/1/31', jf)
      moment(m).subtract(1, 'jmonth').format(jf).should.be.equal('1392/12/29')
      moment(m).subtract(6, 'jmonth').format(jf).should.be.equal('1392/7/30')
      moment(m).subtract(7, 'jmonth').format(jf).should.be.equal('1392/6/31')

      m = moment('1391/12/30', jf)
      moment(m).subtract(1, 'jyear').format(jf).should.be.equal('1390/12/29')
      moment(m).subtract(2, 'jyear').format(jf).should.be.equal('1389/12/29')
      moment(m).subtract(3, 'jyear').format(jf).should.be.equal('1388/12/29')
      moment(m).subtract(4, 'jyear').format(jf).should.be.equal('1387/12/30')
    })

    it('should subtract months correctly', function () {
      var jf = 'jYYYY/jM/jD'
        , m = moment('1393/1/31', jf)
      moment(m).subtract(1, 'jmonth').format(jf).should.be.equal('1392/12/29')
      moment(m).subtract(2, 'jmonth').format(jf).should.be.equal('1392/11/30')
      moment(m).subtract(7, 'jmonth').format(jf).should.be.equal('1392/6/31')
      moment(m).subtract(12, 'jmonth').format(jf).should.be.equal('1392/1/31')
      moment(m).subtract(13, 'jmonth').format(jf).should.be.equal('1391/12/30')
      moment(m).subtract(25, 'jmonth').format(jf).should.be.equal('1390/12/29')

      m = moment('1393/1/1', jf)
      moment(m).subtract(1, 'jmonth').format(jf).should.be.equal('1392/12/1')
      moment(m).subtract(2, 'jmonth').format(jf).should.be.equal('1392/11/1')
      moment(m).subtract(7, 'jmonth').format(jf).should.be.equal('1392/6/1')
      moment(m).subtract(12, 'jmonth').format(jf).should.be.equal('1392/1/1')
      moment(m).subtract(13, 'jmonth').format(jf).should.be.equal('1391/12/1')
      moment(m).subtract(25, 'jmonth').format(jf).should.be.equal('1390/12/1')

      m = moment('1393/1/10', jf)
      moment(m).subtract(1, 'jmonth').format(jf).should.be.equal('1392/12/10')
      moment(m).subtract(2, 'jmonth').format(jf).should.be.equal('1392/11/10')
      moment(m).subtract(7, 'jmonth').format(jf).should.be.equal('1392/6/10')
      moment(m).subtract(12, 'jmonth').format(jf).should.be.equal('1392/1/10')
      moment(m).subtract(13, 'jmonth').format(jf).should.be.equal('1391/12/10')
      moment(m).subtract(25, 'jmonth').format(jf).should.be.equal('1390/12/10')
    })
  })

  describe('.jIsLeapYear', function() {
    it('should return true for Jalaali leap years and false otherwise', function() {
      moment.jIsLeapYear(1391).should.be.true
      moment.jIsLeapYear(1392).should.be.false
      moment.jIsLeapYear(1393).should.be.false
      moment.jIsLeapYear(1394).should.be.false
      moment.jIsLeapYear(1395).should.be.true
      moment.jIsLeapYear(1396).should.be.false
      moment.jIsLeapYear(1397).should.be.false
      moment.jIsLeapYear(1398).should.be.false
      moment.jIsLeapYear(1399).should.be.true
      moment.jIsLeapYear(1400).should.be.false
      moment.jIsLeapYear(1401).should.be.false
      moment.jIsLeapYear(1402).should.be.false
      moment.jIsLeapYear(1403).should.be.true
      moment.jIsLeapYear(1404).should.be.false
    })
  })

  describe('.loadPersian', function() {
    it('should load Persian lang', function() {
      var ol = moment.locale()
        , m
      moment.loadPersian()
      m = moment('1981-08-17')
      m.format('D MMMM YYYY').should.be.equal('17 اوت 1981')
      m.format('jD jMMMM jYYYY').should.be.equal('26 امرداد 1360')
      m.calendar().should.be.equal('1360/05/26')
      m.format('LLLL').should.be.equal('دوشنبه، 26 امرداد 1360 00:00')
      m.format('llll').should.be.equal('دوشنبه، 26 امر 1360 00:00')
      moment.locale(ol)
    })
  })

  describe('.unix', function () {
    it('should create a moment with unix epoch', function () {
      var unix = moment('1360/5/26', 'jYYYY/jM/jD').unix()
      moment.unix(unix).format('jYYYY/jM/jD').should.be.equal('1360/5/26')
    })
  })
})
