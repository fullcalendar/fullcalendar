/*!
FullCalendar RRule Plugin v4.0.2
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/
!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?r(exports,require("rrule"),require("@fullcalendar/core")):"function"==typeof define&&define.amd?define(["exports","rrule","@fullcalendar/core"],r):(e=e||self,r(e.FullCalendarRrule={},e.rrule,e.FullCalendar))}(this,function(e,r,t){"use strict";function n(e,t){var n,i=null;if("string"==typeof e)n=r.rrulestr(e);else if("object"==typeof e&&e){var f=a({},e);if("string"==typeof f.dtstart){var o=t.createMarkerMeta(f.dtstart);o?(f.dtstart=o.marker,i=o.isTimeUnspecified):delete f.dtstart}"string"==typeof f.until&&(f.until=t.createMarker(f.until)),null!=f.freq&&(f.freq=l(f.freq)),null!=f.wkst?f.wkst=l(f.wkst):f.wkst=(t.weekDow-1+7)%7,null!=f.byweekday&&(f.byweekday=u(f.byweekday)),n=new r.RRule(f)}return n?{rrule:n,allDayGuess:i}:null}function u(e){return Array.isArray(e)?e.map(l):l(e)}function l(e){return"string"==typeof e?r.RRule[e.toUpperCase()]:e}/*! *****************************************************************************
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
var a=function(){return a=Object.assign||function(e){for(var r,t=1,n=arguments.length;t<n;t++){r=arguments[t];for(var u in r)Object.prototype.hasOwnProperty.call(r,u)&&(e[u]=r[u])}return e},a.apply(this,arguments)},i={rrule:null,duration:t.createDuration},f={parse:function(e,r,u){if(null!=e.rrule){var l=t.refineProps(e,i,{},r),a=n(l.rrule,u);if(a)return{typeData:a.rrule,allDayGuess:a.allDayGuess,duration:l.duration}}return null},expand:function(e,r){return e.between(r.start,r.end,!0).filter(function(e){return e.valueOf()<r.end.valueOf()})}},o=t.createPlugin({recurringTypes:[f]});e.default=o,Object.defineProperty(e,"__esModule",{value:!0})});