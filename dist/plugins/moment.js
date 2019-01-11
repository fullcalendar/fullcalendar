/*!
 * FullCalendar v4.0.0-alpha.4
 * Docs & License: https://fullcalendar.io/
 * (c) 2018 Adam Shaw
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("fullcalendar"), require("moment"));
	else if(typeof define === 'function' && define.amd)
		define(["fullcalendar", "moment"], factory);
	else if(typeof exports === 'object')
		factory(require("fullcalendar"), require("moment"));
	else
		factory(root["FullCalendar"], root["moment"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_71__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 230);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),

/***/ 230:
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var moment = __webpack_require__(71);
var fc = __webpack_require__(0);
function toMoment(date, calendar) {
    if (!(calendar instanceof fc.Calendar)) {
        throw new Error('must supply a Calendar instance');
    }
    return convertToMoment(date, calendar.dateEnv.timeZone, null, calendar.dateEnv.locale.codes[0]);
}
exports.toMoment = toMoment;
function toDuration(fcDuration) {
    return moment.duration(fcDuration); // momment accepts all the props that fc.Duration already has!
}
exports.toDuration = toDuration;
// for browser globals. TODO: better solution
fc.Moment = {
    toMoment: toMoment,
    toDuration: toDuration
};
fc.registerCmdFormatter('moment', function (cmdStr, arg) {
    var cmd = parseCmdStr(cmdStr);
    if (arg.end) {
        var startMom = convertToMoment(arg.start.array, arg.timeZone, arg.start.timeZoneOffset, arg.localeCodes[0]);
        var endMom = convertToMoment(arg.end.array, arg.timeZone, arg.end.timeZoneOffset, arg.localeCodes[0]);
        return formatRange(cmd, createMomentFormatFunc(startMom), createMomentFormatFunc(endMom), arg.separator);
    }
    return convertToMoment(arg.date.array, arg.timeZone, arg.date.timeZoneOffset, arg.localeCodes[0]).format(cmd.whole); // TODO: test for this
});
fc.globalDefaults.cmdFormatter = 'moment';
function createMomentFormatFunc(mom) {
    return function (cmdStr) {
        return cmdStr ? mom.format(cmdStr) : ''; // because calling with blank string results in ISO8601 :(
    };
}
function convertToMoment(input, timeZone, timeZoneOffset, locale) {
    var mom;
    if (timeZone === 'local') {
        mom = moment(input);
    }
    else if (timeZone === 'UTC') {
        mom = moment.utc(input);
    }
    else if (moment.tz) {
        mom = moment.tz(input, timeZone);
    }
    else {
        mom = moment.utc(input);
        if (timeZoneOffset != null) {
            mom.utcOffset(timeZoneOffset);
        }
    }
    mom.locale(locale);
    return mom;
}
function parseCmdStr(cmdStr) {
    var parts = cmdStr.match(/^(.*?)\{(.*)\}(.*)$/); // TODO: lookbehinds for escape characters
    if (parts) {
        var middle = parseCmdStr(parts[2]);
        return {
            head: parts[1],
            middle: middle,
            tail: parts[3],
            whole: parts[1] + middle.whole + parts[3]
        };
    }
    else {
        return {
            head: null,
            middle: null,
            tail: null,
            whole: cmdStr
        };
    }
}
function formatRange(cmd, formatStart, formatEnd, separator) {
    if (cmd.middle) {
        var startHead = formatStart(cmd.head);
        var startMiddle = formatRange(cmd.middle, formatStart, formatEnd, separator);
        var startTail = formatStart(cmd.tail);
        var endHead = formatEnd(cmd.head);
        var endMiddle = formatRange(cmd.middle, formatStart, formatEnd, separator);
        var endTail = formatEnd(cmd.tail);
        if (startHead === endHead && startTail === endTail) {
            return startHead +
                (startMiddle === endMiddle ? startMiddle : startMiddle + separator + endMiddle) +
                startTail;
        }
    }
    return formatStart(cmd.whole) + separator + formatEnd(cmd.whole);
}


/***/ }),

/***/ 71:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_71__;

/***/ })

/******/ });
});