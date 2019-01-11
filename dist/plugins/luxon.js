/*!
 * FullCalendar v4.0.0-alpha.4
 * Docs & License: https://fullcalendar.io/
 * (c) 2018 Adam Shaw
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("fullcalendar"), require("luxon"));
	else if(typeof define === 'function' && define.amd)
		define(["fullcalendar", "luxon"], factory);
	else if(typeof exports === 'object')
		factory(require("fullcalendar"), require("luxon"));
	else
		factory(root["FullCalendar"], root["luxon"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_234__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 233);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),

/***/ 1:
/***/ (function(module, exports) {

/*
derived from:
https://github.com/Microsoft/tslib/blob/v1.6.0/tslib.js

only include the helpers we need, to keep down filesize
*/
var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p]; };
exports.__extends = function (d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
exports.__assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
    }
    return t;
};


/***/ }),

/***/ 233:
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var luxon_1 = __webpack_require__(234);
var fc = __webpack_require__(0);
function toDateTime(date, calendar) {
    if (!(calendar instanceof fc.Calendar)) {
        throw new Error('must supply a Calendar instance');
    }
    return luxon_1.DateTime.fromJSDate(date, {
        zone: calendar.dateEnv.timeZone,
        locale: calendar.dateEnv.locale.codes[0]
    });
}
exports.toDateTime = toDateTime;
function toDuration(duration, calendar) {
    if (!(calendar instanceof fc.Calendar)) {
        throw new Error('must supply a Calendar instance');
    }
    return luxon_1.Duration.fromObject(tslib_1.__assign({}, duration, { locale: calendar.dateEnv.locale.codes[0] }));
}
exports.toDuration = toDuration;
// for browser globals. TODO: better solution
fc.Luxon = {
    toDateTime: toDateTime,
    toDuration: toDuration
};
var LuxonNamedTimeZone = /** @class */ (function (_super) {
    tslib_1.__extends(LuxonNamedTimeZone, _super);
    function LuxonNamedTimeZone() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LuxonNamedTimeZone.prototype.offsetForArray = function (a) {
        return arrayToLuxon(a, this.name).offset;
    };
    LuxonNamedTimeZone.prototype.timestampToArray = function (ms) {
        return luxonToArray(luxon_1.DateTime.fromMillis(ms, {
            zone: this.name
        }));
    };
    return LuxonNamedTimeZone;
}(fc.NamedTimeZoneImpl));
fc.registerNamedTimeZoneImpl('luxon', LuxonNamedTimeZone);
fc.globalDefaults.timeZoneImpl = 'luxon';
fc.registerCmdFormatter('luxon', function (cmdStr, arg) {
    var cmd = parseCmdStr(cmdStr);
    if (arg.end) {
        var start = arrayToLuxon(arg.start.array, arg.timeZone, arg.localeCodes[0]);
        var end = arrayToLuxon(arg.end.array, arg.timeZone, arg.localeCodes[0]);
        return formatRange(cmd, start.toFormat.bind(start), end.toFormat.bind(end), arg.separator);
    }
    return arrayToLuxon(arg.date.array, arg.timeZone, arg.localeCodes[0]).toFormat(cmd.whole);
});
fc.globalDefaults.cmdFormatter = 'luxon';
function luxonToArray(datetime) {
    return [
        datetime.year,
        datetime.month - 1,
        datetime.day,
        datetime.hour,
        datetime.minute,
        datetime.second,
        datetime.millisecond
    ];
}
function arrayToLuxon(arr, timeZone, locale) {
    return luxon_1.DateTime.fromObject({
        zone: timeZone,
        locale: locale,
        year: arr[0],
        month: arr[1] + 1,
        day: arr[2],
        hour: arr[3],
        minute: arr[4],
        second: arr[5],
        millisecond: arr[6]
    });
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

/***/ 234:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_234__;

/***/ })

/******/ });
});