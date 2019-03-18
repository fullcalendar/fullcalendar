/*!
@fullcalendar/rrule v4.0.1
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rrule'), require('@fullcalendar/core')) :
    typeof define === 'function' && define.amd ? define(['exports', 'rrule', '@fullcalendar/core'], factory) :
    (global = global || self, factory(global.FullCalendarRrule = {}, global.rrule, global.FullCalendar));
}(this, function (exports, rrule, core) { 'use strict';

    /*! *****************************************************************************
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

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    var EVENT_DEF_PROPS = {
        rrule: null,
        duration: core.createDuration
    };
    var recurring = {
        parse: function (rawEvent, allDayDefault, leftoverProps, dateEnv) {
            if (rawEvent.rrule != null) {
                var props = core.refineProps(rawEvent, EVENT_DEF_PROPS, {}, leftoverProps);
                var parsed = parseRRule(props.rrule, allDayDefault, dateEnv);
                if (parsed) {
                    return {
                        allDay: parsed.allDay,
                        duration: props.duration,
                        typeData: parsed.rrule
                    };
                }
            }
            return null;
        },
        expand: function (rrule, eventDef, framingRange) {
            return rrule.between(framingRange.start, framingRange.end);
        }
    };
    var main = core.createPlugin({
        recurringTypes: [recurring]
    });
    function parseRRule(input, allDayDefault, dateEnv) {
        if (typeof input === 'string') {
            return {
                rrule: rrule.rrulestr(input),
                allDay: false
            };
        }
        else if (typeof input === 'object' && input) { // non-null object
            var refined = __assign({}, input); // copy
            var allDay = allDayDefault;
            if (typeof refined.dtstart === 'string') {
                var dtstartMeta = dateEnv.createMarkerMeta(refined.dtstart);
                if (dtstartMeta) {
                    refined.dtstart = dtstartMeta.marker;
                    allDay = dtstartMeta.isTimeUnspecified;
                }
                else {
                    delete refined.dtstart;
                }
            }
            if (typeof refined.until === 'string') {
                refined.until = dateEnv.createMarker(refined.until);
            }
            if (refined.freq != null) {
                refined.freq = convertConstant(refined.freq);
            }
            if (refined.wkst != null) {
                refined.wkst = convertConstant(refined.wkst);
            }
            else {
                refined.wkst = (dateEnv.weekDow - 1 + 7) % 7; // convert Sunday-first to Monday-first
            }
            if (refined.byweekday != null) {
                refined.byweekday = convertConstants(refined.byweekday); // the plural version
            }
            if (allDay == null) { // if not specific event after allDayDefault
                allDay = true;
            }
            return {
                rrule: new rrule.RRule(refined),
                allDay: allDay
            };
        }
        return null;
    }
    function convertConstants(input) {
        if (Array.isArray(input)) {
            return input.map(convertConstant);
        }
        return convertConstant(input);
    }
    function convertConstant(input) {
        if (typeof input === 'string') {
            return rrule.RRule[input.toUpperCase()];
        }
        return input;
    }

    exports.default = main;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
