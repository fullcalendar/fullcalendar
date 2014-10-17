// Persian Date
// Version 0.1.7
// Author Reza Babakhani
// written under the GPL version 2.0
// All Unit test passed , work on  Chrome / Opera / FF / IE 7,8,9
/*
 Change Log:
 0.1.7  :  Fix Format Like Moment.js
 Fix formatPersian Config
 Fix Constructor Without New Keyword\
 Fix #daysInMonth
 Add #toArray
 Fix persianDate.unix(input)
 */


( function() {
            String.prototype.toPersianDigit = function(a) {
                  return this.replace(/\d+/g, function(digit) {
                        var enDigitArr = [], peDigitArr = [], i, j;
                        for ( i = 0; i < digit.length; i += 1) {
                              enDigitArr.push(digit.charCodeAt(i));
                        }
                        for ( j = 0; j < enDigitArr.length; j += 1) {
                              peDigitArr.push(String.fromCharCode(enDigitArr[j] + ((!!a && a === true) ? 1584 : 1728)));
                        }
                        return peDigitArr.join('');
                  });
            };
            var monthRange = {
                  1 : {
                        name : {
                              fa : "فروردین"
                        },
                        abbr : {
                              fa : "فرو"
                        }
                  },
                  2 : {
                        name : {
                              fa : "اردیبهشت"
                        },
                        abbr : {
                              fa : "ارد"
                        }
                  },
                  3 : {
                        name : {
                              fa : "خرداد"
                        },
                        abbr : {
                              fa : "خرد"
                        }
                  },
                  4 : {
                        name : {
                              fa : "تیر"
                        },
                        abbr : {
                              fa : "تیر"
                        }
                  },
                  5 : {
                        name : {
                              fa : "مرداد"
                        },
                        abbr : {
                              fa : "مرد"
                        }
                  },
                  6 : {
                        name : {
                              fa : "شهریور"
                        },
                        abbr : {
                              fa : "شهر"
                        }
                  },
                  7 : {
                        name : {
                              fa : "مهر"
                        },
                        abbr : {
                              fa : "مهر"
                        }
                  },
                  8 : {
                        name : {
                              fa : "آبان"
                        },
                        abbr : {
                              fa : "آبا"
                        }

                  },
                  9 : {
                        name : {
                              fa : "آذر"
                        },
                        abbr : {
                              fa : "آذر"
                        }
                  },
                  10 : {
                        name : {
                              fa : "دی"
                        },
                        abbr : {
                              fa : "دی"
                        }
                  },
                  11 : {
                        name : {
                              fa : "بهمن"
                        },
                        abbr : {
                              fa : "بهم"
                        }
                  },
                  12 : {
                        name : {
                              fa : "اسفند"
                        },
                        abbr : {
                              fa : "اسف"
                        }
                  }
            }, weekRange = {
                  0 : {
                        name : {
                              fa : "شنبه"
                        },
                        abbr : {
                              fa : "ش"
                        }
                  },
                  1 : {
                        name : {
                              fa : "یکشنبه"
                        },
                        abbr : {
                              fa : "ی"
                        }
                  },
                  2 : {
                        name : {
                              fa : "دوشنبه"
                        },
                        abbr : {
                              fa : "د"
                        }
                  },
                  3 : {
                        name : {
                              fa : "سه شنبه"
                        },
                        abbr : {
                              fa : "س"
                        }
                  },
                  4 : {
                        name : {
                              fa : "چهار شنبه"
                        },
                        abbr : {
                              fa : "چ"
                        }
                  },
                  5 : {
                        name : {
                              fa : "پنج شنبه"
                        },
                        abbr : {
                              fa : "پ"
                        }
                  },
                  6 : {
                        name : {
                              fa : "جمعه"
                        },
                        abbr : {
                              fa : "ج"
                        }
                  }
            }, persianDaysName = ["اورمزد", "بهمن", "اوردیبهشت", "شهریور", "سپندارمذ", "خورداد", "امرداد", "دی به آذز", "آذز", "آبان", "خورشید", "ماه", "تیر", "گوش", "دی به مهر", "مهر", "سروش", "رشن", "فروردین", "بهرام", "رام", "باد", "دی به دین", "دین", "ارد", "اشتاد", "آسمان", "زامیاد", "مانتره سپند", "انارام", "زیادی"], toPersianDigit = function(digit) {
                  return digit.toString().toPersianDigit();
            }, isArray = function(input) {
                  return Object.prototype.toString.call(input) === '[object Array]';
            }, isString = function(input) {
                  return typeof input === "string" ? true : false;
            }, isNumber = function(input) {
                  return typeof input === "number" ? true : false;
            }, isDate = function(input) {
                  return input instanceof Date;
            }, isUndefined = function(input) {
                  if ( typeof input === "undefined")
                        return true;
                  else
                        return false;
            }, leftZeroFill = function(number, targetLength) {
                  var output = number + '';
                  while (output.length < targetLength) {
                        output = '0' + output;
                  }
                  return output;
            }, absRound = function(number) {
                  if (number < 0) {
                        return Math.ceil(number);
                  } else {
                        return Math.floor(number);
                  }
            }, mod = function(a, b) {
                  return a - (b * Math.floor(a / b));
            }, GREGORIAN_EPOCH = 1721425.5, PERSIAN_EPOCH = 1948320.5, jwday = function(j) {
                  return mod(Math.floor((j + 1.5)), 7);
            },
            //  LEAP_GREGORIAN  --  Is a given year in the Gregorian calendar a leap year ?
            isLeapGregorian = function(year) {
                  return ((year % 4) == 0) && (!(((year % 100) === 0) && ((year % 400) != 0)));
            }, isLeapPersian = function(year) {
                  return ((((((year - ((year > 0) ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816) < 682;
            },
            //  GREGORIAN_TO_JD  --  Determine Julian day number from Gregorian calendar date
            gregorianToJd = function(year, month, day) {
                  return (GREGORIAN_EPOCH - 1) + (365 * (year - 1)) + Math.floor((year - 1) / 4) + (-Math.floor((year - 1) / 100)) + Math.floor((year - 1) / 400) + Math.floor((((367 * month) - 362) / 12) + ((month <= 2) ? 0 : (isLeapGregorian(year) ? -1 : -2)
                  ) + day);
            },
            //  JD_TO_GREGORIAN  --  Calculate Gregorian calendar date from Julian day
            jdToGregorian = function(jd) {
                  var wjd, depoch, quadricent, dqc, cent, dcent, quad, dquad, yindex, dyindex, year, yearday, leapadj;
                  wjd = Math.floor(jd - 0.5) + 0.5;
                  depoch = wjd - GREGORIAN_EPOCH;
                  quadricent = Math.floor(depoch / 146097);
                  dqc = mod(depoch, 146097);
                  cent = Math.floor(dqc / 36524);
                  dcent = mod(dqc, 36524);
                  quad = Math.floor(dcent / 1461);
                  dquad = mod(dcent, 1461);
                  yindex = Math.floor(dquad / 365);
                  year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;
                  if (!((cent == 4) || (yindex == 4))) {
                        year++;
                  }
                  yearday = wjd - gregorianToJd(year, 1, 1);
                  leapadj = ((wjd < gregorianToJd(year, 3, 1)) ? 0 : (isLeapGregorian(year) ? 1 : 2)
                  );
                  month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);
                  day = (wjd - gregorianToJd(year, month, 1)) + 1;
                  return new Array(year, month, day);
            },
            //  PERSIAN_TO_JD  --  Determine Julian day from Persian date
            persianToJd = function(year, month, day) {
                  mod = function(a, b) {
                        return a - (b * Math.floor(a / b));
                  };

                  var epbase, epyear;
                  epbase = year - ((year >= 0) ? 474 : 473);
                  epyear = 474 + mod(epbase, 2820);
                  return day + ((month <= 7) ? ((month - 1) * 31) : (((month - 1) * 30) + 6)
                  ) + Math.floor(((epyear * 682) - 110) / 2816) + (epyear - 1) * 365 + Math.floor(epbase / 2820) * 1029983 + (PERSIAN_EPOCH - 1);
            },
            //  JD_TO_PERSIAN  --  Calculate Persian date from Julian day
            jdToPersian = function(jd) {
                  var year, month, day, depoch, cycle, cyear, ycycle, aux1, aux2, yday;
                  jd = Math.floor(jd) + 0.5;
                  depoch = jd - persianToJd(475, 1, 1);
                  cycle = Math.floor(depoch / 1029983);
                  cyear = mod(depoch, 1029983);
                  if (cyear === 1029982) {
                        ycycle = 2820;
                  } else {
                        aux1 = Math.floor(cyear / 366);
                        aux2 = mod(cyear, 366);
                        ycycle = Math.floor(((2134 * aux1) + (2816 * aux2) + 2815) / 1028522) + aux1 + 1;
                  }
                  year = ycycle + (2820 * cycle) + 474;
                  if (year <= 0) {
                        year -= 1;
                  }
                  yday = (jd - persianToJd(year, 1, 1)) + 1;
                  month = (yday <= 186) ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
                  day = (jd - persianToJd(year, month, 1)) + 1;
                  return new Array(year, month, day);
            }, calcPersian = function(year, month, day) {
                  var date, j;
                  var j = persianToJd(year, month, day);
                  var date = jdToGregorian(j);
                  return new Array(date[0], date[1] - 1, date[2]);
            },
            //  calcGregorian  --  Perform calculation starting with a Gregorian date
            calcGregorian = function(year, month, day) {
                  //  Update Julian day
                  var j = gregorianToJd(year, month + 1, day) + (Math.floor(0 + 60 * (0 + 60 * 0) + 0.5) / 86400.0),
                  //  Update Persian Calendar
                  perscal = jdToPersian(j), weekday = jwday(j);
                  return new Array(perscal[0], perscal[1], perscal[2], weekday);
            },
            //Converts a gregorian date to Jalali date for different formats
            toPersianDate = function(gd) {
                  var pa = calcGregorian(gd.getFullYear(), gd.getMonth(), gd.getDate());
                  var output = {};
                  output.monthDayNumber = pa[2] - 1;
                  // TODO: simplify this code
                  // Sync Gregorian Week Index Width Persian  week Index
                  if (pa[3] == 6) {
                        output.weekDayNumber = 0;
                  } else {
                        output.weekDayNumber = pa[3] + 1;
                  }
                  output.year = pa[0];
                  output.month = pa[1];
                  output.day = pa[3];
                  output.date = pa[2];
                  output.hours = gd.getHours();
                  output.minutes = ((gd.getMinutes() < 10) ? ('0' + gd.getMinutes()) : (gd.getMinutes()));
                  output.seconds = gd.getSeconds();
                  output.milliseconds = gd.getMilliseconds();
                  output.timeZoneOffset = gd.getTimezoneOffset();
                  return output;
            }, persianArrayToGregorianDate = function(parray) {
                  // Howha : javascript Cant Parse this array truly 2011,2,20
                  var pd = calcPersian(parray[0] ? parray[0] : 0, parray[1] ? parray[1] : 1, parray[2] ? parray[2] : 1);
                  var gDate = new Date(pd[0], pd[1], pd[2]);
                  gDate.setYear(pd[0]);
                  gDate.setMonth(pd[1]);
                  gDate.setDate(pd[2]);
                  // TODO: Fix Hourse Important

                  gDate.setHours(parray[3] ? parray[3] : 1);
                  gDate.setMinutes(parray[4] ? parray[4] : 0);
                  gDate.setSeconds(parray[5] ? parray[5] : 0);
                  return gDate;
            }, getPersianArrayFromPDate = function(pDate) {
                  return [pDate.year, pDate.month, pDate.date, pDate.hours, pDate.minutes, pDate.seconds, pDate.milliseconds];
            }
            //##########################################
            // ***************************** Constructor Duration
            //##########################################
            , Duration = function(duration) {
                  var absRound = function(number) {
                        if (number < 0) {
                              return Math.ceil(number);
                        } else {
                              return Math.floor(number);
                        }
                  }, data = this._data = {}, years = duration.years || duration.year || duration.y || 0, months = duration.months || duration.month || duration.M || 0, weeks = duration.weeks || duration.w || duration.week || 0, days = duration.days || duration.d || duration.day || 0, hours = duration.hours || duration.hour || duration.h || 0, minutes = duration.minutes || duration.minute || duration.m || 0, seconds = duration.seconds || duration.second || duration.s || 0, milliseconds = duration.milliseconds || duration.millisecond || duration.ms || 0;
                  // representation for dateAddRemove
                  this._milliseconds = milliseconds + seconds * (1e3) + minutes * (6e4) + hours * (36e5);
                  // Because of dateAddRemove treats 24 hours as different from a
                  // day when working around DST, we need to store them separately
                  this._days = days + weeks * 7;
                  // It is impossible translate months into days without knowing
                  // which months you are are talking about, so we have to store
                  // it separately.
                  this._months = months + years * 12;
                  // The following code bubbles up values, see the tests for
                  // examples of what that means.
                  data.milliseconds = milliseconds % 1000;
                  seconds += absRound(milliseconds / 1000);
                  data.seconds = seconds % 60;
                  minutes += absRound(seconds / 60);
                  data.minutes = minutes % 60;
                  hours += absRound(minutes / 60);
                  data.hours = hours % 24;
                  days += absRound(hours / 24);
                  days += weeks * 7;
                  data.days = days % 30;
                  months += absRound(days / 30);
                  data.months = months % 12;
                  years += absRound(months / 12);
                  data.years = years;
                  return this;

            }
            //##########################################
            // ***************************** Constructor Of Date
            //##########################################
            , PersianDate = function(input) {

                  if (!(this instanceof PersianDate))
                        return new PersianDate(input)

                  // Convert Any thing to Gregorian Date
                  if (isUndefined(input)) {
                        this.gDate = new Date();
                  } else if (isDate(input)) {
                        this.gDate = input;
                  } else if (isArray(input)) {
                        //  Encapsulate Input Array
                        var arrayInput = input.slice();
                        this.gDate = persianArrayToGregorianDate(arrayInput);
                  } else if (isNumber(input)) {
                        this.gDate = new Date(input);
                  } else if ( input instanceof PersianDate) {
                        this.gDate = input.gDate;
                  }
                  // ASP.NET JSON Date
                  else if (input.substring(0, 6) === "/Date(") {
                        this.gDate = new Date(parseInt(input.substr(6)));
                  }
                  this.pDate = toPersianDate(this.gDate);
                  /* Fix IE 8
                   // Some issue appear when valuOf is extended function
                   this.valueOf = function() {
                   return this._valueOf();
                   };
                   */
                  return this;
            };

            Duration.prototype = {
                  weeks : function() {
                        return "Must Implement";
                  },
                  valueOf : function() {
                        return this._milliseconds + this._days * (864e5) + this._months * (2592e6);
                  },
                  humanize : function(withSuffix) {
                        return "Must Implement";
                  }
            };
            PersianDate.prototype = {
                  duration : function(input, key) {
                        var isDuration = this.isDuration(input), isNumber = ( typeof input === 'number'), duration = ( isDuration ? input._data : ( isNumber ? {} : input)), ret;
                        if (isNumber) {
                              if (key) {
                                    duration[key] = input;
                              } else {
                                    duration.milliseconds = input;
                              }
                        }
                        return new Duration(duration);
                  },
                  isDuration : function(obj) {
                        return obj instanceof Duration;
                  },
                  humanize : function() {
                        return "Must Implement";
                  },
                  add : function(key, input) {
                        var d = this.duration(input, key).valueOf(), newUnixDate = this.gDate.valueOf() + d;
                        return new PersianDate(newUnixDate);
                  },
                  subtract : function(key, input) {
                        var d = this.duration(input, key).valueOf(), newUnixDate = this.gDate.valueOf() - d;
                        return new PersianDate(newUnixDate);
                  },
                  formatPersian : "_default",
                  formatNumber : function() {
                        var output;
                        // if default conf dosent set follow golbal config
                        if (this.formatPersian === "_default") {
                              if (window.formatPersian === false) {
                                    output = false;
                              } else {
                                    // Default Conf
                                    output = true;
                              }
                        } else {
                              if (this.formatPersian === true) {
                                    output = true;
                              } else if (this.formatPersian === false) {
                                    output = false;
                              } else {
                                    $.error("Invalid Config 'formatPersian' !!")
                              }
                        }
                        return output;
                  },
                  format : function(inputString) {
                        var self = this, formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DD?D?D?|ddddd|dddd?|do?|w[o|w]?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|zz?|ZZ?|X|LT|ll?l?l?|LL?L?L?)/g, info = {
                              year : self.year(),
                              month : self.month(),
                              hour : self.hours(),
                              minute : self.minutes(),
                              second : self.seconds(),
                              date : self.date(),
                              timezone : self.zone(),
                              unix : self.unix()
                        };
                        function replaceFunction(input) {
                              formatToPersian = self.formatNumber();
                              switch(input) {
                                    // AM/PM
                                    case("a"): {
                                          if (formatToPersian)
                                                return ((info.hour >= 12) ? 'ب ظ' : 'ق ظ');
                                          else
                                                return ((info.hour >= 12) ? 'PM' : 'AM');
                                    }
                                    // Hours (Int)
                                    case("H"): {
                                          if (formatToPersian)
                                                return toPersianDigit(info.hour);
                                          else
                                                return info.hour;
                                    }
                                    case("HH"): {
                                          if (formatToPersian)
                                                return toPersianDigit(leftZeroFill(info.hour, 2));
                                          else
                                                return leftZeroFill(info.hour, 2);
                                    }
                                    case("h"): {
                                          var h = info.hour % 12;
                                          if (formatToPersian)
                                                return toPersianDigit(h);
                                          else
                                                return h;
                                    }
                                    case("hh"): {
                                          var h = info.hour % 12;
                                          if (formatToPersian)
                                                return toPersianDigit(leftZeroFill(h, 2));
                                          else
                                                return leftZeroFill(h, 2);
                                    }
                                    // Minutes
                                    case("m"): {
                                          if (formatToPersian)
                                                return toPersianDigit(info.minute);
                                          else
                                                return info.minute;
                                    }
                                    // Two Digit Minutes
                                    case("mm"): {
                                          if (formatToPersian)
                                                return toPersianDigit(leftZeroFill(info.minute, 2));
                                          else
                                                return leftZeroFill(info.minute, 2);
                                    }
                                    // Second
                                    case("s"): {
                                          if (formatToPersian)
                                                return toPersianDigit(info.second);
                                          else
                                                return info.second;
                                    }
                                    case("ss"): {
                                          if (formatToPersian)
                                                return toPersianDigit(leftZeroFill(info.second, 2));
                                          else
                                                return leftZeroFill(info.second, 2);
                                    }
                                    // Day (Int)
                                    case("D"): {
                                          if (formatToPersian)
                                                return toPersianDigit(leftZeroFill(info.date));
                                          else
                                                return leftZeroFill(info.date);
                                    }
                                    // Return Two Digit
                                    case("DD"): {
                                          if (formatToPersian)
                                                return toPersianDigit(leftZeroFill(info.date, 2));
                                          else
                                                return leftZeroFill(info.date, 2);
                                    }
                                    // Return day Of Year
                                    case("DDD"): {
                                          var t = self.startOf("year")
                                          return self.diff(t, "days");
                                    }
                                    // Return Week Day Full Name
                                    case("DDDD"): {
                                          var t = self.startOf("year")
                                          return leftZeroFill(self.diff(t, "days"), 3);
                                    }
                                    // Return day Of week
                                    case("d"): {
                                          return self.pDate.weekDayNumber;
                                    }
                                    // Return week day name abbr
                                    case("ddd"): {
                                          return weekRange[self.pDate.weekDayNumber].abbr.fa;
                                    }
                                    case("dddd"): {
                                          return weekRange[self.pDate.weekDayNumber].name.fa;
                                    }
                                    // Return Persian Day Name
                                    case("ddddd"): {
                                          return persianDaysName[self.pDate.monthDayNumber]
                                    }
                                    // Return Persian Day Name
                                    case("w"): {
                                          var t = self.startOf("year")
                                          return parseInt(self.diff(t, "days") / 7) + 1;
                                    }
                                    // Return Persian Day Name
                                    case("ww"): {
                                          var t = self.startOf("year")
                                          return leftZeroFill(parseInt(self.diff(t, "days") / 7) + 1, 2);
                                    }
                                    // Month  (Int)
                                    case("M"): {
                                          if (formatToPersian)
                                                return toPersianDigit(info.month);
                                          else
                                                return info.month;
                                    }
                                    // Two Digit Month (Str)
                                    case("MM"): {
                                          if (formatToPersian)
                                                return toPersianDigit(leftZeroFill(info.month, 2));
                                          else
                                                return leftZeroFill(info.month, 2);
                                    }
                                    // Abbr String of Month (Str)
                                    case("MMM"): {
                                          return monthRange[info.month].abbr.fa;
                                    }
                                    // Full String name of Month (Str)
                                    case("MMMM"): {
                                          return monthRange[info.month].name.fa;
                                    }
                                    // Year
                                    // Two Digit Year (Str)
                                    case("YY"): {
                                          var yearDigitArray = info.year.toString().split("");
                                          if (formatToPersian)
                                                return toPersianDigit(yearDigitArray[2] + yearDigitArray[3]);
                                          else
                                                return yearDigitArray[2] + yearDigitArray[3];
                                    }
                                    // Full Year (Int)
                                    case("YYYY"): {
                                          if (formatToPersian)
                                                return toPersianDigit(info.year);
                                          else
                                                return info.year;
                                    }
                                    case("Z"): {
                                          var flag = "+";
                                          var hours = Math.round(info.timezone / 60);
                                          var minutes = info.timezone % 60;
                                          if (minutes < 0) {
                                                minutes *= -1;
                                          }
                                          if (hours < 0) {
                                                flag = "-";
                                                hours *= -1;
                                          }

                                          var z = flag + leftZeroFill(hours, 2) + ":" + leftZeroFill(minutes, 2);
                                          if (formatToPersian)
                                                return toPersianDigit(z)
                                          else
                                                return z;
                                    }
                                    case("ZZ"): {
                                          var flag = "+";
                                          var hours = Math.round(info.timezone / 60);
                                          var minutes = info.timezone % 60;
                                          if (minutes < 0) {
                                                minutes *= -1;
                                          }
                                          if (hours < 0) {
                                                flag = "-";
                                                hours *= -1;
                                          }

                                          var z = flag + leftZeroFill(hours, 2) + "" + leftZeroFill(minutes, 2);
                                          if (formatToPersian)
                                                return toPersianDigit(z)
                                          else
                                                return z;
                                    }
                                    case("X"): {
                                          return self.unix();
                                    }
                                    // 8:30 PM
                                    case("LT"): {
                                          return self.format("h:m a");
                                    }
                                    // 09/04/1986
                                    case("L"): {
                                          return self.format("YYYY/MM/DD");
                                    }
                                    // 9/4/1986
                                    case("l"): {
                                          return self.format("YYYY/M/D");
                                    }
                                    // September 4th 1986
                                    case("LL"): {
                                          return self.format("MMMM DD YYYY");
                                    }
                                    // Sep 4 1986
                                    case("ll"): {
                                          return self.format("MMM DD YYYY");
                                    }
                                    //September 4th 1986 8:30 PM
                                    case("LLL"): {
                                          return self.format("MMMM YYYY DD   h:m  a");
                                    }
                                    // Sep 4 1986 8:30 PM
                                    case("lll"): {
                                          return self.format("MMM YYYY DD   h:m  a");
                                    }
                                    //Thursday, September 4th 1986 8:30 PM
                                    case("LLLL"): {
                                          return self.format("dddd D MMMM YYYY  h:m  a");
                                    }
                                    // Thu, Sep 4 1986 8:30 PM
                                    case("llll"): {
                                          return self.format("ddd D MMM YYYY  h:m  a");
                                    }

                                    default:
                                          return info._d;
                              }
                        }

                        if (inputString) {
                              return inputString.replace(formattingTokens, replaceFunction);
                        } else {
                              var inputString = "YYYY-MM-DD HH:mm:ss a"
                              return inputString.replace(formattingTokens, replaceFunction);
                        }
                  },
                  // Humanize
                  from : function() {
                        return "Must Implement";
                  },
                  fromNow : function() {
                        return "Must Implement";
                  },
                  humanizeDuration : function() {
                        return "Must Implement";
                  },
                  _d : function() {
                        return this.gDate._d;
                  },
                  diff : function(input, val, asFloat) {
                        var self = new PersianDate(this), inputMoment = input,
                        //this._isUTC ? moment(input).utc() : moment(input).local();
                        zoneDiff = 0,
                        //(this.zone() - inputMoment.zone()) * 6e4;
                        diff = self.gDate - inputMoment.gDate - zoneDiff, year = self.year() - inputMoment.year(), month = self.month() - inputMoment.month(), date = (self.date() - inputMoment.date()) * -1, output;
                        if (val === 'months' || val === 'month') {
                              output = year * 12 + month + date / 30;
                        } else if (val === 'years' || val === 'year') {
                              output = year + (month + date / 30) / 12;
                        } else {
                              output = val === 'seconds' || val === 'second' ? diff / 1e3 : // 1000
                              val === 'minutes' || val === 'minute' ? diff / 6e4 : // 1000 * 60
                              val === 'hours' || val === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                              val === 'days' || val === 'day' ? diff / 864e5 : // 1000 * 60 * 60 * 24
                              val === 'weeks' || val === 'week' ? diff / 6048e5 : // 1000 * 60 * 60 * 24 * 7
                              diff;
                        }
                        if (output < 0)
                              output * -1;
                        return asFloat ? output : Math.round(output);
                  },
                  startOf : function(key) {
                        // Simplify this
                        switch(key) {
                              case "years":
                              case "year" :
                                    return new PersianDate([this.year(), 1, 1]);
                              case "months":
                              case "month":
                                    return new PersianDate([this.year(), this.month(), 1]);
                              case "days" :
                              case "day" :
                                    return new PersianDate([this.year(), this.month(), this.date(), 0, 0, 0]);
                              case "hours" :
                              case "hour" :
                                    return new PersianDate([this.year(), this.month(), this.date(), this.hours(), 0, 0]);
                              case "minutes":
                              case "minute":
                                    return new PersianDate([this.year(), this.month(), this.date(), this.hours(), this.minutes(), 0]);
                              case "seconds":
                              case "second":
                                    return new PersianDate([this.year(), this.month(), this.date(), this.hours(), this.minutes(), this.seconds()]);
                              case "weeks":
                              case "week":
                                    var weekDayNumber = this.pDate.weekDayNumber;
                                    if (weekDayNumber === 0) {
                                          return new PersianDate([this.year(), this.month(), this.date()]);
                                    } else {
                                          return new PersianDate([this.year(), this.month(), this.date()]).subtract("days", weekDayNumber);
                                    }
                              default:
                                    return this;
                        }
                  },
                  endOf : function(key) {
                        // Simplify this
                        switch(key) {
                              case "years":
                              case "year":
                                    var days = this.isLeapYear() ? 30 : 29;
                                    return new PersianDate([this.year(), 12, days, 23, 59, 59]);
                              case "months":
                              case "month":
                                    var monthDays = this.daysInMonth(this.year(), this.month());
                                    return new PersianDate([this.year(), this.month(), monthDays, 23, 59, 59]);
                              case "days" :
                              case "day" :
                                    return new PersianDate([this.year(), this.month(), this.date(), 23, 59, 59]);
                              case "hours" :
                              case "hour" :
                                    return new PersianDate([this.year(), this.month(), this.date(), this.hours(), 59, 59]);
                              case "minutes":
                              case "minute":
                                    return new PersianDate([this.year(), this.month(), this.date(), this.hours(), this.minutes(), 59]);
                              case "seconds":
                              case "second":
                                    return new PersianDate([this.year(), this.month(), this.date(), this.hours(), this.minutes(), this.seconds()]);
                              case "weeks":
                              case "week":
                                    var weekDayNumber = this.pDate.weekDayNumber;
                                    if (weekDayNumber === 6) {
                                          weekDayNumber = 7;
                                    } else {
                                          weekDayNumber = 6 - weekDayNumber;
                                    }
                                    return new PersianDate([this.year(), this.month(), this.date()]).add("days", weekDayNumber);
                              default:
                                    return this;
                        }
                  },
                  sod : function() {
                        return this.startOf("day");
                  },
                  eod : function() {
                        return this.endOf("day");
                  },
                  // Get the timezone offset in minutes.
                  zone : function() {
                        return this.pDate.timeZoneOffset;
                  },
                  _utcMode : false,
                  local : function() {
                        if (!this._utcMode) {
                              return this;
                        } else {
                              var offsetMils = this.pDate.timeZoneOffset * 60 * 1000;
                              if (this.pDate.timeZoneOffset < 0) {
                                    var utcStamp = this.valueOf() - offsetMils;
                              } else {
                                    var utcStamp = this.valueOf() + offsetMils;
                              }
                              this.gDate = new Date(utcStamp);
                              this._updatePDate();
                              this._utcMode = false;
                              return this;
                        }
                  },
                  // current date/time in UTC mode
                  utc : function(input) {
                        if (input) {
                              return new persianDate(input).utc();
                        }
                        if (this._utcMode) {
                              return this;
                        } else {
                              var offsetMils = this.pDate.timeZoneOffset * 60 * 1000;
                              if (this.pDate.timeZoneOffset < 0) {
                                    var utcStamp = this.valueOf() + offsetMils;
                              } else {
                                    var utcStamp = this.valueOf() - offsetMils;
                              }
                              this.gDate = new Date(utcStamp);
                              this._updatePDate();
                              this._utcMode = true;
                              return this;
                        }
                  },
                  isUtc : function() {
                        return this._utcMode;
                  },
                  // version 0.0.1
                  isDST : function() {
                        // Just Iran Day light saving time
                        var output = false;
                        if (this.month() >= 1 && this.month() <= 6) {
                              output = true;
                              switch(this.month()) {
                                    case(1):
                                          if (this.date() < 2) {
                                                output = false
                                          };
                                          break;
                                    case(6):
                                          if (this.date() > 30) {
                                                output = false
                                          };
                                          break;
                              }
                        };
                        return output;
                  },
                  isLeapYear : function() {
                        return isLeapPersian(this.year());
                  },
                  daysInMonth : function(yearInput, monthInput) {
                        var year = yearInput ? yearInput : this.year();
                        var month = monthInput ? monthInput : this.month();
                        if (month < 1 || month > 12)
                              return 0;
                        if (month < 7)
                              return 31;
                        if (month < 12)
                              return 30;
                        if (isLeapPersian(year))
                              return 30;
                        return 29;
                  },
                  // return Native Javascript Date
                  toDate : function() {
                        return this.gDate;
                  },
                  // return Array Of Persian Date
                  toArray : function() {
                        return [this.year(), this.month(), this.day(), this.hour(), this.minute(), this.second(), this.millisecond()];
                  },
                  // Return Milliseconds since the Unix Epoch (1318874398806)
                  _valueOf : function() {
                        return this.gDate.valueOf();
                  },
                  // Return Unix Timestamp (1318874398)
                  unix : function(timestamp) {
                        if (timestamp) {
                              return new persianDate(timestamp * 1000);
                        } else {
                              var str = this.gDate.valueOf().toString();
                              output = str.substring(0, str.length - 3);
                        }
                        return parseInt(output);
                  },
                  isPersianDate : function(obj) {
                        return obj instanceof PersianDate;
                  },
                  // -------------------------------------- Getter Setter
                  millisecond : function(input) {
                        return this.milliseconds(input)
                  },
                  milliseconds : function(input) {
                        if (input) {
                              this.gDate.setMilliseconds(input);
                              this._updatePDate();
                              return this;
                        } else {
                              return this.pDate.milliseconds;
                        }
                  },
                  second : function(input) {
                        return this.seconds(input);

                  },
                  seconds : function(input) {
                        if (input | input === 0) {
                              this.gDate.setSeconds(input);
                              this._updatePDate();
                              return this;
                        } else {
                              return this.pDate.seconds;
                        }
                  },
                  minute : function(input) {
                        return this.minutes(input);
                  },
                  minutes : function(input) {
                        if (input || input === 0) {
                              this.gDate.setMinutes(input);
                              this._updatePDate();
                              return this;
                        } else {
                              return this.pDate.minutes;
                        }
                  },
                  hour : function(input) {
                        return this.hours(input)
                  },
                  hours : function(input) {
                        if (input | input === 0) {
                              this.gDate.setHours(input);
                              this._updatePDate();
                              return this;
                        } else {
                              return this.pDate.hours;
                        }
                  },
                  // Day of Months
                  dates : function(input) {
                        return this.date(input)
                  },
                  date : function(input) {
                        if (input | input == 0) {
                              var pDateArray = getPersianArrayFromPDate(this.pDate);
                              pDateArray[2] = input;
                              this.gDate = persianArrayToGregorianDate(pDateArray);
                              this._updatePDate();
                              return this;
                        } else {
                              return this.pDate.date;
                        }
                  },
                  // DAy of week
                  days : function() {
                        return this.day();
                  },
                  day : function() {
                        return this.pDate.day + 1;
                  },
                  month : function(input) {
                        if (input | input === 0) {
                              var pDateArray = getPersianArrayFromPDate(this.pDate);
                              pDateArray[1] = input;
                              this.gDate = persianArrayToGregorianDate(pDateArray);
                              this._updatePDate();
                              return this;
                        } else {
                              return this.pDate.month;
                        }
                  },
                  years : function(input) {
                        return this.year(input);
                  },
                  year : function(input) {
                        if (input | input === 0) {
                              var pDateArray = getPersianArrayFromPDate(this.pDate);
                              pDateArray[0] = input;
                              this.gDate = persianArrayToGregorianDate(pDateArray);
                              this._updatePDate();
                              return this;
                        } else {
                              return this.pDate.year;
                        }
                  },
                  getFirstWeekDayOfMonth : function(year, month) {
                        var dateArray = calcPersian(year, month, 1), pdate = calcGregorian(dateArray[0], dateArray[1], dateArray[2]);
                        if (pdate[3] + 2 === 8) {
                              return 1;
                        } else if (pdate[3] + 2 === 7) {
                              return 7;
                        } else {
                              return pdate[3] + 2;
                        }
                  },
                  clone : function() {
                        var self = this;
                        return new PersianDate(self.gDate);
                  },
                  version : "0.1.7",
                  _updatePDate : function() {
                        this.pDate = toPersianDate(this.gDate);
                  },
                  valueOf : function() {
                        return this._valueOf();
                  }
            };
            persianDate = PersianDate;
            pDate = PersianDate;
            persianDate.unix = persianDate.prototype.unix;
            persianDate.utc = persianDate.prototype.utc;
            //for(i in persianDate.prototype){persianDate[i] = persianDate.prototype[i]}

      }());
