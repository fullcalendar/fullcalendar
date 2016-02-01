
module.exports = jMoment

var moment = require('moment')
  , jalaali = require('jalaali-js')

/************************************
    Constants
************************************/

var formattingTokens = /(\[[^\[]*\])|(\\)?j(Mo|MM?M?M?|Do|DDDo|DD?D?D?|w[o|w]?|YYYYY|YYYY|YY|gg(ggg?)?|)|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g
  , localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g

  , parseTokenOneOrTwoDigits = /\d\d?/
  , parseTokenOneToThreeDigits = /\d{1,3}/
  , parseTokenThreeDigits = /\d{3}/
  , parseTokenFourDigits = /\d{1,4}/
  , parseTokenSixDigits = /[+\-]?\d{1,6}/
  , parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i
  , parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/i
  , parseTokenT = /T/i
  , parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/

  , unitAliases =
    { jm: 'jmonth'
    , jmonths: 'jmonth'
    , jy: 'jyear'
    , jyears: 'jyear'
    }

  , formatFunctions = {}

  , ordinalizeTokens = 'DDD w M D'.split(' ')
  , paddedTokens = 'M D w'.split(' ')

  , formatTokenFunctions =
    { jM: function () {
        return this.jMonth() + 1
      }
    , jMMM: function (format) {
        return this.localeData().jMonthsShort(this, format)
      }
    , jMMMM: function (format) {
        return this.localeData().jMonths(this, format)
      }
    , jD: function () {
        return this.jDate()
      }
    , jDDD: function () {
        return this.jDayOfYear()
      }
    , jw: function () {
        return this.jWeek()
      }
    , jYY: function () {
        return leftZeroFill(this.jYear() % 100, 2)
      }
    , jYYYY: function () {
        return leftZeroFill(this.jYear(), 4)
      }
    , jYYYYY: function () {
        return leftZeroFill(this.jYear(), 5)
      }
    , jgg: function () {
        return leftZeroFill(this.jWeekYear() % 100, 2)
      }
    , jgggg: function () {
        return this.jWeekYear()
      }
    , jggggg: function () {
        return leftZeroFill(this.jWeekYear(), 5)
      }
    }

function padToken(func, count) {
  return function (a) {
    return leftZeroFill(func.call(this, a), count)
  }
}
function ordinalizeToken(func, period) {
  return function (a) {
    return this.localeData().ordinal(func.call(this, a), period)
  }
}

(function () {
  var i
  while (ordinalizeTokens.length) {
    i = ordinalizeTokens.pop()
    formatTokenFunctions['j' + i + 'o'] = ordinalizeToken(formatTokenFunctions['j' + i], i)
  }
  while (paddedTokens.length) {
    i = paddedTokens.pop()
    formatTokenFunctions['j' + i + i] = padToken(formatTokenFunctions['j' + i], 2)
  }
  formatTokenFunctions.jDDDD = padToken(formatTokenFunctions.jDDD, 3)
}())

/************************************
    Helpers
************************************/

function extend(a, b) {
  var key
  for (key in b)
    if (b.hasOwnProperty(key))
      a[key] = b[key]
  return a
}

function leftZeroFill(number, targetLength) {
  var output = number + ''
  while (output.length < targetLength)
    output = '0' + output
  return output
}

function isArray(input) {
  return Object.prototype.toString.call(input) === '[object Array]'
}

// function compareArrays(array1, array2) {
//   var len = Math.min(array1.length, array2.length)
//     , lengthDiff = Math.abs(array1.length - array2.length)
//     , diffs = 0
//     , i
//   for (i = 0; i < len; i += 1)
//     if (~~array1[i] !== ~~array2[i])
//       diffs += 1
//   return diffs + lengthDiff
// }

function normalizeUnits(units) {
  if (units) {
    var lowered = units.toLowerCase()
    units = unitAliases[lowered] || lowered
  }
  return units
}

function setDate(m, year, month, date) {
  var d = m._d
  if (m._isUTC) {
    /*eslint-disable new-cap*/
    m._d = new Date(Date.UTC(year, month, date,
        d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()))
    /*eslint-enable new-cap*/
  } else {
    m._d = new Date(year, month, date,
        d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds())
  }
}

function objectCreate(parent) {
  function F() {}
  F.prototype = parent
  return new F()
}

function getPrototypeOf(object) {
  if (Object.getPrototypeOf)
    return Object.getPrototypeOf(object)
  else if (''.__proto__)
    return object.__proto__
  else
    return object.constructor.prototype
}

/************************************
    Languages
************************************/
extend(getPrototypeOf(moment.localeData()),
  { _jMonths: [ 'Farvardin'
              , 'Ordibehesht'
              , 'Khordaad'
              , 'Tir'
              , 'Amordaad'
              , 'Shahrivar'
              , 'Mehr'
              , 'Aabaan'
              , 'Aazar'
              , 'Dey'
              , 'Bahman'
              , 'Esfand'
              ]
  , jMonths: function (m) {
      return this._jMonths[m.jMonth()]
    }

  , _jMonthsShort:  [ 'Far'
                    , 'Ord'
                    , 'Kho'
                    , 'Tir'
                    , 'Amo'
                    , 'Sha'
                    , 'Meh'
                    , 'Aab'
                    , 'Aaz'
                    , 'Dey'
                    , 'Bah'
                    , 'Esf'
                    ]
  , jMonthsShort: function (m) {
      return this._jMonthsShort[m.jMonth()]
    }

  , jMonthsParse: function (monthName) {
      var i
        , mom
        , regex
      if (!this._jMonthsParse)
        this._jMonthsParse = []
      for (i = 0; i < 12; i += 1) {
        // Make the regex if we don't have it already.
        if (!this._jMonthsParse[i]) {
          mom = jMoment([2000, (2 + i) % 12, 25])
          regex = '^' + this.jMonths(mom, '') + '|^' + this.jMonthsShort(mom, '')
          this._jMonthsParse[i] = new RegExp(regex.replace('.', ''), 'i')
        }
        // Test the regex.
        if (this._jMonthsParse[i].test(monthName))
          return i
      }
    }
  }
)

/************************************
    Formatting
************************************/

function makeFormatFunction(format) {
  var array = format.match(formattingTokens)
    , length = array.length
    , i

  for (i = 0; i < length; i += 1)
    if (formatTokenFunctions[array[i]])
      array[i] = formatTokenFunctions[array[i]]

  return function (mom) {
    var output = ''
    for (i = 0; i < length; i += 1)
      output += array[i] instanceof Function ? '[' + array[i].call(mom, format) + ']' : array[i]
    return output
  }
}

/************************************
    Parsing
************************************/

function getParseRegexForToken(token, config) {
  switch (token) {
  case 'jDDDD':
    return parseTokenThreeDigits
  case 'jYYYY':
    return parseTokenFourDigits
  case 'jYYYYY':
    return parseTokenSixDigits
  case 'jDDD':
    return parseTokenOneToThreeDigits
  case 'jMMM':
  case 'jMMMM':
    return parseTokenWord
  case 'jMM':
  case 'jDD':
  case 'jYY':
  case 'jM':
  case 'jD':
    return parseTokenOneOrTwoDigits
  case 'DDDD':
    return parseTokenThreeDigits
  case 'YYYY':
    return parseTokenFourDigits
  case 'YYYYY':
    return parseTokenSixDigits
  case 'S':
  case 'SS':
  case 'SSS':
  case 'DDD':
    return parseTokenOneToThreeDigits
  case 'MMM':
  case 'MMMM':
  case 'dd':
  case 'ddd':
  case 'dddd':
    return parseTokenWord
  case 'a':
  case 'A':
    return moment.localeData(config._l)._meridiemParse
  case 'X':
    return parseTokenTimestampMs
  case 'Z':
  case 'ZZ':
    return parseTokenTimezone
  case 'T':
    return parseTokenT
  case 'MM':
  case 'DD':
  case 'YY':
  case 'HH':
  case 'hh':
  case 'mm':
  case 'ss':
  case 'M':
  case 'D':
  case 'd':
  case 'H':
  case 'h':
  case 'm':
  case 's':
    return parseTokenOneOrTwoDigits
  default:
    return new RegExp(token.replace('\\', ''))
  }
}

function addTimeToArrayFromToken(token, input, config) {
  var a
    , datePartArray = config._a

  switch (token) {
  case 'jM':
  case 'jMM':
    datePartArray[1] = input == null ? 0 : ~~input - 1
    break
  case 'jMMM':
  case 'jMMMM':
    a = moment.localeData(config._l).jMonthsParse(input)
    if (a != null)
      datePartArray[1] = a
    else
      config._isValid = false
    break
  case 'jD':
  case 'jDD':
  case 'jDDD':
  case 'jDDDD':
    if (input != null)
      datePartArray[2] = ~~input
    break
  case 'jYY':
    datePartArray[0] = ~~input + (~~input > 47 ? 1300 : 1400)
    break
  case 'jYYYY':
  case 'jYYYYY':
    datePartArray[0] = ~~input
  }
  if (input == null)
    config._isValid = false
}

function dateFromArray(config) {
  var g
    , j
    , jy = config._a[0]
    , jm = config._a[1]
    , jd = config._a[2]

  if ((jy == null) && (jm == null) && (jd == null))
    return [0, 0, 1]
  jy = jy != null ? jy : 0
  jm = jm != null ? jm : 0
  jd = jd != null ? jd : 1
  if (jd < 1 || jd > jMoment.jDaysInMonth(jy, jm) || jm < 0 || jm > 11)
    config._isValid = false
  g = toGregorian(jy, jm, jd)
  j = toJalaali(g.gy, g.gm, g.gd)
  config._jDiff = 0
  if (~~j.jy !== jy)
    config._jDiff += 1
  if (~~j.jm !== jm)
    config._jDiff += 1
  if (~~j.jd !== jd)
    config._jDiff += 1
  return [g.gy, g.gm, g.gd]
}

function makeDateFromStringAndFormat(config) {
  var tokens = config._f.match(formattingTokens)
    , string = config._i + ''
    , len = tokens.length
    , i
    , token
    , parsedInput

  config._a = []

  for (i = 0; i < len; i += 1) {
    token = tokens[i]
    parsedInput = (getParseRegexForToken(token, config).exec(string) || [])[0]
    if (parsedInput)
      string = string.slice(string.indexOf(parsedInput) + parsedInput.length)
    if (formatTokenFunctions[token])
      addTimeToArrayFromToken(token, parsedInput, config)
  }
  if (string)
    config._il = string
  return dateFromArray(config)
}

function makeDateFromStringAndArray(config, utc) {
  var len = config._f.length
    , i
    , format
    , tempMoment
    , bestMoment
    , currentScore
    , scoreToBeat

  if (len === 0) {
    return makeMoment(new Date(NaN))
  }

  for (i = 0; i < len; i += 1) {
    format = config._f[i]
    currentScore = 0
    tempMoment = makeMoment(config._i, format, config._l, config._strict, utc)

    if (!tempMoment.isValid()) continue

    // currentScore = compareArrays(tempMoment._a, tempMoment.toArray())
    currentScore += tempMoment._jDiff
    if (tempMoment._il)
      currentScore += tempMoment._il.length
    if (scoreToBeat == null || currentScore < scoreToBeat) {
      scoreToBeat = currentScore
      bestMoment = tempMoment
    }
  }

  return bestMoment
}

function removeParsedTokens(config) {
  var string = config._i + ''
    , input = ''
    , format = ''
    , array = config._f.match(formattingTokens)
    , len = array.length
    , i
    , match
    , parsed

  for (i = 0; i < len; i += 1) {
    match = array[i]
    parsed = (getParseRegexForToken(match, config).exec(string) || [])[0]
    if (parsed)
      string = string.slice(string.indexOf(parsed) + parsed.length)
    if (!(formatTokenFunctions[match] instanceof Function)) {
      format += match
      if (parsed)
        input += parsed
    }
  }
  config._i = input
  config._f = format
}

/************************************
    Week of Year
************************************/

function jWeekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
  var end = firstDayOfWeekOfYear - firstDayOfWeek
    , daysToDayOfWeek = firstDayOfWeekOfYear - mom.day()
    , adjustedMoment

  if (daysToDayOfWeek > end) {
    daysToDayOfWeek -= 7
  }
  if (daysToDayOfWeek < end - 7) {
    daysToDayOfWeek += 7
  }
  adjustedMoment = jMoment(mom).add(daysToDayOfWeek, 'd')
  return  { week: Math.ceil(adjustedMoment.jDayOfYear() / 7)
          , year: adjustedMoment.jYear()
          }
}

/************************************
    Top Level Functions
************************************/

function makeMoment(input, format, lang, strict, utc) {
  if (typeof lang === 'boolean') {
    utc = strict
    strict = lang
    lang = undefined
  }
  var config =
      { _i: input
      , _f: format
      , _l: lang
      , _strict: strict
      , _isUTC: utc
      }
    , date
    , m
    , jm
    , origInput = input
    , origFormat = format
  if (format) {
    if (isArray(format)) {
      return makeDateFromStringAndArray(config, utc)
    } else {
      date = makeDateFromStringAndFormat(config)
      removeParsedTokens(config)
      format = 'YYYY-MM-DD-' + config._f
      input = leftZeroFill(date[0], 4) + '-'
            + leftZeroFill(date[1] + 1, 2) + '-'
            + leftZeroFill(date[2], 2) + '-'
            + config._i
    }
  }
  if (utc)
    m = moment.utc(input, format, lang, strict)
  else
    m = moment(input, format, lang, strict)
  if (config._isValid === false)
    m._isValid = false
  m._jDiff = config._jDiff || 0
  jm = objectCreate(jMoment.fn)
  extend(jm, m)
  if (strict && jm.isValid()) {
    jm._isValid = jm.format(origFormat) === origInput
  }
  return jm
}

function jMoment(input, format, lang, strict) {
  return makeMoment(input, format, lang, strict, false)
}

extend(jMoment, moment)
jMoment.fn = objectCreate(moment.fn)

jMoment.utc = function (input, format, lang, strict) {
  return makeMoment(input, format, lang, strict, true)
}

jMoment.unix = function (input) {
  return makeMoment(input * 1000)
}

/************************************
    jMoment Prototype
************************************/

jMoment.fn.format = function (format) {
  var i
    , replace
    , me = this

  if (format) {
    i = 5
    replace = function (input) {
      return me.localeData().longDateFormat(input) || input
    }
    while (i > 0 && localFormattingTokens.test(format)) {
      i -= 1
      format = format.replace(localFormattingTokens, replace)
    }
    if (!formatFunctions[format]) {
      formatFunctions[format] = makeFormatFunction(format)
    }
    format = formatFunctions[format](this)
  }
  return moment.fn.format.call(this, format)
}

jMoment.fn.jYear = function (input) {
  var lastDay
    , j
    , g
  if (typeof input === 'number') {
    j = toJalaali(this.year(), this.month(), this.date())
    lastDay = Math.min(j.jd, jMoment.jDaysInMonth(input, j.jm))
    g = toGregorian(input, j.jm, lastDay)
    setDate(this, g.gy, g.gm, g.gd)
    moment.updateOffset(this)
    return this
  } else {
    return toJalaali(this.year(), this.month(), this.date()).jy
  }
}

jMoment.fn.jMonth = function (input) {
  var lastDay
    , j
    , g
  if (input != null) {
    if (typeof input === 'string') {
      input = this.lang().jMonthsParse(input)
      if (typeof input !== 'number')
        return this
    }
    j = toJalaali(this.year(), this.month(), this.date())
    lastDay = Math.min(j.jd, jMoment.jDaysInMonth(j.jy, input))
    this.jYear(j.jy + div(input, 12))
    input = mod(input, 12)
    if (input < 0) {
      input += 12
      this.jYear(this.jYear() - 1)
    }
    g = toGregorian(this.jYear(), input, lastDay)
    setDate(this, g.gy, g.gm, g.gd)
    moment.updateOffset(this)
    return this
  } else {
    return toJalaali(this.year(), this.month(), this.date()).jm
  }
}

jMoment.fn.jDate = function (input) {
  var j
    , g
  if (typeof input === 'number') {
    j = toJalaali(this.year(), this.month(), this.date())
    g = toGregorian(j.jy, j.jm, input)
    setDate(this, g.gy, g.gm, g.gd)
    moment.updateOffset(this)
    return this
  } else {
    return toJalaali(this.year(), this.month(), this.date()).jd
  }
}

jMoment.fn.jDayOfYear = function (input) {
  var dayOfYear = Math.round((jMoment(this).startOf('day') - jMoment(this).startOf('jYear')) / 864e5) + 1
  return input == null ? dayOfYear : this.add(input - dayOfYear, 'd')
}

jMoment.fn.jWeek = function (input) {
  var week = jWeekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).week
  return input == null ? week : this.add((input - week) * 7, 'd')
}

jMoment.fn.jWeekYear = function (input) {
  var year = jWeekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year
  return input == null ? year : this.add(input - year, 'y')
}

jMoment.fn.add = function (val, units) {
  var temp
  if (units !== null && !isNaN(+units)) {
    temp = val
    val = units
    units = temp
  }
  units = normalizeUnits(units)
  if (units === 'jyear') {
    this.jYear(this.jYear() + val)
  } else if (units === 'jmonth') {
    this.jMonth(this.jMonth() + val)
  } else {
    moment.fn.add.call(this, val, units)
  }
  return this
}

jMoment.fn.subtract = function (val, units) {
  var temp
  if (units !== null && !isNaN(+units)) {
    temp = val
    val = units
    units = temp
  }
  units = normalizeUnits(units)
  if (units === 'jyear') {
    this.jYear(this.jYear() - val)
  } else if (units === 'jmonth') {
    this.jMonth(this.jMonth() - val)
  } else {
    moment.fn.subtract.call(this, val, units)
  }
  return this
}

jMoment.fn.startOf = function (units) {
  units = normalizeUnits(units)
  if (units === 'jyear' || units === 'jmonth') {
    if (units === 'jyear') {
      this.jMonth(0)
    }
    this.jDate(1)
    this.hours(0)
    this.minutes(0)
    this.seconds(0)
    this.milliseconds(0)
    return this
  } else {
    return moment.fn.startOf.call(this, units)
  }
}

jMoment.fn.endOf = function (units) {
  units = normalizeUnits(units)
  if (units === undefined || units === 'milisecond') {
    return this
  }
  return this.startOf(units).add(1, (units === 'isoweek' ? 'week' : units)).subtract(1, 'ms')
}

jMoment.fn.clone = function () {
  return jMoment(this)
}

jMoment.fn.jYears = jMoment.fn.jYear
jMoment.fn.jMonths = jMoment.fn.jMonth
jMoment.fn.jDates = jMoment.fn.jDate
jMoment.fn.jWeeks = jMoment.fn.jWeek

/************************************
    jMoment Statics
************************************/

jMoment.jDaysInMonth = function (year, month) {
  year += div(month, 12)
  month = mod(month, 12)
  if (month < 0) {
    month += 12
    year -= 1
  }
  if (month < 6) {
    return 31
  } else if (month < 11) {
    return 30
  } else if (jMoment.jIsLeapYear(year)) {
    return 30
  } else {
    return 29
  }
}

jMoment.jIsLeapYear = jalaali.isLeapJalaaliYear

jMoment.loadPersian = function () {
  moment.locale('fa'
  , { months: ('ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر').split('_')
    , monthsShort: ('ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر').split('_')
    , weekdays: ('یک\u200cشنبه_دوشنبه_سه\u200cشنبه_چهارشنبه_پنج\u200cشنبه_آدینه_شنبه').split('_')
    , weekdaysShort: ('یک\u200cشنبه_دوشنبه_سه\u200cشنبه_چهارشنبه_پنج\u200cشنبه_آدینه_شنبه').split('_')
    , weekdaysMin: 'ی_د_س_چ_پ_آ_ش'.split('_')
    , longDateFormat:
      { LT: 'HH:mm'
      , L: 'jYYYY/jMM/jDD'
      , LL: 'jD jMMMM jYYYY'
      , LLL: 'jD jMMMM jYYYY LT'
      , LLLL: 'dddd، jD jMMMM jYYYY LT'
      }
    , calendar:
      { sameDay: '[امروز ساعت] LT'
      , nextDay: '[فردا ساعت] LT'
      , nextWeek: 'dddd [ساعت] LT'
      , lastDay: '[دیروز ساعت] LT'
      , lastWeek: 'dddd [ی پیش ساعت] LT'
      , sameElse: 'L'
      }
    , relativeTime:
      { future: 'در %s'
      , past: '%s پیش'
      , s: 'چند ثانیه'
      , m: '1 دقیقه'
      , mm: '%d دقیقه'
      , h: '1 ساعت'
      , hh: '%d ساعت'
      , d: '1 روز'
      , dd: '%d روز'
      , M: '1 ماه'
      , MM: '%d ماه'
      , y: '1 سال'
      , yy: '%d سال'
      }
    , ordinal: '%dم'
    , week:
      { dow: 6 // Saturday is the first day of the week.
      , doy: 12 // The week that contains Jan 1st is the first week of the year.
      }
    , meridiem: function (hour) {
        return hour < 12 ? 'ق.ظ' : 'ب.ظ'
      }
    , jMonths: ('فروردین_اردیبهشت_خرداد_تیر_امرداد_شهریور_مهر_آبان_آذر_دی_بهمن_اسفند').split('_')
    , jMonthsShort: 'فرو_ارد_خرد_تیر_امر_شهر_مهر_آبا_آذر_دی_بهم_اسف'.split('_')
    }
  )
}

jMoment.jConvert =  { toJalaali: toJalaali
                    , toGregorian: toGregorian
                    }

/************************************
    Jalaali Conversion
************************************/

function toJalaali(gy, gm, gd) {
  var j = jalaali.toJalaali(gy, gm + 1, gd)
  j.jm -= 1
  return j
}

function toGregorian(jy, jm, jd) {
  var g = jalaali.toGregorian(jy, jm + 1, jd)
  g.gm -= 1
  return g
}

/*
  Utility helper functions.
*/

function div(a, b) {
  return ~~(a / b)
}

function mod(a, b) {
  return a - ~~(a / b) * b
}
