/*!
FullCalendar Luxon Plugin v4.2.0
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports,require("luxon"),require("@fullcalendar/core")):"function"==typeof define&&define.amd?define(["exports","luxon","@fullcalendar/core"],t):(e=e||self,t(e.FullCalendarLuxon={},e.luxon,e.FullCalendar))}(this,function(e,t,n){"use strict";function o(e,t){function n(){this.constructor=e}f(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}function r(e,o){if(!(o instanceof n.Calendar))throw new Error("must supply a Calendar instance");return t.DateTime.fromJSDate(e,{zone:o.dateEnv.timeZone,locale:o.dateEnv.locale.codes[0]})}function a(e,o){if(!(o instanceof n.Calendar))throw new Error("must supply a Calendar instance");return t.Duration.fromObject(m({},e,{locale:o.dateEnv.locale.codes[0]}))}function i(e,t){var n=c(e);if(t.end){var o=u(t.start.array,t.timeZone,t.localeCodes[0]),r=u(t.end.array,t.timeZone,t.localeCodes[0]);return d(n,o.toFormat.bind(o),r.toFormat.bind(r),t.separator)}return u(t.date.array,t.timeZone,t.localeCodes[0]).toFormat(n.whole)}function l(e){return[e.year,e.month-1,e.day,e.hour,e.minute,e.second,e.millisecond]}function u(e,n,o){return t.DateTime.fromObject({zone:n,locale:o,year:e[0],month:e[1]+1,day:e[2],hour:e[3],minute:e[4],second:e[5],millisecond:e[6]})}function c(e){var t=e.match(/^(.*?)\{(.*)\}(.*)$/);if(t){var n=c(t[2]);return{head:t[1],middle:n,tail:t[3],whole:t[1]+n.whole+t[3]}}return{head:null,middle:null,tail:null,whole:e}}function d(e,t,n,o){if(e.middle){var r=t(e.head),a=d(e.middle,t,n,o),i=t(e.tail),l=n(e.head),u=d(e.middle,t,n,o),c=n(e.tail);if(r===l&&i===c)return r+(a===u?a:a+o+u)+i}return t(e.whole)+o+n(e.whole)}/*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
var f=function(e,t){return(f=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},m=function(){return m=Object.assign||function(e){for(var t,n=1,o=arguments.length;n<o;n++){t=arguments[n];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e},m.apply(this,arguments)},s=function(e){function n(){return null!==e&&e.apply(this,arguments)||this}return o(n,e),n.prototype.offsetForArray=function(e){return u(e,this.timeZoneName).offset},n.prototype.timestampToArray=function(e){return l(t.DateTime.fromMillis(e,{zone:this.timeZoneName}))},n}(n.NamedTimeZoneImpl),p=n.createPlugin({cmdFormatter:i,namedTimeZonedImpl:s});e.default=p,e.toDateTime=r,e.toDuration=a,Object.defineProperty(e,"__esModule",{value:!0})});