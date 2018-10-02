/*!
 * FullCalendar v4.0.0-alpha.2
 * Docs & License: https://fullcalendar.io/
 * (c) 2018 Adam Shaw
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("fullcalendar"), require("rrule"));
	else if(typeof define === 'function' && define.amd)
		define(["fullcalendar", "rrule"], factory);
	else if(typeof exports === 'object')
		factory(require("fullcalendar"), require("rrule"));
	else
		factory(root["FullCalendar"], root["rrule"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_219__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 218);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),

/***/ 218:
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var rrule_1 = __webpack_require__(219);
var fullcalendar_1 = __webpack_require__(0);
var EVENT_DEF_PROPS = {
    rrule: null,
    duration: fullcalendar_1.createDuration
};
fullcalendar_1.registerRecurringType({
    parse: function (rawEvent, leftoverProps, dateEnv) {
        if (rawEvent.rrule != null) {
            var props = fullcalendar_1.refineProps(rawEvent, EVENT_DEF_PROPS, {}, leftoverProps);
            var parsed = parseRRule(props.rrule, dateEnv);
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
});
function parseRRule(input, dateEnv) {
    if (typeof input === 'string') {
        return {
            rrule: rrule_1.rrulestr(input),
            allDay: false
        };
    }
    else if (typeof input === 'object' && input) { // non-null object
        var refined = fullcalendar_1.assignTo({}, input); // copy
        var allDay = false;
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
        return {
            rrule: new rrule_1.RRule(refined),
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
        return rrule_1.RRule[input.toUpperCase()];
    }
    return input;
}


/***/ }),

/***/ 219:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_219__;

/***/ })

/******/ });
});