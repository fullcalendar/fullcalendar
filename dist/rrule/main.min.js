/*!
@fullcalendar/rrule v4.0.1
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/
!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?r(exports,require("rrule"),require("@fullcalendar/core")):"function"==typeof define&&define.amd?define(["exports","rrule","@fullcalendar/core"],r):(e=e||self,r(e.FullCalendarRrule={},e.rrule,e.FullCalendar))}(this,function(e,r,t){"use strict";function n(e,t,n){if("string"==typeof e)return{rrule:r.rrulestr(e),allDay:!1};if("object"==typeof e&&e){var i=a({},e),o=t;if("string"==typeof i.dtstart){var f=n.createMarkerMeta(i.dtstart);f?(i.dtstart=f.marker,o=f.isTimeUnspecified):delete i.dtstart}return"string"==typeof i.until&&(i.until=n.createMarker(i.until)),null!=i.freq&&(i.freq=u(i.freq)),null!=i.wkst?i.wkst=u(i.wkst):i.wkst=(n.weekDow-1+7)%7,null!=i.byweekday&&(i.byweekday=l(i.byweekday)),null==o&&(o=!0),{rrule:new r.RRule(i),allDay:o}}return null}function l(e){return Array.isArray(e)?e.map(u):u(e)}function u(e){return"string"==typeof e?r.RRule[e.toUpperCase()]:e}/*! *****************************************************************************
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
var a=function(){return a=Object.assign||function(e){for(var r,t=1,n=arguments.length;t<n;t++){r=arguments[t];for(var l in r)Object.prototype.hasOwnProperty.call(r,l)&&(e[l]=r[l])}return e},a.apply(this,arguments)},i={rrule:null,duration:t.createDuration},o={parse:function(e,r,l,u){if(null!=e.rrule){var a=t.refineProps(e,i,{},l),o=n(a.rrule,r,u);if(o)return{allDay:o.allDay,duration:a.duration,typeData:o.rrule}}return null},expand:function(e,r,t){return e.between(t.start,t.end)}},f=t.createPlugin({recurringTypes:[o]});e.default=f,Object.defineProperty(e,"__esModule",{value:!0})});