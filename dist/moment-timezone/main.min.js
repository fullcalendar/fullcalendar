/*!
FullCalendar Moment Timezone Plugin v4.2.0
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports,require("moment"),require("moment-timezone/builds/moment-timezone-with-data"),require("@fullcalendar/core")):"function"==typeof define&&define.amd?define(["exports","moment","moment-timezone/builds/moment-timezone-with-data","@fullcalendar/core"],t):(e=e||self,t(e.FullCalendarMomentTimezone={},e.moment,e.moment,e.FullCalendar))}(this,function(e,t,n,o){"use strict";function r(e,t){function n(){this.constructor=e}i(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}t=t&&t.hasOwnProperty("default")?t.default:t;/*! *****************************************************************************
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
var i=function(e,t){return(i=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},u=function(e){function n(){return null!==e&&e.apply(this,arguments)||this}return r(n,e),n.prototype.offsetForArray=function(e){return t.tz(e,this.timeZoneName).utcOffset()},n.prototype.timestampToArray=function(e){return t.tz(e,this.timeZoneName).toArray()},n}(o.NamedTimeZoneImpl),m=o.createPlugin({namedTimeZonedImpl:u});e.default=m,Object.defineProperty(e,"__esModule",{value:!0})});