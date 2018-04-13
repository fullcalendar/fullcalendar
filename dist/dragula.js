/*!
 * FullCalendar v4.0.0-alpha
 * Docs & License: https://fullcalendar.io/
 * (c) 2018 Adam Shaw
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("fullcalendar"), require("dragula"));
	else if(typeof define === 'function' && define.amd)
		define(["fullcalendar", "dragula"], factory);
	else if(typeof exports === 'object')
		factory(require("fullcalendar"), require("dragula"));
	else
		factory(root["FullCalendar"], root["dragula"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_279__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 278);
/******/ })
/************************************************************************/
/******/ ({

/***/ 1:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),

/***/ 278:
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var dragula = __webpack_require__(279);
var FullCalendar = __webpack_require__(1);
var visibleCalendars = [];
FullCalendar.Calendar.on('initialRender', function (calendar) {
    visibleCalendars.push(calendar);
    calendar.one('destroy', function () {
        FullCalendar.removeExact(visibleCalendars, calendar);
    });
});
var recentEvent;
[
    'mousedown',
    'touchstart',
    'pointerdown'
].forEach(function (eventName) {
    document.addEventListener(eventName, function (ev) {
        recentEvent = ev;
    });
});
function constructDragula() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var drake = dragula.apply(window, args);
    drake.on('drag', function (draggingEl) {
        for (var _i = 0, visibleCalendars_1 = visibleCalendars; _i < visibleCalendars_1.length; _i++) {
            var calendar = visibleCalendars_1[_i];
            calendar.handlExternalDragStart(recentEvent, draggingEl, false // have FullCalendar watch for mouse/touch events
            // because dragula doesn't expose a 'move' event
            );
        }
    });
    return drake;
}
FullCalendar.dragula = constructDragula;
exports.default = constructDragula;


/***/ }),

/***/ 279:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_279__;

/***/ })

/******/ });
});