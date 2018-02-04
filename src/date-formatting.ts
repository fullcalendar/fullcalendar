import {
  default as momentExt,
  newMomentProto,
  oldMomentProto,
  oldMomentFormat
} from './moment-ext'


// Plugin
// -------------------------------------------------------------------------------------------------

newMomentProto.format = function() {

  if (this._fullCalendar && arguments[0]) { // an enhanced moment? and a format string provided?
    return formatDate(this, arguments[0]) // our extended formatting
  }
  if (this._ambigTime) {
    return oldMomentFormat(englishMoment(this), 'YYYY-MM-DD')
  }
  if (this._ambigZone) {
    return oldMomentFormat(englishMoment(this), 'YYYY-MM-DD[T]HH:mm:ss')
  }
  if (this._fullCalendar) { // enhanced non-ambig moment?
    // moment.format() doesn't ensure english, but we want to.
    return oldMomentFormat(englishMoment(this))
  }

  return oldMomentProto.format.apply(this, arguments)
}

newMomentProto.toISOString = function() {

  if (this._ambigTime) {
    return oldMomentFormat(englishMoment(this), 'YYYY-MM-DD')
  }
  if (this._ambigZone) {
    return oldMomentFormat(englishMoment(this), 'YYYY-MM-DD[T]HH:mm:ss')
  }
  if (this._fullCalendar) { // enhanced non-ambig moment?
    // depending on browser, moment might not output english. ensure english.
    // https://github.com/moment/moment/blob/2.18.1/src/lib/moment/format.js#L22
    return oldMomentProto.toISOString.apply(englishMoment(this), arguments)
  }

  return oldMomentProto.toISOString.apply(this, arguments)
}

function englishMoment(mom) {
  if (mom.locale() !== 'en') {
    return mom.clone().locale('en')
  }
  return mom
}


// Config
// ---------------------------------------------------------------------------------------------------------------------

/*
Inserted between chunks in the fake ("intermediate") formatting string.
Important that it passes as whitespace (\s) because moment often identifies non-standalone months
via a regexp with an \s.
*/
let PART_SEPARATOR = '\u000b' // vertical tab

/*
Inserted as the first character of a literal-text chunk to indicate that the literal text is not actually literal text,
but rather, a "special" token that has custom rendering (see specialTokens map).
*/
let SPECIAL_TOKEN_MARKER = '\u001f' // information separator 1

/*
Inserted at the beginning and end of a span of text that must have non-zero numeric characters.
Handling of these markers is done in a post-processing step at the very end of text rendering.
*/
let MAYBE_MARKER = '\u001e' // information separator 2
let MAYBE_REGEXP = new RegExp(MAYBE_MARKER + '([^' + MAYBE_MARKER + ']*)' + MAYBE_MARKER, 'g') // must be global

/*
Addition formatting tokens we want recognized
*/
let specialTokens = {
  t: function(date) { // "a" or "p"
    return oldMomentFormat(date, 'a').charAt(0)
  },
  T: function(date) { // "A" or "P"
    return oldMomentFormat(date, 'A').charAt(0)
  }
}

/*
The first characters of formatting tokens for units that are 1 day or larger.
`value` is for ranking relative size (lower means bigger).
`unit` is a normalized unit, used for comparing moments.
*/
let largeTokenMap = {
  Y: { value: 1, unit: 'year' },
  M: { value: 2, unit: 'month' },
  W: { value: 3, unit: 'week' }, // ISO week
  w: { value: 3, unit: 'week' }, // local week
  D: { value: 4, unit: 'day' }, // day of month
  d: { value: 4, unit: 'day' } // day of week
}


// Single Date Formatting
// ---------------------------------------------------------------------------------------------------------------------

/*
Formats `date` with a Moment formatting string, but allow our non-zero areas and special token
*/
export function formatDate(date, formatStr) {
  return renderFakeFormatString(
    getParsedFormatString(formatStr).fakeFormatString,
    date
  )
}


// Date Range Formatting
// -------------------------------------------------------------------------------------------------
// TODO: make it work with timezone offset

/*
Using a formatting string meant for a single date, generate a range string, like
"Sep 2 - 9 2013", that intelligently inserts a separator where the dates differ.
If the dates are the same as far as the format string is concerned, just return a single
rendering of one date, without any separator.
*/
export function formatRange(date1, date2, formatStr, separator, isRTL) {
  let localeData

  date1 = momentExt.parseZone(date1)
  date2 = momentExt.parseZone(date2)

  localeData = date1.localeData()

  // Expand localized format strings, like "LL" -> "MMMM D YYYY".
  // BTW, this is not important for `formatDate` because it is impossible to put custom tokens
  // or non-zero areas in Moment's localized format strings.
  formatStr = localeData.longDateFormat(formatStr) || formatStr

  return renderParsedFormat(
    getParsedFormatString(formatStr),
    date1,
    date2,
    separator || ' - ',
    isRTL
  )
}

/*
Renders a range with an already-parsed format string.
*/
function renderParsedFormat(parsedFormat, date1, date2, separator, isRTL) {
  let sameUnits = parsedFormat.sameUnits
  let unzonedDate1 = date1.clone().stripZone() // for same-unit comparisons
  let unzonedDate2 = date2.clone().stripZone() // "

  let renderedParts1 = renderFakeFormatStringParts(parsedFormat.fakeFormatString, date1)
  let renderedParts2 = renderFakeFormatStringParts(parsedFormat.fakeFormatString, date2)

  let leftI
  let leftStr = ''
  let rightI
  let rightStr = ''
  let middleI
  let middleStr1 = ''
  let middleStr2 = ''
  let middleStr = ''

  // Start at the leftmost side of the formatting string and continue until you hit a token
  // that is not the same between dates.
  for (
    leftI = 0;
    leftI < sameUnits.length && (!sameUnits[leftI] || unzonedDate1.isSame(unzonedDate2, sameUnits[leftI]));
    leftI++
  ) {
    leftStr += renderedParts1[leftI]
  }

  // Similarly, start at the rightmost side of the formatting string and move left
  for (
    rightI = sameUnits.length - 1;
    rightI > leftI && (!sameUnits[rightI] || unzonedDate1.isSame(unzonedDate2, sameUnits[rightI]));
    rightI--
  ) {
    // If current chunk is on the boundary of unique date-content, and is a special-case
    // date-formatting postfix character, then don't consume it. Consider it unique date-content.
    // TODO: make configurable
    if (rightI - 1 === leftI && renderedParts1[rightI] === '.') {
      break
    }

    rightStr = renderedParts1[rightI] + rightStr
  }

  // The area in the middle is different for both of the dates.
  // Collect them distinctly so we can jam them together later.
  for (middleI = leftI; middleI <= rightI; middleI++) {
    middleStr1 += renderedParts1[middleI]
    middleStr2 += renderedParts2[middleI]
  }

  if (middleStr1 || middleStr2) {
    if (isRTL) {
      middleStr = middleStr2 + separator + middleStr1
    } else {
      middleStr = middleStr1 + separator + middleStr2
    }
  }

  return processMaybeMarkers(
    leftStr + middleStr + rightStr
  )
}


// Format String Parsing
// ---------------------------------------------------------------------------------------------------------------------

let parsedFormatStrCache = {}

/*
Returns a parsed format string, leveraging a cache.
*/
function getParsedFormatString(formatStr) {
  return parsedFormatStrCache[formatStr] ||
    (parsedFormatStrCache[formatStr] = parseFormatString(formatStr))
}

/*
Parses a format string into the following:
- fakeFormatString: a momentJS formatting string, littered with special control characters that get post-processed.
- sameUnits: for every part in fakeFormatString, if the part is a token, the value will be a unit string (like "day"),
  that indicates how similar a range's start & end must be in order to share the same formatted text.
  If not a token, then the value is null.
  Always a flat array (not nested liked "chunks").
*/
function parseFormatString(formatStr) {
  let chunks = chunkFormatString(formatStr)

  return {
    fakeFormatString: buildFakeFormatString(chunks),
    sameUnits: buildSameUnits(chunks)
  }
}

/*
Break the formatting string into an array of chunks.
A 'maybe' chunk will have nested chunks.
*/
function chunkFormatString(formatStr) {
  let chunks = []
  let match

  // TODO: more descrimination
  // \4 is a backreference to the first character of a multi-character set.
  let chunker = /\[([^\]]*)\]|\(([^\)]*)\)|(LTS|LT|(\w)\4*o?)|([^\w\[\(]+)/g

  while ((match = chunker.exec(formatStr))) {
    if (match[1]) { // a literal string inside [ ... ]
      chunks.push.apply(chunks, // append
        splitStringLiteral(match[1])
      )
    } else if (match[2]) { // non-zero formatting inside ( ... )
      chunks.push({ maybe: chunkFormatString(match[2]) })
    } else if (match[3]) { // a formatting token
      chunks.push({ token: match[3] })
    } else if (match[5]) { // an unenclosed literal string
      chunks.push.apply(chunks, // append
        splitStringLiteral(match[5])
      )
    }
  }

  return chunks
}

/*
Potentially splits a literal-text string into multiple parts. For special cases.
*/
function splitStringLiteral(s) {
  if (s === '. ') {
    return [ '.', ' ' ] // for locales with periods bound to the end of each year/month/date
  } else {
    return [ s ]
  }
}

/*
Given chunks parsed from a real format string, generate a fake (aka "intermediate") format string with special control
characters that will eventually be given to moment for formatting, and then post-processed.
*/
function buildFakeFormatString(chunks) {
  let parts = []
  let i
  let chunk

  for (i = 0; i < chunks.length; i++) {
    chunk = chunks[i]

    if (typeof chunk === 'string') {
      parts.push('[' + chunk + ']')
    } else if (chunk.token) {
      if (chunk.token in specialTokens) {
        parts.push(
          SPECIAL_TOKEN_MARKER + // useful during post-processing
          '[' + chunk.token + ']' // preserve as literal text
        )
      } else {
        parts.push(chunk.token) // unprotected text implies a format string
      }
    } else if (chunk.maybe) {
      parts.push(
        MAYBE_MARKER + // useful during post-processing
        buildFakeFormatString(chunk.maybe) +
        MAYBE_MARKER
      )
    }
  }

  return parts.join(PART_SEPARATOR)
}

/*
Given parsed chunks from a real formatting string, generates an array of unit strings (like "day") that indicate
in which regard two dates must be similar in order to share range formatting text.
The `chunks` can be nested (because of "maybe" chunks), however, the returned array will be flat.
*/
function buildSameUnits(chunks) {
  let units = []
  let i
  let chunk
  let tokenInfo

  for (i = 0; i < chunks.length; i++) {
    chunk = chunks[i]

    if (chunk.token) {
      tokenInfo = largeTokenMap[chunk.token.charAt(0)]
      units.push(tokenInfo ? tokenInfo.unit : 'second') // default to a very strict same-second
    } else if (chunk.maybe) {
      units.push.apply(units, // append
        buildSameUnits(chunk.maybe)
      )
    } else {
      units.push(null)
    }
  }

  return units
}


// Rendering to text
// ---------------------------------------------------------------------------------------------------------------------

/*
Formats a date with a fake format string, post-processes the control characters, then returns.
*/
function renderFakeFormatString(fakeFormatString, date) {
  return processMaybeMarkers(
    renderFakeFormatStringParts(fakeFormatString, date).join('')
  )
}

/*
Formats a date into parts that will have been post-processed, EXCEPT for the "maybe" markers.
*/
function renderFakeFormatStringParts(fakeFormatString, date) {
  let parts = []
  let fakeRender = oldMomentFormat(date, fakeFormatString)
  let fakeParts = fakeRender.split(PART_SEPARATOR)
  let i
  let fakePart

  for (i = 0; i < fakeParts.length; i++) {
    fakePart = fakeParts[i]

    if (fakePart.charAt(0) === SPECIAL_TOKEN_MARKER) {
      parts.push(
        // the literal string IS the token's name.
        // call special token's registered function.
        specialTokens[fakePart.substring(1)](date)
      )
    } else {
      parts.push(fakePart)
    }
  }

  return parts
}

/*
Accepts an almost-finally-formatted string and processes the "maybe" control characters, returning a new string.
*/
function processMaybeMarkers(s) {
  return s.replace(MAYBE_REGEXP, function(m0, m1) { // regex assumed to have 'g' flag
    if (m1.match(/[1-9]/)) { // any non-zero numeric characters?
      return m1
    } else {
      return ''
    }
  })
}


// Misc Utils
// -------------------------------------------------------------------------------------------------

/*
Returns a unit string, either 'year', 'month', 'day', or null for the most granular formatting token in the string.
*/
export function queryMostGranularFormatUnit(formatStr) {
  let chunks = chunkFormatString(formatStr)
  let i
  let chunk
  let candidate
  let best

  for (i = 0; i < chunks.length; i++) {
    chunk = chunks[i]

    if (chunk.token) {
      candidate = largeTokenMap[chunk.token.charAt(0)]
      if (candidate) {
        if (!best || candidate.value > best.value) {
          best = candidate
        }
      }
    }
  }

  if (best) {
    return best.unit
  }

  return null
}
