/*!
 * FullCalendar v4.0.0-alpha
 * Docs & License: https://fullcalendar.io/
 * (c) 2018 Adam Shaw
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("fullcalendar"), require("jquery"));
	else if(typeof define === 'function' && define.amd)
		define(["fullcalendar", "jquery"], factory);
	else if(typeof exports === 'object')
		factory(require("fullcalendar"), require("jquery"));
	else
		factory(root["FullCalendar"], root["jQuery"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_277__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 276);
/******/ })
/************************************************************************/
/******/ ({

/***/ 1:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),

/***/ 276:
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var $ = __webpack_require__(277);
var fullcalendar_1 = __webpack_require__(1);
var $document = $(document);
fullcalendar_1.Calendar.on('initialRender', function (calendar) {
    var handleDragStart = function (ev, ui) {
        var handleDragMove = function (ev, ui) {
            calendar.handleExternalDragMove(ev);
        };
        var handleDragStop = function (ev, ui) {
            calendar.handleExternalDragStop(ev);
            $document
                .off('drag', handleDragMove)
                .off('dragstop', handleDragStop);
        };
        $document
            .on('drag', handleDragMove)
            .on('dragstop', handleDragStop);
        calendar.handlExternalDragStart(ev.originalEvent, ((ui && ui.item) ? ui.item[0] : null) || ev.target, ev.name === 'dragstart' // don't watch mouse/touch movements if doing jqui drag (not sort)
        );
    };
    $document.on('dragstart sortstart', handleDragStart);
    calendar.one('destroy', function (calendar) {
        $document.off('dragstart sortstart', handleDragStart);
    });
});
var origGetEmbeddedElData = fullcalendar_1.ExternalDropping.getEmbeddedElData;
fullcalendar_1.ExternalDropping.getEmbeddedElData = function (el, name, shouldParseJson) {
    if (shouldParseJson === void 0) { shouldParseJson = false; }
    var val = $(el).data(name); // will automatically parse JSON
    if (val != null) {
        return val;
    }
    return origGetEmbeddedElData.apply(fullcalendar_1.ExternalDropping, arguments);
};


/***/ }),

/***/ 277:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_277__;

/***/ })

/******/ });
});