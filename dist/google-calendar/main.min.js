/*!
FullCalendar Google Calendar Plugin v4.0.2
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/
!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?r(exports,require("@fullcalendar/core")):"function"==typeof define&&define.amd?define(["exports","@fullcalendar/core"],r):(e=e||self,r(e.FullCalendarGoogleCalendar={},e.FullCalendar))}(this,function(e,r){"use strict";function t(e){var r;return/^[^\/]+@([^\/\.]+\.)*(google|googlemail|gmail)\.com$/.test(e)?e:(r=/^https:\/\/www.googleapis.com\/calendar\/v3\/calendars\/([^\/]*)/.exec(e))||(r=/^https?:\/\/www.google.com\/calendar\/feeds\/([^\/]*)/.exec(e))?decodeURIComponent(r[1]):void 0}function n(e){return s+"/"+encodeURIComponent(e.googleCalendarId)+"/events"}function o(e,t,n,o){var a,l,i;return o.canComputeOffset?(l=o.formatIso(e.start),i=o.formatIso(e.end)):(l=r.addDays(e.start,-1).toISOString(),i=r.addDays(e.end,1).toISOString()),a=d({},n||{},{key:t,timeMin:l,timeMax:i,singleEvents:!0,maxResults:9999}),"local"!==o.timeZone&&(a.timeZone=o.timeZone),a}function a(e,r){return e.map(function(e){return l(e,r)})}function l(e,r){var t=e.htmlLink||null;return t&&r&&(t=i(t,"ctz="+r)),{id:e.id,title:e.summary,start:e.start.dateTime||e.start.date,end:e.end.dateTime||e.end.date,url:t,location:e.location,description:e.description}}function i(e,r){return e.replace(/(\?.*?)?(#|$)/,function(e,t,n){return(t?t+"&":"?")+r+n})}/*! *****************************************************************************
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
var d=function(){return d=Object.assign||function(e){for(var r,t=1,n=arguments.length;t<n;t++){r=arguments[t];for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&(e[o]=r[o])}return e},d.apply(this,arguments)},s="https://www.googleapis.com/calendar/v3/calendars",c={url:String,googleCalendarApiKey:String,googleCalendarId:String,data:null},u={parseMeta:function(e){if("string"==typeof e&&(e={url:e}),"object"==typeof e){var n=r.refineProps(e,c);if(!n.googleCalendarId&&n.url&&(n.googleCalendarId=t(n.url)),delete n.url,n.googleCalendarId)return n}return null},fetch:function(e,t,l){var i=e.calendar,d=e.eventSource.meta,s=d.googleCalendarApiKey||i.opt("googleCalendarApiKey");if(s){var c=n(d),u=o(e.range,s,d.data,i.dateEnv);r.requestJson("GET",c,u,function(e,r){e.error?l({message:"Google Calendar API: "+e.error.message,errors:e.error.errors,xhr:r}):t({rawEvents:a(e.items,u.timeZone),xhr:r})},function(e,r){l({message:e,xhr:r})})}else l({message:"Specify a googleCalendarApiKey. See http://fullcalendar.io/docs/google_calendar/"})}},g=r.createPlugin({eventSourceDefs:[u]});e.default=g,Object.defineProperty(e,"__esModule",{value:!0})});