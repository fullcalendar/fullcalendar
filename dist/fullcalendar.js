/*!
 * FullCalendar v4.0.0-alpha.2
 * Docs & License: https://fullcalendar.io/
 * (c) 2018 Adam Shaw
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("superagent"));
	else if(typeof define === 'function' && define.amd)
		define(["superagent"], factory);
	else if(typeof exports === 'object')
		exports["FullCalendar"] = factory(require("superagent"));
	else
		root["FullCalendar"] = factory(root["superagent"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_64__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 164);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
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


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var dom_manip_1 = __webpack_require__(3);
var dom_geom_1 = __webpack_require__(13);
var dom_event_1 = __webpack_require__(19);
var marker_1 = __webpack_require__(6);
var duration_1 = __webpack_require__(10);
/* FullCalendar-specific DOM Utilities
----------------------------------------------------------------------------------------------------------------------*/
// Given the scrollbar widths of some other container, create borders/margins on rowEls in order to match the left
// and right space that was offset by the scrollbars. A 1-pixel border first, then margin beyond that.
function compensateScroll(rowEl, scrollbarWidths) {
    if (scrollbarWidths.left) {
        dom_manip_1.applyStyle(rowEl, {
            borderLeftWidth: 1,
            marginLeft: scrollbarWidths.left - 1
        });
    }
    if (scrollbarWidths.right) {
        dom_manip_1.applyStyle(rowEl, {
            borderRightWidth: 1,
            marginRight: scrollbarWidths.right - 1
        });
    }
}
exports.compensateScroll = compensateScroll;
// Undoes compensateScroll and restores all borders/margins
function uncompensateScroll(rowEl) {
    dom_manip_1.applyStyle(rowEl, {
        marginLeft: '',
        marginRight: '',
        borderLeftWidth: '',
        borderRightWidth: ''
    });
}
exports.uncompensateScroll = uncompensateScroll;
// Make the mouse cursor express that an event is not allowed in the current area
function disableCursor() {
    document.body.classList.add('fc-not-allowed');
}
exports.disableCursor = disableCursor;
// Returns the mouse cursor to its original look
function enableCursor() {
    document.body.classList.remove('fc-not-allowed');
}
exports.enableCursor = enableCursor;
// Given a total available height to fill, have `els` (essentially child rows) expand to accomodate.
// By default, all elements that are shorter than the recommended height are expanded uniformly, not considering
// any other els that are already too tall. if `shouldRedistribute` is on, it considers these tall rows and
// reduces the available height.
function distributeHeight(els, availableHeight, shouldRedistribute) {
    // *FLOORING NOTE*: we floor in certain places because zoom can give inaccurate floating-point dimensions,
    // and it is better to be shorter than taller, to avoid creating unnecessary scrollbars.
    var minOffset1 = Math.floor(availableHeight / els.length); // for non-last element
    var minOffset2 = Math.floor(availableHeight - minOffset1 * (els.length - 1)); // for last element *FLOORING NOTE*
    var flexEls = []; // elements that are allowed to expand. array of DOM nodes
    var flexOffsets = []; // amount of vertical space it takes up
    var flexHeights = []; // actual css height
    var usedHeight = 0;
    undistributeHeight(els); // give all elements their natural height
    // find elements that are below the recommended height (expandable).
    // important to query for heights in a single first pass (to avoid reflow oscillation).
    els.forEach(function (el, i) {
        var minOffset = i === els.length - 1 ? minOffset2 : minOffset1;
        var naturalOffset = dom_geom_1.computeHeightAndMargins(el);
        if (naturalOffset < minOffset) {
            flexEls.push(el);
            flexOffsets.push(naturalOffset);
            flexHeights.push(el.offsetHeight);
        }
        else {
            // this element stretches past recommended height (non-expandable). mark the space as occupied.
            usedHeight += naturalOffset;
        }
    });
    // readjust the recommended height to only consider the height available to non-maxed-out rows.
    if (shouldRedistribute) {
        availableHeight -= usedHeight;
        minOffset1 = Math.floor(availableHeight / flexEls.length);
        minOffset2 = Math.floor(availableHeight - minOffset1 * (flexEls.length - 1)); // *FLOORING NOTE*
    }
    // assign heights to all expandable elements
    flexEls.forEach(function (el, i) {
        var minOffset = i === flexEls.length - 1 ? minOffset2 : minOffset1;
        var naturalOffset = flexOffsets[i];
        var naturalHeight = flexHeights[i];
        var newHeight = minOffset - (naturalOffset - naturalHeight); // subtract the margin/padding
        if (naturalOffset < minOffset) { // we check this again because redistribution might have changed things
            el.style.height = newHeight + 'px';
        }
    });
}
exports.distributeHeight = distributeHeight;
// Undoes distrubuteHeight, restoring all els to their natural height
function undistributeHeight(els) {
    els.forEach(function (el) {
        el.style.height = '';
    });
}
exports.undistributeHeight = undistributeHeight;
// Given `els`, a set of <td> cells, find the cell with the largest natural width and set the widths of all the
// cells to be that width.
// PREREQUISITE: if you want a cell to take up width, it needs to have a single inner element w/ display:inline
function matchCellWidths(els) {
    var maxInnerWidth = 0;
    els.forEach(function (el) {
        var innerEl = el.firstChild; // hopefully an element
        if (innerEl instanceof HTMLElement) {
            var innerWidth_1 = innerEl.offsetWidth;
            if (innerWidth_1 > maxInnerWidth) {
                maxInnerWidth = innerWidth_1;
            }
        }
    });
    maxInnerWidth++; // sometimes not accurate of width the text needs to stay on one line. insurance
    els.forEach(function (el) {
        el.style.width = maxInnerWidth + 'px';
    });
    return maxInnerWidth;
}
exports.matchCellWidths = matchCellWidths;
// Given one element that resides inside another,
// Subtracts the height of the inner element from the outer element.
function subtractInnerElHeight(outerEl, innerEl) {
    // effin' IE8/9/10/11 sometimes returns 0 for dimensions. this weird hack was the only thing that worked
    var reflowStyleProps = {
        position: 'relative',
        left: -1 // ensure reflow in case the el was already relative. negative is less likely to cause new scroll
    };
    dom_manip_1.applyStyle(outerEl, reflowStyleProps);
    dom_manip_1.applyStyle(innerEl, reflowStyleProps);
    var diff = outerEl.offsetHeight - innerEl.offsetHeight; // grab the dimensions
    // undo hack
    var resetStyleProps = { position: '', left: '' };
    dom_manip_1.applyStyle(outerEl, resetStyleProps);
    dom_manip_1.applyStyle(innerEl, resetStyleProps);
    return diff;
}
exports.subtractInnerElHeight = subtractInnerElHeight;
/* Selection
----------------------------------------------------------------------------------------------------------------------*/
function preventSelection(el) {
    el.classList.add('fc-unselectable');
    el.addEventListener('selectstart', dom_event_1.preventDefault);
}
exports.preventSelection = preventSelection;
function allowSelection(el) {
    el.classList.remove('fc-unselectable');
    el.removeEventListener('selectstart', dom_event_1.preventDefault);
}
exports.allowSelection = allowSelection;
/* Context Menu
----------------------------------------------------------------------------------------------------------------------*/
function preventContextMenu(el) {
    el.addEventListener('contextmenu', dom_event_1.preventDefault);
}
exports.preventContextMenu = preventContextMenu;
function allowContextMenu(el) {
    el.removeEventListener('contextmenu', dom_event_1.preventDefault);
}
exports.allowContextMenu = allowContextMenu;
/* Object Ordering by Field
----------------------------------------------------------------------------------------------------------------------*/
function parseFieldSpecs(input) {
    var specs = [];
    var tokens = [];
    var i;
    var token;
    if (typeof input === 'string') {
        tokens = input.split(/\s*,\s*/);
    }
    else if (typeof input === 'function') {
        tokens = [input];
    }
    else if (Array.isArray(input)) {
        tokens = input;
    }
    for (i = 0; i < tokens.length; i++) {
        token = tokens[i];
        if (typeof token === 'string') {
            specs.push(token.charAt(0) === '-' ?
                { field: token.substring(1), order: -1 } :
                { field: token, order: 1 });
        }
        else if (typeof token === 'function') {
            specs.push({ func: token });
        }
    }
    return specs;
}
exports.parseFieldSpecs = parseFieldSpecs;
function compareByFieldSpecs(obj0, obj1, fieldSpecs) {
    var i;
    var cmp;
    for (i = 0; i < fieldSpecs.length; i++) {
        cmp = compareByFieldSpec(obj0, obj1, fieldSpecs[i]);
        if (cmp) {
            return cmp;
        }
    }
    return 0;
}
exports.compareByFieldSpecs = compareByFieldSpecs;
function compareByFieldSpec(obj0, obj1, fieldSpec) {
    if (fieldSpec.func) {
        return fieldSpec.func(obj0, obj1);
    }
    return flexibleCompare(obj0[fieldSpec.field], obj1[fieldSpec.field])
        * (fieldSpec.order || 1);
}
exports.compareByFieldSpec = compareByFieldSpec;
function flexibleCompare(a, b) {
    if (!a && !b) {
        return 0;
    }
    if (b == null) {
        return -1;
    }
    if (a == null) {
        return 1;
    }
    if (typeof a === 'string' || typeof b === 'string') {
        return String(a).localeCompare(String(b));
    }
    return a - b;
}
exports.flexibleCompare = flexibleCompare;
/* Logging and Debug
----------------------------------------------------------------------------------------------------------------------*/
function log() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var console = window.console;
    if (console && console.log) {
        return console.log.apply(console, args);
    }
}
exports.log = log;
function warn() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var console = window.console;
    if (console && console.warn) {
        return console.warn.apply(console, args);
    }
    else {
        return log.apply(null, args);
    }
}
exports.warn = warn;
/* String Utilities
----------------------------------------------------------------------------------------------------------------------*/
function capitaliseFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
exports.capitaliseFirstLetter = capitaliseFirstLetter;
function padStart(val, len) {
    var s = String(val);
    return '000'.substr(0, len - s.length) + s;
}
exports.padStart = padStart;
/* Number Utilities
----------------------------------------------------------------------------------------------------------------------*/
function compareNumbers(a, b) {
    return a - b;
}
exports.compareNumbers = compareNumbers;
function isInt(n) {
    return n % 1 === 0;
}
exports.isInt = isInt;
/* Weird Utilities
----------------------------------------------------------------------------------------------------------------------*/
function applyAll(functions, thisObj, args) {
    if (typeof functions === 'function') { // supplied a single function
        functions = [functions];
    }
    if (functions) {
        var i = void 0;
        var ret = void 0;
        for (i = 0; i < functions.length; i++) {
            ret = functions[i].apply(thisObj, args) || ret;
        }
        return ret;
    }
}
exports.applyAll = applyAll;
function firstDefined() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    for (var i = 0; i < args.length; i++) {
        if (args[i] !== undefined) {
            return args[i];
        }
    }
}
exports.firstDefined = firstDefined;
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// https://github.com/jashkenas/underscore/blob/1.6.0/underscore.js#L714
function debounce(func, wait) {
    var timeout;
    var args;
    var context;
    var timestamp;
    var result;
    var later = function () {
        var last = new Date().valueOf() - timestamp;
        if (last < wait) {
            timeout = setTimeout(later, wait - last);
        }
        else {
            timeout = null;
            result = func.apply(context, args);
            context = args = null;
        }
    };
    return function () {
        context = this;
        args = arguments;
        timestamp = new Date().valueOf();
        if (!timeout) {
            timeout = setTimeout(later, wait);
        }
        return result;
    };
}
exports.debounce = debounce;
// Number and Boolean are only types that defaults or not computed for
// TODO: write more comments
function refineProps(rawProps, processors, defaults, leftoverProps) {
    if (defaults === void 0) { defaults = {}; }
    var refined = {};
    for (var key in processors) {
        var processor = processors[key];
        if (rawProps[key] !== undefined) {
            // found
            if (processor === Function) {
                refined[key] = typeof rawProps[key] === 'function' ? rawProps[key] : null;
            }
            else if (processor) { // a refining function?
                refined[key] = processor(rawProps[key]);
            }
            else {
                refined[key] = rawProps[key];
            }
        }
        else if (defaults[key] !== undefined) {
            // there's an explicit default
            refined[key] = defaults[key];
        }
        else {
            // must compute a default
            if (processor === String) {
                refined[key] = ''; // empty string is default for String
            }
            else if (!processor || processor === Number || processor === Boolean || processor === Function) {
                refined[key] = null; // assign null for other non-custom processor funcs
            }
            else {
                refined[key] = processor(null); // run the custom processor func
            }
        }
    }
    if (leftoverProps) {
        for (var key in rawProps) {
            if (processors[key] === undefined) {
                leftoverProps[key] = rawProps[key];
            }
        }
    }
    return refined;
}
exports.refineProps = refineProps;
/* Date stuff that doesn't belong in datelib core
----------------------------------------------------------------------------------------------------------------------*/
// given a timed range, computes an all-day range that has the same exact duration,
// but whose start time is aligned with the start of the day.
function computeAlignedDayRange(timedRange) {
    var dayCnt = Math.floor(marker_1.diffDays(timedRange.start, timedRange.end)) || 1;
    var start = marker_1.startOfDay(timedRange.start);
    var end = marker_1.addDays(start, dayCnt);
    return { start: start, end: end };
}
exports.computeAlignedDayRange = computeAlignedDayRange;
// given a timed range, computes an all-day range based on how for the end date bleeds into the next day
function computeVisibleDayRange(timedRange, nextDayThreshold) {
    var startDay = marker_1.startOfDay(timedRange.start); // the beginning of the day the range starts
    var end = timedRange.end;
    var endDay = marker_1.startOfDay(end);
    var endTimeMS = end.valueOf() - endDay.valueOf(); // # of milliseconds into `endDay`
    // If the end time is actually inclusively part of the next day and is equal to or
    // beyond the next day threshold, adjust the end to be the exclusive end of `endDay`.
    // Otherwise, leaving it as inclusive will cause it to exclude `endDay`.
    if (endTimeMS && endTimeMS >= duration_1.asRoughMs(nextDayThreshold)) {
        endDay = marker_1.addDays(endDay, 1);
    }
    // If end is within `startDay` but not past nextDayThreshold, assign the default duration of one day.
    if (endDay <= startDay) {
        endDay = marker_1.addDays(startDay, 1);
    }
    return { start: startDay, end: endDay };
}
exports.computeVisibleDayRange = computeVisibleDayRange;
// spans from one day into another?
function isMultiDayRange(range) {
    var visibleRange = computeVisibleDayRange(range, duration_1.createDuration(0));
    return marker_1.diffDays(visibleRange.start, visibleRange.end) > 1;
}
exports.isMultiDayRange = isMultiDayRange;
function diffDates(date0, date1, dateEnv, largeUnit) {
    if (largeUnit === 'year') {
        return duration_1.createDuration(dateEnv.diffWholeYears(date0, date1), 'year');
    }
    else if (largeUnit === 'month') {
        return duration_1.createDuration(dateEnv.diffWholeMonths(date0, date1), 'month');
    }
    else {
        return marker_1.diffDayAndTime(date0, date1); // returns a duration
    }
}
exports.diffDates = diffDates;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

// Creating
// ----------------------------------------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
var elementPropHash = {
    className: true,
    colSpan: true,
    rowSpan: true
};
var containerTagHash = {
    '<tr': 'tbody',
    '<td': 'tr'
};
function createElement(tagName, attrs, content) {
    var el = document.createElement(tagName);
    if (attrs) {
        for (var attrName in attrs) {
            if (attrName === 'style') {
                applyStyle(el, attrs[attrName]);
            }
            else if (elementPropHash[attrName]) {
                el[attrName] = attrs[attrName];
            }
            else {
                el.setAttribute(attrName, attrs[attrName]);
            }
        }
    }
    if (typeof content === 'string') {
        el.innerHTML = content; // shortcut. no need to process HTML in any way
    }
    else if (content != null) {
        appendToElement(el, content);
    }
    return el;
}
exports.createElement = createElement;
function htmlToElement(html) {
    html = html.trim();
    var container = document.createElement(computeContainerTag(html));
    container.innerHTML = html;
    return container.firstChild;
}
exports.htmlToElement = htmlToElement;
function htmlToElements(html) {
    return Array.prototype.slice.call(htmlToNodeList(html));
}
exports.htmlToElements = htmlToElements;
function htmlToNodeList(html) {
    html = html.trim();
    var container = document.createElement(computeContainerTag(html));
    container.innerHTML = html;
    return container.childNodes;
}
// assumes html already trimmed and tag names are lowercase
function computeContainerTag(html) {
    return containerTagHash[html.substr(0, 3) // faster than using regex
    ] || 'div';
}
function appendToElement(el, content) {
    var childNodes = normalizeContent(content);
    for (var i = 0; i < childNodes.length; i++) {
        el.appendChild(childNodes[i]);
    }
}
exports.appendToElement = appendToElement;
function prependToElement(parent, content) {
    var newEls = normalizeContent(content);
    var afterEl = parent.firstChild || null; // if no firstChild, will append to end, but that's okay, b/c there were no children
    for (var i = 0; i < newEls.length; i++) {
        parent.insertBefore(newEls[i], afterEl);
    }
}
exports.prependToElement = prependToElement;
function insertAfterElement(refEl, content) {
    var newEls = normalizeContent(content);
    var afterEl = refEl.nextSibling || null;
    for (var i = 0; i < newEls.length; i++) {
        refEl.parentNode.insertBefore(newEls[i], afterEl);
    }
}
exports.insertAfterElement = insertAfterElement;
function normalizeContent(content) {
    var els;
    if (typeof content === 'string') {
        els = htmlToNodeList(content);
    }
    else if (content instanceof Node) {
        els = [content];
    }
    else { // assumed to be NodeList or Node[]
        els = content;
    }
    return els;
}
function removeElement(el) {
    if (el.parentNode) {
        el.parentNode.removeChild(el);
    }
}
exports.removeElement = removeElement;
// Querying
// ----------------------------------------------------------------------------------------------------------------
// from https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
var matchesMethod = Element.prototype.matches ||
    Element.prototype.matchesSelector ||
    Element.prototype.msMatchesSelector;
var closestMethod = Element.prototype.closest || function (selector) {
    // polyfill
    var el = this;
    if (!document.documentElement.contains(el)) {
        return null;
    }
    do {
        if (elementMatches(el, selector)) {
            return el;
        }
        el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
};
function elementClosest(el, selector) {
    return closestMethod.call(el, selector);
}
exports.elementClosest = elementClosest;
function elementMatches(el, selector) {
    return matchesMethod.call(el, selector);
}
exports.elementMatches = elementMatches;
// accepts multiple subject els
// returns a real array. good for methods like forEach
function findElements(container, selector) {
    var containers = container instanceof HTMLElement ? [container] : container;
    var allMatches = [];
    for (var i = 0; i < containers.length; i++) {
        var matches = containers[i].querySelectorAll(selector);
        for (var j = 0; j < matches.length; j++) {
            allMatches.push(matches[j]);
        }
    }
    return allMatches;
}
exports.findElements = findElements;
// accepts multiple subject els
// only queries direct child elements
function findChildren(parent, selector) {
    var parents = parent instanceof HTMLElement ? [parent] : parent;
    var allMatches = [];
    for (var i = 0; i < parents.length; i++) {
        var childNodes = parents[i].children; // only ever elements
        for (var j = 0; j < childNodes.length; j++) {
            var childNode = childNodes[j];
            if (!selector || elementMatches(childNode, selector)) {
                allMatches.push(childNode);
            }
        }
    }
    return allMatches;
}
exports.findChildren = findChildren;
// Attributes
// ----------------------------------------------------------------------------------------------------------------
function forceClassName(el, className, bool) {
    if (bool) {
        el.classList.add(className);
    }
    else {
        el.classList.remove(className);
    }
}
exports.forceClassName = forceClassName;
// Style
// ----------------------------------------------------------------------------------------------------------------
var PIXEL_PROP_RE = /(top|left|right|bottom|width|height)$/i;
function applyStyle(el, props, propVal) {
    for (var propName in props) {
        applyStyleProp(el, propName, props[propName]);
    }
}
exports.applyStyle = applyStyle;
function applyStyleProp(el, name, val) {
    if (val == null) {
        el.style[name] = '';
    }
    else if (typeof val === 'number' && PIXEL_PROP_RE.test(name)) {
        el.style[name] = val + 'px';
    }
    else {
        el.style[name] = val;
    }
}
exports.applyStyleProp = applyStyleProp;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var hasOwnPropMethod = {}.hasOwnProperty;
function assignTo(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    for (var i = 0; i < sources.length; i++) {
        var source = sources[i];
        if (source != null) { // skip over if undefined or null
            for (var key in source) {
                // avoid bugs when hasOwnProperty is shadowed
                if (hasOwnProp(source, key)) {
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
}
exports.assignTo = assignTo;
function copyOwnProps(src, dest) {
    for (var name_1 in src) {
        if (hasOwnProp(src, name_1)) {
            dest[name_1] = src[name_1];
        }
    }
}
exports.copyOwnProps = copyOwnProps;
function hasOwnProp(obj, name) {
    return hasOwnPropMethod.call(obj, name);
}
// Merges an array of objects into a single object.
// The second argument allows for an array of property names who's object values will be merged together.
function mergeProps(propObjs, complexProps) {
    var dest = {};
    var i;
    var name;
    var complexObjs;
    var j;
    var val;
    var props;
    if (complexProps) {
        for (i = 0; i < complexProps.length; i++) {
            name = complexProps[i];
            complexObjs = [];
            // collect the trailing object values, stopping when a non-object is discovered
            for (j = propObjs.length - 1; j >= 0; j--) {
                val = propObjs[j][name];
                if (typeof val === 'object' && val) { // non-null object
                    complexObjs.unshift(val);
                }
                else if (val !== undefined) {
                    dest[name] = val; // if there were no objects, this value will be used
                    break;
                }
            }
            // if the trailing values were objects, use the merged value
            if (complexObjs.length) {
                dest[name] = mergeProps(complexObjs);
            }
        }
    }
    // copy values into the destination, going from last to first
    for (i = propObjs.length - 1; i >= 0; i--) {
        props = propObjs[i];
        for (name in props) {
            if (!(name in dest)) { // if already assigned by previous props or complex props, don't reassign
                dest[name] = props[name];
            }
        }
    }
    return dest;
}
exports.mergeProps = mergeProps;
function filterHash(hash, func) {
    var filtered = {};
    for (var key in hash) {
        if (func(hash[key], key)) {
            filtered[key] = hash[key];
        }
    }
    return filtered;
}
exports.filterHash = filterHash;
function mapHash(hash, func) {
    var newHash = {};
    for (var key in hash) {
        newHash[key] = func(hash[key], key);
    }
    return newHash;
}
exports.mapHash = mapHash;
function arrayToHash(a) {
    var hash = {};
    for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
        var item = a_1[_i];
        hash[item] = true;
    }
    return hash;
}
exports.arrayToHash = arrayToHash;


/***/ }),
/* 5 */,
/* 6 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.DAY_IDS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
// Adding
function addWeeks(m, n) {
    var a = dateToUtcArray(m);
    a[2] += n * 7;
    return arrayToUtcDate(a);
}
exports.addWeeks = addWeeks;
function addDays(m, n) {
    var a = dateToUtcArray(m);
    a[2] += n;
    return arrayToUtcDate(a);
}
exports.addDays = addDays;
function addMs(m, n) {
    var a = dateToUtcArray(m);
    a[6] += n;
    return arrayToUtcDate(a);
}
exports.addMs = addMs;
// Diffing (all return floats)
function diffWeeks(m0, m1) {
    return diffDays(m0, m1) / 7;
}
exports.diffWeeks = diffWeeks;
function diffDays(m0, m1) {
    return (m1.valueOf() - m0.valueOf()) / (1000 * 60 * 60 * 24);
}
exports.diffDays = diffDays;
function diffHours(m0, m1) {
    return (m1.valueOf() - m0.valueOf()) / (1000 * 60 * 60);
}
exports.diffHours = diffHours;
function diffMinutes(m0, m1) {
    return (m1.valueOf() - m0.valueOf()) / (1000 * 60);
}
exports.diffMinutes = diffMinutes;
function diffSeconds(m0, m1) {
    return (m1.valueOf() - m0.valueOf()) / 1000;
}
exports.diffSeconds = diffSeconds;
function diffDayAndTime(m0, m1) {
    var m0day = startOfDay(m0);
    var m1day = startOfDay(m1);
    return {
        years: 0,
        months: 0,
        days: Math.round(diffDays(m0day, m1day)),
        milliseconds: (m1.valueOf() - m1day.valueOf()) - (m0.valueOf() - m0day.valueOf())
    };
}
exports.diffDayAndTime = diffDayAndTime;
// Diffing Whole Units
function diffWholeWeeks(m0, m1) {
    var d = diffWholeDays(m0, m1);
    if (d !== null && d % 7 === 0) {
        return d / 7;
    }
    return null;
}
exports.diffWholeWeeks = diffWholeWeeks;
function diffWholeDays(m0, m1) {
    if (timeAsMs(m0) === timeAsMs(m1)) {
        return Math.round(diffDays(m0, m1));
    }
    return null;
}
exports.diffWholeDays = diffWholeDays;
// Start-Of
function startOfDay(m) {
    return arrayToUtcDate([
        m.getUTCFullYear(),
        m.getUTCMonth(),
        m.getUTCDate()
    ]);
}
exports.startOfDay = startOfDay;
function startOfHour(m) {
    return arrayToUtcDate([
        m.getUTCFullYear(),
        m.getUTCMonth(),
        m.getUTCDate(),
        m.getUTCHours()
    ]);
}
exports.startOfHour = startOfHour;
function startOfMinute(m) {
    return arrayToUtcDate([
        m.getUTCFullYear(),
        m.getUTCMonth(),
        m.getUTCDate(),
        m.getUTCHours(),
        m.getUTCMinutes()
    ]);
}
exports.startOfMinute = startOfMinute;
function startOfSecond(m) {
    return arrayToUtcDate([
        m.getUTCFullYear(),
        m.getUTCMonth(),
        m.getUTCDate(),
        m.getUTCHours(),
        m.getUTCMinutes(),
        m.getUTCSeconds()
    ]);
}
exports.startOfSecond = startOfSecond;
// Week Computation
function weekOfYear(marker, dow, doy) {
    var y = marker.getUTCFullYear();
    var w = weekOfGivenYear(marker, y, dow, doy);
    if (w < 1) {
        return weekOfGivenYear(marker, y - 1, dow, doy);
    }
    var nextW = weekOfGivenYear(marker, y + 1, dow, doy);
    if (nextW >= 1) {
        return Math.min(w, nextW);
    }
    return w;
}
exports.weekOfYear = weekOfYear;
function weekOfGivenYear(marker, year, dow, doy) {
    var firstWeekStart = arrayToUtcDate([year, 0, 1 + firstWeekOffset(year, dow, doy)]);
    var dayStart = startOfDay(marker);
    var days = Math.round(diffDays(firstWeekStart, dayStart));
    return Math.floor(days / 7) + 1; // zero-indexed
}
// start-of-first-week - start-of-year
function firstWeekOffset(year, dow, doy) {
    // first-week day -- which january is always in the first week (4 for iso, 1 for other)
    var fwd = 7 + dow - doy;
    // first-week day local weekday -- which local weekday is fwd
    var fwdlw = (7 + arrayToUtcDate([year, 0, fwd]).getUTCDay() - dow) % 7;
    return -fwdlw + fwd - 1;
}
// Array Conversion
function dateToLocalArray(date) {
    return [
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
    ];
}
exports.dateToLocalArray = dateToLocalArray;
function arrayToLocalDate(a) {
    return new Date(a[0], a[1] || 0, a[2] == null ? 1 : a[2], // day of month
    a[3] || 0, a[4] || 0, a[5] || 0);
}
exports.arrayToLocalDate = arrayToLocalDate;
function dateToUtcArray(date) {
    return [
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds()
    ];
}
exports.dateToUtcArray = dateToUtcArray;
function arrayToUtcDate(a) {
    return new Date(Date.UTC.apply(Date, a));
}
exports.arrayToUtcDate = arrayToUtcDate;
// Other Utils
function timeAsMs(m) {
    return m.getUTCHours() * 1000 * 60 * 60 +
        m.getUTCMinutes() * 1000 * 60 +
        m.getUTCSeconds() * 1000 +
        m.getUTCMilliseconds();
}
exports.timeAsMs = timeAsMs;


/***/ }),
/* 7 */,
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var misc_1 = __webpack_require__(2);
var formatting_native_1 = __webpack_require__(166);
var formatting_cmd_1 = __webpack_require__(52);
var formatting_func_1 = __webpack_require__(167);
var object_1 = __webpack_require__(4);
// Formatter Object Creation
function createFormatter(input, defaultSeparator) {
    if (typeof input === 'object' && input) { // non-null object
        if (typeof defaultSeparator === 'string') {
            input = object_1.assignTo({ separator: defaultSeparator }, input);
        }
        return new formatting_native_1.NativeFormatter(input);
    }
    else if (typeof input === 'string') {
        return new formatting_cmd_1.CmdFormatter(input, defaultSeparator);
    }
    else if (typeof input === 'function') {
        return new formatting_func_1.FuncFormatter(input);
    }
}
exports.createFormatter = createFormatter;
// String Utils
// timeZoneOffset is in minutes
function buildIsoString(marker, timeZoneOffset, stripZeroTime) {
    if (stripZeroTime === void 0) { stripZeroTime = false; }
    var s = marker.toISOString();
    s = s.replace('.000', '');
    if (stripZeroTime) {
        s = s.replace('T00:00:00Z', '');
    }
    if (s.length > 10) { // time part wasn't stripped, can add timezone info
        if (timeZoneOffset == null) {
            s = s.replace('Z', '');
        }
        else if (timeZoneOffset !== 0) {
            s = s.replace('Z', formatTimeZoneOffset(timeZoneOffset, true));
        }
        // otherwise, its UTC-0 and we want to keep the Z
    }
    return s;
}
exports.buildIsoString = buildIsoString;
function formatIsoTimeString(marker) {
    return misc_1.padStart(marker.getUTCHours(), 2) + ':' +
        misc_1.padStart(marker.getUTCMinutes(), 2) + ':' +
        misc_1.padStart(marker.getUTCSeconds(), 2);
}
exports.formatIsoTimeString = formatIsoTimeString;
function formatTimeZoneOffset(minutes, doIso) {
    if (doIso === void 0) { doIso = false; }
    var sign = minutes < 0 ? '-' : '+';
    var abs = Math.abs(minutes);
    var hours = Math.floor(abs / 60);
    var mins = Math.round(abs % 60);
    if (doIso) {
        return sign + misc_1.padStart(hours, 2) + ':' + misc_1.padStart(mins, 2);
    }
    else {
        return 'GMT' + sign + hours + (mins ? ':' + misc_1.padStart(mins, 2) : '');
    }
}
exports.formatTimeZoneOffset = formatTimeZoneOffset;
// Arg Utils
function createVerboseFormattingArg(start, end, context, separator) {
    var startInfo = expandZonedMarker(start, context.calendarSystem);
    var endInfo = end ? expandZonedMarker(end, context.calendarSystem) : null;
    return {
        date: startInfo,
        start: startInfo,
        end: endInfo,
        timeZone: context.timeZone,
        localeCodes: context.locale.codes,
        separator: separator
    };
}
exports.createVerboseFormattingArg = createVerboseFormattingArg;
function expandZonedMarker(dateInfo, calendarSystem) {
    var a = calendarSystem.markerToArray(dateInfo.marker);
    return {
        marker: dateInfo.marker,
        timeZoneOffset: dateInfo.timeZoneOffset,
        array: a,
        year: a[0],
        month: a[1],
        day: a[2],
        hour: a[3],
        minute: a[4],
        second: a[5],
        millisecond: a[6]
    };
}


/***/ }),
/* 9 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
function htmlEscape(s) {
    return (s + '').replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#039;')
        .replace(/"/g, '&quot;')
        .replace(/\n/g, '<br />');
}
exports.htmlEscape = htmlEscape;
// Given a hash of CSS properties, returns a string of CSS.
// Uses property names as-is (no camel-case conversion). Will not make statements for null/undefined values.
function cssToStr(cssProps) {
    var statements = [];
    for (var name_1 in cssProps) {
        var val = cssProps[name_1];
        if (val != null) {
            statements.push(name_1 + ':' + val);
        }
    }
    return statements.join(';');
}
exports.cssToStr = cssToStr;
// Given an object hash of HTML attribute names to values,
// generates a string that can be injected between < > in HTML
function attrsToStr(attrs) {
    var parts = [];
    for (var name_2 in attrs) {
        var val = attrs[name_2];
        if (val != null) {
            parts.push(name_2 + '="' + htmlEscape(val) + '"');
        }
    }
    return parts.join(' ');
}
exports.attrsToStr = attrsToStr;
function parseClassName(raw) {
    if (Array.isArray(raw)) {
        return raw;
    }
    else if (typeof raw === 'string') {
        return raw.split(/\s+/);
    }
    else {
        return [];
    }
}
exports.parseClassName = parseClassName;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var misc_1 = __webpack_require__(2);
var INTERNAL_UNITS = ['years', 'months', 'days', 'milliseconds'];
var PARSE_RE = /^(-?)(?:(\d+)\.)?(\d+):(\d\d)(?::(\d\d)(?:\.(\d\d\d))?)?/;
// Parsing and Creation
function createDuration(input, unit) {
    var _a;
    if (typeof input === 'string') {
        return parseString(input);
    }
    else if (typeof input === 'object' && input) { // non-null object
        return normalizeObject(input);
    }
    else if (typeof input === 'number') {
        return normalizeObject((_a = {}, _a[unit || 'milliseconds'] = input, _a));
    }
    else {
        return null;
    }
}
exports.createDuration = createDuration;
function parseString(s) {
    var m = PARSE_RE.exec(s);
    if (m) {
        var sign = m[1] ? -1 : 1;
        return {
            years: 0,
            months: 0,
            days: sign * (m[2] ? parseInt(m[2], 10) : 0),
            milliseconds: sign * ((m[3] ? parseInt(m[3], 10) : 0) * 60 * 60 * 1000 + // hours
                (m[4] ? parseInt(m[4], 10) : 0) * 60 * 1000 + // minutes
                (m[5] ? parseInt(m[5], 10) : 0) * 1000 + // seconds
                (m[6] ? parseInt(m[6], 10) : 0) // ms
            )
        };
    }
    return null;
}
function normalizeObject(obj) {
    return {
        years: obj.years || obj.year || 0,
        months: obj.months || obj.month || 0,
        days: (obj.days || obj.day || 0) +
            getWeeksFromInput(obj) * 7,
        milliseconds: (obj.hours || obj.hour || 0) * 60 * 60 * 1000 + // hours
            (obj.minutes || obj.minute || 0) * 60 * 1000 + // minutes
            (obj.seconds || obj.second || 0) * 1000 + // seconds
            (obj.milliseconds || obj.millisecond || obj.ms || 0) // ms
    };
}
function getWeeksFromInput(obj) {
    return obj.weeks || obj.week || 0;
}
exports.getWeeksFromInput = getWeeksFromInput;
// Equality
function durationsEqual(d0, d1) {
    return d0.years === d1.years &&
        d0.months === d1.months &&
        d0.days === d1.days &&
        d0.milliseconds === d1.milliseconds;
}
exports.durationsEqual = durationsEqual;
function isSingleDay(dur) {
    return dur.years === 0 && dur.months === 0 && dur.days === 1 && dur.milliseconds === 0;
}
exports.isSingleDay = isSingleDay;
// Simple Math
function addDurations(d0, d1) {
    return {
        years: d0.years + d1.years,
        months: d0.months + d1.months,
        days: d0.days + d1.days,
        milliseconds: d0.milliseconds + d1.milliseconds
    };
}
exports.addDurations = addDurations;
function subtractDurations(d1, d0) {
    return {
        years: d1.years - d0.years,
        months: d1.months - d0.months,
        days: d1.days - d0.days,
        milliseconds: d1.milliseconds - d0.milliseconds
    };
}
exports.subtractDurations = subtractDurations;
function multiplyDuration(d, n) {
    return {
        years: d.years * n,
        months: d.months * n,
        days: d.days * n,
        milliseconds: d.milliseconds * n
    };
}
exports.multiplyDuration = multiplyDuration;
// Conversions
// "Rough" because they are based on average-case Gregorian months/years
function asRoughYears(dur) {
    return asRoughDays(dur) / 365;
}
exports.asRoughYears = asRoughYears;
function asRoughMonths(dur) {
    return asRoughDays(dur) / 30;
}
exports.asRoughMonths = asRoughMonths;
function asRoughDays(dur) {
    return asRoughMs(dur) / 864e5;
}
exports.asRoughDays = asRoughDays;
function asRoughHours(dur) {
    return asRoughMs(dur) / (1000 * 60 * 60);
}
exports.asRoughHours = asRoughHours;
function asRoughMinutes(dur) {
    return asRoughMs(dur) / (1000 * 60);
}
exports.asRoughMinutes = asRoughMinutes;
function asRoughSeconds(dur) {
    return asRoughMs(dur) / 1000;
}
exports.asRoughSeconds = asRoughSeconds;
function asRoughMs(dur) {
    return dur.years * (365 * 864e5) +
        dur.months * (30 * 864e5) +
        dur.days * 864e5 +
        dur.milliseconds;
}
exports.asRoughMs = asRoughMs;
// Advanced Math
function wholeDivideDurations(numerator, denominator) {
    var res = null;
    for (var i = 0; i < INTERNAL_UNITS.length; i++) {
        var unit = INTERNAL_UNITS[i];
        if (denominator[unit]) {
            var localRes = numerator[unit] / denominator[unit];
            if (!misc_1.isInt(localRes) || (res !== null && res !== localRes)) {
                return null;
            }
            res = localRes;
        }
        else if (numerator[unit]) {
            // needs to divide by something but can't!
            return null;
        }
    }
    return res;
}
exports.wholeDivideDurations = wholeDivideDurations;
function greatestDurationDenominator(dur, dontReturnWeeks) {
    var ms = dur.milliseconds;
    if (ms) {
        if (ms % 1000 !== 0) {
            return { unit: 'millisecond', value: ms };
        }
        if (ms % (1000 * 60) !== 0) {
            return { unit: 'second', value: ms / 1000 };
        }
        if (ms % (1000 * 60 * 60) !== 0) {
            return { unit: 'minute', value: ms / (1000 * 60) };
        }
        if (ms) {
            return { unit: 'hour', value: ms / (1000 * 60 * 60) };
        }
    }
    if (dur.days) {
        if (!dontReturnWeeks && dur.days % 7 === 0) {
            return { unit: 'week', value: dur.days / 7 };
        }
        return { unit: 'day', value: dur.days };
    }
    if (dur.months) {
        return { unit: 'month', value: dur.months };
    }
    if (dur.years) {
        return { unit: 'year', value: dur.years };
    }
    return { unit: 'millisecond', value: 0 };
}
exports.greatestDurationDenominator = greatestDurationDenominator;


/***/ }),
/* 11 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
function parseRange(input, dateEnv) {
    var start = null;
    var end = null;
    if (input.start) {
        start = dateEnv.createMarker(input.start);
    }
    if (input.end) {
        end = dateEnv.createMarker(input.end);
    }
    if (!start && !end) {
        return null;
    }
    if (start && end && end < start) {
        return null;
    }
    return { start: start, end: end };
}
exports.parseRange = parseRange;
// SIDE-EFFECT: will mutate ranges.
// Will return a new array result.
function invertRanges(ranges, constraintRange) {
    var invertedRanges = [];
    var start = constraintRange.start; // the end of the previous range. the start of the new range
    var i;
    var dateRange;
    // ranges need to be in order. required for our date-walking algorithm
    ranges.sort(compareRanges);
    for (i = 0; i < ranges.length; i++) {
        dateRange = ranges[i];
        // add the span of time before the event (if there is any)
        if (dateRange.start > start) { // compare millisecond time (skip any ambig logic)
            invertedRanges.push({ start: start, end: dateRange.start });
        }
        if (dateRange.end > start) {
            start = dateRange.end;
        }
    }
    // add the span of time after the last event (if there is any)
    if (start < constraintRange.end) { // compare millisecond time (skip any ambig logic)
        invertedRanges.push({ start: start, end: constraintRange.end });
    }
    return invertedRanges;
}
exports.invertRanges = invertRanges;
function compareRanges(range0, range1) {
    return range0.start.valueOf() - range1.start.valueOf(); // earlier ranges go first
}
function intersectRanges(range0, range1) {
    var start = range0.start;
    var end = range0.end;
    var newRange = null;
    if (range1.start !== null) {
        if (start === null) {
            start = range1.start;
        }
        else {
            start = new Date(Math.max(start.valueOf(), range1.start.valueOf()));
        }
    }
    if (range1.end != null) {
        if (end === null) {
            end = range1.end;
        }
        else {
            end = new Date(Math.min(end.valueOf(), range1.end.valueOf()));
        }
    }
    if (start === null || end === null || start < end) {
        newRange = { start: start, end: end };
    }
    return newRange;
}
exports.intersectRanges = intersectRanges;
function rangesEqual(range0, range1) {
    return (range0.start === null ? null : range0.start.valueOf()) === (range1.start === null ? null : range1.start.valueOf()) &&
        (range0.end === null ? null : range0.end.valueOf()) === (range1.end === null ? null : range1.end.valueOf());
}
exports.rangesEqual = rangesEqual;
function rangesIntersect(range0, range1) {
    return (range0.end === null || range1.start === null || range0.end > range1.start) &&
        (range0.start === null || range1.end === null || range0.start < range1.end);
}
exports.rangesIntersect = rangesIntersect;
function rangeContainsRange(outerRange, innerRange) {
    return (outerRange.start === null || (innerRange.start !== null && innerRange.start >= outerRange.start)) &&
        (outerRange.end === null || (innerRange.end !== null && innerRange.end <= outerRange.end));
}
exports.rangeContainsRange = rangeContainsRange;
function rangeContainsMarker(range, date) {
    return (range.start === null || date >= range.start) &&
        (range.end === null || date < range.end);
}
exports.rangeContainsMarker = rangeContainsMarker;
// If the given date is not within the given range, move it inside.
// (If it's past the end, make it one millisecond before the end).
function constrainMarkerToRange(date, range) {
    if (range.start != null && date < range.start) {
        return range.start;
    }
    if (range.end != null && date >= range.end) {
        return new Date(range.end.valueOf() - 1);
    }
    return date;
}
exports.constrainMarkerToRange = constrainMarkerToRange;


/***/ }),
/* 12 */,
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var geom_1 = __webpack_require__(26);
var scrollbars_1 = __webpack_require__(165);
function computeEdges(el, getPadding) {
    if (getPadding === void 0) { getPadding = false; }
    var computedStyle = window.getComputedStyle(el);
    var borderLeft = parseInt(computedStyle.borderLeftWidth, 10) || 0;
    var borderRight = parseInt(computedStyle.borderRightWidth, 10) || 0;
    var borderTop = parseInt(computedStyle.borderTopWidth, 10) || 0;
    var borderBottom = parseInt(computedStyle.borderBottomWidth, 10) || 0;
    var scrollbarLeftRight = scrollbars_1.sanitizeScrollbarWidth(el.offsetWidth - el.clientWidth - borderLeft - borderRight);
    var scrollbarBottom = scrollbars_1.sanitizeScrollbarWidth(el.offsetHeight - el.clientHeight - borderTop - borderBottom);
    var res = {
        borderLeft: borderLeft,
        borderRight: borderRight,
        borderTop: borderTop,
        borderBottom: borderBottom,
        scrollbarBottom: scrollbarBottom,
        scrollbarLeft: 0,
        scrollbarRight: 0
    };
    if (scrollbars_1.getIsRtlScrollbarOnLeft() && computedStyle.direction === 'rtl') { // is the scrollbar on the left side?
        res.scrollbarLeft = scrollbarLeftRight;
    }
    else {
        res.scrollbarRight = scrollbarLeftRight;
    }
    if (getPadding) {
        res.paddingLeft = parseInt(computedStyle.paddingLeft, 10) || 0;
        res.paddingRight = parseInt(computedStyle.paddingRight, 10) || 0;
        res.paddingTop = parseInt(computedStyle.paddingTop, 10) || 0;
        res.paddingBottom = parseInt(computedStyle.paddingBottom, 10) || 0;
    }
    return res;
}
exports.computeEdges = computeEdges;
function computeInnerRect(el, goWithinPadding) {
    if (goWithinPadding === void 0) { goWithinPadding = false; }
    var outerRect = computeRect(el);
    var edges = computeEdges(el, goWithinPadding);
    var res = {
        left: outerRect.left + edges.borderLeft + edges.scrollbarLeft,
        right: outerRect.right - edges.borderRight - edges.scrollbarRight,
        top: outerRect.top + edges.borderTop,
        bottom: outerRect.bottom - edges.borderBottom - edges.scrollbarBottom
    };
    if (goWithinPadding) {
        res.left += edges.paddingLeft;
        res.right -= edges.paddingRight;
        res.top += edges.paddingTop;
        res.bottom -= edges.paddingBottom;
    }
    return res;
}
exports.computeInnerRect = computeInnerRect;
function computeRect(el) {
    var rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.pageXOffset,
        top: rect.top + window.pageYOffset,
        right: rect.right + window.pageXOffset,
        bottom: rect.bottom + window.pageYOffset
    };
}
exports.computeRect = computeRect;
function computeViewportRect() {
    return {
        left: window.pageXOffset,
        right: window.pageXOffset + document.documentElement.clientWidth,
        top: window.pageYOffset,
        bottom: window.pageYOffset + document.documentElement.clientHeight
    };
}
function computeHeightAndMargins(el) {
    var computed = window.getComputedStyle(el);
    return el.offsetHeight +
        parseInt(computed.marginTop, 10) +
        parseInt(computed.marginBottom, 10);
}
exports.computeHeightAndMargins = computeHeightAndMargins;
function getClippingParents(el) {
    var parents = [];
    while (el instanceof HTMLElement) { // will stop when gets to document or null
        var computedStyle = window.getComputedStyle(el);
        if (computedStyle.position === 'fixed') {
            break;
        }
        if ((/(auto|scroll)/).test(computedStyle.overflow + computedStyle.overflowY + computedStyle.overflowX)) {
            parents.push(el);
        }
        el = el.parentNode;
    }
    return parents;
}
exports.getClippingParents = getClippingParents;
function computeClippingRect(el) {
    return getClippingParents(el)
        .map(function (el) {
        return computeInnerRect(el);
    })
        .concat(computeViewportRect())
        .reduce(function (rect0, rect1) {
        return geom_1.intersectRects(rect0, rect1) || rect1; // should always intersect
    });
}
exports.computeClippingRect = computeClippingRect;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var event_1 = __webpack_require__(29);
var recurring_event_1 = __webpack_require__(38);
var object_1 = __webpack_require__(4);
function parseEvents(rawEvents, sourceId, calendar) {
    var eventStore = createEmptyEventStore();
    for (var _i = 0, rawEvents_1 = rawEvents; _i < rawEvents_1.length; _i++) {
        var rawEvent = rawEvents_1[_i];
        var tuple = event_1.parseEvent(rawEvent, sourceId, calendar);
        if (tuple) {
            eventTupleToStore(tuple, eventStore);
        }
    }
    return eventStore;
}
exports.parseEvents = parseEvents;
function eventTupleToStore(tuple, eventStore) {
    if (eventStore === void 0) { eventStore = createEmptyEventStore(); }
    eventStore.defs[tuple.def.defId] = tuple.def;
    if (tuple.instance) {
        eventStore.instances[tuple.instance.instanceId] = tuple.instance;
    }
    return eventStore;
}
exports.eventTupleToStore = eventTupleToStore;
function expandRecurring(eventStore, framingRange, calendar) {
    var dateEnv = calendar.dateEnv;
    var defs = eventStore.defs, instances = eventStore.instances;
    // remove existing recurring instances
    instances = object_1.filterHash(instances, function (instance) {
        return !defs[instance.defId].recurringDef;
    });
    for (var defId in defs) {
        var def = defs[defId];
        if (def.recurringDef) {
            var starts = recurring_event_1.expandRecurringRanges(def, framingRange, calendar.dateEnv);
            var duration = def.recurringDef.duration;
            if (!duration) {
                duration = def.allDay ?
                    calendar.defaultAllDayEventDuration :
                    calendar.defaultTimedEventDuration;
            }
            for (var _i = 0, starts_1 = starts; _i < starts_1.length; _i++) {
                var start = starts_1[_i];
                var instance = event_1.createEventInstance(defId, {
                    start: start,
                    end: dateEnv.add(start, duration)
                });
                instances[instance.instanceId] = instance;
            }
        }
    }
    return { defs: defs, instances: instances };
}
exports.expandRecurring = expandRecurring;
// retrieves events that have the same groupId as the instance specified by `instanceId`
// or they are the same as the instance.
// why might instanceId not be in the store? an event from another calendar?
function getRelevantEvents(eventStore, instanceId) {
    var instance = eventStore.instances[instanceId];
    if (instance) {
        var def_1 = eventStore.defs[instance.defId];
        // get events/instances with same group
        var newStore = filterEventStoreDefs(eventStore, function (lookDef) {
            return isEventDefsGrouped(def_1, lookDef);
        });
        // add the original
        // TODO: wish we could use eventTupleToStore or something like it
        newStore.defs[def_1.defId] = def_1;
        newStore.instances[instance.instanceId] = instance;
        return newStore;
    }
    return createEmptyEventStore();
}
exports.getRelevantEvents = getRelevantEvents;
function isEventDefsGrouped(def0, def1) {
    return Boolean(def0.groupId && def0.groupId === def1.groupId);
}
exports.isEventDefsGrouped = isEventDefsGrouped;
function transformRawEvents(rawEvents, eventSource, calendar) {
    var calEachTransform = calendar.opt('eventDataTransform');
    var sourceEachTransform = eventSource ? eventSource.eventDataTransform : null;
    if (sourceEachTransform) {
        rawEvents = transformEachRawEvent(rawEvents, sourceEachTransform);
    }
    if (calEachTransform) {
        rawEvents = transformEachRawEvent(rawEvents, calEachTransform);
    }
    return rawEvents;
}
exports.transformRawEvents = transformRawEvents;
function transformEachRawEvent(rawEvents, func) {
    var refinedEvents;
    if (!func) {
        refinedEvents = rawEvents;
    }
    else {
        refinedEvents = [];
        for (var _i = 0, rawEvents_2 = rawEvents; _i < rawEvents_2.length; _i++) {
            var rawEvent = rawEvents_2[_i];
            var refinedEvent = func(rawEvent);
            if (refinedEvent) {
                refinedEvents.push(refinedEvent);
            }
            else if (refinedEvent == null) {
                refinedEvents.push(rawEvent);
            } // if a different falsy value, do nothing
        }
    }
    return refinedEvents;
}
function createEmptyEventStore() {
    return { defs: {}, instances: {} };
}
exports.createEmptyEventStore = createEmptyEventStore;
function mergeEventStores(store0, store1) {
    return {
        defs: object_1.assignTo({}, store0.defs, store1.defs),
        instances: object_1.assignTo({}, store0.instances, store1.instances)
    };
}
exports.mergeEventStores = mergeEventStores;
function filterEventStoreDefs(eventStore, filterFunc) {
    var defs = object_1.filterHash(eventStore.defs, filterFunc);
    var instances = object_1.filterHash(eventStore.instances, function (instance) {
        return defs[instance.defId]; // still exists?
    });
    return { defs: defs, instances: instances };
}
exports.filterEventStoreDefs = filterEventStoreDefs;
function mapEventInstances(eventStore, callback) {
    var defs = eventStore.defs, instances = eventStore.instances;
    var res = [];
    for (var instanceId in instances) {
        var instance = instances[instanceId];
        res.push(callback(instance, defs[instance.defId]));
    }
    return res;
}
exports.mapEventInstances = mapEventInstances;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var misc_1 = __webpack_require__(2);
var duration_1 = __webpack_require__(10);
var formatting_1 = __webpack_require__(8);
var EventSourceApi_1 = __webpack_require__(141);
var html_1 = __webpack_require__(9);
var EventApi = /** @class */ (function () {
    function EventApi(calendar, def, instance) {
        this.calendar = calendar;
        this.def = def;
        this.instance = instance || null;
    }
    EventApi.prototype.setProp = function (name, val) {
        var _a;
        if (name.match(/^(start|end|date|allDay)$/)) {
            // error. date-related props need other methods
        }
        else {
            var props 
            // TODO: consolidate this logic with event struct?
            = void 0;
            // TODO: consolidate this logic with event struct?
            if (name === 'editable') {
                props = { startEditable: val, durationEditable: val };
            }
            else if (name === 'color') {
                props = { backgroundColor: val, borderColor: val };
            }
            else if (name === 'classNames') {
                props = { classNames: html_1.parseClassName(val) };
            }
            else {
                props = (_a = {}, _a[name] = val, _a);
            }
            this.mutate({
                standardProps: props
            });
        }
    };
    EventApi.prototype.setExtendedProp = function (name, val) {
        var _a;
        this.mutate({
            extendedProps: (_a = {}, _a[name] = val, _a)
        });
    };
    EventApi.prototype.setStart = function (startInput, options) {
        if (options === void 0) { options = {}; }
        var dateEnv = this.calendar.dateEnv;
        var start = dateEnv.createMarker(startInput);
        if (start && this.instance) { // TODO: warning if parsed bad
            var instanceRange = this.instance.range;
            var startDelta = misc_1.diffDates(instanceRange.start, start, dateEnv, options.granularity); // what if parsed bad!?
            var endDelta = null;
            if (options.maintainDuration) {
                var origDuration = misc_1.diffDates(instanceRange.start, instanceRange.end, dateEnv, options.granularity);
                var newDuration = misc_1.diffDates(start, instanceRange.end, dateEnv, options.granularity);
                endDelta = duration_1.subtractDurations(origDuration, newDuration);
            }
            this.mutate({ startDelta: startDelta, endDelta: endDelta });
        }
    };
    EventApi.prototype.setEnd = function (endInput, options) {
        if (options === void 0) { options = {}; }
        var dateEnv = this.calendar.dateEnv;
        var end;
        if (endInput != null) {
            end = dateEnv.createMarker(endInput);
            if (!end) {
                return; // TODO: warning if parsed bad
            }
        }
        if (this.instance) {
            if (end) {
                var endDelta = misc_1.diffDates(this.instance.range.end, end, dateEnv, options.granularity);
                this.mutate({ endDelta: endDelta });
            }
            else {
                this.mutate({ standardProps: { hasEnd: false } });
            }
        }
    };
    EventApi.prototype.setDates = function (startInput, endInput, options) {
        if (options === void 0) { options = {}; }
        var dateEnv = this.calendar.dateEnv;
        var standardProps = { allDay: options.allDay };
        var start = dateEnv.createMarker(startInput);
        var end;
        if (!start) {
            return; // TODO: warning if parsed bad
        }
        if (endInput != null) {
            end = dateEnv.createMarker(endInput);
            if (!end) { // TODO: warning if parsed bad
                return;
            }
        }
        if (this.instance) {
            var instanceRange = this.instance.range;
            // when computing the diff for an event being converted to all-day,
            // compute diff off of the all-day values the way event-mutation does.
            if (options.allDay === true) {
                instanceRange = misc_1.computeAlignedDayRange(instanceRange);
            }
            var startDelta = misc_1.diffDates(instanceRange.start, start, dateEnv, options.granularity);
            if (end) {
                var endDelta = misc_1.diffDates(instanceRange.end, end, dateEnv, options.granularity);
                this.mutate({ startDelta: startDelta, endDelta: endDelta, standardProps: standardProps });
            }
            else {
                standardProps.hasEnd = false;
                this.mutate({ startDelta: startDelta, standardProps: standardProps });
            }
        }
    };
    EventApi.prototype.moveStart = function (deltaInput) {
        var delta = duration_1.createDuration(deltaInput);
        if (delta) { // TODO: warning if parsed bad
            this.mutate({ startDelta: delta });
        }
    };
    EventApi.prototype.moveEnd = function (deltaInput) {
        var delta = duration_1.createDuration(deltaInput);
        if (delta) { // TODO: warning if parsed bad
            this.mutate({ endDelta: delta });
        }
    };
    EventApi.prototype.moveDates = function (deltaInput) {
        var delta = duration_1.createDuration(deltaInput);
        if (delta) { // TODO: warning if parsed bad
            this.mutate({ startDelta: delta, endDelta: delta });
        }
    };
    EventApi.prototype.setAllDay = function (allDay, options) {
        if (options === void 0) { options = {}; }
        var standardProps = { allDay: allDay };
        var maintainDuration = options.maintainDuration;
        if (maintainDuration == null) {
            maintainDuration = this.calendar.opt('allDayMaintainDuration');
        }
        if (this.def.allDay !== allDay) {
            standardProps.hasEnd = maintainDuration;
        }
        this.mutate({ standardProps: standardProps });
    };
    EventApi.prototype.formatRange = function (formatInput) {
        var dateEnv = this.calendar.dateEnv;
        var instance = this.instance;
        var formatter = formatting_1.createFormatter(formatInput, this.calendar.opt('defaultRangeSeparator'));
        if (this.def.hasEnd) {
            return dateEnv.formatRange(instance.range.start, instance.range.end, formatter, {
                forcedStartTzo: instance.forcedStartTzo,
                forcedEndTzo: instance.forcedEndTzo
            });
        }
        else {
            return dateEnv.format(instance.range.start, formatter, {
                forcedTzo: instance.forcedStartTzo
            });
        }
    };
    EventApi.prototype.mutate = function (mutation) {
        var instance = this.instance;
        if (instance) {
            this.calendar.dispatch({
                type: 'MUTATE_EVENTS',
                instanceId: instance.instanceId,
                mutation: mutation
            });
            var eventStore = this.calendar.state.eventStore;
            this.def = eventStore.defs[this.def.defId];
            this.instance = eventStore.instances[this.instance.instanceId];
        }
    };
    EventApi.prototype.remove = function () {
        this.calendar.dispatch({
            type: 'REMOVE_EVENT_DEF',
            defId: this.def.defId
        });
    };
    Object.defineProperty(EventApi.prototype, "source", {
        get: function () {
            if (this.def.sourceId) {
                return new EventSourceApi_1.default(this.calendar, this.calendar.state.eventSources[this.def.sourceId]);
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "start", {
        get: function () {
            return this.instance ?
                this.calendar.dateEnv.toDate(this.instance.range.start) :
                null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "end", {
        get: function () {
            return (this.instance && this.def.hasEnd) ?
                this.calendar.dateEnv.toDate(this.instance.range.end) :
                null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "id", {
        // computable props that all access the def
        // TODO: find a TypeScript-compatible way to do this at scale
        get: function () { return this.def.publicId; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "groupId", {
        get: function () { return this.def.groupId; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "allDay", {
        get: function () { return this.def.allDay; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "title", {
        get: function () { return this.def.title; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "url", {
        get: function () { return this.def.url; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "startEditable", {
        get: function () { return this.def.startEditable; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "durationEditable", {
        get: function () { return this.def.durationEditable; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "constraint", {
        get: function () { return this.def.constraint; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "overlap", {
        get: function () { return this.def.overlap; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "rendering", {
        get: function () { return this.def.rendering; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "backgroundColor", {
        get: function () { return this.def.backgroundColor; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "borderColor", {
        get: function () { return this.def.borderColor; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "textColor", {
        get: function () { return this.def.textColor; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "classNames", {
        // NOTE: user can't modify these because Object.freeze was called in event-def parsing
        get: function () { return this.def.classNames; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventApi.prototype, "extendedProps", {
        get: function () { return this.def.extendedProps; },
        enumerable: true,
        configurable: true
    });
    return EventApi;
}());
exports.default = EventApi;


/***/ }),
/* 16 */,
/* 17 */,
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var formatting_1 = __webpack_require__(8);
var dom_manip_1 = __webpack_require__(3);
var misc_1 = __webpack_require__(2);
var event_rendering_1 = __webpack_require__(28);
var EventApi_1 = __webpack_require__(15);
var object_1 = __webpack_require__(4);
var EventRenderer = /** @class */ (function () {
    function EventRenderer(component, fillRenderer) {
        this.view = component.view;
        this.component = component;
        this.fillRenderer = fillRenderer;
    }
    EventRenderer.prototype.opt = function (name) {
        return this.view.opt(name);
    };
    // Updates values that rely on options and also relate to range
    EventRenderer.prototype.rangeUpdated = function () {
        var displayEventTime;
        var displayEventEnd;
        this.eventTimeFormat = formatting_1.createFormatter(this.opt('eventTimeFormat') || this.computeEventTimeFormat(), this.opt('defaultRangeSeparator'));
        displayEventTime = this.opt('displayEventTime');
        if (displayEventTime == null) {
            displayEventTime = this.computeDisplayEventTime(); // might be based off of range
        }
        displayEventEnd = this.opt('displayEventEnd');
        if (displayEventEnd == null) {
            displayEventEnd = this.computeDisplayEventEnd(); // might be based off of range
        }
        this.displayEventTime = displayEventTime;
        this.displayEventEnd = displayEventEnd;
    };
    EventRenderer.prototype.renderSegs = function (allSegs) {
        var bgSegs = [];
        var fgSegs = [];
        for (var _i = 0, allSegs_1 = allSegs; _i < allSegs_1.length; _i++) {
            var seg = allSegs_1[_i];
            if (event_rendering_1.hasBgRendering(seg.eventRange.ui)) {
                bgSegs.push(seg);
            }
            else {
                fgSegs.push(seg);
            }
        }
        this.bgSegs = this.renderBgSegs(bgSegs);
        // render an `.el` on each seg
        // returns a subset of the segs. segs that were actually rendered
        fgSegs = this.renderFgSegEls(fgSegs);
        if (this.renderFgSegs(fgSegs) !== false) { // no failure?
            this.fgSegs = fgSegs;
        }
        this.view.triggerRenderedSegs(this.getSegs());
    };
    EventRenderer.prototype.unrender = function () {
        this.unrenderBgSegs();
        this.bgSegs = null;
        this.unrenderFgSegs(this.fgSegs || []);
        this.fgSegs = null;
    };
    EventRenderer.prototype.getSegs = function () {
        return (this.bgSegs || []).concat(this.fgSegs || []);
    };
    // Renders foreground event segments onto the grid
    EventRenderer.prototype.renderFgSegs = function (segs) {
        // subclasses must implement
        // segs already has rendered els, and has been filtered.
        return false; // signal failure if not implemented
    };
    // Unrenders all currently rendered foreground segments
    EventRenderer.prototype.unrenderFgSegs = function (segs) {
        // subclasses must implement
    };
    EventRenderer.prototype.renderBgSegs = function (segs) {
        var _this = this;
        if (this.fillRenderer) {
            return this.fillRenderer.renderSegs('bgEvent', segs, {
                getClasses: function (seg) {
                    return seg.eventRange.ui.classNames.concat(['fc-bgevent']);
                },
                getCss: function (seg) {
                    return {
                        'background-color': seg.eventRange.ui.backgroundColor
                    };
                },
                filterEl: function (seg, el) {
                    el = _this.filterEventRenderEl(seg, el);
                    if (el) {
                        setElSeg(el, seg);
                        seg.el = el;
                    }
                    return el;
                }
            });
        }
        return [];
    };
    EventRenderer.prototype.unrenderBgSegs = function () {
        if (this.fillRenderer) {
            this.fillRenderer.unrender('bgEvent');
        }
    };
    // Renders and assigns an `el` property for each foreground event segment.
    // Only returns segments that successfully rendered.
    EventRenderer.prototype.renderFgSegEls = function (segs, isMirrors) {
        var _this = this;
        var hasEventRenderHandlers = this.view.hasPublicHandlers('eventRender');
        var html = '';
        var renderedSegs = [];
        var i;
        if (segs.length) { // don't build an empty html string
            // build a large concatenation of event segment HTML
            for (i = 0; i < segs.length; i++) {
                html += this.fgSegHtml(segs[i]);
            }
            // Grab individual elements from the combined HTML string. Use each as the default rendering.
            // Then, compute the 'el' for each segment. An el might be null if the eventRender callback returned false.
            dom_manip_1.htmlToElements(html).forEach(function (el, i) {
                var seg = segs[i];
                if (hasEventRenderHandlers) { // optimization
                    el = _this.filterEventRenderEl(seg, el, isMirrors);
                }
                if (el) {
                    setElSeg(el, seg);
                    seg.el = el;
                    renderedSegs.push(seg);
                }
            });
        }
        return renderedSegs;
    };
    // Generates the HTML for the default rendering of a foreground event segment. Used by renderFgSegEls()
    EventRenderer.prototype.fgSegHtml = function (seg) {
        // subclasses should implement
    };
    // Generic utility for generating the HTML classNames for an event segment's element
    EventRenderer.prototype.getSegClasses = function (seg, isDraggable, isResizable) {
        var classes = [
            'fc-event',
            seg.isStart ? 'fc-start' : 'fc-not-start',
            seg.isEnd ? 'fc-end' : 'fc-not-end'
        ].concat(seg.eventRange.ui.classNames);
        if (isDraggable) {
            classes.push('fc-draggable');
        }
        if (isResizable) {
            classes.push('fc-resizable');
        }
        // event is currently selected? attach a className.
        if (seg.eventRange.instance.instanceId === this.component.eventSelection) {
            classes.push('fc-selected');
        }
        return classes;
    };
    // Given an event and the default element used for rendering, returns the element that should actually be used.
    // Basically runs events and elements through the eventRender hook.
    EventRenderer.prototype.filterEventRenderEl = function (seg, el, isMirror) {
        if (isMirror === void 0) { isMirror = false; }
        var custom = this.view.publiclyTrigger('eventRender', [
            {
                event: new EventApi_1.default(this.view.calendar, seg.eventRange.def, seg.eventRange.instance),
                isMirror: isMirror,
                isStart: seg.isStart,
                isEnd: seg.isEnd,
                // TODO: include seg.range once all components consistently generate it
                el: el,
                view: this.view
            }
        ]);
        if (custom === false) { // means don't render at all
            el = null;
        }
        else if (custom && custom !== true) {
            el = custom;
        }
        return el;
    };
    // Compute the text that should be displayed on an event's element.
    // `range` can be the Event object itself, or something range-like, with at least a `start`.
    // If event times are disabled, or the event has no time, will return a blank string.
    // If not specified, formatter will default to the eventTimeFormat setting,
    // and displayEnd will default to the displayEventEnd setting.
    EventRenderer.prototype.getTimeText = function (eventRange, formatter, displayEnd) {
        var def = eventRange.def, instance = eventRange.instance;
        return this._getTimeText(instance.range.start, def.hasEnd ? instance.range.end : null, def.allDay, formatter, displayEnd, instance.forcedStartTzo, instance.forcedEndTzo);
    };
    EventRenderer.prototype._getTimeText = function (start, end, allDay, formatter, displayEnd, forcedStartTzo, forcedEndTzo) {
        var dateEnv = this.view.calendar.dateEnv;
        if (formatter == null) {
            formatter = this.eventTimeFormat;
        }
        if (displayEnd == null) {
            displayEnd = this.displayEventEnd;
        }
        if (this.displayEventTime && !allDay) {
            if (displayEnd && end) {
                return dateEnv.formatRange(start, end, formatter, {
                    forcedStartTzo: forcedStartTzo,
                    forcedEndTzo: forcedEndTzo
                });
            }
            else {
                return dateEnv.format(start, formatter, {
                    forcedTzo: forcedStartTzo
                });
            }
        }
        return '';
    };
    EventRenderer.prototype.computeEventTimeFormat = function () {
        return {
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: true
        };
    };
    EventRenderer.prototype.computeDisplayEventTime = function () {
        return true;
    };
    EventRenderer.prototype.computeDisplayEventEnd = function () {
        return true;
    };
    // Utility for generating event skin-related CSS properties
    EventRenderer.prototype.getSkinCss = function (ui) {
        return {
            'background-color': ui.backgroundColor,
            'border-color': ui.borderColor,
            color: ui.textColor
        };
    };
    EventRenderer.prototype.sortEventSegs = function (segs) {
        var specs = this.view.eventOrderSpecs;
        var objs = segs.map(buildSegCompareObj);
        objs.sort(function (obj0, obj1) {
            return misc_1.compareByFieldSpecs(obj0, obj1, specs);
        });
        return objs.map(function (c) {
            return c._seg;
        });
    };
    EventRenderer.prototype.computeFgSize = function () {
    };
    EventRenderer.prototype.assignFgSize = function () {
    };
    return EventRenderer;
}());
exports.default = EventRenderer;
function setElSeg(el, seg) {
    el.fcSeg = seg;
}
function getElSeg(el) {
    return el.fcSeg || null;
}
exports.getElSeg = getElSeg;
// returns a object with all primitive props that can be compared
function buildSegCompareObj(seg) {
    var eventDef = seg.eventRange.def;
    var range = seg.eventRange.instance.range;
    var start = range.start.valueOf();
    var end = range.end.valueOf();
    return object_1.assignTo({}, eventDef.extendedProps, eventDef, {
        id: eventDef.publicId,
        start: start,
        end: end,
        duration: end - start,
        allDay: Number(eventDef.allDay),
        _seg: seg // for later retrieval
    });
}
exports.buildSegCompareObj = buildSegCompareObj;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var dom_manip_1 = __webpack_require__(3);
// Stops a mouse/touch event from doing it's native browser action
function preventDefault(ev) {
    ev.preventDefault();
}
exports.preventDefault = preventDefault;
// Event Delegation
// ----------------------------------------------------------------------------------------------------------------
function listenBySelector(container, eventType, selector, handler) {
    function realHandler(ev) {
        var matchedChild = dom_manip_1.elementClosest(ev.target, selector);
        if (matchedChild) {
            handler.call(matchedChild, ev, matchedChild);
        }
    }
    container.addEventListener(eventType, realHandler);
    return function () {
        container.removeEventListener(eventType, realHandler);
    };
}
exports.listenBySelector = listenBySelector;
function listenToHoverBySelector(container, selector, onMouseEnter, onMouseLeave) {
    var currentMatchedChild;
    return listenBySelector(container, 'mouseover', selector, function (ev, matchedChild) {
        if (matchedChild !== currentMatchedChild) {
            currentMatchedChild = matchedChild;
            onMouseEnter(ev, matchedChild);
            var realOnMouseLeave_1 = function (ev) {
                currentMatchedChild = null;
                onMouseLeave(ev, matchedChild);
                matchedChild.removeEventListener('mouseleave', realOnMouseLeave_1);
            };
            // listen to the next mouseleave, and then unattach
            matchedChild.addEventListener('mouseleave', realOnMouseLeave_1);
        }
    });
}
exports.listenToHoverBySelector = listenToHoverBySelector;
// Animation
// ----------------------------------------------------------------------------------------------------------------
var transitionEventNames = [
    'webkitTransitionEnd',
    'otransitionend',
    'oTransitionEnd',
    'msTransitionEnd',
    'transitionend'
];
// triggered only when the next single subsequent transition finishes
function whenTransitionDone(el, callback) {
    var realCallback = function (ev) {
        callback(ev);
        transitionEventNames.forEach(function (eventName) {
            el.removeEventListener(eventName, realCallback);
        });
    };
    transitionEventNames.forEach(function (eventName) {
        el.addEventListener(eventName, realCallback); // cross-browser way to determine when the transition finishes
    });
}
exports.whenTransitionDone = whenTransitionDone;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

/*
USAGE:
  import { default as EmitterMixin, EmitterInterface } from './EmitterMixin'
in class:
  on: EmitterInterface['on']
  one: EmitterInterface['one']
  off: EmitterInterface['off']
  trigger: EmitterInterface['trigger']
  triggerWith: EmitterInterface['triggerWith']
  hasHandlers: EmitterInterface['hasHandlers']
after class:
  EmitterMixin.mixInto(TheClass)
*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var misc_1 = __webpack_require__(2);
var Mixin_1 = __webpack_require__(47);
var EmitterMixin = /** @class */ (function (_super) {
    tslib_1.__extends(EmitterMixin, _super);
    function EmitterMixin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EmitterMixin.prototype.on = function (type, handler) {
        addToHash(this._handlers || (this._handlers = {}), type, handler);
        return this; // for chaining
    };
    // todo: add comments
    EmitterMixin.prototype.one = function (type, handler) {
        addToHash(this._oneHandlers || (this._oneHandlers = {}), type, handler);
        return this; // for chaining
    };
    EmitterMixin.prototype.off = function (type, handler) {
        if (this._handlers) {
            removeFromHash(this._handlers, type, handler);
        }
        if (this._oneHandlers) {
            removeFromHash(this._oneHandlers, type, handler);
        }
        return this; // for chaining
    };
    EmitterMixin.prototype.trigger = function (type) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.triggerWith(type, this, args);
        return this; // for chaining
    };
    EmitterMixin.prototype.triggerWith = function (type, context, args) {
        if (this._handlers) {
            misc_1.applyAll(this._handlers[type], context, args);
        }
        if (this._oneHandlers) {
            misc_1.applyAll(this._oneHandlers[type], context, args);
            delete this._oneHandlers[type]; // will never fire again
        }
        return this; // for chaining
    };
    EmitterMixin.prototype.hasHandlers = function (type) {
        return (this._handlers && this._handlers[type] && this._handlers[type].length) ||
            (this._oneHandlers && this._oneHandlers[type] && this._oneHandlers[type].length);
    };
    return EmitterMixin;
}(Mixin_1.default));
exports.default = EmitterMixin;
function addToHash(hash, type, handler) {
    (hash[type] || (hash[type] = []))
        .push(handler);
}
function removeFromHash(hash, type, handler) {
    if (handler) {
        if (hash[type]) {
            hash[type] = hash[type].filter(function (func) {
                return func !== handler;
            });
        }
    }
    else {
        delete hash[type]; // remove all handler funcs for this type
    }
}


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var html_1 = __webpack_require__(9);
var dom_manip_1 = __webpack_require__(3);
var Component_1 = __webpack_require__(140);
var marker_1 = __webpack_require__(6);
var duration_1 = __webpack_require__(10);
var event_rendering_1 = __webpack_require__(28);
var event_store_1 = __webpack_require__(14);
var object_1 = __webpack_require__(4);
var browser_context_1 = __webpack_require__(53);
var date_range_1 = __webpack_require__(11);
var EventApi_1 = __webpack_require__(15);
var event_1 = __webpack_require__(29);
var EmitterMixin_1 = __webpack_require__(20);
var validation_1 = __webpack_require__(39);
var uid = 0;
var DateComponent = /** @class */ (function (_super) {
    tslib_1.__extends(DateComponent, _super);
    function DateComponent(_view, _options) {
        var _this = _super.call(this) || this;
        // self-config, overridable by subclasses
        _this.isInteractable = false;
        _this.useEventCenter = true; // for dragging geometry
        _this.doesDragMirror = false; // for events that ORIGINATE from this component
        _this.doesDragHighlight = false; // for events that ORIGINATE from this component
        _this.fgSegSelector = '.fc-event-container > *'; // lets eventRender produce elements without fc-event class
        _this.bgSegSelector = '.fc-bgevent';
        _this.slicingType = null;
        _this.isRtl = false; // frequently accessed options
        _this.emitter = new EmitterMixin_1.default();
        _this.renderedFlags = {};
        _this.dirtySizeFlags = {};
        _this.needHitsDepth = 0;
        _this.dateProfile = null;
        _this.businessHours = null;
        _this.eventStore = null;
        _this.eventUis = null;
        _this.dateSelection = null;
        _this.eventSelection = '';
        _this.eventDrag = null;
        _this.eventResize = null;
        // hack to set options prior to the this.opt calls
        _this.view = _view || _this;
        if (_options) {
            _this['options'] = _options;
        }
        _this.uid = String(uid++);
        _this.childrenByUid = {};
        _this.nextDayThreshold = duration_1.createDuration(_this.opt('nextDayThreshold'));
        _this.isRtl = _this.opt('dir') === 'rtl';
        if (_this.fillRendererClass) {
            _this.fillRenderer = new _this.fillRendererClass(_this);
        }
        if (_this.eventRendererClass) { // fillRenderer is optional -----v
            _this.eventRenderer = new _this.eventRendererClass(_this, _this.fillRenderer);
        }
        if (_this.mirrorRendererClass && _this.eventRenderer) {
            _this.mirrorRenderer = new _this.mirrorRendererClass(_this, _this.eventRenderer);
        }
        return _this;
    }
    DateComponent.prototype.addChild = function (child) {
        if (!this.childrenByUid[child.uid]) {
            this.childrenByUid[child.uid] = child;
            return true;
        }
        return false;
    };
    DateComponent.prototype.removeChild = function (child) {
        if (this.childrenByUid[child.uid]) {
            delete this.childrenByUid[child.uid];
            return true;
        }
        return false;
    };
    DateComponent.prototype.updateSize = function (totalHeight, isAuto, force) {
        var flags = this.dirtySizeFlags;
        if (force || flags.skeleton || flags.dates || flags.events) {
            // sort of the catch-all sizing
            // anything that might cause dimension changes
            this.updateBaseSize(totalHeight, isAuto);
            this.buildPositionCaches();
        }
        if (force || flags.businessHours) {
            this.computeBusinessHoursSize();
        }
        if (force || flags.dateSelection || flags.eventDrag || flags.eventResize) {
            this.computeHighlightSize();
            this.computeMirrorSize();
        }
        if (force || flags.events) {
            this.computeEventsSize();
        }
        if (force || flags.businessHours) {
            this.assignBusinessHoursSize();
        }
        if (force || flags.dateSelection || flags.eventDrag || flags.eventResize) {
            this.assignHighlightSize();
            this.assignMirrorSize();
        }
        if (force || flags.events) {
            this.assignEventsSize();
        }
        this.dirtySizeFlags = {};
        this.callChildren('updateSize', arguments); // always do this at end?
    };
    DateComponent.prototype.updateBaseSize = function (totalHeight, isAuto) {
    };
    DateComponent.prototype.buildPositionCaches = function () {
    };
    DateComponent.prototype.requestPrepareHits = function () {
        if (!(this.needHitsDepth++)) {
            this.prepareHits();
        }
    };
    DateComponent.prototype.requestReleaseHits = function () {
        if (!(--this.needHitsDepth)) {
            this.releaseHits();
        }
    };
    DateComponent.prototype.prepareHits = function () {
    };
    DateComponent.prototype.releaseHits = function () {
    };
    DateComponent.prototype.queryHit = function (leftOffset, topOffset) {
        return null; // this should be abstract
    };
    DateComponent.prototype.bindGlobalHandlers = function () {
        if (this.isInteractable) {
            browser_context_1.default.registerComponent(this);
        }
    };
    DateComponent.prototype.unbindGlobalHandlers = function () {
        if (this.isInteractable) {
            browser_context_1.default.unregisterComponent(this);
        }
    };
    // Options
    // -----------------------------------------------------------------------------------------------------------------
    DateComponent.prototype.opt = function (name) {
        return this.view.options[name];
    };
    // Triggering
    // -----------------------------------------------------------------------------------------------------------------
    DateComponent.prototype.publiclyTrigger = function (name, args) {
        var calendar = this.getCalendar();
        return calendar.publiclyTrigger(name, args);
    };
    DateComponent.prototype.publiclyTriggerAfterSizing = function (name, args) {
        var calendar = this.getCalendar();
        return calendar.publiclyTriggerAfterSizing(name, args);
    };
    DateComponent.prototype.hasPublicHandlers = function (name) {
        var calendar = this.getCalendar();
        return calendar.hasPublicHandlers(name);
    };
    DateComponent.prototype.triggerRenderedSegs = function (segs, isMirrors) {
        if (isMirrors === void 0) { isMirrors = false; }
        if (this.hasPublicHandlers('eventPositioned')) {
            var calendar = this.getCalendar();
            for (var _i = 0, segs_1 = segs; _i < segs_1.length; _i++) {
                var seg = segs_1[_i];
                this.publiclyTriggerAfterSizing('eventPositioned', [
                    {
                        event: new EventApi_1.default(calendar, seg.eventRange.def, seg.eventRange.instance),
                        isMirror: isMirrors,
                        isStart: seg.isStart,
                        isEnd: seg.isEnd,
                        el: seg.el,
                        view: this
                    }
                ]);
            }
        }
    };
    DateComponent.prototype.triggerWillRemoveSegs = function (segs) {
        for (var _i = 0, segs_2 = segs; _i < segs_2.length; _i++) {
            var seg = segs_2[_i];
            this.emitter.trigger('eventElRemove', seg.el);
        }
        if (this.hasPublicHandlers('eventDestroy')) {
            var calendar = this.getCalendar();
            for (var _a = 0, segs_3 = segs; _a < segs_3.length; _a++) {
                var seg = segs_3[_a];
                this.publiclyTrigger('eventDestroy', [
                    {
                        event: new EventApi_1.default(calendar, seg.eventRange.def, seg.eventRange.instance),
                        el: seg.el,
                        view: this
                    }
                ]);
            }
        }
    };
    // Root Rendering
    // -----------------------------------------------------------------------------------------------------------------
    DateComponent.prototype.render = function (renderState, forceFlags) {
        var renderedFlags = this.renderedFlags;
        var dirtyFlags = {
            skeleton: false,
            dates: renderState.dateProfile !== this.dateProfile,
            events: renderState.eventStore !== this.eventStore || renderState.eventUis !== this.eventUis,
            businessHours: renderState.businessHours !== this.businessHours,
            dateSelection: renderState.dateSelection !== this.dateSelection,
            eventSelection: renderState.eventSelection !== this.eventSelection,
            eventDrag: renderState.eventDrag !== this.eventDrag,
            eventResize: renderState.eventResize !== this.eventResize
        };
        object_1.assignTo(dirtyFlags, forceFlags);
        if (forceFlags === true) {
            // everthing must be marked as dirty when doing a forced resize
            for (var name_1 in dirtyFlags) {
                dirtyFlags[name_1] = true;
            }
        }
        else {
            // mark things that are still not rendered as dirty
            for (var name_2 in dirtyFlags) {
                if (!renderedFlags[name_2]) {
                    dirtyFlags[name_2] = true;
                }
            }
            // when the dates are dirty, mark nearly everything else as dirty too
            if (dirtyFlags.dates) {
                for (var name_3 in dirtyFlags) {
                    if (name_3 !== 'skeleton') {
                        dirtyFlags[name_3] = true;
                    }
                }
            }
        }
        this.unrender(dirtyFlags); // only unrender dirty things
        object_1.assignTo(this, renderState); // assign incoming state to local state
        this.renderByFlag(renderState, dirtyFlags); // only render dirty things
        this.renderChildren(renderState, forceFlags);
    };
    DateComponent.prototype.renderByFlag = function (renderState, flags) {
        var _a = this, renderedFlags = _a.renderedFlags, dirtySizeFlags = _a.dirtySizeFlags;
        if (flags.skeleton) {
            this.renderSkeleton();
            this.afterSkeletonRender();
            renderedFlags.skeleton = true;
            dirtySizeFlags.skeleton = true;
        }
        if (flags.dates && renderState.dateProfile) {
            this.renderDates(renderState.dateProfile);
            this.afterDatesRender();
            renderedFlags.dates = true;
            dirtySizeFlags.dates = true;
        }
        if (flags.businessHours && renderState.businessHours) {
            this.renderBusinessHours(renderState.businessHours);
            renderedFlags.businessHours = true;
            dirtySizeFlags.businessHours = true;
        }
        if (flags.dateSelection && renderState.dateSelection) {
            this.renderDateSelection(renderState.dateSelection);
            renderedFlags.dateSelection = true;
            dirtySizeFlags.dateSelection = true;
        }
        if (flags.events && renderState.eventStore) {
            this.renderEvents(renderState.eventStore, renderState.eventUis);
            renderedFlags.events = true;
            dirtySizeFlags.events = true;
        }
        if (flags.eventSelection) {
            this.selectEventsByInstanceId(renderState.eventSelection);
            renderedFlags.eventSelection = true;
            dirtySizeFlags.eventSelection = true;
        }
        if (flags.eventDrag && renderState.eventDrag) {
            this.renderEventDragState(renderState.eventDrag);
            renderedFlags.eventDrag = true;
            dirtySizeFlags.eventDrag = true;
        }
        if (flags.eventResize && renderState.eventResize) {
            this.renderEventResizeState(renderState.eventResize);
            renderedFlags.eventResize = true;
            dirtySizeFlags.eventResize = true;
        }
    };
    DateComponent.prototype.unrender = function (flags) {
        var renderedFlags = this.renderedFlags;
        if ((!flags || flags.eventResize) && renderedFlags.eventResize) {
            this.unrenderEventResizeState();
            renderedFlags.eventResize = false;
        }
        if ((!flags || flags.eventDrag) && renderedFlags.eventDrag) {
            this.unrenderEventDragState();
            renderedFlags.eventDrag = false;
        }
        if ((!flags || flags.eventSelection) && renderedFlags.eventSelection) {
            this.unselectAllEvents();
            renderedFlags.eventSelection = false;
        }
        if ((!flags || flags.events) && renderedFlags.events) {
            this.unrenderEvents();
            renderedFlags.events = false;
        }
        if ((!flags || flags.dateSelection) && renderedFlags.dateSelection) {
            this.unrenderDateSelection();
            renderedFlags.dateSelection = false;
        }
        if ((!flags || flags.businessHours) && renderedFlags.businessHours) {
            this.unrenderBusinessHours();
            renderedFlags.businessHours = false;
        }
        if ((!flags || flags.dates) && renderedFlags.dates) {
            this.beforeDatesUnrender();
            this.unrenderDates();
            renderedFlags.dates = false;
        }
        if ((!flags || flags.skeleton) && renderedFlags.skeleton) {
            this.beforeSkeletonUnrender();
            this.unrenderSkeleton();
            renderedFlags.skeleton = false;
        }
    };
    DateComponent.prototype.renderChildren = function (renderState, forceFlags) {
        this.callChildren('render', arguments);
    };
    DateComponent.prototype.removeElement = function () {
        this.unrender();
        this.dirtySizeFlags = {};
        _super.prototype.removeElement.call(this);
    };
    // Skeleton
    // -----------------------------------------------------------------------------------------------------------------
    DateComponent.prototype.renderSkeleton = function () {
        // subclasses should implement
    };
    DateComponent.prototype.afterSkeletonRender = function () { };
    DateComponent.prototype.beforeSkeletonUnrender = function () { };
    DateComponent.prototype.unrenderSkeleton = function () {
        // subclasses should implement
    };
    // Date
    // -----------------------------------------------------------------------------------------------------------------
    // date-cell content only
    DateComponent.prototype.renderDates = function (dateProfile) {
        // subclasses should implement
    };
    DateComponent.prototype.afterDatesRender = function () { };
    DateComponent.prototype.beforeDatesUnrender = function () { };
    // date-cell content only
    DateComponent.prototype.unrenderDates = function () {
        // subclasses should override
    };
    // Now-Indicator
    // -----------------------------------------------------------------------------------------------------------------
    // Returns a string unit, like 'second' or 'minute' that defined how often the current time indicator
    // should be refreshed. If something falsy is returned, no time indicator is rendered at all.
    DateComponent.prototype.getNowIndicatorUnit = function () {
        // subclasses should implement
    };
    // Renders a current time indicator at the given datetime
    DateComponent.prototype.renderNowIndicator = function (date) {
        this.callChildren('renderNowIndicator', arguments);
    };
    // Undoes the rendering actions from renderNowIndicator
    DateComponent.prototype.unrenderNowIndicator = function () {
        this.callChildren('unrenderNowIndicator', arguments);
    };
    // Business Hours
    // ---------------------------------------------------------------------------------------------------------------
    DateComponent.prototype.renderBusinessHours = function (businessHours) {
        if (this.slicingType) { // can use eventStoreToRanges?
            var expandedStore = event_store_1.expandRecurring(businessHours, this.dateProfile.activeRange, this.getCalendar());
            this.renderBusinessHourRanges(this.eventStoreToRanges(expandedStore, event_rendering_1.computeEventDefUis(expandedStore.defs, {}, {})));
        }
    };
    DateComponent.prototype.renderBusinessHourRanges = function (eventRanges) {
        if (this.fillRenderer) {
            this.fillRenderer.renderSegs('businessHours', this.eventRangesToSegs(eventRanges), {
                getClasses: function (seg) {
                    return ['fc-bgevent'].concat(seg.eventRange.def.classNames);
                }
            });
        }
    };
    // Unrenders previously-rendered business-hours
    DateComponent.prototype.unrenderBusinessHours = function () {
        if (this.fillRenderer) {
            this.fillRenderer.unrender('businessHours');
        }
    };
    DateComponent.prototype.computeBusinessHoursSize = function () {
        if (this.fillRenderer) {
            this.fillRenderer.computeSize('businessHours');
        }
    };
    DateComponent.prototype.assignBusinessHoursSize = function () {
        if (this.fillRenderer) {
            this.fillRenderer.assignSize('businessHours');
        }
    };
    // Event Displaying
    // -----------------------------------------------------------------------------------------------------------------
    DateComponent.prototype.renderEvents = function (eventStore, eventUis) {
        if (this.slicingType) { // can use eventStoreToRanges?
            this.renderEventRanges(this.eventStoreToRanges(eventStore, eventUis));
        }
    };
    DateComponent.prototype.renderEventRanges = function (eventRanges) {
        if (this.eventRenderer) {
            this.eventRenderer.rangeUpdated(); // poorly named now
            this.eventRenderer.renderSegs(this.eventRangesToSegs(eventRanges));
            var calendar = this.getCalendar();
            if (!calendar.state.loadingLevel) { // avoid initial empty state while pending
                calendar.afterSizingTriggers._eventsPositioned = [null]; // fire once
            }
        }
    };
    DateComponent.prototype.unrenderEvents = function () {
        if (this.eventRenderer) {
            this.triggerWillRemoveSegs(this.eventRenderer.getSegs());
            this.eventRenderer.unrender();
        }
    };
    DateComponent.prototype.computeEventsSize = function () {
        if (this.fillRenderer) {
            this.fillRenderer.computeSize('bgEvent');
        }
        if (this.eventRenderer) {
            this.eventRenderer.computeFgSize();
        }
    };
    DateComponent.prototype.assignEventsSize = function () {
        if (this.fillRenderer) {
            this.fillRenderer.assignSize('bgEvent');
        }
        if (this.eventRenderer) {
            this.eventRenderer.assignFgSize();
        }
    };
    // Drag-n-Drop Rendering (for both events and external elements)
    // ---------------------------------------------------------------------------------------------------------------
    DateComponent.prototype.renderEventDragState = function (state) {
        this.hideSegsByHash(state.affectedEvents.instances);
        this.renderEventDrag(state.mutatedEvents, state.eventUis, state.isEvent, state.origSeg);
    };
    DateComponent.prototype.unrenderEventDragState = function () {
        this.showSegsByHash(this.eventDrag.affectedEvents.instances);
        this.unrenderEventDrag();
    };
    // Renders a visual indication of a event or external-element drag over the given drop zone.
    // If an external-element, seg will be `null`.
    DateComponent.prototype.renderEventDrag = function (eventStore, eventUis, isEvent, origSeg) {
        var segs = this.eventRangesToSegs(this.eventStoreToRanges(eventStore, eventUis));
        // if the user is dragging something that is considered an event with real event data,
        // and this component likes to do drag mirrors OR the component where the seg came from
        // likes to do drag mirrors, then render a drag mirror.
        if (isEvent && (this.doesDragMirror || origSeg && origSeg.component.doesDragMirror)) {
            if (this.mirrorRenderer) {
                this.mirrorRenderer.renderEventDraggingSegs(segs, origSeg);
            }
        }
        // if it would be impossible to render a drag mirror OR this component likes to render
        // highlights, then render a highlight.
        if (!isEvent || this.doesDragHighlight) {
            this.renderHighlightSegs(segs);
        }
    };
    // Unrenders a visual indication of an event or external-element being dragged.
    DateComponent.prototype.unrenderEventDrag = function () {
        this.unrenderHighlight();
        if (this.mirrorRenderer) {
            this.mirrorRenderer.unrender();
        }
    };
    // Event Resizing
    // ---------------------------------------------------------------------------------------------------------------
    DateComponent.prototype.renderEventResizeState = function (state) {
        this.hideSegsByHash(state.affectedEvents.instances);
        this.renderEventResize(state.mutatedEvents, state.eventUis, state.origSeg);
    };
    DateComponent.prototype.unrenderEventResizeState = function () {
        this.showSegsByHash(this.eventResize.affectedEvents.instances);
        this.unrenderEventResize();
    };
    // Renders a visual indication of an event being resized.
    DateComponent.prototype.renderEventResize = function (eventStore, eventUis, origSeg) {
        // subclasses can implement
    };
    // Unrenders a visual indication of an event being resized.
    DateComponent.prototype.unrenderEventResize = function () {
        // subclasses can implement
    };
    // Seg Utils
    // -----------------------------------------------------------------------------------------------------------------
    DateComponent.prototype.hideSegsByHash = function (hash) {
        this.getAllEventSegs().forEach(function (seg) {
            if (hash[seg.eventRange.instance.instanceId]) {
                seg.el.style.visibility = 'hidden';
            }
        });
    };
    DateComponent.prototype.showSegsByHash = function (hash) {
        this.getAllEventSegs().forEach(function (seg) {
            if (hash[seg.eventRange.instance.instanceId]) {
                seg.el.style.visibility = '';
            }
        });
    };
    DateComponent.prototype.getAllEventSegs = function () {
        if (this.eventRenderer) {
            return this.eventRenderer.getSegs();
        }
        else {
            return [];
        }
    };
    // Event Instance Selection (aka long-touch focus)
    // -----------------------------------------------------------------------------------------------------------------
    // TODO: show/hide according to groupId?
    DateComponent.prototype.selectEventsByInstanceId = function (instanceId) {
        this.getAllEventSegs().forEach(function (seg) {
            var eventInstance = seg.eventRange.instance;
            if (eventInstance && eventInstance.instanceId === instanceId &&
                seg.el // necessary?
            ) {
                seg.el.classList.add('fc-selected');
            }
        });
    };
    DateComponent.prototype.unselectAllEvents = function () {
        this.getAllEventSegs().forEach(function (seg) {
            if (seg.el) { // necessary?
                seg.el.classList.remove('fc-selected');
            }
        });
    };
    // EXTERNAL Drag-n-Drop
    // ---------------------------------------------------------------------------------------------------------------
    // Doesn't need to implement a response, but must pass to children
    DateComponent.prototype.handlExternalDragStart = function (ev, el, skipBinding) {
        this.callChildren('handlExternalDragStart', arguments);
    };
    DateComponent.prototype.handleExternalDragMove = function (ev) {
        this.callChildren('handleExternalDragMove', arguments);
    };
    DateComponent.prototype.handleExternalDragStop = function (ev) {
        this.callChildren('handleExternalDragStop', arguments);
    };
    // DateSpan
    // ---------------------------------------------------------------------------------------------------------------
    // Renders a visual indication of the selection
    DateComponent.prototype.renderDateSelection = function (selection) {
        this.renderHighlightSegs(this.selectionToSegs(selection, false));
    };
    // Unrenders a visual indication of selection
    DateComponent.prototype.unrenderDateSelection = function () {
        this.unrenderHighlight();
    };
    // Highlight
    // ---------------------------------------------------------------------------------------------------------------
    // Renders an emphasis on the given date range. Given a span (unzoned start/end and other misc data)
    DateComponent.prototype.renderHighlightSegs = function (segs) {
        if (this.fillRenderer) {
            this.fillRenderer.renderSegs('highlight', segs, {
                getClasses: function () {
                    return ['fc-highlight'];
                }
            });
        }
    };
    // Unrenders the emphasis on a date range
    DateComponent.prototype.unrenderHighlight = function () {
        if (this.fillRenderer) {
            this.fillRenderer.unrender('highlight');
        }
    };
    DateComponent.prototype.computeHighlightSize = function () {
        if (this.fillRenderer) {
            this.fillRenderer.computeSize('highlight');
        }
    };
    DateComponent.prototype.assignHighlightSize = function () {
        if (this.fillRenderer) {
            this.fillRenderer.assignSize('highlight');
        }
    };
    /*
    ------------------------------------------------------------------------------------------------------------------*/
    DateComponent.prototype.computeMirrorSize = function () {
        if (this.mirrorRenderer) {
            this.mirrorRenderer.computeSize();
        }
    };
    DateComponent.prototype.assignMirrorSize = function () {
        if (this.mirrorRenderer) {
            this.mirrorRenderer.assignSize();
        }
    };
    /* Converting selection/eventRanges -> segs
    ------------------------------------------------------------------------------------------------------------------*/
    DateComponent.prototype.eventStoreToRanges = function (eventStore, eventUis) {
        return event_rendering_1.sliceEventStore(eventStore, eventUis, this.dateProfile.activeRange, this.slicingType === 'all-day' ? this.nextDayThreshold : null);
    };
    DateComponent.prototype.eventRangesToSegs = function (eventRenderRanges) {
        var allSegs = [];
        for (var _i = 0, eventRenderRanges_1 = eventRenderRanges; _i < eventRenderRanges_1.length; _i++) {
            var eventRenderRange = eventRenderRanges_1[_i];
            var segs = this.rangeToSegs(eventRenderRange.range, eventRenderRange.def.allDay);
            for (var _a = 0, segs_4 = segs; _a < segs_4.length; _a++) {
                var seg = segs_4[_a];
                seg.eventRange = eventRenderRange;
                seg.isStart = seg.isStart && eventRenderRange.isStart;
                seg.isEnd = seg.isEnd && eventRenderRange.isEnd;
                allSegs.push(seg);
            }
        }
        return allSegs;
    };
    DateComponent.prototype.selectionToSegs = function (selection, fabricateEvents) {
        var segs = this.rangeToSegs(selection.range, selection.allDay);
        if (fabricateEvents) {
            // fabricate an eventRange. important for mirror
            // TODO: make a separate utility for this?
            var def = event_1.parseEventDef({ editable: false }, '', // sourceId
            selection.allDay, true, // hasEnd
            this.getCalendar());
            var eventRange = {
                def: def,
                ui: event_rendering_1.computeEventDefUi(def, {}, {}),
                instance: event_1.createEventInstance(def.defId, selection.range),
                range: selection.range,
                isStart: true,
                isEnd: true
            };
            for (var _i = 0, segs_5 = segs; _i < segs_5.length; _i++) {
                var seg = segs_5[_i];
                seg.eventRange = eventRange;
            }
        }
        return segs;
    };
    // must implement if want to use many of the rendering utils
    DateComponent.prototype.rangeToSegs = function (range, allDay) {
        return [];
    };
    // Utils
    // ---------------------------------------------------------------------------------------------------------------
    DateComponent.prototype.callChildren = function (methodName, args) {
        this.iterChildren(function (child) {
            child[methodName].apply(child, args);
        });
    };
    DateComponent.prototype.iterChildren = function (func) {
        var childrenByUid = this.childrenByUid;
        var uid;
        for (uid in childrenByUid) {
            func(childrenByUid[uid]);
        }
    };
    DateComponent.prototype.getCalendar = function () {
        return this.view.calendar;
    };
    DateComponent.prototype.getDateEnv = function () {
        return this.getCalendar().dateEnv;
    };
    DateComponent.prototype.getTheme = function () {
        return this.getCalendar().theme;
    };
    // Generates HTML for an anchor to another view into the calendar.
    // Will either generate an <a> tag or a non-clickable <span> tag, depending on enabled settings.
    // `gotoOptions` can either be a date input, or an object with the form:
    // { date, type, forceOff }
    // `type` is a view-type like "day" or "week". default value is "day".
    // `attrs` and `innerHtml` are use to generate the rest of the HTML tag.
    DateComponent.prototype.buildGotoAnchorHtml = function (gotoOptions, attrs, innerHtml) {
        var dateEnv = this.getDateEnv();
        var date;
        var type;
        var forceOff;
        var finalOptions;
        if (gotoOptions instanceof Date || typeof gotoOptions !== 'object') {
            date = gotoOptions; // a single date-like input
        }
        else {
            date = gotoOptions.date;
            type = gotoOptions.type;
            forceOff = gotoOptions.forceOff;
        }
        date = dateEnv.createMarker(date); // if a string, parse it
        finalOptions = {
            date: dateEnv.formatIso(date, { omitTime: true }),
            type: type || 'day'
        };
        if (typeof attrs === 'string') {
            innerHtml = attrs;
            attrs = null;
        }
        attrs = attrs ? ' ' + html_1.attrsToStr(attrs) : ''; // will have a leading space
        innerHtml = innerHtml || '';
        if (!forceOff && this.opt('navLinks')) {
            return '<a' + attrs +
                ' data-goto="' + html_1.htmlEscape(JSON.stringify(finalOptions)) + '">' +
                innerHtml +
                '</a>';
        }
        else {
            return '<span' + attrs + '>' +
                innerHtml +
                '</span>';
        }
    };
    DateComponent.prototype.getAllDayHtml = function () {
        return this.opt('allDayHtml') || html_1.htmlEscape(this.opt('allDayText'));
    };
    // Computes HTML classNames for a single-day element
    DateComponent.prototype.getDayClasses = function (date, noThemeHighlight) {
        var view = this.view;
        var classes = [];
        var todayStart;
        var todayEnd;
        if (!date_range_1.rangeContainsMarker(this.dateProfile.activeRange, date)) {
            classes.push('fc-disabled-day'); // TODO: jQuery UI theme?
        }
        else {
            classes.push('fc-' + marker_1.DAY_IDS[date.getUTCDay()]);
            if (view.isDateInOtherMonth(date, this.dateProfile)) { // TODO: use DateComponent subclass somehow
                classes.push('fc-other-month');
            }
            todayStart = marker_1.startOfDay(view.calendar.getNow());
            todayEnd = marker_1.addDays(todayStart, 1);
            if (date < todayStart) {
                classes.push('fc-past');
            }
            else if (date >= todayEnd) {
                classes.push('fc-future');
            }
            else {
                classes.push('fc-today');
                if (noThemeHighlight !== true) {
                    classes.push(view.calendar.theme.getClass('today'));
                }
            }
        }
        return classes;
    };
    // Compute the number of the give units in the "current" range.
    // Won't go more precise than days.
    // Will return `0` if there's not a clean whole interval.
    DateComponent.prototype.currentRangeAs = function (unit) {
        var dateEnv = this.getDateEnv();
        var range = this.dateProfile.currentRange;
        var res = null;
        if (unit === 'years') {
            res = dateEnv.diffWholeYears(range.start, range.end);
        }
        else if (unit === 'months') {
            res = dateEnv.diffWholeMonths(range.start, range.end);
        }
        else if (unit === 'weeks') {
            res = dateEnv.diffWholeMonths(range.start, range.end);
        }
        else if (unit === 'days') {
            res = marker_1.diffWholeDays(range.start, range.end);
        }
        return res || 0;
    };
    DateComponent.prototype.isValidSegDownEl = function (el) {
        return !this.eventDrag && !this.eventResize &&
            !dom_manip_1.elementClosest(el, '.fc-mirror') &&
            !this.isInPopover(el);
    };
    DateComponent.prototype.isValidDateDownEl = function (el) {
        var segEl = dom_manip_1.elementClosest(el, this.fgSegSelector);
        return (!segEl || segEl.classList.contains('fc-mirror')) &&
            !dom_manip_1.elementClosest(el, '.fc-more') && // a "more.." link
            !dom_manip_1.elementClosest(el, 'a[data-goto]') && // a clickable nav link
            !this.isInPopover(el);
    };
    // is the element inside of an inner popover?
    DateComponent.prototype.isInPopover = function (el) {
        var popoverEl = dom_manip_1.elementClosest(el, '.fc-popover');
        return popoverEl && popoverEl !== this.el; // if the current component IS a popover, okay
    };
    DateComponent.prototype.isEventsValid = function (eventStore) {
        var dateProfile = this.dateProfile;
        var instances = eventStore.instances;
        if (dateProfile) { // HACK for DayTile
            for (var instanceId in instances) {
                if (!date_range_1.rangeContainsRange(dateProfile.validRange, instances[instanceId].range)) {
                    return false;
                }
            }
        }
        return validation_1.isEventsValid(eventStore, this.getCalendar());
    };
    DateComponent.prototype.isSelectionValid = function (selection) {
        var dateProfile = this.dateProfile;
        if (dateProfile && // HACK for DayTile
            !date_range_1.rangeContainsRange(dateProfile.validRange, selection.range)) {
            return false;
        }
        return validation_1.isSelectionValid(selection, this.getCalendar());
    };
    return DateComponent;
}(Component_1.default));
exports.default = DateComponent;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var html_1 = __webpack_require__(9);
var misc_1 = __webpack_require__(2);
var validation_1 = __webpack_require__(39);
var SIMPLE_SOURCE_PROPS = {
    id: String,
    allDayDefault: Boolean,
    eventDataTransform: Function,
    editable: Boolean,
    startEditable: Boolean,
    durationEditable: Boolean,
    constraint: null,
    overlap: Boolean,
    allow: null,
    rendering: String,
    className: html_1.parseClassName,
    color: String,
    backgroundColor: String,
    borderColor: String,
    textColor: String,
    success: Function,
    failure: Function
};
var defs = [];
var uid = 0;
// NOTE: if we ever want to remove defs,
// we need to null out the entry in the array, not delete it,
// because our event source IDs rely on the index.
function registerEventSourceDef(def) {
    defs.push(def);
}
exports.registerEventSourceDef = registerEventSourceDef;
function getEventSourceDef(id) {
    return defs[id];
}
exports.getEventSourceDef = getEventSourceDef;
function doesSourceNeedRange(eventSource) {
    return !defs[eventSource.sourceDefId].ignoreRange;
}
exports.doesSourceNeedRange = doesSourceNeedRange;
function parseEventSource(raw, calendar) {
    for (var i = defs.length - 1; i >= 0; i--) { // later-added plugins take precedence
        var def = defs[i];
        var meta = def.parseMeta(raw);
        if (meta) {
            return parseEventSourceProps(typeof raw === 'object' ? raw : {}, meta, i, calendar);
        }
    }
    return null;
}
exports.parseEventSource = parseEventSource;
/*
TODO: combine with pluckNonDateProps AND refineScopedUi
*/
function parseEventSourceProps(raw, meta, sourceDefId, calendar) {
    var props = misc_1.refineProps(raw, SIMPLE_SOURCE_PROPS);
    props.isFetching = false;
    props.latestFetchId = '';
    props.fetchRange = null;
    props.publicId = String(raw.id || '');
    props.sourceId = String(uid++);
    props.sourceDefId = sourceDefId;
    props.meta = meta;
    if (props.constraint) {
        props.constraint = validation_1.normalizeConstraint(props.constraint, calendar);
    }
    if (props.startEditable == null) {
        props.startEditable = props.editable;
    }
    if (props.durationEditable == null) {
        props.durationEditable = props.editable;
    }
    if (!props.backgroundColor) {
        props.backgroundColor = props.color;
    }
    if (!props.borderColor) {
        props.borderColor = props.color;
    }
    delete props.editable;
    delete props.color;
    return props;
}


/***/ }),
/* 23 */,
/* 24 */,
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.version = '4.0.0-alpha.2';
// When introducing internal API incompatibilities (where fullcalendar plugins would break),
// the minor version of the calendar should be upped (ex: 2.7.2 -> 2.8.0)
// and the below integer should be incremented.
exports.internalApiVersion = 12;
var misc_1 = __webpack_require__(2);
exports.applyAll = misc_1.applyAll;
exports.debounce = misc_1.debounce;
exports.padStart = misc_1.padStart;
exports.isInt = misc_1.isInt;
exports.capitaliseFirstLetter = misc_1.capitaliseFirstLetter;
exports.parseFieldSpecs = misc_1.parseFieldSpecs;
exports.compareByFieldSpecs = misc_1.compareByFieldSpecs;
exports.compareByFieldSpec = misc_1.compareByFieldSpec;
exports.flexibleCompare = misc_1.flexibleCompare;
exports.log = misc_1.log;
exports.warn = misc_1.warn;
var html_1 = __webpack_require__(9);
exports.htmlEscape = html_1.htmlEscape;
exports.cssToStr = html_1.cssToStr;
var array_1 = __webpack_require__(136);
exports.removeExact = array_1.removeExact;
var geom_1 = __webpack_require__(26);
exports.intersectRects = geom_1.intersectRects;
var object_1 = __webpack_require__(4);
exports.assignTo = object_1.assignTo;
var dom_manip_1 = __webpack_require__(3);
exports.findElements = dom_manip_1.findElements;
exports.findChildren = dom_manip_1.findChildren;
exports.htmlToElement = dom_manip_1.htmlToElement;
exports.createElement = dom_manip_1.createElement;
exports.insertAfterElement = dom_manip_1.insertAfterElement;
exports.prependToElement = dom_manip_1.prependToElement;
exports.removeElement = dom_manip_1.removeElement;
exports.appendToElement = dom_manip_1.appendToElement;
exports.applyStyle = dom_manip_1.applyStyle;
exports.applyStyleProp = dom_manip_1.applyStyleProp;
exports.elementMatches = dom_manip_1.elementMatches;
exports.forceClassName = dom_manip_1.forceClassName;
var dom_event_1 = __webpack_require__(19);
exports.preventDefault = dom_event_1.preventDefault;
exports.listenBySelector = dom_event_1.listenBySelector;
exports.whenTransitionDone = dom_event_1.whenTransitionDone;
var dom_geom_1 = __webpack_require__(13);
exports.computeInnerRect = dom_geom_1.computeInnerRect;
exports.computeEdges = dom_geom_1.computeEdges;
exports.computeHeightAndMargins = dom_geom_1.computeHeightAndMargins;
var EmitterMixin_1 = __webpack_require__(20);
exports.EmitterMixin = EmitterMixin_1.default;
var date_range_1 = __webpack_require__(11);
exports.rangeContainsMarker = date_range_1.rangeContainsMarker;
exports.intersectRanges = date_range_1.intersectRanges;
var ThemeRegistry_1 = __webpack_require__(48);
exports.defineThemeSystem = ThemeRegistry_1.defineThemeSystem;
var Mixin_1 = __webpack_require__(47);
exports.Mixin = Mixin_1.default;
var PositionCache_1 = __webpack_require__(49);
exports.PositionCache = PositionCache_1.default;
var ScrollComponent_1 = __webpack_require__(37);
exports.ScrollComponent = ScrollComponent_1.default;
var Theme_1 = __webpack_require__(27);
exports.Theme = Theme_1.default;
var DateComponent_1 = __webpack_require__(21);
exports.DateComponent = DateComponent_1.default;
var Calendar_1 = __webpack_require__(175);
exports.Calendar = Calendar_1.default;
var View_1 = __webpack_require__(42);
exports.View = View_1.default;
var ViewRegistry_1 = __webpack_require__(43);
exports.defineView = ViewRegistry_1.defineView;
exports.getViewConfig = ViewRegistry_1.getViewConfig;
var DayTableMixin_1 = __webpack_require__(58);
exports.DayTableMixin = DayTableMixin_1.default;
var EventRenderer_1 = __webpack_require__(18);
exports.EventRenderer = EventRenderer_1.default;
var FillRenderer_1 = __webpack_require__(59);
exports.FillRenderer = FillRenderer_1.default;
var MirrorRenderer_1 = __webpack_require__(60);
exports.MirrorRenderer = MirrorRenderer_1.default;
var AgendaView_1 = __webpack_require__(146);
exports.AgendaView = AgendaView_1.default;
var TimeGrid_1 = __webpack_require__(147);
exports.TimeGrid = TimeGrid_1.default;
var DayGrid_1 = __webpack_require__(62);
exports.DayGrid = DayGrid_1.default;
var BasicView_1 = __webpack_require__(63);
exports.BasicView = BasicView_1.default;
var MonthView_1 = __webpack_require__(150);
exports.MonthView = MonthView_1.default;
var ListView_1 = __webpack_require__(151);
exports.ListView = ListView_1.default;
var marker_1 = __webpack_require__(6);
exports.addDays = marker_1.addDays;
exports.startOfDay = marker_1.startOfDay;
exports.addMs = marker_1.addMs;
exports.diffWholeWeeks = marker_1.diffWholeWeeks;
exports.diffWholeDays = marker_1.diffWholeDays;
exports.diffDayAndTime = marker_1.diffDayAndTime;
var duration_1 = __webpack_require__(10);
exports.createDuration = duration_1.createDuration;
exports.isSingleDay = duration_1.isSingleDay;
exports.multiplyDuration = duration_1.multiplyDuration;
exports.addDurations = duration_1.addDurations;
exports.asRoughMinutes = duration_1.asRoughMinutes;
exports.asRoughSeconds = duration_1.asRoughSeconds;
exports.asRoughMs = duration_1.asRoughMs;
exports.wholeDivideDurations = duration_1.wholeDivideDurations;
exports.greatestDurationDenominator = duration_1.greatestDurationDenominator;
var env_1 = __webpack_require__(56);
exports.DateEnv = env_1.DateEnv;
var locale_1 = __webpack_require__(41);
exports.defineLocale = locale_1.defineLocale;
exports.getLocale = locale_1.getLocale;
exports.getLocaleCodes = locale_1.getLocaleCodes;
var formatting_1 = __webpack_require__(8);
exports.createFormatter = formatting_1.createFormatter;
var timezone_1 = __webpack_require__(144);
exports.NamedTimeZoneImpl = timezone_1.NamedTimeZoneImpl;
exports.registerNamedTimeZoneImpl = timezone_1.registerNamedTimeZoneImpl;
var formatting_cmd_1 = __webpack_require__(52);
exports.registerCmdFormatter = formatting_cmd_1.registerCmdFormatter;
var parsing_1 = __webpack_require__(145);
exports.parseMarker = parsing_1.parse;
var event_source_1 = __webpack_require__(22);
exports.registerEventSourceDef = event_source_1.registerEventSourceDef;
var misc_2 = __webpack_require__(2);
exports.refineProps = misc_2.refineProps;
var PointerDragging_1 = __webpack_require__(40);
exports.PointerDragging = PointerDragging_1.default;
var ElementDragging_1 = __webpack_require__(54);
exports.ElementDragging = ElementDragging_1.default;
var ExternalDraggable_1 = __webpack_require__(195);
exports.Draggable = ExternalDraggable_1.default;
var ThirdPartyDraggable_1 = __webpack_require__(197);
exports.ThirdPartyDraggable = ThirdPartyDraggable_1.default;
var formatting_api_1 = __webpack_require__(199);
exports.formatDate = formatting_api_1.formatDate;
exports.formatRange = formatting_api_1.formatRange;
var options_1 = __webpack_require__(32);
exports.globalDefaults = options_1.globalDefaults;
var recurring_event_1 = __webpack_require__(38);
exports.registerRecurringType = recurring_event_1.registerRecurringType;


/***/ }),
/* 26 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
function pointInsideRect(point, rect) {
    return point.left >= rect.left &&
        point.left < rect.right &&
        point.top >= rect.top &&
        point.top < rect.bottom;
}
exports.pointInsideRect = pointInsideRect;
// Returns a new rectangle that is the intersection of the two rectangles. If they don't intersect, returns false
function intersectRects(rect1, rect2) {
    var res = {
        left: Math.max(rect1.left, rect2.left),
        right: Math.min(rect1.right, rect2.right),
        top: Math.max(rect1.top, rect2.top),
        bottom: Math.min(rect1.bottom, rect2.bottom)
    };
    if (res.left < res.right && res.top < res.bottom) {
        return res;
    }
    return false;
}
exports.intersectRects = intersectRects;
// Returns a new point that will have been moved to reside within the given rectangle
function constrainPoint(point, rect) {
    return {
        left: Math.min(Math.max(point.left, rect.left), rect.right),
        top: Math.min(Math.max(point.top, rect.top), rect.bottom)
    };
}
exports.constrainPoint = constrainPoint;
// Returns a point that is the center of the given rectangle
function getRectCenter(rect) {
    return {
        left: (rect.left + rect.right) / 2,
        top: (rect.top + rect.bottom) / 2
    };
}
exports.getRectCenter = getRectCenter;
// Subtracts point2's coordinates from point1's coordinates, returning a delta
function diffPoints(point1, point2) {
    return {
        left: point1.left - point2.left,
        top: point1.top - point2.top
    };
}
exports.diffPoints = diffPoints;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var object_1 = __webpack_require__(4);
var Theme = /** @class */ (function () {
    function Theme(calendarOptions) {
        this.calendarOptions = calendarOptions;
        this.processIconOverride();
    }
    Theme.prototype.processIconOverride = function () {
        if (this.iconOverrideOption) {
            this.setIconOverride(this.calendarOptions[this.iconOverrideOption]);
        }
    };
    Theme.prototype.setIconOverride = function (iconOverrideHash) {
        var iconClassesCopy;
        var buttonName;
        if (typeof iconOverrideHash === 'object' && iconOverrideHash) { // non-null object
            iconClassesCopy = object_1.assignTo({}, this.iconClasses);
            for (buttonName in iconOverrideHash) {
                iconClassesCopy[buttonName] = this.applyIconOverridePrefix(iconOverrideHash[buttonName]);
            }
            this.iconClasses = iconClassesCopy;
        }
        else if (iconOverrideHash === false) {
            this.iconClasses = {};
        }
    };
    Theme.prototype.applyIconOverridePrefix = function (className) {
        var prefix = this.iconOverridePrefix;
        if (prefix && className.indexOf(prefix) !== 0) { // if not already present
            className = prefix + className;
        }
        return className;
    };
    Theme.prototype.getClass = function (key) {
        return this.classes[key] || '';
    };
    Theme.prototype.getIconClass = function (buttonName) {
        var className = this.iconClasses[buttonName];
        if (className) {
            return this.baseIconClass + ' ' + className;
        }
        return '';
    };
    Theme.prototype.getCustomButtonIconClass = function (customButtonProps) {
        var className;
        if (this.iconOverrideCustomButtonOption) {
            className = customButtonProps[this.iconOverrideCustomButtonOption];
            if (className) {
                return this.baseIconClass + ' ' + this.applyIconOverridePrefix(className);
            }
        }
        return '';
    };
    return Theme;
}());
exports.default = Theme;
Theme.prototype.classes = {};
Theme.prototype.iconClasses = {};
Theme.prototype.baseIconClass = '';
Theme.prototype.iconOverridePrefix = '';


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var date_range_1 = __webpack_require__(11);
var object_1 = __webpack_require__(4);
var html_1 = __webpack_require__(9);
var misc_1 = __webpack_require__(2);
/*
Specifying nextDayThreshold signals that all-day ranges should be sliced.
*/
function sliceEventStore(eventStore, eventUis, framingRange, nextDayThreshold) {
    var inverseBgByGroupId = {};
    var inverseBgByDefId = {};
    var defByGroupId = {};
    var renderRanges = [];
    for (var defId in eventStore.defs) {
        var def = eventStore.defs[defId];
        var ui = eventUis[defId];
        if (ui.rendering === 'inverse-background') {
            if (def.groupId) {
                inverseBgByGroupId[def.groupId] = [];
                if (!defByGroupId[def.groupId]) {
                    defByGroupId[def.groupId] = def;
                }
            }
            else {
                inverseBgByDefId[defId] = [];
            }
        }
    }
    for (var instanceId in eventStore.instances) {
        var instance = eventStore.instances[instanceId];
        var def = eventStore.defs[instance.defId];
        var ui = eventUis[def.defId];
        var origRange = instance.range;
        var slicedRange = date_range_1.intersectRanges(origRange, framingRange);
        var visibleRange = void 0;
        if (slicedRange) {
            visibleRange = (!def.allDay && nextDayThreshold) ?
                misc_1.computeVisibleDayRange(slicedRange, nextDayThreshold) :
                slicedRange;
            if (ui.rendering === 'inverse-background') {
                if (def.groupId) {
                    inverseBgByGroupId[def.groupId].push(visibleRange);
                }
                else {
                    inverseBgByDefId[instance.defId].push(visibleRange);
                }
            }
            else {
                renderRanges.push({
                    def: def,
                    ui: ui,
                    instance: instance,
                    range: visibleRange,
                    isStart: origRange.start.valueOf() === slicedRange.start.valueOf(),
                    isEnd: origRange.end.valueOf() === slicedRange.end.valueOf()
                });
            }
        }
    }
    for (var groupId in inverseBgByGroupId) {
        var ranges = inverseBgByGroupId[groupId];
        var invertedRanges = date_range_1.invertRanges(ranges, framingRange);
        for (var _i = 0, invertedRanges_1 = invertedRanges; _i < invertedRanges_1.length; _i++) {
            var invertedRange = invertedRanges_1[_i];
            var def = defByGroupId[groupId];
            var ui = eventUis[def.defId];
            renderRanges.push({
                def: def,
                ui: ui,
                instance: null,
                range: invertedRange,
                isStart: false,
                isEnd: false
            });
        }
    }
    for (var defId in inverseBgByDefId) {
        var ranges = inverseBgByDefId[defId];
        var invertedRanges = date_range_1.invertRanges(ranges, framingRange);
        for (var _a = 0, invertedRanges_2 = invertedRanges; _a < invertedRanges_2.length; _a++) {
            var invertedRange = invertedRanges_2[_a];
            renderRanges.push({
                def: eventStore.defs[defId],
                ui: eventUis[defId],
                instance: null,
                range: invertedRange,
                isStart: false,
                isEnd: false
            });
        }
    }
    return renderRanges;
}
exports.sliceEventStore = sliceEventStore;
function hasBgRendering(ui) {
    return ui.rendering === 'background' || ui.rendering === 'inverse-background';
}
exports.hasBgRendering = hasBgRendering;
// UI Props
// ----------------------------------------------------------------------------------------------------
function computeEventDefUis(eventDefs, eventSources, options) {
    return object_1.mapHash(eventDefs, function (eventDef) {
        return computeEventDefUi(eventDef, eventSources, options);
    });
}
exports.computeEventDefUis = computeEventDefUis;
function computeEventDefUi(eventDef, eventSources, options) {
    // lowest to highest priority
    // TODO: hook for resources, using refineScopedUi
    var refinedHashes = [
        refineScopedUi(options),
        refineUnscopedUi(eventSources[eventDef.sourceId] || {}),
        refineUnscopedUi(eventDef)
    ];
    return refinedHashes.reduce(combineUis);
}
exports.computeEventDefUi = computeEventDefUi;
// has word "event" in prop names
// FYI: startEditable/durationEditable might end up being null
function refineScopedUi(input) {
    return {
        startEditable: (input.startEditable != null) ? input.startEditable : input.editable,
        durationEditable: (input.durationEditable != null) ? input.durationEditable : input.editable,
        backgroundColor: input.eventBackgroundColor || input.eventColor || '',
        borderColor: input.eventBorderColor || input.eventColor || '',
        textColor: input.eventTextColor || '',
        rendering: input.eventRendering || '',
        classNames: html_1.parseClassName(input.eventClassNames || input.eventClassName) // probs already parsed
    };
}
// does NOT have the word "event" in prop names
// FYI: startEditable/durationEditable might end up being null
function refineUnscopedUi(input) {
    return {
        startEditable: (input.startEditable != null) ? input.startEditable : input.editable,
        durationEditable: (input.durationEditable != null) ? input.durationEditable : input.editable,
        backgroundColor: input.backgroundColor || input.color || '',
        borderColor: input.borderColor || input.color || '',
        textColor: input.textColor || '',
        rendering: input.rendering || '',
        classNames: html_1.parseClassName(input.classNames || input.className) // probs already parsed
    };
}
function combineUis(hash0, hash1) {
    return {
        startEditable: (hash1.startEditable != null) ? hash1.startEditable : hash0.startEditable,
        durationEditable: (hash1.durationEditable != null) ? hash1.durationEditable : hash0.durationEditable,
        backgroundColor: hash1.backgroundColor || hash0.backgroundColor,
        borderColor: hash1.borderColor || hash0.borderColor,
        textColor: hash1.textColor || hash0.textColor,
        rendering: hash1.rendering || hash0.rendering,
        classNames: hash0.classNames.concat(hash1.classNames)
    };
}


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var misc_1 = __webpack_require__(2);
var html_1 = __webpack_require__(9);
var object_1 = __webpack_require__(4);
var marker_1 = __webpack_require__(6);
var recurring_event_1 = __webpack_require__(38);
var validation_1 = __webpack_require__(39);
var NON_DATE_PROPS = {
    id: String,
    groupId: String,
    title: String,
    url: String,
    editable: Boolean,
    startEditable: Boolean,
    durationEditable: Boolean,
    constraint: null,
    overlap: Boolean,
    rendering: String,
    classNames: html_1.parseClassName,
    className: html_1.parseClassName,
    color: String,
    backgroundColor: String,
    borderColor: String,
    textColor: String,
    extendedProps: null
};
var DATE_PROPS = {
    start: null,
    date: null,
    end: null,
    allDay: null
};
var uid = 0;
function parseEvent(raw, sourceId, calendar) {
    var leftovers0 = {};
    var allDayDefault = computeIsAllDayDefault(sourceId, calendar);
    var singleRes = parseSingle(raw, allDayDefault, calendar, leftovers0);
    if (singleRes) {
        var def = parseEventDef(leftovers0, sourceId, singleRes.allDay, singleRes.hasEnd, calendar);
        var instance = createEventInstance(def.defId, singleRes.range, singleRes.forcedStartTzo, singleRes.forcedEndTzo);
        return { def: def, instance: instance };
    }
    else {
        var leftovers1 = {};
        var recurringRes = recurring_event_1.parseRecurring(leftovers0, // raw, but with single-event stuff stripped out
        calendar.dateEnv, leftovers1 // the new leftovers
        );
        if (recurringRes) {
            var allDay = (raw.allDay != null) ? Boolean(raw.allDay) : // need to get this from `raw` because already stripped out of `leftovers0`
                (allDayDefault != null ? allDayDefault :
                    recurringRes.allDay); // fall back to the recurring date props LAST
            var def = parseEventDef(leftovers1, sourceId, allDay, Boolean(recurringRes.duration), calendar);
            def.recurringDef = {
                typeId: recurringRes.typeId,
                typeData: recurringRes.typeData,
                duration: recurringRes.duration
            };
            return { def: def, instance: null };
        }
    }
    return null;
}
exports.parseEvent = parseEvent;
/*
Will NOT populate extendedProps with the leftover properties.
Will NOT populate date-related props.
The EventNonDateInput has been normalized (id => publicId, etc).
*/
function parseEventDef(raw, sourceId, allDay, hasEnd, calendar) {
    var leftovers = {};
    var def = pluckNonDateProps(raw, calendar, leftovers);
    def.defId = String(uid++);
    def.sourceId = sourceId;
    def.allDay = allDay;
    def.hasEnd = hasEnd;
    def.extendedProps = object_1.assignTo(leftovers, def.extendedProps || {});
    // help out EventApi from having user modify props
    Object.freeze(def.classNames);
    Object.freeze(def.extendedProps);
    return def;
}
exports.parseEventDef = parseEventDef;
function createEventInstance(defId, range, forcedStartTzo, forcedEndTzo) {
    return {
        instanceId: String(uid++),
        defId: defId,
        range: range,
        forcedStartTzo: forcedStartTzo == null ? null : forcedStartTzo,
        forcedEndTzo: forcedEndTzo == null ? null : forcedEndTzo
    };
}
exports.createEventInstance = createEventInstance;
function parseSingle(raw, allDayDefault, calendar, leftovers) {
    var props = pluckDateProps(raw, leftovers);
    var allDay = props.allDay;
    var startMeta;
    var startMarker;
    var hasEnd = false;
    var endMeta = null;
    var endMarker = null;
    startMeta = calendar.dateEnv.createMarkerMeta(props.start);
    if (!startMeta) {
        return null;
    }
    if (props.end != null) {
        endMeta = calendar.dateEnv.createMarkerMeta(props.end);
    }
    if (allDay == null) {
        if (allDayDefault != null) {
            allDay = allDayDefault;
        }
        else {
            // fall back to the date props LAST
            allDay = startMeta.isTimeUnspecified && (!endMeta || endMeta.isTimeUnspecified);
        }
    }
    startMarker = startMeta.marker;
    if (allDay) {
        startMarker = marker_1.startOfDay(startMarker);
    }
    if (endMeta) {
        endMarker = endMeta.marker;
        if (endMarker <= startMarker) {
            endMarker = null;
        }
        else if (allDay) {
            endMarker = marker_1.startOfDay(endMarker);
        }
    }
    if (endMarker) {
        hasEnd = true;
    }
    else {
        hasEnd = calendar.opt('forceEventDuration') || false;
        endMarker = calendar.dateEnv.add(startMarker, allDay ?
            calendar.defaultAllDayEventDuration :
            calendar.defaultTimedEventDuration);
    }
    return {
        allDay: allDay,
        hasEnd: hasEnd,
        range: { start: startMarker, end: endMarker },
        forcedStartTzo: startMeta.forcedTzo,
        forcedEndTzo: endMeta ? endMeta.forcedTzo : null
    };
}
function pluckDateProps(raw, leftovers) {
    var props = misc_1.refineProps(raw, DATE_PROPS, {}, leftovers);
    props.start = (props.start !== null) ? props.start : props.date;
    delete props.date;
    return props;
}
function pluckNonDateProps(raw, calendar, leftovers) {
    var props = misc_1.refineProps(raw, NON_DATE_PROPS, {}, leftovers);
    props.publicId = props.id;
    props.classNames = props.classNames.concat(props.className);
    if (props.constraint) {
        props.constraint = validation_1.normalizeConstraint(props.constraint, calendar);
    }
    if (props.startEditable == null) {
        props.startEditable = props.editable;
    }
    if (props.durationEditable == null) {
        props.durationEditable = props.editable;
    }
    if (!props.backgroundColor) {
        props.backgroundColor = props.color;
    }
    if (!props.borderColor) {
        props.borderColor = props.color;
    }
    delete props.id;
    delete props.className;
    delete props.editable;
    delete props.color;
    return props;
}
function computeIsAllDayDefault(sourceId, calendar) {
    var res = null;
    if (sourceId) {
        var source = calendar.state.eventSources[sourceId];
        res = source.allDayDefault;
    }
    if (res == null) {
        res = calendar.opt('allDayDefault');
    }
    return res;
}


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var PointerDragging_1 = __webpack_require__(40);
var misc_1 = __webpack_require__(2);
var ElementMirror_1 = __webpack_require__(169);
var ElementDragging_1 = __webpack_require__(54);
var AutoScroller_1 = __webpack_require__(170);
/*
Monitors dragging on an element. Has a number of high-level features:
- minimum distance required before dragging
- minimum wait time ("delay") before dragging
- a mirror element that follows the pointer
*/
var FeaturefulElementDragging = /** @class */ (function (_super) {
    tslib_1.__extends(FeaturefulElementDragging, _super);
    function FeaturefulElementDragging(containerEl) {
        var _this = _super.call(this) || this;
        // options that can be directly set by caller
        // the caller can also set the PointerDragging's options as well
        _this.delay = null;
        _this.minDistance = 0;
        _this.touchScrollAllowed = true; // prevents drag from starting and blocks scrolling during drag
        _this.mirrorNeedsRevert = false;
        _this.isInteracting = false; // is the user validly moving the pointer? lasts until pointerup
        _this.isDragging = false; // is it INTENTFULLY dragging? lasts until after revert animation
        _this.isDelayEnded = false;
        _this.isDistanceSurpassed = false;
        _this.delayTimeoutId = null;
        _this.onPointerDown = function (ev) {
            if (!_this.isDragging) { // so new drag doesn't happen while revert animation is going
                _this.isInteracting = true;
                _this.isDelayEnded = false;
                _this.isDistanceSurpassed = false;
                misc_1.preventSelection(document.body);
                misc_1.preventContextMenu(document.body);
                // prevent links from being visited if there's an eventual drag.
                // also prevents selection in older browsers (maybe?).
                // not necessary for touch, besides, browser would complain about passiveness.
                if (!ev.isTouch) {
                    ev.origEvent.preventDefault();
                }
                _this.emitter.trigger('pointerdown', ev);
                if (!_this.pointer.shouldIgnoreMove) {
                    // actions related to initiating dragstart+dragmove+dragend...
                    _this.origX = ev.pageX;
                    _this.origY = ev.pageY;
                    _this.mirror.setIsVisible(false); // reset. caller must set-visible
                    _this.mirror.start(ev.subjectEl, ev.pageX, ev.pageY); // must happen on first pointer down
                    _this.startDelay(ev);
                    if (!_this.minDistance) {
                        _this.handleDistanceSurpassed(ev);
                    }
                }
            }
        };
        _this.onPointerMove = function (ev) {
            if (_this.isInteracting) { // if false, still waiting for previous drag's revert
                _this.emitter.trigger('pointermove', ev);
                if (!_this.isDistanceSurpassed) {
                    var dx = ev.pageX - _this.origX;
                    var dy = ev.pageY - _this.origY;
                    var minDistance = _this.minDistance;
                    var distanceSq = void 0; // current distance from the origin, squared
                    distanceSq = dx * dx + dy * dy;
                    if (distanceSq >= minDistance * minDistance) { // use pythagorean theorem
                        _this.handleDistanceSurpassed(ev);
                    }
                }
                if (_this.isDragging) {
                    // a real pointer move? (not one simulated by scrolling)
                    if (ev.origEvent.type !== 'scroll') {
                        _this.mirror.handleMove(ev.pageX, ev.pageY);
                        _this.autoScroller.handleMove(ev.pageX, ev.pageY);
                    }
                    _this.emitter.trigger('dragmove', ev);
                }
            }
        };
        _this.onPointerUp = function (ev) {
            if (_this.isInteracting) { // if false, still waiting for previous drag's revert
                _this.isInteracting = false;
                misc_1.allowSelection(document.body);
                misc_1.allowContextMenu(document.body);
                _this.emitter.trigger('pointerup', ev); // can potentially set mirrorNeedsRevert
                if (_this.isDragging) {
                    _this.autoScroller.stop();
                    _this.tryStopDrag(ev); // which will stop the mirror
                }
                if (_this.delayTimeoutId) {
                    clearTimeout(_this.delayTimeoutId);
                    _this.delayTimeoutId = null;
                }
            }
        };
        var pointer = _this.pointer = new PointerDragging_1.default(containerEl);
        pointer.emitter.on('pointerdown', _this.onPointerDown);
        pointer.emitter.on('pointermove', _this.onPointerMove);
        pointer.emitter.on('pointerup', _this.onPointerUp);
        _this.mirror = new ElementMirror_1.default();
        _this.autoScroller = new AutoScroller_1.default();
        return _this;
    }
    FeaturefulElementDragging.prototype.destroy = function () {
        this.pointer.destroy();
    };
    FeaturefulElementDragging.prototype.startDelay = function (ev) {
        var _this = this;
        if (typeof this.delay === 'number') {
            this.delayTimeoutId = setTimeout(function () {
                _this.delayTimeoutId = null;
                _this.handleDelayEnd(ev);
            }, this.delay);
        }
        else {
            this.handleDelayEnd(ev);
        }
    };
    FeaturefulElementDragging.prototype.handleDelayEnd = function (ev) {
        this.isDelayEnded = true;
        this.tryStartDrag(ev);
    };
    FeaturefulElementDragging.prototype.handleDistanceSurpassed = function (ev) {
        this.isDistanceSurpassed = true;
        this.tryStartDrag(ev);
    };
    FeaturefulElementDragging.prototype.tryStartDrag = function (ev) {
        if (this.isDelayEnded && this.isDistanceSurpassed) {
            if (!this.pointer.wasTouchScroll || this.touchScrollAllowed) {
                this.isDragging = true;
                this.mirrorNeedsRevert = false;
                this.autoScroller.start(ev.pageX, ev.pageY);
                this.emitter.trigger('dragstart', ev);
                if (this.touchScrollAllowed === false) {
                    this.pointer.cancelTouchScroll();
                }
            }
        }
    };
    FeaturefulElementDragging.prototype.tryStopDrag = function (ev) {
        // .stop() is ALWAYS asynchronous, which we NEED because we want all pointerup events
        // that come from the document to fire beforehand. much more convenient this way.
        this.mirror.stop(this.mirrorNeedsRevert, this.stopDrag.bind(this, ev) // bound with args
        );
    };
    FeaturefulElementDragging.prototype.stopDrag = function (ev) {
        this.isDragging = false;
        this.emitter.trigger('dragend', ev);
    };
    // fill in the implementations...
    FeaturefulElementDragging.prototype.setIgnoreMove = function (bool) {
        this.pointer.shouldIgnoreMove = bool;
    };
    FeaturefulElementDragging.prototype.setMirrorIsVisible = function (bool) {
        this.mirror.setIsVisible(bool);
    };
    FeaturefulElementDragging.prototype.setMirrorNeedsRevert = function (bool) {
        this.mirrorNeedsRevert = bool;
    };
    return FeaturefulElementDragging;
}(ElementDragging_1.default));
exports.default = FeaturefulElementDragging;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var EmitterMixin_1 = __webpack_require__(20);
var DateComponent_1 = __webpack_require__(21);
var date_span_1 = __webpack_require__(50);
var dom_geom_1 = __webpack_require__(13);
var geom_1 = __webpack_require__(26);
var date_range_1 = __webpack_require__(11);
/*
Tracks movement over multiple droppable areas (aka "hits")
that exist in one or more DateComponents.
Relies on an existing draggable.

emits:
- pointerdown
- dragstart
- hitchange - fires initially, even if not over a hit
- pointerup
- (hitchange - again, to null, if ended over a hit)
- dragend
*/
var HitDragging = /** @class */ (function () {
    function HitDragging(dragging, droppable) {
        var _a;
        var _this = this;
        // options that can be set by caller
        this.useSubjectCenter = false;
        this.requireInitial = true; // if doesn't start out on a hit, won't emit any events
        // internal state
        this.initialHit = null;
        this.movingHit = null;
        this.finalHit = null; // won't ever be populated if shouldIgnoreMove
        this.handlePointerDown = function (ev) {
            var dragging = _this.dragging;
            _this.initialHit = null;
            _this.movingHit = null;
            _this.finalHit = null;
            _this.prepareHits();
            _this.processFirstCoord(ev);
            if (_this.initialHit || !_this.requireInitial) {
                dragging.setIgnoreMove(false);
                _this.emitter.trigger('pointerdown', ev); // TODO: fire this before computing processFirstCoord, so listeners can cancel. this gets fired by almost every handler :(
            }
            else {
                dragging.setIgnoreMove(true);
            }
        };
        this.handleDragStart = function (ev) {
            _this.emitter.trigger('dragstart', ev);
            _this.handleMove(ev, true); // force = fire even if initially null
        };
        this.handleDragMove = function (ev) {
            _this.emitter.trigger('dragmove', ev);
            _this.handleMove(ev);
        };
        this.handlePointerUp = function (ev) {
            _this.releaseHits();
            _this.emitter.trigger('pointerup', ev);
        };
        this.handleDragEnd = function (ev) {
            if (_this.movingHit) {
                _this.emitter.trigger('hitupdate', null, true, ev);
            }
            _this.finalHit = _this.movingHit;
            _this.movingHit = null;
            _this.emitter.trigger('dragend', ev);
        };
        if (droppable instanceof DateComponent_1.default) {
            this.droppableHash = (_a = {}, _a[droppable.uid] = droppable, _a);
        }
        else {
            this.droppableHash = droppable;
        }
        dragging.emitter.on('pointerdown', this.handlePointerDown);
        dragging.emitter.on('dragstart', this.handleDragStart);
        dragging.emitter.on('dragmove', this.handleDragMove);
        dragging.emitter.on('pointerup', this.handlePointerUp);
        dragging.emitter.on('dragend', this.handleDragEnd);
        this.dragging = dragging;
        this.emitter = new EmitterMixin_1.default();
    }
    // sets initialHit
    // sets coordAdjust
    HitDragging.prototype.processFirstCoord = function (ev) {
        var origPoint = { left: ev.pageX, top: ev.pageY };
        var adjustedPoint = origPoint;
        var subjectEl = ev.subjectEl;
        var subjectRect;
        if (subjectEl !== document) {
            subjectRect = dom_geom_1.computeRect(subjectEl);
            adjustedPoint = geom_1.constrainPoint(adjustedPoint, subjectRect);
        }
        var initialHit = this.initialHit = this.queryHit(adjustedPoint.left, adjustedPoint.top);
        if (initialHit) {
            if (this.useSubjectCenter && subjectRect) {
                var slicedSubjectRect = geom_1.intersectRects(subjectRect, initialHit.rect);
                if (slicedSubjectRect) {
                    adjustedPoint = geom_1.getRectCenter(slicedSubjectRect);
                }
            }
            this.coordAdjust = geom_1.diffPoints(adjustedPoint, origPoint);
        }
        else {
            this.coordAdjust = { left: 0, top: 0 };
        }
    };
    HitDragging.prototype.handleMove = function (ev, forceHandle) {
        var hit = this.queryHit(ev.pageX + this.coordAdjust.left, ev.pageY + this.coordAdjust.top);
        if (forceHandle || !isHitsEqual(this.movingHit, hit)) {
            this.movingHit = hit;
            this.emitter.trigger('hitupdate', hit, false, ev);
        }
    };
    HitDragging.prototype.prepareHits = function () {
        var droppableHash = this.droppableHash;
        for (var id in droppableHash) {
            droppableHash[id].requestPrepareHits();
        }
    };
    HitDragging.prototype.releaseHits = function () {
        var droppableHash = this.droppableHash;
        for (var id in droppableHash) {
            droppableHash[id].requestReleaseHits();
        }
    };
    HitDragging.prototype.queryHit = function (x, y) {
        var droppableHash = this.droppableHash;
        var bestHit = null;
        for (var id in droppableHash) {
            var component = droppableHash[id];
            var hit = component.queryHit(x, y);
            if (hit &&
                (
                // make sure the hit is within activeRange, meaning it's not a deal cell
                !component.dateProfile || // hack for DayTile
                    date_range_1.rangeContainsRange(component.dateProfile.activeRange, hit.dateSpan.range)) &&
                (!bestHit || hit.layer > bestHit.layer)) {
                bestHit = hit;
            }
        }
        return bestHit;
    };
    return HitDragging;
}());
exports.default = HitDragging;
function isHitsEqual(hit0, hit1) {
    if (!hit0 && !hit1) {
        return true;
    }
    if (Boolean(hit0) !== Boolean(hit1)) {
        return false;
    }
    return date_span_1.isDateSpansEqual(hit0.dateSpan, hit1.dateSpan);
}
exports.isHitsEqual = isHitsEqual;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var object_1 = __webpack_require__(4);
exports.globalDefaults = {
    defaultRangeSeparator: ' - ',
    titleRangeSeparator: ' \u2013 ',
    cmdFormatter: null,
    defaultTimedEventDuration: '01:00:00',
    defaultAllDayEventDuration: { day: 1 },
    forceEventDuration: false,
    nextDayThreshold: '00:00:00',
    // display
    columnHeader: true,
    defaultView: 'month',
    aspectRatio: 1.35,
    header: {
        left: 'title',
        center: '',
        right: 'today prev,next'
    },
    weekends: true,
    weekNumbers: false,
    weekNumberCalculation: 'local',
    editable: false,
    // nowIndicator: false,
    scrollTime: '06:00:00',
    minTime: '00:00:00',
    maxTime: '24:00:00',
    showNonCurrentDates: true,
    // event ajax
    lazyFetching: true,
    startParam: 'start',
    endParam: 'end',
    timeZoneParam: 'timeZone',
    timeZone: 'local',
    timeZoneImpl: null,
    // allDayDefault: undefined,
    // locale
    locale: 'en',
    // dir: will get this from the default locale
    // buttonIcons: null,
    // allows setting a min-height to the event segment to prevent short events overlapping each other
    agendaEventMinHeight: 0,
    // jquery-ui theming
    theme: false,
    // themeButtonIcons: null,
    // eventResizableFromStart: false,
    dragRevertDuration: 500,
    dragScroll: true,
    allDayMaintainDuration: false,
    // selectable: false,
    unselectAuto: true,
    // selectMinDistance: 0,
    dropAccept: '*',
    eventOrder: 'start,-duration,allDay,title',
    // ^ if start tie, longer events go before shorter. final tie-breaker is title text
    // rerenderDelay: null,
    eventLimit: false,
    eventLimitClick: 'popover',
    dayPopoverFormat: { month: 'long', day: 'numeric', year: 'numeric' },
    handleWindowResize: true,
    windowResizeDelay: 100,
    longPressDelay: 1000,
    eventDragMinDistance: 5 // only applies to mouse
};
exports.rtlDefaults = {
    header: {
        left: 'next,prev today',
        center: '',
        right: 'title'
    },
    buttonIcons: {
        prev: 'right-single-arrow',
        next: 'left-single-arrow',
        prevYear: 'right-double-arrow',
        nextYear: 'left-double-arrow'
    },
    themeButtonIcons: {
        prev: 'circle-triangle-e',
        next: 'circle-triangle-w',
        nextYear: 'seek-prev',
        prevYear: 'seek-next'
    }
};
var complexOptions = [
    'header',
    'footer',
    'buttonText',
    'buttonIcons',
    'themeButtonIcons'
];
// Merges an array of option objects into a single object
function mergeOptions(optionObjs) {
    return object_1.mergeProps(optionObjs, complexOptions);
}
exports.mergeOptions = mergeOptions;


/***/ }),
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var dom_geom_1 = __webpack_require__(13);
var dom_manip_1 = __webpack_require__(3);
var scroll_controller_1 = __webpack_require__(139);
/*
Embodies a div that has potential scrollbars
*/
var ScrollComponent = /** @class */ (function (_super) {
    tslib_1.__extends(ScrollComponent, _super);
    function ScrollComponent(overflowX, overflowY) {
        var _this = _super.call(this, dom_manip_1.createElement('div', {
            className: 'fc-scroller'
        })) || this;
        _this.overflowX = overflowX;
        _this.overflowY = overflowY;
        return _this;
    }
    // sets to natural height, unlocks overflow
    ScrollComponent.prototype.clear = function () {
        this.setHeight('auto');
        this.applyOverflow();
    };
    ScrollComponent.prototype.removeElement = function () {
        dom_manip_1.removeElement(this.el);
    };
    // Overflow
    // -----------------------------------------------------------------------------------------------------------------
    ScrollComponent.prototype.applyOverflow = function () {
        dom_manip_1.applyStyle(this.el, {
            overflowX: this.overflowX,
            overflowY: this.overflowY
        });
    };
    // Causes any 'auto' overflow values to resolves to 'scroll' or 'hidden'.
    // Useful for preserving scrollbar widths regardless of future resizes.
    // Can pass in scrollbarWidths for optimization.
    ScrollComponent.prototype.lockOverflow = function (scrollbarWidths) {
        var overflowX = this.overflowX;
        var overflowY = this.overflowY;
        scrollbarWidths = scrollbarWidths || this.getScrollbarWidths();
        if (overflowX === 'auto') {
            overflowX = (scrollbarWidths.bottom || // horizontal scrollbars?
                this.canScrollHorizontally() // OR scrolling pane with massless scrollbars?
            ) ? 'scroll' : 'hidden';
        }
        if (overflowY === 'auto') {
            overflowY = (scrollbarWidths.left || scrollbarWidths.right || // horizontal scrollbars?
                this.canScrollVertically() // OR scrolling pane with massless scrollbars?
            ) ? 'scroll' : 'hidden';
        }
        dom_manip_1.applyStyle(this.el, { overflowX: overflowX, overflowY: overflowY });
    };
    ScrollComponent.prototype.setHeight = function (height) {
        dom_manip_1.applyStyleProp(this.el, 'height', height);
    };
    ScrollComponent.prototype.getScrollbarWidths = function () {
        var edges = dom_geom_1.computeEdges(this.el);
        return {
            left: edges.scrollbarLeft,
            right: edges.scrollbarRight,
            bottom: edges.scrollbarBottom
        };
    };
    return ScrollComponent;
}(scroll_controller_1.ElementScrollController));
exports.default = ScrollComponent;


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var marker_1 = __webpack_require__(6);
var recurringTypes = [];
function registerRecurringType(recurringType) {
    recurringTypes.push(recurringType);
}
exports.registerRecurringType = registerRecurringType;
function parseRecurring(eventInput, dateEnv, leftovers) {
    for (var i = 0; i < recurringTypes.length; i++) {
        var parsed = recurringTypes[i].parse(eventInput, leftovers, dateEnv);
        if (parsed) {
            return {
                allDay: parsed.allDay,
                duration: parsed.duration,
                typeData: parsed.typeData,
                typeId: i
            };
        }
    }
    return null;
}
exports.parseRecurring = parseRecurring;
/*
Event MUST have a recurringDef
*/
function expandRecurringRanges(eventDef, framingRange, dateEnv) {
    var typeDef = recurringTypes[eventDef.recurringDef.typeId];
    var markers = typeDef.expand(eventDef.recurringDef.typeData, eventDef, framingRange, dateEnv);
    // the recurrence plugins don't guarantee that all-day events are start-of-day, so we have to
    if (eventDef.allDay) {
        markers = markers.map(marker_1.startOfDay);
    }
    return markers;
}
exports.expandRecurringRanges = expandRecurringRanges;


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var event_store_1 = __webpack_require__(14);
var date_span_1 = __webpack_require__(50);
var event_1 = __webpack_require__(29);
var date_range_1 = __webpack_require__(11);
var EventApi_1 = __webpack_require__(15);
function isEventsValid(eventStore, calendar) {
    return isEntitiesValid(eventStoreToEntities(eventStore, calendar.state.eventSources), normalizeConstraint(calendar.opt('eventConstraint'), calendar), calendar.opt('eventOverlap'), calendar.opt('eventAllow'), calendar);
}
exports.isEventsValid = isEventsValid;
function isSelectionValid(selection, calendar) {
    return isEntitiesValid([{ dateSpan: selection, event: null, constraint: null, overlap: null, allow: null }], normalizeConstraint(calendar.opt('selectConstraint'), calendar), calendar.opt('selectOverlap'), calendar.opt('selectAllow'), calendar);
}
exports.isSelectionValid = isSelectionValid;
function isEntitiesValid(entities, globalConstraint, globalOverlap, globalAllow, calendar) {
    var state = calendar.state;
    for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
        var entity = entities_1[_i];
        if (!isDateSpanWithinConstraint(entity.dateSpan, entity.constraint, calendar) ||
            !isDateSpanWithinConstraint(entity.dateSpan, globalConstraint, calendar)) {
            return false;
        }
    }
    var eventEntities = eventStoreToEntities(state.eventStore, state.eventSources);
    for (var _a = 0, entities_2 = entities; _a < entities_2.length; _a++) {
        var subjectEntity = entities_2[_a];
        for (var _b = 0, eventEntities_1 = eventEntities; _b < eventEntities_1.length; _b++) {
            var eventEntity = eventEntities_1[_b];
            if (( // not comparing the same/related event
            !subjectEntity.event ||
                !eventEntity.event ||
                isEventsCollidable(subjectEntity.event, eventEntity.event)) &&
                dateSpansCollide(subjectEntity.dateSpan, eventEntity.dateSpan) // a collision!
            ) {
                if (subjectEntity.overlap === false ||
                    (eventEntity.overlap === false && subjectEntity.event) || // the eventEntity doesn't like two events colliding
                    !isOverlapValid(eventEntity.event, subjectEntity.event, globalOverlap, calendar)) {
                    return false;
                }
            }
        }
    }
    for (var _c = 0, entities_3 = entities; _c < entities_3.length; _c++) {
        var entity = entities_3[_c];
        if (!isDateSpanAllowed(entity.dateSpan, entity.event, entity.allow, calendar) ||
            !isDateSpanAllowed(entity.dateSpan, entity.event, globalAllow, calendar)) {
            return false;
        }
    }
    return true;
}
// do we want to compare these events for collision?
// say no if events are the same, or if they share a groupId
function isEventsCollidable(event0, event1) {
    if (event0.instance.instanceId === event1.instance.instanceId) {
        return false;
    }
    return !event_store_1.isEventDefsGrouped(event0.def, event1.def);
}
function eventStoreToEntities(eventStore, eventSources) {
    return event_store_1.mapEventInstances(eventStore, function (eventInstance, eventDef) {
        var eventSource = eventSources[eventDef.sourceId];
        var constraint = eventDef.constraint;
        var overlap = eventDef.overlap;
        if (constraint == null && eventSource) {
            constraint = eventSource.constraint;
        }
        if (overlap == null && eventSource) {
            overlap = eventSource.overlap;
            if (overlap == null) {
                overlap = true;
            }
        }
        return {
            dateSpan: eventToDateSpan(eventDef, eventInstance),
            event: { def: eventDef, instance: eventInstance },
            constraint: constraint,
            overlap: overlap,
            allow: eventSource ? eventSource.allow : null
        };
    });
}
function isDateSpanWithinConstraint(subjectSpan, constraint, calendar) {
    if (constraint === null) {
        return true; // doesn't care
    }
    var constrainingSpans = constraintToSpans(constraint, subjectSpan, calendar);
    for (var _i = 0, constrainingSpans_1 = constrainingSpans; _i < constrainingSpans_1.length; _i++) {
        var constrainingSpan = constrainingSpans_1[_i];
        if (dateSpanContainsOther(constrainingSpan, subjectSpan)) {
            return true;
        }
    }
    return false; // not contained by any one of the constrainingSpans
}
function constraintToSpans(constraint, subjectSpan, calendar) {
    if (constraint === 'businessHours') {
        var store = getPeerBusinessHours(subjectSpan, calendar);
        store = event_store_1.expandRecurring(store, subjectSpan.range, calendar);
        return eventStoreToDateSpans(store);
    }
    else if (typeof constraint === 'string') { // an ID
        var store = event_store_1.filterEventStoreDefs(calendar.state.eventStore, function (eventDef) {
            return eventDef.groupId === constraint;
        });
        return eventStoreToDateSpans(store);
    }
    else if (typeof constraint === 'object' && constraint) { // non-null object
        if (constraint.def) { // an event definition (actually, a tuple)
            var store = event_store_1.eventTupleToStore(constraint);
            store = event_store_1.expandRecurring(store, subjectSpan.range, calendar);
            return eventStoreToDateSpans(store);
        }
        else {
            return [constraint]; // already parsed datespan
        }
    }
    return [];
}
function isOverlapValid(still, moving, overlap, calendar) {
    if (typeof overlap === 'boolean') {
        return overlap;
    }
    else if (typeof overlap === 'function') {
        return Boolean(overlap(new EventApi_1.default(calendar, still.def, still.instance), moving ? new EventApi_1.default(calendar, moving.def, moving.instance) : null));
    }
    return true;
}
function isDateSpanAllowed(dateSpan, moving, allow, calendar) {
    if (typeof allow === 'function') {
        return Boolean(allow(date_span_1.buildDateSpanApi(dateSpan, calendar.dateEnv), moving ? new EventApi_1.default(calendar, moving.def, moving.instance) : null));
    }
    return true;
}
function dateSpansCollide(span0, span1) {
    return date_range_1.rangesIntersect(span0.range, span1.range) && date_span_1.isSpanPropsEqual(span0, span1);
}
function dateSpanContainsOther(outerSpan, subjectSpan) {
    return date_range_1.rangeContainsRange(outerSpan.range, subjectSpan.range) &&
        date_span_1.isSpanPropsMatching(subjectSpan, outerSpan); // subjectSpan has all the props that outerSpan has?
}
function eventStoreToDateSpans(store) {
    return event_store_1.mapEventInstances(store, function (instance, def) {
        return eventToDateSpan(def, instance);
    });
}
// TODO: plugin
function eventToDateSpan(def, instance) {
    return {
        allDay: def.allDay,
        range: instance.range
    };
}
exports.eventToDateSpan = eventToDateSpan;
// TODO: plugin
function getPeerBusinessHours(subjectSpan, calendar) {
    return calendar.view.businessHours; // accessing view :(
}
function normalizeConstraint(input, calendar) {
    if (typeof input === 'object' && input) { // non-null object
        var span = date_span_1.parseOpenDateSpan(input, calendar.dateEnv);
        if (span === null || span.range.start || span.range.end) {
            return span;
        }
        else { // if completely-open range, assume it's a recurring event (prolly with startTime/endTime)
            return event_1.parseEvent(input, '', calendar);
        }
    }
    else if (input != null) {
        return String(input);
    }
    else {
        return null;
    }
}
exports.normalizeConstraint = normalizeConstraint;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var exportHooks = __webpack_require__(25);
var dom_manip_1 = __webpack_require__(3);
var EmitterMixin_1 = __webpack_require__(20);
exportHooks.touchMouseIgnoreWait = 500;
var ignoreMouseDepth = 0;
var listenerCnt = 0;
var isWindowTouchMoveCancelled = false;
/*
Uses a "pointer" abstraction, which monitors UI events for both mouse and touch.
Tracks when the pointer "drags" on a certain element, meaning down+move+up.

Also, tracks if there was touch-scrolling.
Also, can prevent touch-scrolling from happening.
Also, can fire pointermove events when scrolling happens underneath, even when no real pointer movement.

emits:
- pointerdown
- pointermove
- pointerup
*/
var PointerDragging = /** @class */ (function () {
    function PointerDragging(containerEl) {
        var _this = this;
        this.subjectEl = null;
        this.downEl = null;
        // options that can be directly assigned by caller
        this.selector = ''; // will cause subjectEl in all emitted events to be this element
        this.handleSelector = '';
        this.shouldIgnoreMove = false;
        this.shouldWatchScroll = true; // for simulating pointermove on scroll
        // internal states
        this.isDragging = false;
        this.isTouchDragging = false;
        this.wasTouchScroll = false;
        // Mouse
        // ----------------------------------------------------------------------------------------------------
        this.handleMouseDown = function (ev) {
            if (!_this.shouldIgnoreMouse() &&
                isPrimaryMouseButton(ev) &&
                _this.tryStart(ev)) {
                var pev = createEventFromMouse(ev, _this.subjectEl);
                _this.emitter.trigger('pointerdown', pev);
                _this.initScrollWatch(pev);
                if (!_this.shouldIgnoreMove) {
                    document.addEventListener('mousemove', _this.handleMouseMove);
                }
                document.addEventListener('mouseup', _this.handleMouseUp);
            }
        };
        this.handleMouseMove = function (ev) {
            var pev = createEventFromMouse(ev, _this.subjectEl);
            _this.recordCoords(pev);
            _this.emitter.trigger('pointermove', pev);
        };
        this.handleMouseUp = function (ev) {
            document.removeEventListener('mousemove', _this.handleMouseMove);
            document.removeEventListener('mouseup', _this.handleMouseUp);
            _this.emitter.trigger('pointerup', createEventFromMouse(ev, _this.subjectEl));
            _this.cleanup(); // call last so that pointerup has access to props
        };
        // Touch
        // ----------------------------------------------------------------------------------------------------
        this.handleTouchStart = function (ev) {
            if (_this.tryStart(ev)) {
                _this.isTouchDragging = true;
                var pev = createEventFromTouch(ev, _this.subjectEl);
                _this.emitter.trigger('pointerdown', pev);
                _this.initScrollWatch(pev);
                // unlike mouse, need to attach to target, not document
                // https://stackoverflow.com/a/45760014
                var target = ev.target;
                if (!_this.shouldIgnoreMove) {
                    target.addEventListener('touchmove', _this.handleTouchMove);
                }
                target.addEventListener('touchend', _this.handleTouchEnd);
                target.addEventListener('touchcancel', _this.handleTouchEnd); // treat it as a touch end
                // attach a handler to get called when ANY scroll action happens on the page.
                // this was impossible to do with normal on/off because 'scroll' doesn't bubble.
                // http://stackoverflow.com/a/32954565/96342
                window.addEventListener('scroll', _this.handleTouchScroll, true // useCapture
                );
            }
        };
        this.handleTouchMove = function (ev) {
            var pev = createEventFromTouch(ev, _this.subjectEl);
            _this.recordCoords(pev);
            _this.emitter.trigger('pointermove', pev);
        };
        this.handleTouchEnd = function (ev) {
            if (_this.isDragging) { // done to guard against touchend followed by touchcancel
                var target = ev.target;
                target.removeEventListener('touchmove', _this.handleTouchMove);
                target.removeEventListener('touchend', _this.handleTouchEnd);
                target.removeEventListener('touchcancel', _this.handleTouchEnd);
                window.removeEventListener('scroll', _this.handleTouchScroll, true); // wasCaptured=true
                _this.emitter.trigger('pointerup', createEventFromTouch(ev, _this.subjectEl));
                _this.cleanup(); // call last so that pointerup has access to props
                _this.isTouchDragging = false;
                startIgnoringMouse();
            }
        };
        this.handleTouchScroll = function () {
            _this.wasTouchScroll = true;
        };
        this.handleScroll = function (ev) {
            if (!_this.shouldIgnoreMove) {
                _this.emitter.trigger('pointermove', {
                    origEvent: ev,
                    isTouch: _this.isTouchDragging,
                    subjectEl: _this.subjectEl,
                    pageX: (window.pageXOffset - _this.prevScrollX) + _this.prevPageX,
                    pageY: (window.pageYOffset - _this.prevScrollY) + _this.prevPageY
                });
            }
        };
        this.containerEl = containerEl;
        this.emitter = new EmitterMixin_1.default();
        containerEl.addEventListener('mousedown', this.handleMouseDown);
        containerEl.addEventListener('touchstart', this.handleTouchStart);
        listenerCreated();
    }
    PointerDragging.prototype.destroy = function () {
        this.containerEl.removeEventListener('mousedown', this.handleMouseDown);
        this.containerEl.removeEventListener('touchstart', this.handleTouchStart);
        listenerDestroyed();
    };
    PointerDragging.prototype.tryStart = function (ev) {
        var subjectEl = this.querySubjectEl(ev);
        var downEl = ev.target;
        if (subjectEl &&
            (!this.handleSelector || dom_manip_1.elementClosest(downEl, this.handleSelector))) {
            this.subjectEl = subjectEl;
            this.downEl = downEl;
            this.isDragging = true; // do this first so cancelTouchScroll will work
            this.wasTouchScroll = false;
            return true;
        }
        return false;
    };
    PointerDragging.prototype.cleanup = function () {
        isWindowTouchMoveCancelled = false;
        this.isDragging = false;
        this.subjectEl = null;
        this.downEl = null;
        // keep wasTouchScroll around for later access
        this.destroyScrollWatch();
    };
    PointerDragging.prototype.querySubjectEl = function (ev) {
        if (this.selector) {
            return dom_manip_1.elementClosest(ev.target, this.selector);
        }
        else {
            return this.containerEl;
        }
    };
    PointerDragging.prototype.shouldIgnoreMouse = function () {
        return ignoreMouseDepth || this.isTouchDragging;
    };
    // can be called by user of this class, to cancel touch-based scrolling for the current drag
    PointerDragging.prototype.cancelTouchScroll = function () {
        if (this.isDragging) {
            isWindowTouchMoveCancelled = true;
        }
    };
    // Scrolling that simulates pointermoves
    // ----------------------------------------------------------------------------------------------------
    PointerDragging.prototype.initScrollWatch = function (ev) {
        if (this.shouldWatchScroll) {
            this.recordCoords(ev);
            window.addEventListener('scroll', this.handleScroll, true); // useCapture=true
        }
    };
    PointerDragging.prototype.recordCoords = function (ev) {
        if (this.shouldWatchScroll) {
            this.prevPageX = ev.pageX;
            this.prevPageY = ev.pageY;
            this.prevScrollX = window.pageXOffset;
            this.prevScrollY = window.pageYOffset;
        }
    };
    PointerDragging.prototype.destroyScrollWatch = function () {
        if (this.shouldWatchScroll) {
            window.removeEventListener('scroll', this.handleScroll, true); // wasCaptured=true
        }
    };
    return PointerDragging;
}());
exports.default = PointerDragging;
// Event Normalization
// ----------------------------------------------------------------------------------------------------
function createEventFromMouse(ev, subjectEl) {
    return {
        origEvent: ev,
        isTouch: false,
        subjectEl: subjectEl,
        pageX: ev.pageX,
        pageY: ev.pageY
    };
}
function createEventFromTouch(ev, subjectEl) {
    var touches = ev.touches;
    var pageX;
    var pageY;
    // if touch coords available, prefer,
    // because FF would give bad ev.pageX ev.pageY
    if (touches && touches.length) {
        pageX = touches[0].pageX;
        pageY = touches[0].pageY;
    }
    else {
        pageX = ev.pageX;
        pageY = ev.pageY;
    }
    return {
        origEvent: ev,
        isTouch: true,
        subjectEl: subjectEl,
        pageX: pageX,
        pageY: pageY
    };
}
// Returns a boolean whether this was a left mouse click and no ctrl key (which means right click on Mac)
function isPrimaryMouseButton(ev) {
    return ev.button === 0 && !ev.ctrlKey;
}
// Ignoring fake mouse events generated by touch
// ----------------------------------------------------------------------------------------------------
function startIgnoringMouse() {
    ignoreMouseDepth++;
    setTimeout(function () {
        ignoreMouseDepth--;
    }, exportHooks.touchMouseIgnoreWait);
}
// We want to attach touchmove as early as possible for Safari
// ----------------------------------------------------------------------------------------------------
function listenerCreated() {
    if (!(listenerCnt++)) {
        window.addEventListener('touchmove', onWindowTouchMove, { passive: false });
    }
}
function listenerDestroyed() {
    if (!(--listenerCnt)) {
        window.removeEventListener('touchmove', onWindowTouchMove);
    }
}
function onWindowTouchMove(ev) {
    if (isWindowTouchMoveCancelled) {
        ev.preventDefault();
    }
}


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var object_1 = __webpack_require__(4);
var RAW_EN_LOCALE = {
    week: {
        dow: 0,
        doy: 4 // 4 days need to be within the year to be considered the first week
    },
    dir: 'ltr',
    buttonText: {
        prev: 'prev',
        next: 'next',
        prevYear: 'prev year',
        nextYear: 'next year',
        year: 'year',
        today: 'today',
        month: 'month',
        week: 'week',
        day: 'day',
        list: 'list'
    },
    weekLabel: 'W',
    allDayText: 'all-day',
    eventLimitText: 'more',
    noEventsMessage: 'No events to display'
};
var rawMap = {};
function getLocale(codeArg) {
    if (codeArg === 'auto') {
        codeArg = null;
    }
    var codes;
    if (Array.isArray(codeArg)) {
        codes = codeArg;
    }
    else if (typeof codeArg === 'string') {
        codes = [codeArg];
    }
    else {
        codes = [];
    }
    var raw = getRawLocale(codes) || {};
    var merged = object_1.mergeProps([RAW_EN_LOCALE, raw], ['buttonText']);
    var week = merged.week;
    delete merged.week;
    return {
        codeArg: codeArg,
        codes: codes,
        week: week,
        simpleNumberFormat: new Intl.NumberFormat(codeArg),
        options: merged
    };
}
exports.getLocale = getLocale;
function getRawLocale(codes) {
    for (var i = 0; i < codes.length; i++) {
        var parts = codes[i].toLocaleLowerCase().split('-');
        for (var j = parts.length; j > 0; j--) {
            var simpleId = parts.slice(0, j).join('-');
            if (rawMap[simpleId]) {
                return rawMap[simpleId];
            }
        }
    }
    return null;
}
function defineLocale(simpleId, rawData) {
    rawMap[simpleId] = rawData;
}
exports.defineLocale = defineLocale;
function getLocaleCodes() {
    return Object.keys(rawMap);
}
exports.getLocaleCodes = getLocaleCodes;
defineLocale('en', RAW_EN_LOCALE);


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var object_1 = __webpack_require__(4);
var misc_1 = __webpack_require__(2);
var DateProfileGenerator_1 = __webpack_require__(57);
var DateComponent_1 = __webpack_require__(21);
var marker_1 = __webpack_require__(6);
var duration_1 = __webpack_require__(10);
var formatting_1 = __webpack_require__(8);
var EmitterMixin_1 = __webpack_require__(20);
var date_range_1 = __webpack_require__(11);
/* An abstract class from which other views inherit from
----------------------------------------------------------------------------------------------------------------------*/
var View = /** @class */ (function (_super) {
    tslib_1.__extends(View, _super);
    function View(calendar, viewSpec) {
        var _this = _super.call(this, null, viewSpec.options) || this;
        _this.calendar = calendar;
        _this.viewSpec = viewSpec;
        // shortcuts
        _this.type = viewSpec.type;
        _this.initHiddenDays();
        _this.dateProfileGenerator = new _this.dateProfileGeneratorClass(_this);
        _this.eventOrderSpecs = misc_1.parseFieldSpecs(_this.opt('eventOrder'));
        _this.initialize();
        return _this;
    }
    View.prototype.initialize = function () {
    };
    // Retrieves an option with the given name
    View.prototype.opt = function (name) {
        return this.options[name];
    };
    /* Title and Date Formatting
    ------------------------------------------------------------------------------------------------------------------*/
    // Computes what the title at the top of the calendar should be for this view
    View.prototype.computeTitle = function (dateProfile) {
        var dateEnv = this.getDateEnv();
        var range;
        // for views that span a large unit of time, show the proper interval, ignoring stray days before and after
        if (/^(year|month)$/.test(dateProfile.currentRangeUnit)) {
            range = dateProfile.currentRange;
        }
        else { // for day units or smaller, use the actual day range
            range = dateProfile.activeRange;
        }
        return dateEnv.formatRange(range.start, range.end, formatting_1.createFormatter(this.opt('titleFormat') || this.computeTitleFormat(dateProfile), this.opt('titleRangeSeparator')), { isEndExclusive: dateProfile.isRangeAllDay });
    };
    // Generates the format string that should be used to generate the title for the current date range.
    // Attempts to compute the most appropriate format if not explicitly specified with `titleFormat`.
    View.prototype.computeTitleFormat = function (dateProfile) {
        var currentRangeUnit = dateProfile.currentRangeUnit;
        if (currentRangeUnit === 'year') {
            return { year: 'numeric' };
        }
        else if (currentRangeUnit === 'month') {
            return { year: 'numeric', month: 'long' }; // like "September 2014"
        }
        else {
            var days = marker_1.diffWholeDays(dateProfile.currentRange.start, dateProfile.currentRange.end);
            if (days !== null && days > 1) {
                // multi-day range. shorter, like "Sep 9 - 10 2014"
                return { year: 'numeric', month: 'short', day: 'numeric' };
            }
            else {
                // one day. longer, like "September 9 2014"
                return { year: 'numeric', month: 'long', day: 'numeric' };
            }
        }
    };
    // Date Setting/Unsetting
    // -----------------------------------------------------------------------------------------------------------------
    View.prototype.computeDateProfile = function (date) {
        var dateProfile = this.dateProfileGenerator.build(date, undefined, true); // forceToValid=true
        if ( // reuse current reference if possible, for rendering optimization
        this.dateProfile &&
            date_range_1.rangesEqual(this.dateProfile.activeRange, dateProfile.activeRange)) {
            return this.dateProfile;
        }
        return dateProfile;
    };
    Object.defineProperty(View.prototype, "activeStart", {
        get: function () {
            return this.getDateEnv().toDate(this.dateProfile.activeRange.start);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "activeEnd", {
        get: function () {
            return this.getDateEnv().toDate(this.dateProfile.activeRange.end);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "currentStart", {
        get: function () {
            return this.getDateEnv().toDate(this.dateProfile.currentRange.start);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "currentEnd", {
        get: function () {
            return this.getDateEnv().toDate(this.dateProfile.currentRange.end);
        },
        enumerable: true,
        configurable: true
    });
    // Skeleton Rendering
    // -----------------------------------------------------------------------------------------------------------------
    View.prototype.afterSkeletonRender = function () {
        this.publiclyTriggerAfterSizing('viewSkeletonRender', [
            {
                view: this,
                el: this.el
            }
        ]);
    };
    View.prototype.beforeSkeletonUnrender = function () {
        this.publiclyTrigger('viewSkeletonDestroy', [
            {
                view: this,
                el: this.el
            }
        ]);
    };
    // Date Rendering
    // -----------------------------------------------------------------------------------------------------------------
    View.prototype.afterDatesRender = function () {
        this.title = this.computeTitle(this.dateProfile);
        this.addScroll({ isDateInit: true });
        this.startNowIndicator(); // shouldn't render yet because updateSize will be called soon
        this.publiclyTriggerAfterSizing('datesRender', [
            {
                view: this,
                el: this.el
            }
        ]);
    };
    View.prototype.beforeDatesUnrender = function () {
        this.publiclyTrigger('datesDestroy', [
            {
                view: this,
                el: this.el
            }
        ]);
        this.stopNowIndicator();
    };
    /* Now Indicator
    ------------------------------------------------------------------------------------------------------------------*/
    // Immediately render the current time indicator and begins re-rendering it at an interval,
    // which is defined by this.getNowIndicatorUnit().
    // TODO: somehow do this for the current whole day's background too
    View.prototype.startNowIndicator = function () {
        var _this = this;
        var dateEnv = this.getDateEnv();
        var unit;
        var update;
        var delay; // ms wait value
        if (this.opt('nowIndicator')) {
            unit = this.getNowIndicatorUnit();
            if (unit) {
                update = this.updateNowIndicator.bind(this);
                this.initialNowDate = this.calendar.getNow();
                this.initialNowQueriedMs = new Date().valueOf();
                // wait until the beginning of the next interval
                delay = dateEnv.add(dateEnv.startOf(this.initialNowDate, unit), duration_1.createDuration(1, unit)).valueOf() - this.initialNowDate.valueOf();
                // TODO: maybe always use setTimeout, waiting until start of next unit
                this.nowIndicatorTimeoutID = setTimeout(function () {
                    _this.nowIndicatorTimeoutID = null;
                    update();
                    if (unit === 'second') {
                        delay = 1000; // every second
                    }
                    else {
                        delay = 1000 * 60; // otherwise, every minute
                    }
                    _this.nowIndicatorIntervalID = setInterval(update, delay); // update every interval
                }, delay);
            }
            // rendering will be initiated in updateSize
        }
    };
    // rerenders the now indicator, computing the new current time from the amount of time that has passed
    // since the initial getNow call.
    View.prototype.updateNowIndicator = function () {
        if (this.renderedFlags.dates &&
            this.initialNowDate // activated before?
        ) {
            this.unrenderNowIndicator(); // won't unrender if unnecessary
            this.renderNowIndicator(marker_1.addMs(this.initialNowDate, new Date().valueOf() - this.initialNowQueriedMs));
            this.isNowIndicatorRendered = true;
        }
    };
    // Immediately unrenders the view's current time indicator and stops any re-rendering timers.
    // Won't cause side effects if indicator isn't rendered.
    View.prototype.stopNowIndicator = function () {
        if (this.isNowIndicatorRendered) {
            if (this.nowIndicatorTimeoutID) {
                clearTimeout(this.nowIndicatorTimeoutID);
                this.nowIndicatorTimeoutID = null;
            }
            if (this.nowIndicatorIntervalID) {
                clearInterval(this.nowIndicatorIntervalID);
                this.nowIndicatorIntervalID = null;
            }
            this.unrenderNowIndicator();
            this.isNowIndicatorRendered = false;
        }
    };
    /* Dimensions
    ------------------------------------------------------------------------------------------------------------------*/
    View.prototype.updateSize = function (totalHeight, isAuto, force) {
        _super.prototype.updateSize.call(this, totalHeight, isAuto, force);
        this.updateNowIndicator();
    };
    /* Scroller
    ------------------------------------------------------------------------------------------------------------------*/
    View.prototype.addScroll = function (scroll) {
        var queuedScroll = this.queuedScroll || (this.queuedScroll = {});
        if (!queuedScroll.isLocked) {
            object_1.assignTo(queuedScroll, scroll);
        }
    };
    View.prototype.popScroll = function () {
        this.applyQueuedScroll();
        this.queuedScroll = null;
    };
    View.prototype.applyQueuedScroll = function () {
        this.applyScroll(this.queuedScroll || {});
    };
    View.prototype.queryScroll = function () {
        var scroll = {};
        if (this.renderedFlags.dates) {
            object_1.assignTo(scroll, this.queryDateScroll());
        }
        return scroll;
    };
    View.prototype.applyScroll = function (scroll) {
        if (scroll.isLocked) {
            delete scroll.isLocked;
        }
        if (scroll.isDateInit) {
            delete scroll.isDateInit;
            if (this.renderedFlags.dates) {
                object_1.assignTo(scroll, this.computeInitialDateScroll());
            }
        }
        if (this.renderedFlags.dates) {
            this.applyDateScroll(scroll);
        }
    };
    View.prototype.computeInitialDateScroll = function () {
        return {}; // subclasses must implement
    };
    View.prototype.queryDateScroll = function () {
        return {}; // subclasses must implement
    };
    View.prototype.applyDateScroll = function (scroll) {
        // subclasses must implement
    };
    /* Date Utils
    ------------------------------------------------------------------------------------------------------------------*/
    // For DateComponent::getDayClasses
    View.prototype.isDateInOtherMonth = function (date, dateProfile) {
        return false;
    };
    // Arguments after name will be forwarded to a hypothetical function value
    // WARNING: passed-in arguments will be given to generator functions as-is and can cause side-effects.
    // Always clone your objects if you fear mutation.
    View.prototype.getRangeOption = function (name) {
        var otherArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            otherArgs[_i - 1] = arguments[_i];
        }
        var val = this.opt(name);
        if (typeof val === 'function') {
            val = val.apply(null, otherArgs);
        }
        if (val) {
            return date_range_1.parseRange(val, this.calendar.dateEnv);
        }
    };
    /* Hidden Days
    ------------------------------------------------------------------------------------------------------------------*/
    // Initializes internal variables related to calculating hidden days-of-week
    View.prototype.initHiddenDays = function () {
        var hiddenDays = this.opt('hiddenDays') || []; // array of day-of-week indices that are hidden
        var isHiddenDayHash = []; // is the day-of-week hidden? (hash with day-of-week-index -> bool)
        var dayCnt = 0;
        var i;
        if (this.opt('weekends') === false) {
            hiddenDays.push(0, 6); // 0=sunday, 6=saturday
        }
        for (i = 0; i < 7; i++) {
            if (!(isHiddenDayHash[i] = hiddenDays.indexOf(i) !== -1)) {
                dayCnt++;
            }
        }
        if (!dayCnt) {
            throw new Error('invalid hiddenDays'); // all days were hidden? bad.
        }
        this.isHiddenDayHash = isHiddenDayHash;
    };
    // Remove days from the beginning and end of the range that are computed as hidden.
    // If the whole range is trimmed off, returns null
    View.prototype.trimHiddenDays = function (range) {
        var start = range.start;
        var end = range.end;
        if (start) {
            start = this.skipHiddenDays(start);
        }
        if (end) {
            end = this.skipHiddenDays(end, -1, true);
        }
        if (start == null || end == null || start < end) {
            return { start: start, end: end };
        }
        return null;
    };
    // Is the current day hidden?
    // `day` is a day-of-week index (0-6), or a Date (used for UTC)
    View.prototype.isHiddenDay = function (day) {
        if (day instanceof Date) {
            day = day.getUTCDay();
        }
        return this.isHiddenDayHash[day];
    };
    // Incrementing the current day until it is no longer a hidden day, returning a copy.
    // DOES NOT CONSIDER validRange!
    // If the initial value of `date` is not a hidden day, don't do anything.
    // Pass `isExclusive` as `true` if you are dealing with an end date.
    // `inc` defaults to `1` (increment one day forward each time)
    View.prototype.skipHiddenDays = function (date, inc, isExclusive) {
        if (inc === void 0) { inc = 1; }
        if (isExclusive === void 0) { isExclusive = false; }
        while (this.isHiddenDayHash[(date.getUTCDay() + (isExclusive ? inc : 0) + 7) % 7]) {
            date = marker_1.addDays(date, inc);
        }
        return date;
    };
    return View;
}(DateComponent_1.default));
exports.default = View;
EmitterMixin_1.default.mixInto(View);
View.prototype.usesMinMaxTime = false;
View.prototype.dateProfileGeneratorClass = DateProfileGenerator_1.default;


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var exportHooks = __webpack_require__(25);
exports.viewHash = {};
exportHooks.views = exports.viewHash;
function defineView(viewType, viewConfig) {
    exports.viewHash[viewType] = viewConfig;
}
exports.defineView = defineView;
function getViewConfig(viewType) {
    return exports.viewHash[viewType];
}
exports.getViewConfig = getViewConfig;


/***/ }),
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var Mixin = /** @class */ (function () {
    function Mixin() {
    }
    // mix into a CLASS
    Mixin.mixInto = function (destClass) {
        this.mixIntoObj(destClass.prototype);
    };
    // mix into ANY object
    Mixin.mixIntoObj = function (destObj) {
        var _this = this;
        Object.getOwnPropertyNames(this.prototype).forEach(function (name) {
            if (!destObj[name]) { // if destination doesn't already define it
                destObj[name] = _this.prototype[name];
            }
        });
    };
    /*
    will override existing methods
    TODO: remove! not used anymore
    */
    Mixin.mixOver = function (destClass) {
        var _this = this;
        Object.getOwnPropertyNames(this.prototype).forEach(function (name) {
            destClass.prototype[name] = _this.prototype[name];
        });
    };
    return Mixin;
}());
exports.default = Mixin;


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var StandardTheme_1 = __webpack_require__(137);
var JqueryUiTheme_1 = __webpack_require__(138);
var themeClassHash = {};
function defineThemeSystem(themeName, themeClass) {
    themeClassHash[themeName] = themeClass;
}
exports.defineThemeSystem = defineThemeSystem;
function getThemeSystemClass(themeSetting) {
    if (!themeSetting) {
        return StandardTheme_1.default;
    }
    else if (themeSetting === true) {
        return JqueryUiTheme_1.default;
    }
    else {
        return themeClassHash[themeSetting];
    }
}
exports.getThemeSystemClass = getThemeSystemClass;


/***/ }),
/* 49 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
/*
Records offset information for a set of elements, relative to an origin element.
Can record the left/right OR the top/bottom OR both.
Provides methods for querying the cache by position.
*/
var PositionCache = /** @class */ (function () {
    function PositionCache(originEl, els, isHorizontal, isVertical) {
        this.originEl = originEl;
        this.els = els;
        this.isHorizontal = isHorizontal;
        this.isVertical = isVertical;
    }
    // Queries the els for coordinates and stores them.
    // Call this method before using and of the get* methods below.
    PositionCache.prototype.build = function () {
        var originEl = this.originEl;
        var originClientRect = originEl.getBoundingClientRect(); // relative to viewport top-left
        if (this.isHorizontal) {
            this.buildElHorizontals(originClientRect.left);
        }
        if (this.isVertical) {
            this.buildElVerticals(originClientRect.top);
        }
    };
    // Populates the left/right internal coordinate arrays
    PositionCache.prototype.buildElHorizontals = function (originClientLeft) {
        var lefts = [];
        var rights = [];
        for (var _i = 0, _a = this.els; _i < _a.length; _i++) {
            var el = _a[_i];
            var rect = el.getBoundingClientRect();
            lefts.push(rect.left - originClientLeft);
            rights.push(rect.right - originClientLeft);
        }
        this.lefts = lefts;
        this.rights = rights;
    };
    // Populates the top/bottom internal coordinate arrays
    PositionCache.prototype.buildElVerticals = function (originClientTop) {
        var tops = [];
        var bottoms = [];
        for (var _i = 0, _a = this.els; _i < _a.length; _i++) {
            var el = _a[_i];
            var rect = el.getBoundingClientRect();
            tops.push(rect.top - originClientTop);
            bottoms.push(rect.bottom - originClientTop);
        }
        this.tops = tops;
        this.bottoms = bottoms;
    };
    // Given a left offset (from document left), returns the index of the el that it horizontally intersects.
    // If no intersection is made, returns undefined.
    PositionCache.prototype.leftToIndex = function (leftPosition) {
        var lefts = this.lefts;
        var rights = this.rights;
        var len = lefts.length;
        var i;
        for (i = 0; i < len; i++) {
            if (leftPosition >= lefts[i] && leftPosition < rights[i]) {
                return i;
            }
        }
    };
    // Given a top offset (from document top), returns the index of the el that it vertically intersects.
    // If no intersection is made, returns undefined.
    PositionCache.prototype.topToIndex = function (topPosition) {
        var tops = this.tops;
        var bottoms = this.bottoms;
        var len = tops.length;
        var i;
        for (i = 0; i < len; i++) {
            if (topPosition >= tops[i] && topPosition < bottoms[i]) {
                return i;
            }
        }
    };
    // Gets the width of the element at the given index
    PositionCache.prototype.getWidth = function (leftIndex) {
        return this.rights[leftIndex] - this.lefts[leftIndex];
    };
    // Gets the height of the element at the given index
    PositionCache.prototype.getHeight = function (topIndex) {
        return this.bottoms[topIndex] - this.tops[topIndex];
    };
    return PositionCache;
}());
exports.default = PositionCache;


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var date_range_1 = __webpack_require__(11);
var misc_1 = __webpack_require__(2);
var object_1 = __webpack_require__(4);
var STANDARD_PROPS = {
    start: null,
    end: null,
    allDay: Boolean
};
function parseDateSpan(raw, dateEnv, defaultDuration) {
    var span = parseOpenDateSpan(raw, dateEnv);
    var range = span.range;
    if (!range.start) {
        return null;
    }
    if (!range.end) {
        if (defaultDuration == null) {
            return null;
        }
        else {
            range.end = dateEnv.add(range.start, defaultDuration);
        }
    }
    return span;
}
exports.parseDateSpan = parseDateSpan;
/*
TODO: somehow combine with parseRange?
Will return null if the start/end props were present but parsed invalidly.
*/
function parseOpenDateSpan(raw, dateEnv) {
    var leftovers = {};
    var standardProps = misc_1.refineProps(raw, STANDARD_PROPS, {}, leftovers);
    var startMeta = standardProps.start ? dateEnv.createMarkerMeta(standardProps.start) : null;
    var endMeta = standardProps.end ? dateEnv.createMarkerMeta(standardProps.end) : null;
    var allDay = standardProps.allDay;
    if (allDay == null) {
        allDay = (startMeta && startMeta.isTimeUnspecified) &&
            (!endMeta || endMeta.isTimeUnspecified);
    }
    // use this leftover object as the selection object
    leftovers.range = {
        start: startMeta ? startMeta.marker : null,
        end: endMeta ? endMeta.marker : null
    };
    leftovers.allDay = allDay;
    return leftovers;
}
exports.parseOpenDateSpan = parseOpenDateSpan;
function isDateSpansEqual(span0, span1) {
    return date_range_1.rangesEqual(span0.range, span1.range) &&
        span0.allDay === span1.allDay &&
        isSpanPropsEqual(span0, span1);
}
exports.isDateSpansEqual = isDateSpansEqual;
// the NON-DATE-RELATED props
function isSpanPropsEqual(span0, span1) {
    if (!isSpanPropsMatching(span0, span1)) {
        return false;
    }
    // are there any props that span0 has that span1 DOESN'T have?
    // both have range/allDay, so no need to special-case.
    for (var propName in span0) {
        if (!(propName in span1)) {
            return false;
        }
    }
    return true;
}
exports.isSpanPropsEqual = isSpanPropsEqual;
// does subjectSpan have all the props/values that matchSpan does?
// subjectSpan is allowed to have more
function isSpanPropsMatching(subjectSpan, matchSpan) {
    for (var propName in matchSpan) {
        if (propName !== 'range' && propName !== 'allDay') {
            if (subjectSpan[propName] !== matchSpan[propName]) {
                return false;
            }
        }
    }
    return true;
}
exports.isSpanPropsMatching = isSpanPropsMatching;
function buildDateSpanApi(span, dateEnv) {
    var props = object_1.assignTo({}, span);
    delete props.range;
    props.start = dateEnv.toDate(span.range.start);
    props.end = dateEnv.toDate(span.range.end);
    props.startStr = dateEnv.formatIso(span.range.start, { omitTime: span.allDay });
    props.endStr = dateEnv.formatIso(span.range.end, { omitTime: span.allDay });
    return props;
}
exports.buildDateSpanApi = buildDateSpanApi;


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var array_1 = __webpack_require__(136);
function default_1(workerFunc) {
    var prevArgs;
    var prevResult;
    return function () {
        if (!prevArgs || !array_1.isArraysEqual(prevArgs, arguments)) {
            prevArgs = arguments;
            prevResult = workerFunc.apply(this, arguments);
        }
        return prevResult;
    };
}
exports.default = default_1;


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var formatting_1 = __webpack_require__(8);
var cmdFormatters = {};
function registerCmdFormatter(name, input) {
    cmdFormatters[name] = input;
}
exports.registerCmdFormatter = registerCmdFormatter;
function getCmdFormatter(name) {
    return cmdFormatters[name];
}
exports.getCmdFormatter = getCmdFormatter;
/*
TODO: fix the terminology of "formatter" vs "formatting func"
*/
/*
At the time of instantiation, this object does not know which cmd-formatting system it will use.
It receives this at the time of formatting, as a setting.
*/
var CmdFormatter = /** @class */ (function () {
    function CmdFormatter(cmdStr, separator) {
        this.cmdStr = cmdStr;
        this.separator = separator;
    }
    CmdFormatter.prototype.format = function (date, context) {
        return context.cmdFormatter(this.cmdStr, formatting_1.createVerboseFormattingArg(date, null, context, this.separator));
    };
    CmdFormatter.prototype.formatRange = function (start, end, context) {
        return context.cmdFormatter(this.cmdStr, formatting_1.createVerboseFormattingArg(start, end, context, this.separator));
    };
    return CmdFormatter;
}());
exports.CmdFormatter = CmdFormatter;


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var DateClicking_1 = __webpack_require__(168);
var DateSelecting_1 = __webpack_require__(171);
var EventClicking_1 = __webpack_require__(172);
var EventHovering_1 = __webpack_require__(173);
var EventDragging_1 = __webpack_require__(143);
var EventResizing_1 = __webpack_require__(174);
var BrowserContext = /** @class */ (function () {
    function BrowserContext() {
        this.componentHash = {};
        this.listenerHash = {};
    }
    BrowserContext.prototype.registerComponent = function (component) {
        this.componentHash[component.uid] = component;
        this.bindComponent(component);
    };
    BrowserContext.prototype.unregisterComponent = function (component) {
        delete this.componentHash[component.uid];
        this.unbindComponent(component);
    };
    BrowserContext.prototype.bindComponent = function (component) {
        this.listenerHash[component.uid] = {
            dateClicking: new DateClicking_1.default(component),
            dateSelecting: new DateSelecting_1.default(component),
            eventClicking: new EventClicking_1.default(component),
            eventHovering: new EventHovering_1.default(component),
            eventDragging: new EventDragging_1.default(component),
            eventResizing: new EventResizing_1.default(component)
        };
    };
    BrowserContext.prototype.unbindComponent = function (component) {
        var listeners = this.listenerHash[component.uid];
        listeners.dateClicking.destroy();
        listeners.dateSelecting.destroy();
        listeners.eventClicking.destroy();
        listeners.eventHovering.destroy();
        listeners.eventDragging.destroy();
        listeners.eventResizing.destroy();
        delete this.listenerHash[component.uid];
    };
    return BrowserContext;
}());
exports.BrowserContext = BrowserContext;
exports.default = new BrowserContext();


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var EmitterMixin_1 = __webpack_require__(20);
/*
An abstraction for a dragging interaction originating on an event.
Does higher-level things than PointerDragger, such as possibly:
- a "mirror" that moves with the pointer
- a minimum number of pixels or other criteria for a true drag to begin

subclasses must emit:
- pointerdown
- dragstart
- dragmove
- pointerup
- dragend
*/
var ElementDragging = /** @class */ (function () {
    function ElementDragging() {
        this.emitter = new EmitterMixin_1.default();
    }
    ElementDragging.prototype.destroy = function () {
    };
    ElementDragging.prototype.setMirrorIsVisible = function (bool) {
        // optional if subclass doesn't want to support a mirror
    };
    ElementDragging.prototype.setMirrorNeedsRevert = function (bool) {
        // optional if subclass doesn't want to support a mirror
    };
    return ElementDragging;
}());
exports.default = ElementDragging;


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var duration_1 = __webpack_require__(10);
var event_store_1 = __webpack_require__(14);
var object_1 = __webpack_require__(4);
var misc_1 = __webpack_require__(2);
var marker_1 = __webpack_require__(6);
// applies the mutation to ALL defs/instances within the event store
function applyMutationToEventStore(eventStore, mutation, calendar) {
    var dest = event_store_1.createEmptyEventStore();
    for (var defId in eventStore.defs) {
        var def = eventStore.defs[defId];
        dest.defs[defId] = applyMutationToEventDef(def, mutation);
    }
    for (var instanceId in eventStore.instances) {
        var instance = eventStore.instances[instanceId];
        var def = dest.defs[instance.defId]; // important to grab the newly modified def
        dest.instances[instanceId] = applyMutationToEventInstance(instance, def, mutation, calendar);
    }
    return dest;
}
exports.applyMutationToEventStore = applyMutationToEventStore;
function applyMutationToEventDef(eventDef, mutation) {
    var copy = object_1.assignTo({}, eventDef);
    var standardProps = mutation.standardProps || {};
    // if hasEnd has not been specified, guess a good value based on deltas.
    // if duration will change, there's no way the default duration will persist,
    // and thus, we need to mark the event as having a real end
    if (standardProps.hasEnd == null &&
        willDeltasAffectDuration(mutation.startDelta, mutation.endDelta)) {
        standardProps.hasEnd = true;
    }
    object_1.assignTo(copy, standardProps);
    if (mutation.extendedProps) {
        copy.extendedProps = object_1.assignTo({}, copy.extendedProps, mutation.extendedProps);
    }
    return copy;
}
function willDeltasAffectDuration(startDelta, endDelta) {
    if (startDelta && !duration_1.asRoughMs(startDelta)) {
        startDelta = null;
    }
    if (endDelta && !duration_1.asRoughMs(endDelta)) {
        endDelta = null;
    }
    if (!startDelta && !endDelta) {
        return false;
    }
    if (Boolean(startDelta) !== Boolean(endDelta)) {
        return true;
    }
    return !duration_1.durationsEqual(startDelta, endDelta);
}
function applyMutationToEventInstance(eventInstance, eventDef, // must first be modified by applyMutationToEventDef
mutation, calendar) {
    var dateEnv = calendar.dateEnv;
    var forceAllDay = mutation.standardProps && mutation.standardProps.allDay === true;
    var clearEnd = mutation.standardProps && mutation.standardProps.hasEnd === false;
    var copy = object_1.assignTo({}, eventInstance);
    if (forceAllDay) {
        copy.range = misc_1.computeAlignedDayRange(copy.range);
    }
    if (mutation.startDelta) {
        copy.range = {
            start: dateEnv.add(copy.range.start, mutation.startDelta),
            end: copy.range.end
        };
    }
    if (clearEnd) {
        copy.range = {
            start: copy.range.start,
            end: calendar.getDefaultEventEnd(eventDef.allDay, copy.range.start)
        };
    }
    else if (mutation.endDelta) {
        copy.range = {
            start: copy.range.start,
            end: dateEnv.add(copy.range.end, mutation.endDelta)
        };
    }
    // in case event was all-day but the supplied deltas were not
    // better util for this?
    if (eventDef.allDay) {
        copy.range = {
            start: marker_1.startOfDay(copy.range.start),
            end: marker_1.startOfDay(copy.range.end)
        };
    }
    // handle invalid durations
    if (copy.range.end < copy.range.start) {
        copy.range.end = calendar.getDefaultEventEnd(eventDef.allDay, copy.range.start);
    }
    return copy;
}


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var marker_1 = __webpack_require__(6);
var calendar_system_1 = __webpack_require__(178);
var timezone_1 = __webpack_require__(144);
var duration_1 = __webpack_require__(10);
var formatting_1 = __webpack_require__(8);
var parsing_1 = __webpack_require__(145);
var misc_1 = __webpack_require__(2);
var formatting_cmd_1 = __webpack_require__(52);
var DateEnv = /** @class */ (function () {
    function DateEnv(settings) {
        var timeZone = this.timeZone = settings.timeZone;
        var isNamedTimeZone = timeZone !== 'local' && timeZone !== 'UTC';
        if (settings.timeZoneImpl && isNamedTimeZone) {
            this.namedTimeZoneImpl = timezone_1.createNamedTimeZoneImpl(settings.timeZoneImpl, timeZone);
        }
        this.canComputeOffset = Boolean(!isNamedTimeZone || this.namedTimeZoneImpl);
        this.calendarSystem = calendar_system_1.createCalendarSystem(settings.calendarSystem);
        this.locale = settings.locale;
        this.weekDow = settings.locale.week.dow;
        this.weekDoy = settings.locale.week.doy;
        if (settings.weekNumberCalculation === 'ISO') {
            this.weekDow = 1;
            this.weekDoy = 4;
        }
        else if (typeof settings.firstDay === 'number') {
            this.weekDow = settings.firstDay;
        }
        if (typeof settings.weekNumberCalculation === 'function') {
            this.weekNumberFunc = settings.weekNumberCalculation;
        }
        this.weekLabel = settings.weekLabel != null ? settings.weekLabel : settings.locale.options.weekLabel;
        if (typeof settings.cmdFormatter === 'string') {
            this.cmdFormatter = formatting_cmd_1.getCmdFormatter(settings.cmdFormatter);
        }
    }
    // Creating / Parsing
    DateEnv.prototype.createMarker = function (input) {
        var meta = this.createMarkerMeta(input);
        if (meta === null) {
            return null;
        }
        return meta.marker;
    };
    DateEnv.prototype.createNowMarker = function () {
        if (this.canComputeOffset) {
            return this.timestampToMarker(new Date().valueOf());
        }
        else {
            // if we can't compute the current date val for a timezone,
            // better to give the current local date vals than UTC
            return marker_1.arrayToUtcDate(marker_1.dateToLocalArray(new Date()));
        }
    };
    DateEnv.prototype.createMarkerMeta = function (input) {
        if (typeof input === 'string') {
            return this.parse(input);
        }
        var marker = null;
        if (typeof input === 'number') {
            marker = this.timestampToMarker(input);
        }
        else if (input instanceof Date) {
            input = input.valueOf();
            if (!isNaN(input)) {
                marker = this.timestampToMarker(input);
            }
        }
        else if (Array.isArray(input)) {
            marker = marker_1.arrayToUtcDate(input);
        }
        if (marker === null || isNaN(marker.valueOf())) {
            return null;
        }
        return { marker: marker, isTimeUnspecified: false, forcedTzo: null };
    };
    DateEnv.prototype.parse = function (s) {
        var parts = parsing_1.parse(s);
        if (parts === null) {
            return null;
        }
        var marker = parts.marker;
        var forcedTzo = null;
        if (parts.timeZoneOffset !== null) {
            if (this.canComputeOffset) {
                marker = this.timestampToMarker(marker.valueOf() - parts.timeZoneOffset * 60 * 1000);
            }
            else {
                forcedTzo = parts.timeZoneOffset;
            }
        }
        return { marker: marker, isTimeUnspecified: parts.isTimeUnspecified, forcedTzo: forcedTzo };
    };
    // Accessors
    DateEnv.prototype.getYear = function (marker) {
        return this.calendarSystem.getMarkerYear(marker);
    };
    DateEnv.prototype.getMonth = function (marker) {
        return this.calendarSystem.getMarkerMonth(marker);
    };
    // Adding / Subtracting
    DateEnv.prototype.add = function (marker, dur) {
        var a = this.calendarSystem.markerToArray(marker);
        a[0] += dur.years;
        a[1] += dur.months;
        a[2] += dur.days;
        a[6] += dur.milliseconds;
        return this.calendarSystem.arrayToMarker(a);
    };
    DateEnv.prototype.subtract = function (marker, dur) {
        var a = this.calendarSystem.markerToArray(marker);
        a[0] -= dur.years;
        a[1] -= dur.months;
        a[2] -= dur.days;
        a[6] -= dur.milliseconds;
        return this.calendarSystem.arrayToMarker(a);
    };
    DateEnv.prototype.addYears = function (marker, n) {
        var a = this.calendarSystem.markerToArray(marker);
        a[0] += n;
        return this.calendarSystem.arrayToMarker(a);
    };
    DateEnv.prototype.addMonths = function (marker, n) {
        var a = this.calendarSystem.markerToArray(marker);
        a[1] += n;
        return this.calendarSystem.arrayToMarker(a);
    };
    // Diffing Whole Units
    DateEnv.prototype.diffWholeYears = function (m0, m1) {
        var calendarSystem = this.calendarSystem;
        if (marker_1.timeAsMs(m0) === marker_1.timeAsMs(m1) &&
            calendarSystem.getMarkerDay(m0) === calendarSystem.getMarkerDay(m1) &&
            calendarSystem.getMarkerMonth(m0) === calendarSystem.getMarkerMonth(m1)) {
            return calendarSystem.getMarkerYear(m1) - calendarSystem.getMarkerYear(m0);
        }
        return null;
    };
    DateEnv.prototype.diffWholeMonths = function (m0, m1) {
        var calendarSystem = this.calendarSystem;
        if (marker_1.timeAsMs(m0) === marker_1.timeAsMs(m1) &&
            calendarSystem.getMarkerDay(m0) === calendarSystem.getMarkerDay(m1)) {
            return (calendarSystem.getMarkerMonth(m1) - calendarSystem.getMarkerMonth(m0)) +
                (calendarSystem.getMarkerYear(m1) - calendarSystem.getMarkerYear(m0)) * 12;
        }
        return null;
    };
    // Range / Duration
    DateEnv.prototype.greatestWholeUnit = function (m0, m1) {
        var n = this.diffWholeYears(m0, m1);
        if (n !== null) {
            return { unit: 'year', value: n };
        }
        n = this.diffWholeMonths(m0, m1);
        if (n !== null) {
            return { unit: 'month', value: n };
        }
        n = marker_1.diffWholeWeeks(m0, m1);
        if (n !== null) {
            return { unit: 'week', value: n };
        }
        n = marker_1.diffWholeDays(m0, m1);
        if (n !== null) {
            return { unit: 'day', value: n };
        }
        n = marker_1.diffHours(m0, m1);
        if (misc_1.isInt(n)) {
            return { unit: 'hour', value: n };
        }
        n = marker_1.diffMinutes(m0, m1);
        if (misc_1.isInt(n)) {
            return { unit: 'minute', value: n };
        }
        n = marker_1.diffSeconds(m0, m1);
        if (misc_1.isInt(n)) {
            return { unit: 'second', value: n };
        }
        return { unit: 'millisecond', value: m1.valueOf() - m0.valueOf() };
    };
    DateEnv.prototype.countDurationsBetween = function (m0, m1, d) {
        // TODO: can use greatestWholeUnit
        var diff;
        if (d.years) {
            diff = this.diffWholeYears(m0, m1);
            if (diff !== null) {
                return diff / duration_1.asRoughYears(d);
            }
        }
        if (d.months) {
            diff = this.diffWholeMonths(m0, m1);
            if (diff !== null) {
                return diff / duration_1.asRoughMonths(d);
            }
        }
        if (d.days) {
            diff = marker_1.diffWholeDays(m0, m1);
            if (diff !== null) {
                return diff / duration_1.asRoughDays(d);
            }
        }
        return (m1.valueOf() - m0.valueOf()) / duration_1.asRoughMs(d);
    };
    // Start-Of
    DateEnv.prototype.startOf = function (m, unit) {
        if (unit === 'year') {
            return this.startOfYear(m);
        }
        else if (unit === 'month') {
            return this.startOfMonth(m);
        }
        else if (unit === 'week') {
            return this.startOfWeek(m);
        }
        else if (unit === 'day') {
            return marker_1.startOfDay(m);
        }
        else if (unit === 'hour') {
            return marker_1.startOfHour(m);
        }
        else if (unit === 'minute') {
            return marker_1.startOfMinute(m);
        }
        else if (unit === 'second') {
            return marker_1.startOfSecond(m);
        }
    };
    DateEnv.prototype.startOfYear = function (m) {
        return this.calendarSystem.arrayToMarker([
            this.calendarSystem.getMarkerYear(m)
        ]);
    };
    DateEnv.prototype.startOfMonth = function (m) {
        return this.calendarSystem.arrayToMarker([
            this.calendarSystem.getMarkerYear(m),
            this.calendarSystem.getMarkerMonth(m)
        ]);
    };
    DateEnv.prototype.startOfWeek = function (m) {
        return this.calendarSystem.arrayToMarker([
            this.calendarSystem.getMarkerYear(m),
            this.calendarSystem.getMarkerMonth(m),
            m.getUTCDate() - ((m.getUTCDay() - this.weekDow + 7) % 7)
        ]);
    };
    // Week Number
    DateEnv.prototype.computeWeekNumber = function (marker) {
        if (this.weekNumberFunc) {
            return this.weekNumberFunc(this.toDate(marker));
        }
        else {
            return marker_1.weekOfYear(marker, this.weekDow, this.weekDoy);
        }
    };
    // TODO: choke on timeZoneName: long
    DateEnv.prototype.format = function (marker, formatter, dateOptions) {
        if (dateOptions === void 0) { dateOptions = {}; }
        return formatter.format({
            marker: marker,
            timeZoneOffset: dateOptions.forcedTzo != null ?
                dateOptions.forcedTzo :
                this.offsetForMarker(marker)
        }, this);
    };
    DateEnv.prototype.formatRange = function (start, end, formatter, dateOptions) {
        if (dateOptions === void 0) { dateOptions = {}; }
        if (dateOptions.isEndExclusive) {
            end = marker_1.addMs(end, -1);
        }
        return formatter.formatRange({
            marker: start,
            timeZoneOffset: dateOptions.forcedStartTzo != null ?
                dateOptions.forcedStartTzo :
                this.offsetForMarker(start)
        }, {
            marker: end,
            timeZoneOffset: dateOptions.forcedEndTzo != null ?
                dateOptions.forcedEndTzo :
                this.offsetForMarker(end)
        }, this);
    };
    DateEnv.prototype.formatIso = function (marker, extraOptions) {
        if (extraOptions === void 0) { extraOptions = {}; }
        var timeZoneOffset = null;
        if (!extraOptions.omitTimeZoneOffset) {
            if (extraOptions.forcedTzo != null) {
                timeZoneOffset = extraOptions.forcedTzo;
            }
            else {
                timeZoneOffset = this.offsetForMarker(marker);
            }
        }
        return formatting_1.buildIsoString(marker, timeZoneOffset, extraOptions.omitTime);
    };
    // TimeZone
    DateEnv.prototype.timestampToMarker = function (ms) {
        if (this.timeZone === 'local') {
            return marker_1.arrayToUtcDate(marker_1.dateToLocalArray(new Date(ms)));
        }
        else if (this.timeZone === 'UTC' || !this.namedTimeZoneImpl) {
            return new Date(ms);
        }
        else {
            return marker_1.arrayToUtcDate(this.namedTimeZoneImpl.timestampToArray(ms));
        }
    };
    DateEnv.prototype.offsetForMarker = function (m) {
        if (this.timeZone === 'local') {
            return -marker_1.arrayToLocalDate(marker_1.dateToUtcArray(m)).getTimezoneOffset(); // convert "inverse" offset to "normal" offset
        }
        else if (this.timeZone === 'UTC') {
            return 0;
        }
        else if (this.namedTimeZoneImpl) {
            return this.namedTimeZoneImpl.offsetForArray(marker_1.dateToUtcArray(m));
        }
        return null;
    };
    // Conversion
    DateEnv.prototype.toDate = function (m, forcedTzo) {
        if (this.timeZone === 'local') {
            return marker_1.arrayToLocalDate(marker_1.dateToUtcArray(m));
        }
        else if (this.timeZone === 'UTC') {
            return new Date(m.valueOf()); // make sure it's a copy
        }
        else if (!this.namedTimeZoneImpl) {
            return new Date(m.valueOf() - (forcedTzo || 0));
        }
        else {
            return new Date(m.valueOf() -
                this.namedTimeZoneImpl.offsetForArray(marker_1.dateToUtcArray(m)) * 1000 * 60 // convert minutes -> ms
            );
        }
    };
    return DateEnv;
}());
exports.DateEnv = DateEnv;


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var marker_1 = __webpack_require__(6);
var duration_1 = __webpack_require__(10);
var date_range_1 = __webpack_require__(11);
var DateProfileGenerator = /** @class */ (function () {
    function DateProfileGenerator(_view) {
        this._view = _view;
    }
    DateProfileGenerator.prototype.opt = function (name) {
        return this._view.opt(name);
    };
    DateProfileGenerator.prototype.trimHiddenDays = function (range) {
        return this._view.trimHiddenDays(range);
    };
    /* Date Range Computation
    ------------------------------------------------------------------------------------------------------------------*/
    // Builds a structure with info about what the dates/ranges will be for the "prev" view.
    DateProfileGenerator.prototype.buildPrev = function (currentDateProfile) {
        var dateEnv = this._view.calendar.dateEnv;
        var prevDate = dateEnv.subtract(dateEnv.startOf(currentDateProfile.currentDate, currentDateProfile.currentRangeUnit), currentDateProfile.dateIncrement);
        return this.build(prevDate, -1);
    };
    // Builds a structure with info about what the dates/ranges will be for the "next" view.
    DateProfileGenerator.prototype.buildNext = function (currentDateProfile) {
        var dateEnv = this._view.calendar.dateEnv;
        var nextDate = dateEnv.add(dateEnv.startOf(currentDateProfile.currentDate, currentDateProfile.currentRangeUnit), currentDateProfile.dateIncrement);
        return this.build(nextDate, 1);
    };
    // Builds a structure holding dates/ranges for rendering around the given date.
    // Optional direction param indicates whether the date is being incremented/decremented
    // from its previous value. decremented = -1, incremented = 1 (default).
    DateProfileGenerator.prototype.build = function (currentDate, direction, forceToValid) {
        if (forceToValid === void 0) { forceToValid = false; }
        var validRange;
        var minTime = null;
        var maxTime = null;
        var currentInfo;
        var isRangeAllDay;
        var renderRange;
        var activeRange;
        var isValid;
        validRange = this.buildValidRange();
        validRange = this.trimHiddenDays(validRange);
        if (forceToValid) {
            currentDate = date_range_1.constrainMarkerToRange(currentDate, validRange);
        }
        currentInfo = this.buildCurrentRangeInfo(currentDate, direction);
        isRangeAllDay = /^(year|month|week|day)$/.test(currentInfo.unit);
        renderRange = this.buildRenderRange(this.trimHiddenDays(currentInfo.range), currentInfo.unit, isRangeAllDay);
        renderRange = this.trimHiddenDays(renderRange);
        activeRange = renderRange;
        if (!this.opt('showNonCurrentDates')) {
            activeRange = date_range_1.intersectRanges(activeRange, currentInfo.range);
        }
        minTime = duration_1.createDuration(this.opt('minTime'));
        maxTime = duration_1.createDuration(this.opt('maxTime'));
        activeRange = this.adjustActiveRange(activeRange, minTime, maxTime);
        activeRange = date_range_1.intersectRanges(activeRange, validRange); // might return null
        if (activeRange) {
            currentDate = date_range_1.constrainMarkerToRange(currentDate, activeRange);
        }
        // it's invalid if the originally requested date is not contained,
        // or if the range is completely outside of the valid range.
        isValid = date_range_1.rangesIntersect(currentInfo.range, validRange);
        return {
            // constraint for where prev/next operations can go and where events can be dragged/resized to.
            // an object with optional start and end properties.
            validRange: validRange,
            currentDate: currentDate,
            // range the view is formally responsible for.
            // for example, a month view might have 1st-31st, excluding padded dates
            currentRange: currentInfo.range,
            // name of largest unit being displayed, like "month" or "week"
            currentRangeUnit: currentInfo.unit,
            isRangeAllDay: isRangeAllDay,
            // dates that display events and accept drag-n-drop
            // will be `null` if no dates accept events
            activeRange: activeRange,
            // date range with a rendered skeleton
            // includes not-active days that need some sort of DOM
            renderRange: renderRange,
            // Duration object that denotes the first visible time of any given day
            minTime: minTime,
            // Duration object that denotes the exclusive visible end time of any given day
            maxTime: maxTime,
            isValid: isValid,
            // how far the current date will move for a prev/next operation
            dateIncrement: this.buildDateIncrement(currentInfo.duration)
            // pass a fallback (might be null) ^
        };
    };
    // Builds an object with optional start/end properties.
    // Indicates the minimum/maximum dates to display.
    // not responsible for trimming hidden days.
    DateProfileGenerator.prototype.buildValidRange = function () {
        return this._view.getRangeOption('validRange', this._view.calendar.getNow()) ||
            { start: null, end: null }; // completely open-ended
    };
    // Builds a structure with info about the "current" range, the range that is
    // highlighted as being the current month for example.
    // See build() for a description of `direction`.
    // Guaranteed to have `range` and `unit` properties. `duration` is optional.
    DateProfileGenerator.prototype.buildCurrentRangeInfo = function (date, direction) {
        var dateEnv = this._view.calendar.dateEnv;
        var viewSpec = this._view.viewSpec;
        var duration = null;
        var unit = null;
        var range = null;
        var dayCount;
        if (viewSpec.duration) {
            duration = viewSpec.duration;
            unit = viewSpec.durationUnit;
            range = this.buildRangeFromDuration(date, direction, duration, unit);
        }
        else if ((dayCount = this.opt('dayCount'))) {
            unit = 'day';
            range = this.buildRangeFromDayCount(date, direction, dayCount);
        }
        else if ((range = this.buildCustomVisibleRange(date))) {
            unit = dateEnv.greatestWholeUnit(range.start, range.end).unit;
        }
        else {
            duration = this.getFallbackDuration();
            unit = duration_1.greatestDurationDenominator(duration).unit;
            range = this.buildRangeFromDuration(date, direction, duration, unit);
        }
        return { duration: duration, unit: unit, range: range };
    };
    DateProfileGenerator.prototype.getFallbackDuration = function () {
        return duration_1.createDuration({ day: 1 });
    };
    // Returns a new activeRange to have time values (un-ambiguate)
    // minTime or maxTime causes the range to expand.
    DateProfileGenerator.prototype.adjustActiveRange = function (range, minTime, maxTime) {
        var dateEnv = this._view.calendar.dateEnv;
        var start = range.start;
        var end = range.end;
        if (this._view.usesMinMaxTime) {
            // expand active range if minTime is negative (why not when positive?)
            if (duration_1.asRoughDays(minTime) < 0) {
                start = marker_1.startOfDay(start); // necessary?
                start = dateEnv.add(start, minTime);
            }
            // expand active range if maxTime is beyond one day (why not when positive?)
            if (duration_1.asRoughDays(maxTime) > 1) {
                end = marker_1.startOfDay(end); // necessary?
                end = marker_1.addDays(end, -1);
                end = dateEnv.add(end, maxTime);
            }
        }
        return { start: start, end: end };
    };
    // Builds the "current" range when it is specified as an explicit duration.
    // `unit` is the already-computed greatestDurationDenominator unit of duration.
    DateProfileGenerator.prototype.buildRangeFromDuration = function (date, direction, duration, unit) {
        var dateEnv = this._view.calendar.dateEnv;
        var alignment = this.opt('dateAlignment');
        var dateIncrementInput;
        var dateIncrementDuration;
        var start;
        var end;
        var res;
        // compute what the alignment should be
        if (!alignment) {
            dateIncrementInput = this.opt('dateIncrement');
            if (dateIncrementInput) {
                dateIncrementDuration = duration_1.createDuration(dateIncrementInput);
                // use the smaller of the two units
                if (duration_1.asRoughMs(dateIncrementDuration) < duration_1.asRoughMs(duration)) {
                    alignment = duration_1.greatestDurationDenominator(dateIncrementDuration, !duration_1.getWeeksFromInput(dateIncrementInput)).unit;
                }
                else {
                    alignment = unit;
                }
            }
            else {
                alignment = unit;
            }
        }
        // if the view displays a single day or smaller
        if (duration_1.asRoughDays(duration) <= 1) {
            if (this._view.isHiddenDay(start)) {
                start = this._view.skipHiddenDays(start, direction);
                start = marker_1.startOfDay(start);
            }
        }
        function computeRes() {
            start = dateEnv.startOf(date, alignment);
            end = dateEnv.add(start, duration);
            res = { start: start, end: end };
        }
        computeRes();
        // if range is completely enveloped by hidden days, go past the hidden days
        if (!this.trimHiddenDays(res)) {
            date = this._view.skipHiddenDays(date, direction);
            computeRes();
        }
        return res;
    };
    // Builds the "current" range when a dayCount is specified.
    DateProfileGenerator.prototype.buildRangeFromDayCount = function (date, direction, dayCount) {
        var dateEnv = this._view.calendar.dateEnv;
        var customAlignment = this.opt('dateAlignment');
        var runningCount = 0;
        var start = date;
        var end;
        if (customAlignment) {
            start = dateEnv.startOf(start, customAlignment);
        }
        start = marker_1.startOfDay(start);
        start = this._view.skipHiddenDays(start, direction);
        end = start;
        do {
            end = marker_1.addDays(end, 1);
            if (!this._view.isHiddenDay(end)) {
                runningCount++;
            }
        } while (runningCount < dayCount);
        return { start: start, end: end };
    };
    // Builds a normalized range object for the "visible" range,
    // which is a way to define the currentRange and activeRange at the same time.
    DateProfileGenerator.prototype.buildCustomVisibleRange = function (date) {
        var dateEnv = this._view.calendar.dateEnv;
        var visibleRange = this._view.getRangeOption('visibleRange', dateEnv.toDate(date));
        if (visibleRange && (visibleRange.start == null || visibleRange.end == null)) {
            return null;
        }
        return visibleRange;
    };
    // Computes the range that will represent the element/cells for *rendering*,
    // but which may have voided days/times.
    // not responsible for trimming hidden days.
    DateProfileGenerator.prototype.buildRenderRange = function (currentRange, currentRangeUnit, isRangeAllDay) {
        return currentRange;
    };
    // Compute the duration value that should be added/substracted to the current date
    // when a prev/next operation happens.
    DateProfileGenerator.prototype.buildDateIncrement = function (fallback) {
        var dateIncrementInput = this.opt('dateIncrement');
        var customAlignment;
        if (dateIncrementInput) {
            return duration_1.createDuration(dateIncrementInput);
        }
        else if ((customAlignment = this.opt('dateAlignment'))) {
            return duration_1.createDuration(1, customAlignment);
        }
        else if (fallback) {
            return fallback;
        }
        else {
            return duration_1.createDuration({ days: 1 });
        }
    };
    return DateProfileGenerator;
}());
exports.default = DateProfileGenerator;
function isDateProfilesEqual(p0, p1) {
    return date_range_1.rangesEqual(p0.activeRange, p1.activeRange) &&
        date_range_1.rangesEqual(p0.validRange, p1.validRange);
}
exports.isDateProfilesEqual = isDateProfilesEqual;


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var html_1 = __webpack_require__(9);
var dom_manip_1 = __webpack_require__(3);
var Mixin_1 = __webpack_require__(47);
var marker_1 = __webpack_require__(6);
var formatting_1 = __webpack_require__(8);
var date_range_1 = __webpack_require__(11);
/*
A set of rendering and date-related methods for a visual component comprised of one or more rows of day columns.
Prerequisite: the object being mixed into needs to be a *Grid*
*/
var DayTableMixin = /** @class */ (function (_super) {
    tslib_1.__extends(DayTableMixin, _super);
    function DayTableMixin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Populates internal variables used for date calculation and rendering
    DayTableMixin.prototype.updateDayTable = function () {
        var t = this;
        var view = t.view;
        var dateProfile = t.dateProfile;
        var date = dateProfile.renderRange.start;
        var end = dateProfile.renderRange.end;
        var dayIndex = -1;
        var dayIndices = [];
        var dayDates = [];
        var daysPerRow;
        var firstDay;
        var rowCnt;
        while (date < end) { // loop each day from start to end
            if (view.isHiddenDay(date)) {
                dayIndices.push(dayIndex + 0.5); // mark that it's between indices
            }
            else {
                dayIndex++;
                dayIndices.push(dayIndex);
                dayDates.push(date);
            }
            date = marker_1.addDays(date, 1);
        }
        if (this.breakOnWeeks) {
            // count columns until the day-of-week repeats
            firstDay = dayDates[0].getUTCDay();
            for (daysPerRow = 1; daysPerRow < dayDates.length; daysPerRow++) {
                if (dayDates[daysPerRow].getUTCDay() === firstDay) {
                    break;
                }
            }
            rowCnt = Math.ceil(dayDates.length / daysPerRow);
        }
        else {
            rowCnt = 1;
            daysPerRow = dayDates.length;
        }
        this.dayDates = dayDates;
        this.dayIndices = dayIndices;
        this.daysPerRow = daysPerRow;
        this.rowCnt = rowCnt;
        this.updateDayTableCols();
    };
    // Computes and assigned the colCnt property and updates any options that may be computed from it
    DayTableMixin.prototype.updateDayTableCols = function () {
        this.colCnt = this.computeColCnt();
        this.colHeadFormat = formatting_1.createFormatter(this.opt('columnHeaderFormat') ||
            this.computeColHeadFormat());
    };
    // Determines how many columns there should be in the table
    DayTableMixin.prototype.computeColCnt = function () {
        return this.daysPerRow;
    };
    // Computes the DateMarker for the given cell
    DayTableMixin.prototype.getCellDate = function (row, col) {
        return this.dayDates[this.getCellDayIndex(row, col)];
    };
    // Computes the ambiguously-timed date range for the given cell
    DayTableMixin.prototype.getCellRange = function (row, col) {
        var start = this.getCellDate(row, col);
        var end = marker_1.addDays(start, 1);
        return { start: start, end: end };
    };
    // Returns the number of day cells, chronologically, from the first of the grid (0-based)
    DayTableMixin.prototype.getCellDayIndex = function (row, col) {
        return row * this.daysPerRow + this.getColDayIndex(col);
    };
    // Returns the numner of day cells, chronologically, from the first cell in *any given row*
    DayTableMixin.prototype.getColDayIndex = function (col) {
        if (this.isRtl) {
            return this.colCnt - 1 - col;
        }
        else {
            return col;
        }
    };
    // Given a date, returns its chronolocial cell-index from the first cell of the grid.
    // If the date lies between cells (because of hiddenDays), returns a floating-point value between offsets.
    // If before the first offset, returns a negative number.
    // If after the last offset, returns an offset past the last cell offset.
    // Only works for *start* dates of cells. Will not work for exclusive end dates for cells.
    DayTableMixin.prototype.getDateDayIndex = function (date) {
        var dayIndices = this.dayIndices;
        var dayOffset = Math.floor(marker_1.diffDays(this.dayDates[0], date));
        if (dayOffset < 0) {
            return dayIndices[0] - 1;
        }
        else if (dayOffset >= dayIndices.length) {
            return dayIndices[dayIndices.length - 1] + 1;
        }
        else {
            return dayIndices[dayOffset];
        }
    };
    /* Options
    ------------------------------------------------------------------------------------------------------------------*/
    // Computes a default column header formatting string if `colFormat` is not explicitly defined
    DayTableMixin.prototype.computeColHeadFormat = function () {
        // if more than one week row, or if there are a lot of columns with not much space,
        // put just the day numbers will be in each cell
        if (this.rowCnt > 1 || this.colCnt > 10) {
            return { weekday: 'short' }; // "Sat"
        }
        else if (this.colCnt > 1) {
            return { weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true }; // "Sat 11/12"
        }
        else {
            return { weekday: 'long' }; // "Saturday"
        }
    };
    /* Slicing
    ------------------------------------------------------------------------------------------------------------------*/
    // Slices up a date range into a segment for every week-row it intersects with
    // range already normalized to start-of-day
    DayTableMixin.prototype.sliceRangeByRow = function (range) {
        var daysPerRow = this.daysPerRow;
        var rangeFirst = this.getDateDayIndex(range.start); // inclusive first index
        var rangeLast = this.getDateDayIndex(marker_1.addDays(range.end, -1)); // inclusive last index
        var segs = [];
        var row;
        var rowFirst;
        var rowLast; // inclusive day-index range for current row
        var segFirst;
        var segLast; // inclusive day-index range for segment
        for (row = 0; row < this.rowCnt; row++) {
            rowFirst = row * daysPerRow;
            rowLast = rowFirst + daysPerRow - 1;
            // intersect segment's offset range with the row's
            segFirst = Math.max(rangeFirst, rowFirst);
            segLast = Math.min(rangeLast, rowLast);
            // deal with in-between indices
            segFirst = Math.ceil(segFirst); // in-between starts round to next cell
            segLast = Math.floor(segLast); // in-between ends round to prev cell
            if (segFirst <= segLast) { // was there any intersection with the current row?
                segs.push({
                    row: row,
                    // normalize to start of row
                    firstRowDayIndex: segFirst - rowFirst,
                    lastRowDayIndex: segLast - rowFirst,
                    // must be matching integers to be the segment's start/end
                    isStart: segFirst === rangeFirst,
                    isEnd: segLast === rangeLast
                });
            }
        }
        return segs;
    };
    // Slices up a date range into a segment for every day-cell it intersects with.
    // range already normalized to start-of-day
    // TODO: make more DRY with sliceRangeByRow somehow.
    DayTableMixin.prototype.sliceRangeByDay = function (range) {
        var daysPerRow = this.daysPerRow;
        var rangeFirst = this.getDateDayIndex(range.start); // inclusive first index
        var rangeLast = this.getDateDayIndex(marker_1.addDays(range.end, -1)); // inclusive last index
        var segs = [];
        var row;
        var rowFirst;
        var rowLast; // inclusive day-index range for current row
        var i;
        var segFirst;
        var segLast; // inclusive day-index range for segment
        for (row = 0; row < this.rowCnt; row++) {
            rowFirst = row * daysPerRow;
            rowLast = rowFirst + daysPerRow - 1;
            for (i = rowFirst; i <= rowLast; i++) {
                // intersect segment's offset range with the row's
                segFirst = Math.max(rangeFirst, i);
                segLast = Math.min(rangeLast, i);
                // deal with in-between indices
                segFirst = Math.ceil(segFirst); // in-between starts round to next cell
                segLast = Math.floor(segLast); // in-between ends round to prev cell
                if (segFirst <= segLast) { // was there any intersection with the current row?
                    segs.push({
                        row: row,
                        // normalize to start of row
                        firstRowDayIndex: segFirst - rowFirst,
                        lastRowDayIndex: segLast - rowFirst,
                        // must be matching integers to be the segment's start/end
                        isStart: segFirst === rangeFirst,
                        isEnd: segLast === rangeLast
                    });
                }
            }
        }
        return segs;
    };
    /* Header Rendering
    ------------------------------------------------------------------------------------------------------------------*/
    DayTableMixin.prototype.renderHeadHtml = function () {
        var theme = this.getTheme();
        return '' +
            '<div class="fc-row ' + theme.getClass('headerRow') + '">' +
            '<table class="' + theme.getClass('tableGrid') + '">' +
            '<thead>' +
            this.renderHeadTrHtml() +
            '</thead>' +
            '</table>' +
            '</div>';
    };
    DayTableMixin.prototype.renderHeadIntroHtml = function () {
        return this.renderIntroHtml(); // fall back to generic
    };
    DayTableMixin.prototype.renderHeadTrHtml = function () {
        return '' +
            '<tr>' +
            (this.isRtl ? '' : this.renderHeadIntroHtml()) +
            this.renderHeadDateCellsHtml() +
            (this.isRtl ? this.renderHeadIntroHtml() : '') +
            '</tr>';
    };
    DayTableMixin.prototype.renderHeadDateCellsHtml = function () {
        var htmls = [];
        var col;
        var date;
        for (col = 0; col < this.colCnt; col++) {
            date = this.getCellDate(0, col);
            htmls.push(this.renderHeadDateCellHtml(date));
        }
        return htmls.join('');
    };
    // TODO: when internalApiVersion, accept an object for HTML attributes
    // (colspan should be no different)
    DayTableMixin.prototype.renderHeadDateCellHtml = function (date, colspan, otherAttrs) {
        var t = this;
        var view = t.view;
        var dateEnv = t.getDateEnv();
        var dateProfile = t.dateProfile;
        var isDateValid = date_range_1.rangeContainsMarker(dateProfile.activeRange, date); // TODO: called too frequently. cache somehow.
        var classNames = [
            'fc-day-header',
            view.calendar.theme.getClass('widgetHeader')
        ];
        var innerHtml;
        if (typeof t.opt('columnHeaderHtml') === 'function') {
            innerHtml = t.opt('columnHeaderHtml')(date);
        }
        else if (typeof t.opt('columnHeaderText') === 'function') {
            innerHtml = html_1.htmlEscape(t.opt('columnHeaderText')(date));
        }
        else {
            innerHtml = html_1.htmlEscape(dateEnv.format(date, t.colHeadFormat));
        }
        // if only one row of days, the classNames on the header can represent the specific days beneath
        if (t.rowCnt === 1) {
            classNames = classNames.concat(
            // includes the day-of-week class
            // noThemeHighlight=true (don't highlight the header)
            t.getDayClasses(date, true));
        }
        else {
            classNames.push('fc-' + marker_1.DAY_IDS[date.getUTCDay()]); // only add the day-of-week class
        }
        return '' +
            '<th class="' + classNames.join(' ') + '"' +
            ((isDateValid && t.rowCnt) === 1 ?
                ' data-date="' + dateEnv.formatIso(date, { omitTime: true }) + '"' :
                '') +
            (colspan > 1 ?
                ' colspan="' + colspan + '"' :
                '') +
            (otherAttrs ?
                ' ' + otherAttrs :
                '') +
            '>' +
            (isDateValid ?
                // don't make a link if the heading could represent multiple days, or if there's only one day (forceOff)
                view.buildGotoAnchorHtml({ date: date, forceOff: t.rowCnt > 1 || t.colCnt === 1 }, innerHtml) :
                // if not valid, display text, but no link
                innerHtml) +
            '</th>';
    };
    /* Background Rendering
    ------------------------------------------------------------------------------------------------------------------*/
    DayTableMixin.prototype.renderBgTrHtml = function (row) {
        return '' +
            '<tr>' +
            (this.isRtl ? '' : this.renderBgIntroHtml(row)) +
            this.renderBgCellsHtml(row) +
            (this.isRtl ? this.renderBgIntroHtml(row) : '') +
            '</tr>';
    };
    DayTableMixin.prototype.renderBgIntroHtml = function (row) {
        return this.renderIntroHtml(); // fall back to generic
    };
    DayTableMixin.prototype.renderBgCellsHtml = function (row) {
        var htmls = [];
        var col;
        var date;
        for (col = 0; col < this.colCnt; col++) {
            date = this.getCellDate(row, col);
            htmls.push(this.renderBgCellHtml(date));
        }
        return htmls.join('');
    };
    DayTableMixin.prototype.renderBgCellHtml = function (date, otherAttrs) {
        var t = this;
        var view = t.view;
        var dateEnv = t.getDateEnv();
        var dateProfile = t.dateProfile;
        var isDateValid = date_range_1.rangeContainsMarker(dateProfile.activeRange, date); // TODO: called too frequently. cache somehow.
        var classes = t.getDayClasses(date);
        classes.unshift('fc-day', view.calendar.theme.getClass('widgetContent'));
        return '<td class="' + classes.join(' ') + '"' +
            (isDateValid ?
                ' data-date="' + dateEnv.formatIso(date, { omitTime: true }) + '"' :
                '') +
            (otherAttrs ?
                ' ' + otherAttrs :
                '') +
            '></td>';
    };
    /* Generic
    ------------------------------------------------------------------------------------------------------------------*/
    // Generates the default HTML intro for any row. User classes should override
    DayTableMixin.prototype.renderIntroHtml = function () {
        return '';
    };
    // TODO: a generic method for dealing with <tr>, RTL, intro
    // when increment internalApiVersion
    // wrapTr (scheduler)
    /* Utils
    ------------------------------------------------------------------------------------------------------------------*/
    // Applies the generic "intro" and "outro" HTML to the given cells.
    // Intro means the leftmost cell when the calendar is LTR and the rightmost cell when RTL. Vice-versa for outro.
    DayTableMixin.prototype.bookendCells = function (trEl) {
        var introHtml = this.renderIntroHtml();
        if (introHtml) {
            if (this.isRtl) {
                dom_manip_1.appendToElement(trEl, introHtml);
            }
            else {
                dom_manip_1.prependToElement(trEl, introHtml);
            }
        }
    };
    return DayTableMixin;
}(Mixin_1.default));
exports.default = DayTableMixin;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var html_1 = __webpack_require__(9);
var dom_manip_1 = __webpack_require__(3);
var FillRenderer = /** @class */ (function () {
    function FillRenderer(component) {
        this.fillSegTag = 'div';
        this.component = component;
        this.containerElsByType = {};
        this.renderedSegsByType = {};
    }
    FillRenderer.prototype.renderSegs = function (type, segs, props) {
        var _a;
        var renderedSegs = this.buildSegEls(type, segs, props); // assignes `.el` to each seg. returns successfully rendered segs
        var containerEls = this.attachSegEls(type, renderedSegs);
        if (containerEls) {
            (_a = (this.containerElsByType[type] || (this.containerElsByType[type] = []))).push.apply(_a, containerEls);
        }
        this.renderedSegsByType[type] = renderedSegs;
        return renderedSegs;
    };
    // Unrenders a specific type of fill that is currently rendered on the grid
    FillRenderer.prototype.unrender = function (type) {
        var containerEls = this.containerElsByType[type];
        if (containerEls) {
            containerEls.forEach(dom_manip_1.removeElement);
            delete this.containerElsByType[type];
        }
        delete this.renderedSegsByType[type];
    };
    // Renders and assigns an `el` property for each fill segment. Generic enough to work with different types.
    // Only returns segments that successfully rendered.
    FillRenderer.prototype.buildSegEls = function (type, segs, props) {
        var _this = this;
        var html = '';
        var renderedSegs = [];
        var i;
        if (segs.length) {
            // build a large concatenation of segment HTML
            for (i = 0; i < segs.length; i++) {
                html += this.buildSegHtml(type, segs[i], props);
            }
            // Grab individual elements from the combined HTML string. Use each as the default rendering.
            // Then, compute the 'el' for each segment.
            dom_manip_1.htmlToElements(html).forEach(function (el, i) {
                var seg = segs[i];
                // allow custom filter methods per-type
                if (props.filterEl) {
                    el = props.filterEl(seg, el); // might return null/undefined
                }
                // correct element type? (would be bad if a non-TD were inserted into a table for example)
                if (el && dom_manip_1.elementMatches(el, _this.fillSegTag)) {
                    seg.el = el;
                    renderedSegs.push(seg);
                }
            });
        }
        return renderedSegs;
    };
    // Builds the HTML needed for one fill segment. Generic enough to work with different types.
    FillRenderer.prototype.buildSegHtml = function (type, seg, props) {
        // custom hooks per-type
        var classes = props.getClasses ? props.getClasses(seg) : [];
        var css = html_1.cssToStr(props.getCss ? props.getCss(seg) : {});
        return '<' + this.fillSegTag +
            (classes.length ? ' class="' + classes.join(' ') + '"' : '') +
            (css ? ' style="' + css + '"' : '') +
            '></' + this.fillSegTag + '>';
    };
    // Should return wrapping DOM structure
    FillRenderer.prototype.attachSegEls = function (type, segs) {
        // subclasses must implement
        return null;
    };
    FillRenderer.prototype.computeSize = function (type) {
    };
    FillRenderer.prototype.assignSize = function (type) {
    };
    return FillRenderer;
}());
exports.default = FillRenderer;


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var dom_manip_1 = __webpack_require__(3);
var MirrorRenderer = /** @class */ (function () {
    function MirrorRenderer(component, eventRenderer) {
        this.view = component.view;
        this.component = component;
        this.eventRenderer = eventRenderer;
    }
    MirrorRenderer.prototype.renderEventDraggingSegs = function (segs, sourceSeg) {
        this.renderEventSegs(segs, sourceSeg, 'fc-dragging');
    };
    MirrorRenderer.prototype.renderEventResizingSegs = function (segs, sourceSeg) {
        this.renderEventSegs(segs, sourceSeg, 'fc-resizing');
    };
    MirrorRenderer.prototype.renderEventSegs = function (segs, sourceSeg, extraClassName) {
        var i;
        // assigns each seg's el and returns a subset of segs that were rendered
        segs = this.eventRenderer.renderFgSegEls(segs, true); // isMirrors=true
        for (i = 0; i < segs.length; i++) {
            var classList = segs[i].el.classList;
            classList.add('fc-mirror');
            if (extraClassName) {
                classList.add(extraClassName);
            }
        }
        this.mirrorEls = this.renderSegs(segs, sourceSeg);
        this.segs = segs;
        this.view.triggerRenderedSegs(segs, true); // isMirrors=true
    };
    MirrorRenderer.prototype.computeSize = function () {
    };
    MirrorRenderer.prototype.assignSize = function () {
    };
    MirrorRenderer.prototype.unrender = function () {
        if (this.mirrorEls) {
            this.mirrorEls.forEach(dom_manip_1.removeElement);
            this.mirrorEls = null;
        }
    };
    return MirrorRenderer;
}());
exports.default = MirrorRenderer;


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var dom_geom_1 = __webpack_require__(13);
var geom_1 = __webpack_require__(26);
var scroll_geom_cache_1 = __webpack_require__(142);
/*
When this class is instantiated, it records the offset of an element (relative to the document topleft),
and continues to monitor scrolling, updating the cached coordinates if it needs to.
Does not access the DOM after instantiation, so highly performant.

Also keeps track of all scrolling/overflow:hidden containers that are parents of the given element
and an determine if a given point is inside the combined clipping rectangle.
*/
var OffsetTracker = /** @class */ (function () {
    function OffsetTracker(el) {
        var rect = dom_geom_1.computeRect(el);
        this.origLeft = rect.left;
        this.origTop = rect.top;
        // will work fine for divs that have overflow:hidden
        this.scrollCaches = dom_geom_1.getClippingParents(el).map(function (el) {
            return new scroll_geom_cache_1.ElementScrollGeomCache(el, true); // listen=true
        });
    }
    OffsetTracker.prototype.destroy = function () {
        for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
            var scrollCache = _a[_i];
            scrollCache.destroy();
        }
    };
    OffsetTracker.prototype.computeLeft = function () {
        var left = this.origLeft;
        for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
            var scrollCache = _a[_i];
            left += scrollCache.getScrollLeft() - scrollCache.origScrollLeft;
        }
        return left;
    };
    OffsetTracker.prototype.computeTop = function () {
        var top = this.origTop;
        for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
            var scrollCache = _a[_i];
            top += scrollCache.origScrollTop - scrollCache.getScrollTop();
        }
        return top;
    };
    OffsetTracker.prototype.isWithinClipping = function (pageX, pageY) {
        var point = { left: pageX, top: pageY };
        for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
            var scrollCache = _a[_i];
            if (!geom_1.pointInsideRect(point, scrollCache.clientRect)) {
                return false;
            }
        }
        return true;
    };
    return OffsetTracker;
}());
exports.default = OffsetTracker;


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var object_1 = __webpack_require__(4);
var dom_manip_1 = __webpack_require__(3);
var dom_geom_1 = __webpack_require__(13);
var PositionCache_1 = __webpack_require__(49);
var Popover_1 = __webpack_require__(189);
var DayTableMixin_1 = __webpack_require__(58);
var DayGridEventRenderer_1 = __webpack_require__(148);
var DayGridMirrorRenderer_1 = __webpack_require__(190);
var DayGridFillRenderer_1 = __webpack_require__(191);
var marker_1 = __webpack_require__(6);
var formatting_1 = __webpack_require__(8);
var DateComponent_1 = __webpack_require__(21);
var DayTile_1 = __webpack_require__(192);
var date_range_1 = __webpack_require__(11);
var OffsetTracker_1 = __webpack_require__(61);
var DAY_NUM_FORMAT = formatting_1.createFormatter({ day: 'numeric' });
var WEEK_NUM_FORMAT = formatting_1.createFormatter({ week: 'numeric' });
/* A component that renders a grid of whole-days that runs horizontally. There can be multiple rows, one per week.
----------------------------------------------------------------------------------------------------------------------*/
var DayGrid = /** @class */ (function (_super) {
    tslib_1.__extends(DayGrid, _super);
    function DayGrid(view) {
        var _this = _super.call(this, view) || this;
        _this.isInteractable = true;
        _this.doesDragMirror = false;
        _this.doesDragHighlight = true;
        _this.slicingType = 'all-day'; // stupid TypeScript
        _this.cellWeekNumbersVisible = false; // display week numbers in day cell?
        _this.bottomCoordPadding = 0; // hack for extending the hit area for the last row of the coordinate grid
        // isRigid determines whether the individual rows should ignore the contents and be a constant height.
        // Relies on the view's colCnt and rowCnt. In the future, this component should probably be self-sufficient.
        _this.isRigid = false;
        return _this;
    }
    // Slices up the given span (unzoned start/end with other misc data) into an array of segments
    DayGrid.prototype.rangeToSegs = function (range) {
        range = date_range_1.intersectRanges(range, this.dateProfile.validRange);
        if (range) {
            var segs = this.sliceRangeByRow(range);
            for (var i = 0; i < segs.length; i++) {
                var seg = segs[i];
                seg.component = this;
                if (this.isRtl) {
                    seg.leftCol = this.daysPerRow - 1 - seg.lastRowDayIndex;
                    seg.rightCol = this.daysPerRow - 1 - seg.firstRowDayIndex;
                }
                else {
                    seg.leftCol = seg.firstRowDayIndex;
                    seg.rightCol = seg.lastRowDayIndex;
                }
            }
            return segs;
        }
        else {
            return [];
        }
    };
    /* Date Rendering
    ------------------------------------------------------------------------------------------------------------------*/
    DayGrid.prototype.renderDates = function () {
        this.updateDayTable();
        this.renderGrid();
    };
    DayGrid.prototype.unrenderDates = function () {
        this.removeSegPopover();
    };
    // Renders the rows and columns into the component's `this.el`, which should already be assigned.
    DayGrid.prototype.renderGrid = function () {
        var view = this.view;
        var dateEnv = this.getDateEnv();
        var rowCnt = this.rowCnt;
        var colCnt = this.colCnt;
        var html = '';
        var row;
        var col;
        if (this.headContainerEl) {
            this.headContainerEl.innerHTML = this.renderHeadHtml();
        }
        for (row = 0; row < rowCnt; row++) {
            html += this.renderDayRowHtml(row, this.isRigid);
        }
        this.el.innerHTML = html;
        this.rowEls = dom_manip_1.findElements(this.el, '.fc-row');
        this.cellEls = dom_manip_1.findElements(this.el, '.fc-day, .fc-disabled-day');
        this.rowPositions = new PositionCache_1.default(this.el, this.rowEls, false, true // vertical
        );
        this.colPositions = new PositionCache_1.default(this.el, this.cellEls.slice(0, this.colCnt), // only the first row
        true, false // horizontal
        );
        // trigger dayRender with each cell's element
        for (row = 0; row < rowCnt; row++) {
            for (col = 0; col < colCnt; col++) {
                this.publiclyTrigger('dayRender', [
                    {
                        date: dateEnv.toDate(this.getCellDate(row, col)),
                        el: this.getCellEl(row, col),
                        view: view
                    }
                ]);
            }
        }
    };
    // Generates the HTML for a single row, which is a div that wraps a table.
    // `row` is the row number.
    DayGrid.prototype.renderDayRowHtml = function (row, isRigid) {
        var theme = this.getTheme();
        var classes = ['fc-row', 'fc-week', theme.getClass('dayRow')];
        if (isRigid) {
            classes.push('fc-rigid');
        }
        return '' +
            '<div class="' + classes.join(' ') + '">' +
            '<div class="fc-bg">' +
            '<table class="' + theme.getClass('tableGrid') + '">' +
            this.renderBgTrHtml(row) +
            '</table>' +
            '</div>' +
            '<div class="fc-content-skeleton">' +
            '<table>' +
            (this.getIsNumbersVisible() ?
                '<thead>' +
                    this.renderNumberTrHtml(row) +
                    '</thead>' :
                '') +
            '</table>' +
            '</div>' +
            '</div>';
    };
    DayGrid.prototype.getIsNumbersVisible = function () {
        return this.getIsDayNumbersVisible() || this.cellWeekNumbersVisible;
    };
    DayGrid.prototype.getIsDayNumbersVisible = function () {
        return this.rowCnt > 1;
    };
    /* Grid Number Rendering
    ------------------------------------------------------------------------------------------------------------------*/
    DayGrid.prototype.renderNumberTrHtml = function (row) {
        return '' +
            '<tr>' +
            (this.isRtl ? '' : this.renderNumberIntroHtml(row)) +
            this.renderNumberCellsHtml(row) +
            (this.isRtl ? this.renderNumberIntroHtml(row) : '') +
            '</tr>';
    };
    DayGrid.prototype.renderNumberIntroHtml = function (row) {
        return this.renderIntroHtml();
    };
    DayGrid.prototype.renderNumberCellsHtml = function (row) {
        var htmls = [];
        var col;
        var date;
        for (col = 0; col < this.colCnt; col++) {
            date = this.getCellDate(row, col);
            htmls.push(this.renderNumberCellHtml(date));
        }
        return htmls.join('');
    };
    // Generates the HTML for the <td>s of the "number" row in the DayGrid's content skeleton.
    // The number row will only exist if either day numbers or week numbers are turned on.
    DayGrid.prototype.renderNumberCellHtml = function (date) {
        var view = this.view;
        var dateEnv = this.getDateEnv();
        var html = '';
        var isDateValid = date_range_1.rangeContainsMarker(this.dateProfile.activeRange, date); // TODO: called too frequently. cache somehow.
        var isDayNumberVisible = this.getIsDayNumbersVisible() && isDateValid;
        var classes;
        var weekCalcFirstDow;
        if (!isDayNumberVisible && !this.cellWeekNumbersVisible) {
            // no numbers in day cell (week number must be along the side)
            return '<td></td>'; //  will create an empty space above events :(
        }
        classes = this.getDayClasses(date);
        classes.unshift('fc-day-top');
        if (this.cellWeekNumbersVisible) {
            weekCalcFirstDow = dateEnv.weekDow;
        }
        html += '<td class="' + classes.join(' ') + '"' +
            (isDateValid ?
                ' data-date="' + dateEnv.formatIso(date, { omitTime: true }) + '"' :
                '') +
            '>';
        if (this.cellWeekNumbersVisible && (date.getUTCDay() === weekCalcFirstDow)) {
            html += view.buildGotoAnchorHtml({ date: date, type: 'week' }, { 'class': 'fc-week-number' }, dateEnv.format(date, WEEK_NUM_FORMAT) // inner HTML
            );
        }
        if (isDayNumberVisible) {
            html += view.buildGotoAnchorHtml(date, { 'class': 'fc-day-number' }, dateEnv.format(date, DAY_NUM_FORMAT) // inner HTML
            );
        }
        html += '</td>';
        return html;
    };
    /* Sizing
    ------------------------------------------------------------------------------------------------------------------*/
    DayGrid.prototype.buildPositionCaches = function () {
        this.colPositions.build();
        this.rowPositions.build();
        this.rowPositions.bottoms[this.rowCnt - 1] += this.bottomCoordPadding; // hack
    };
    /* Hit System
    ------------------------------------------------------------------------------------------------------------------*/
    DayGrid.prototype.prepareHits = function () {
        this.offsetTracker = new OffsetTracker_1.default(this.el);
    };
    DayGrid.prototype.releaseHits = function () {
        this.offsetTracker.destroy();
    };
    DayGrid.prototype.queryHit = function (leftOffset, topOffset) {
        var _a = this, colPositions = _a.colPositions, rowPositions = _a.rowPositions, offsetTracker = _a.offsetTracker;
        if (offsetTracker.isWithinClipping(leftOffset, topOffset)) {
            var leftOrigin = offsetTracker.computeLeft();
            var topOrigin = offsetTracker.computeTop();
            var col = colPositions.leftToIndex(leftOffset - leftOrigin);
            var row = rowPositions.topToIndex(topOffset - topOrigin);
            if (row != null && col != null) {
                return {
                    component: this,
                    dateSpan: {
                        range: this.getCellRange(row, col),
                        allDay: true
                    },
                    dayEl: this.getCellEl(row, col),
                    rect: {
                        left: colPositions.lefts[col] + leftOrigin,
                        right: colPositions.rights[col] + leftOrigin,
                        top: rowPositions.tops[row] + topOrigin,
                        bottom: rowPositions.bottoms[row] + topOrigin
                    },
                    layer: 0
                };
            }
        }
    };
    /* Cell System
    ------------------------------------------------------------------------------------------------------------------*/
    // FYI: the first column is the leftmost column, regardless of date
    DayGrid.prototype.getCellEl = function (row, col) {
        return this.cellEls[row * this.colCnt + col];
    };
    /* Event Rendering
    ------------------------------------------------------------------------------------------------------------------*/
    // Unrenders all events currently rendered on the grid
    DayGrid.prototype.unrenderEvents = function () {
        this.removeSegPopover(); // removes the "more.." events popover
        _super.prototype.unrenderEvents.call(this);
    };
    // Retrieves all rendered segment objects currently rendered on the grid
    DayGrid.prototype.getAllEventSegs = function () {
        // append the segments from the "more..." popover
        return _super.prototype.getAllEventSegs.call(this).concat(this.segPopoverTile ?
            this.segPopoverTile.getAllEventSegs() :
            []);
    };
    /* Event Resize Visualization
    ------------------------------------------------------------------------------------------------------------------*/
    // Renders a visual indication of an event being resized
    DayGrid.prototype.renderEventResize = function (eventStore, eventUis, origSeg) {
        var segs = this.eventRangesToSegs(this.eventStoreToRanges(eventStore, eventUis));
        this.renderHighlightSegs(segs);
        this.mirrorRenderer.renderEventResizingSegs(segs, origSeg);
    };
    // Unrenders a visual indication of an event being resized
    DayGrid.prototype.unrenderEventResize = function () {
        this.unrenderHighlight();
        this.mirrorRenderer.unrender();
    };
    /* More+ Link Popover
    ------------------------------------------------------------------------------------------------------------------*/
    DayGrid.prototype.removeSegPopover = function () {
        if (this.segPopover) {
            this.segPopover.hide(); // in handler, will call segPopover's removeElement
        }
    };
    // Limits the number of "levels" (vertically stacking layers of events) for each row of the grid.
    // `levelLimit` can be false (don't limit), a number, or true (should be computed).
    DayGrid.prototype.limitRows = function (levelLimit) {
        var rowStructs = this.eventRenderer.rowStructs || [];
        var row; // row #
        var rowLevelLimit;
        for (row = 0; row < rowStructs.length; row++) {
            this.unlimitRow(row);
            if (!levelLimit) {
                rowLevelLimit = false;
            }
            else if (typeof levelLimit === 'number') {
                rowLevelLimit = levelLimit;
            }
            else {
                rowLevelLimit = this.computeRowLevelLimit(row);
            }
            if (rowLevelLimit !== false) {
                this.limitRow(row, rowLevelLimit);
            }
        }
    };
    // Computes the number of levels a row will accomodate without going outside its bounds.
    // Assumes the row is "rigid" (maintains a constant height regardless of what is inside).
    // `row` is the row number.
    DayGrid.prototype.computeRowLevelLimit = function (row) {
        var rowEl = this.rowEls[row]; // the containing "fake" row div
        var rowBottom = rowEl.getBoundingClientRect().bottom; // relative to viewport!
        var trEls = dom_manip_1.findChildren(this.eventRenderer.rowStructs[row].tbodyEl);
        var i;
        var trEl;
        // Reveal one level <tr> at a time and stop when we find one out of bounds
        for (i = 0; i < trEls.length; i++) {
            trEl = trEls[i];
            trEl.classList.remove('fc-limited'); // reset to original state (reveal)
            if (trEl.getBoundingClientRect().bottom > rowBottom) {
                return i;
            }
        }
        return false; // should not limit at all
    };
    // Limits the given grid row to the maximum number of levels and injects "more" links if necessary.
    // `row` is the row number.
    // `levelLimit` is a number for the maximum (inclusive) number of levels allowed.
    DayGrid.prototype.limitRow = function (row, levelLimit) {
        var _this = this;
        var rowStruct = this.eventRenderer.rowStructs[row];
        var moreNodes = []; // array of "more" <a> links and <td> DOM nodes
        var col = 0; // col #, left-to-right (not chronologically)
        var levelSegs; // array of segment objects in the last allowable level, ordered left-to-right
        var cellMatrix; // a matrix (by level, then column) of all <td> elements in the row
        var limitedNodes; // array of temporarily hidden level <tr> and segment <td> DOM nodes
        var i;
        var seg;
        var segsBelow; // array of segment objects below `seg` in the current `col`
        var totalSegsBelow; // total number of segments below `seg` in any of the columns `seg` occupies
        var colSegsBelow; // array of segment arrays, below seg, one for each column (offset from segs's first column)
        var td;
        var rowSpan;
        var segMoreNodes; // array of "more" <td> cells that will stand-in for the current seg's cell
        var j;
        var moreTd;
        var moreWrap;
        var moreLink;
        // Iterates through empty level cells and places "more" links inside if need be
        var emptyCellsUntil = function (endCol) {
            while (col < endCol) {
                segsBelow = _this.getCellSegs(row, col, levelLimit);
                if (segsBelow.length) {
                    td = cellMatrix[levelLimit - 1][col];
                    moreLink = _this.renderMoreLink(row, col, segsBelow);
                    moreWrap = dom_manip_1.createElement('div', null, moreLink);
                    td.appendChild(moreWrap);
                    moreNodes.push(moreWrap[0]);
                }
                col++;
            }
        };
        if (levelLimit && levelLimit < rowStruct.segLevels.length) { // is it actually over the limit?
            levelSegs = rowStruct.segLevels[levelLimit - 1];
            cellMatrix = rowStruct.cellMatrix;
            limitedNodes = dom_manip_1.findChildren(rowStruct.tbodyEl).slice(levelLimit); // get level <tr> elements past the limit
            limitedNodes.forEach(function (node) {
                node.classList.add('fc-limited'); // hide elements and get a simple DOM-nodes array
            });
            // iterate though segments in the last allowable level
            for (i = 0; i < levelSegs.length; i++) {
                seg = levelSegs[i];
                emptyCellsUntil(seg.leftCol); // process empty cells before the segment
                // determine *all* segments below `seg` that occupy the same columns
                colSegsBelow = [];
                totalSegsBelow = 0;
                while (col <= seg.rightCol) {
                    segsBelow = this.getCellSegs(row, col, levelLimit);
                    colSegsBelow.push(segsBelow);
                    totalSegsBelow += segsBelow.length;
                    col++;
                }
                if (totalSegsBelow) { // do we need to replace this segment with one or many "more" links?
                    td = cellMatrix[levelLimit - 1][seg.leftCol]; // the segment's parent cell
                    rowSpan = td.rowSpan || 1;
                    segMoreNodes = [];
                    // make a replacement <td> for each column the segment occupies. will be one for each colspan
                    for (j = 0; j < colSegsBelow.length; j++) {
                        moreTd = dom_manip_1.createElement('td', { className: 'fc-more-cell', rowSpan: rowSpan });
                        segsBelow = colSegsBelow[j];
                        moreLink = this.renderMoreLink(row, seg.leftCol + j, [seg].concat(segsBelow) // count seg as hidden too
                        );
                        moreWrap = dom_manip_1.createElement('div', null, moreLink);
                        moreTd.appendChild(moreWrap);
                        segMoreNodes.push(moreTd);
                        moreNodes.push(moreTd);
                    }
                    td.classList.add('fc-limited');
                    dom_manip_1.insertAfterElement(td, segMoreNodes);
                    limitedNodes.push(td);
                }
            }
            emptyCellsUntil(this.colCnt); // finish off the level
            rowStruct.moreEls = moreNodes; // for easy undoing later
            rowStruct.limitedEls = limitedNodes; // for easy undoing later
        }
    };
    // Reveals all levels and removes all "more"-related elements for a grid's row.
    // `row` is a row number.
    DayGrid.prototype.unlimitRow = function (row) {
        var rowStruct = this.eventRenderer.rowStructs[row];
        if (rowStruct.moreEls) {
            rowStruct.moreEls.forEach(dom_manip_1.removeElement);
            rowStruct.moreEls = null;
        }
        if (rowStruct.limitedEls) {
            rowStruct.limitedEls.forEach(function (limitedEl) {
                limitedEl.classList.remove('fc-limited');
            });
            rowStruct.limitedEls = null;
        }
    };
    // Renders an <a> element that represents hidden event element for a cell.
    // Responsible for attaching click handler as well.
    DayGrid.prototype.renderMoreLink = function (row, col, hiddenSegs) {
        var _this = this;
        var view = this.view;
        var dateEnv = this.getDateEnv();
        var a = dom_manip_1.createElement('a', { className: 'fc-more' });
        a.innerText = this.getMoreLinkText(hiddenSegs.length);
        a.addEventListener('click', function (ev) {
            var clickOption = _this.opt('eventLimitClick');
            var date = _this.getCellDate(row, col);
            var moreEl = ev.currentTarget;
            var dayEl = _this.getCellEl(row, col);
            var allSegs = _this.getCellSegs(row, col);
            // rescope the segments to be within the cell's date
            var reslicedAllSegs = _this.resliceDaySegs(allSegs, date);
            var reslicedHiddenSegs = _this.resliceDaySegs(hiddenSegs, date);
            if (typeof clickOption === 'function') {
                // the returned value can be an atomic option
                clickOption = _this.publiclyTrigger('eventLimitClick', [
                    {
                        date: dateEnv.toDate(date),
                        allDay: true,
                        dayEl: dayEl,
                        moreEl: moreEl,
                        segs: reslicedAllSegs,
                        hiddenSegs: reslicedHiddenSegs,
                        jsEvent: ev,
                        view: view
                    }
                ]);
            }
            if (clickOption === 'popover') {
                _this.showSegPopover(row, col, moreEl, reslicedAllSegs);
            }
            else if (typeof clickOption === 'string') { // a view name
                view.calendar.zoomTo(date, clickOption);
            }
        });
        return a;
    };
    // Reveals the popover that displays all events within a cell
    DayGrid.prototype.showSegPopover = function (row, col, moreLink, segs) {
        var _this = this;
        var view = this.view;
        var moreWrap = moreLink.parentNode; // the <div> wrapper around the <a>
        var topEl; // the element we want to match the top coordinate of
        var options;
        if (this.rowCnt === 1) {
            topEl = view.el; // will cause the popover to cover any sort of header
        }
        else {
            topEl = this.rowEls[row]; // will align with top of row
        }
        options = {
            className: 'fc-more-popover ' + view.calendar.theme.getClass('popover'),
            parentEl: this.el,
            top: dom_geom_1.computeRect(topEl).top,
            autoHide: true,
            content: function (el) {
                _this.segPopoverTile.setElement(el);
                // it would be more proper to call render() with a full render state,
                // but hackily rendering segs directly is much easier
                // simlate a lot of what happens in render() and renderEventRanges()
                _this.segPopoverTile.renderSkeleton();
                _this.segPopoverTile.eventRenderer.rangeUpdated();
                _this.segPopoverTile.eventRenderer.renderSegs(segs);
                _this.segPopoverTile.renderedFlags.events = true; // so unrendering works
            },
            hide: function () {
                _this.segPopoverTile.removeElement();
                _this.segPopover.removeElement();
                _this.segPopover = null;
            }
        };
        // Determine horizontal coordinate.
        // We use the moreWrap instead of the <td> to avoid border confusion.
        if (this.isRtl) {
            options.right = dom_geom_1.computeRect(moreWrap).right + 1; // +1 to be over cell border
        }
        else {
            options.left = dom_geom_1.computeRect(moreWrap).left - 1; // -1 to be over cell border
        }
        this.segPopoverTile = new DayTile_1.default(this.view, this.getCellDate(row, col));
        this.segPopover = new Popover_1.default(options);
        this.segPopover.show();
        this.getCalendar().releaseAfterSizingTriggers(); // hack for eventPositioned
    };
    // Given the events within an array of segment objects, reslice them to be in a single day
    DayGrid.prototype.resliceDaySegs = function (segs, dayDate) {
        var dayStart = dayDate;
        var dayEnd = marker_1.addDays(dayStart, 1);
        var dayRange = { start: dayStart, end: dayEnd };
        var newSegs = [];
        for (var _i = 0, segs_1 = segs; _i < segs_1.length; _i++) {
            var seg = segs_1[_i];
            var eventRange = seg.eventRange;
            var origRange = eventRange.range;
            var slicedRange = date_range_1.intersectRanges(origRange, dayRange);
            if (slicedRange) {
                newSegs.push(object_1.assignTo({}, seg, {
                    eventRange: {
                        def: eventRange.def,
                        ui: object_1.assignTo({}, eventRange.ui, { durationEditable: false }),
                        instance: eventRange.instance,
                        range: slicedRange
                    },
                    isStart: seg.isStart && slicedRange.start.valueOf() === origRange.start.valueOf(),
                    isEnd: seg.isEnd && slicedRange.end.valueOf() === origRange.end.valueOf()
                }));
            }
        }
        return newSegs;
    };
    // Generates the text that should be inside a "more" link, given the number of events it represents
    DayGrid.prototype.getMoreLinkText = function (num) {
        var opt = this.opt('eventLimitText');
        if (typeof opt === 'function') {
            return opt(num);
        }
        else {
            return '+' + num + ' ' + opt;
        }
    };
    // Returns segments within a given cell.
    // If `startLevel` is specified, returns only events including and below that level. Otherwise returns all segs.
    DayGrid.prototype.getCellSegs = function (row, col, startLevel) {
        var segMatrix = this.eventRenderer.rowStructs[row].segMatrix;
        var level = startLevel || 0;
        var segs = [];
        var seg;
        while (level < segMatrix.length) {
            seg = segMatrix[level][col];
            if (seg) {
                segs.push(seg);
            }
            level++;
        }
        return segs;
    };
    return DayGrid;
}(DateComponent_1.default));
exports.default = DayGrid;
DayGrid.prototype.eventRendererClass = DayGridEventRenderer_1.default;
DayGrid.prototype.mirrorRendererClass = DayGridMirrorRenderer_1.default;
DayGrid.prototype.fillRendererClass = DayGridFillRenderer_1.default;
DayTableMixin_1.default.mixInto(DayGrid);


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var html_1 = __webpack_require__(9);
var dom_manip_1 = __webpack_require__(3);
var misc_1 = __webpack_require__(2);
var formatting_1 = __webpack_require__(8);
var ScrollComponent_1 = __webpack_require__(37);
var View_1 = __webpack_require__(42);
var BasicViewDateProfileGenerator_1 = __webpack_require__(149);
var DayGrid_1 = __webpack_require__(62);
var WEEK_NUM_FORMAT = formatting_1.createFormatter({ week: 'numeric' });
/* An abstract class for the "basic" views, as well as month view. Renders one or more rows of day cells.
----------------------------------------------------------------------------------------------------------------------*/
// It is a manager for a DayGrid subcomponent, which does most of the heavy lifting.
// It is responsible for managing width/height.
var BasicView = /** @class */ (function (_super) {
    tslib_1.__extends(BasicView, _super);
    function BasicView(calendar, viewSpec) {
        var _this = _super.call(this, calendar, viewSpec) || this;
        _this.colWeekNumbersVisible = false;
        _this.dayGrid = _this.instantiateDayGrid();
        _this.dayGrid.isRigid = _this.hasRigidRows();
        if (_this.opt('weekNumbers')) {
            if (_this.opt('weekNumbersWithinDays')) {
                _this.dayGrid.cellWeekNumbersVisible = true;
                _this.colWeekNumbersVisible = false;
            }
            else {
                _this.dayGrid.cellWeekNumbersVisible = false;
                _this.colWeekNumbersVisible = true;
            }
        }
        _this.addChild(_this.dayGrid);
        _this.scroller = new ScrollComponent_1.default('hidden', // overflow x
        'auto' // overflow y
        );
        return _this;
    }
    // Generates the DayGrid object this view needs. Draws from this.dayGridClass
    BasicView.prototype.instantiateDayGrid = function () {
        // generate a subclass on the fly with BasicView-specific behavior
        // TODO: cache this subclass
        var subclass = makeDayGridSubclass(this.dayGridClass);
        return new subclass(this);
    };
    BasicView.prototype.renderDates = function (dateProfile) {
        this.dayGrid.breakOnWeeks = /year|month|week/.test(this.dateProfile.currentRangeUnit);
        _super.prototype.renderDates.call(this, dateProfile);
    };
    BasicView.prototype.renderSkeleton = function () {
        var dayGridContainerEl;
        var dayGridEl;
        this.el.classList.add('fc-basic-view');
        this.el.innerHTML = this.renderSkeletonHtml();
        this.scroller.applyOverflow();
        dayGridContainerEl = this.scroller.el;
        dayGridContainerEl.classList.add('fc-day-grid-container');
        dayGridEl = dom_manip_1.createElement('div', { className: 'fc-day-grid' });
        dayGridContainerEl.appendChild(dayGridEl);
        this.el.querySelector('.fc-body > tr > td').appendChild(dayGridContainerEl);
        this.dayGrid.headContainerEl = this.el.querySelector('.fc-head-container');
        this.dayGrid.setElement(dayGridEl);
    };
    BasicView.prototype.unrenderSkeleton = function () {
        this.dayGrid.removeElement();
        this.scroller.removeElement();
    };
    // Builds the HTML skeleton for the view.
    // The day-grid component will render inside of a container defined by this HTML.
    BasicView.prototype.renderSkeletonHtml = function () {
        var theme = this.getTheme();
        return '' +
            '<table class="' + theme.getClass('tableGrid') + '">' +
            (this.opt('columnHeader') ?
                '<thead class="fc-head">' +
                    '<tr>' +
                    '<td class="fc-head-container ' + theme.getClass('widgetHeader') + '">&nbsp;</td>' +
                    '</tr>' +
                    '</thead>' :
                '') +
            '<tbody class="fc-body">' +
            '<tr>' +
            '<td class="' + theme.getClass('widgetContent') + '"></td>' +
            '</tr>' +
            '</tbody>' +
            '</table>';
    };
    // Generates an HTML attribute string for setting the width of the week number column, if it is known
    BasicView.prototype.weekNumberStyleAttr = function () {
        if (this.weekNumberWidth != null) {
            return 'style="width:' + this.weekNumberWidth + 'px"';
        }
        return '';
    };
    // Determines whether each row should have a constant height
    BasicView.prototype.hasRigidRows = function () {
        var eventLimit = this.opt('eventLimit');
        return eventLimit && typeof eventLimit !== 'number';
    };
    /* Dimensions
    ------------------------------------------------------------------------------------------------------------------*/
    // Refreshes the horizontal dimensions of the view
    BasicView.prototype.updateBaseSize = function (totalHeight, isAuto) {
        var dayGrid = this.dayGrid;
        var eventLimit = this.opt('eventLimit');
        var headRowEl = dayGrid.headContainerEl ?
            dayGrid.headContainerEl.querySelector('.fc-row') :
            null;
        var scrollerHeight;
        var scrollbarWidths;
        // hack to give the view some height prior to dayGrid's columns being rendered
        // TODO: separate setting height from scroller VS dayGrid.
        if (!dayGrid.rowEls) {
            if (!isAuto) {
                scrollerHeight = this.computeScrollerHeight(totalHeight);
                this.scroller.setHeight(scrollerHeight);
            }
            return;
        }
        if (this.colWeekNumbersVisible) {
            // Make sure all week number cells running down the side have the same width.
            // Record the width for cells created later.
            this.weekNumberWidth = misc_1.matchCellWidths(dom_manip_1.findElements(this.el, '.fc-week-number'));
        }
        // reset all heights to be natural
        this.scroller.clear();
        if (headRowEl) {
            misc_1.uncompensateScroll(headRowEl);
        }
        dayGrid.removeSegPopover(); // kill the "more" popover if displayed
        // is the event limit a constant level number?
        if (eventLimit && typeof eventLimit === 'number') {
            dayGrid.limitRows(eventLimit); // limit the levels first so the height can redistribute after
        }
        // distribute the height to the rows
        // (totalHeight is a "recommended" value if isAuto)
        scrollerHeight = this.computeScrollerHeight(totalHeight);
        this.setGridHeight(scrollerHeight, isAuto);
        // is the event limit dynamically calculated?
        if (eventLimit && typeof eventLimit !== 'number') {
            dayGrid.limitRows(eventLimit); // limit the levels after the grid's row heights have been set
        }
        if (!isAuto) { // should we force dimensions of the scroll container?
            this.scroller.setHeight(scrollerHeight);
            scrollbarWidths = this.scroller.getScrollbarWidths();
            if (scrollbarWidths.left || scrollbarWidths.right) { // using scrollbars?
                if (headRowEl) {
                    misc_1.compensateScroll(headRowEl, scrollbarWidths);
                }
                // doing the scrollbar compensation might have created text overflow which created more height. redo
                scrollerHeight = this.computeScrollerHeight(totalHeight);
                this.scroller.setHeight(scrollerHeight);
            }
            // guarantees the same scrollbar widths
            this.scroller.lockOverflow(scrollbarWidths);
        }
    };
    // given a desired total height of the view, returns what the height of the scroller should be
    BasicView.prototype.computeScrollerHeight = function (totalHeight) {
        return totalHeight -
            misc_1.subtractInnerElHeight(this.el, this.scroller.el); // everything that's NOT the scroller
    };
    // Sets the height of just the DayGrid component in this view
    BasicView.prototype.setGridHeight = function (height, isAuto) {
        if (isAuto) {
            misc_1.undistributeHeight(this.dayGrid.rowEls); // let the rows be their natural height with no expanding
        }
        else {
            misc_1.distributeHeight(this.dayGrid.rowEls, height, true); // true = compensate for height-hogging rows
        }
    };
    /* Scroll
    ------------------------------------------------------------------------------------------------------------------*/
    BasicView.prototype.computeInitialDateScroll = function () {
        return { top: 0 };
    };
    BasicView.prototype.queryDateScroll = function () {
        return { top: this.scroller.getScrollTop() };
    };
    BasicView.prototype.applyDateScroll = function (scroll) {
        if (scroll.top !== undefined) {
            this.scroller.setScrollTop(scroll.top);
        }
    };
    return BasicView;
}(View_1.default));
exports.default = BasicView;
BasicView.prototype.dateProfileGeneratorClass = BasicViewDateProfileGenerator_1.default;
BasicView.prototype.dayGridClass = DayGrid_1.default;
// customize the rendering behavior of BasicView's dayGrid
function makeDayGridSubclass(SuperClass) {
    return /** @class */ (function (_super) {
        tslib_1.__extends(SubClass, _super);
        function SubClass() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        // Generates the HTML that will go before the day-of week header cells
        SubClass.prototype.renderHeadIntroHtml = function () {
            var view = this.view;
            if (view.colWeekNumbersVisible) {
                return '' +
                    '<th class="fc-week-number ' + view.calendar.theme.getClass('widgetHeader') + '" ' + view.weekNumberStyleAttr() + '>' +
                    '<span>' + // needed for matchCellWidths
                    html_1.htmlEscape(this.opt('weekLabel')) +
                    '</span>' +
                    '</th>';
            }
            return '';
        };
        // Generates the HTML that will go before content-skeleton cells that display the day/week numbers
        SubClass.prototype.renderNumberIntroHtml = function (row) {
            var view = this.view;
            var dateEnv = this.getDateEnv();
            var weekStart = this.getCellDate(row, 0);
            if (view.colWeekNumbersVisible) {
                return '' +
                    '<td class="fc-week-number" ' + view.weekNumberStyleAttr() + '>' +
                    view.buildGotoAnchorHtml(// aside from link, important for matchCellWidths
                    { date: weekStart, type: 'week', forceOff: this.colCnt === 1 }, dateEnv.format(weekStart, WEEK_NUM_FORMAT) // inner HTML
                    ) +
                    '</td>';
            }
            return '';
        };
        // Generates the HTML that goes before the day bg cells for each day-row
        SubClass.prototype.renderBgIntroHtml = function () {
            var view = this.view;
            if (view.colWeekNumbersVisible) {
                return '<td class="fc-week-number ' + view.calendar.theme.getClass('widgetContent') + '" ' +
                    view.weekNumberStyleAttr() + '></td>';
            }
            return '';
        };
        // Generates the HTML that goes before every other type of row generated by DayGrid.
        // Affects mirror-skeleton and highlight-skeleton rows.
        SubClass.prototype.renderIntroHtml = function () {
            var view = this.view;
            if (view.colWeekNumbersVisible) {
                return '<td class="fc-week-number" ' + view.weekNumberStyleAttr() + '></td>';
            }
            return '';
        };
        SubClass.prototype.getIsNumbersVisible = function () {
            var view = this.view;
            return DayGrid_1.default.prototype.getIsNumbersVisible.apply(this, arguments) || view.colWeekNumbersVisible;
        };
        return SubClass;
    }(SuperClass));
}


/***/ }),
/* 64 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_64__;

/***/ }),
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */,
/* 131 */,
/* 132 */,
/* 133 */,
/* 134 */,
/* 135 */,
/* 136 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
function removeMatching(array, testFunc) {
    var removeCnt = 0;
    var i = 0;
    while (i < array.length) {
        if (testFunc(array[i])) { // truthy value means *remove*
            array.splice(i, 1);
            removeCnt++;
        }
        else {
            i++;
        }
    }
    return removeCnt;
}
exports.removeMatching = removeMatching;
function removeExact(array, exactVal) {
    var removeCnt = 0;
    var i = 0;
    while (i < array.length) {
        if (array[i] === exactVal) {
            array.splice(i, 1);
            removeCnt++;
        }
        else {
            i++;
        }
    }
    return removeCnt;
}
exports.removeExact = removeExact;
function isArraysEqual(a0, a1) {
    var len = a0.length;
    var i;
    if (len == null || len !== a1.length) { // not array? or not same length?
        return false;
    }
    for (i = 0; i < len; i++) {
        if (a0[i] !== a1[i]) {
            return false;
        }
    }
    return true;
}
exports.isArraysEqual = isArraysEqual;


/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var Theme_1 = __webpack_require__(27);
var StandardTheme = /** @class */ (function (_super) {
    tslib_1.__extends(StandardTheme, _super);
    function StandardTheme() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return StandardTheme;
}(Theme_1.default));
exports.default = StandardTheme;
StandardTheme.prototype.classes = {
    widget: 'fc-unthemed',
    widgetHeader: 'fc-widget-header',
    widgetContent: 'fc-widget-content',
    buttonGroup: 'fc-button-group',
    button: 'fc-button',
    cornerLeft: 'fc-corner-left',
    cornerRight: 'fc-corner-right',
    stateDefault: 'fc-state-default',
    stateActive: 'fc-state-active',
    stateDisabled: 'fc-state-disabled',
    stateHover: 'fc-state-hover',
    stateDown: 'fc-state-down',
    popoverHeader: 'fc-widget-header',
    popoverContent: 'fc-widget-content',
    // day grid
    headerRow: 'fc-widget-header',
    dayRow: 'fc-widget-content',
    // list view
    listView: 'fc-widget-content'
};
StandardTheme.prototype.baseIconClass = 'fc-icon';
StandardTheme.prototype.iconClasses = {
    close: 'fc-icon-x',
    prev: 'fc-icon-left-single-arrow',
    next: 'fc-icon-right-single-arrow',
    prevYear: 'fc-icon-left-double-arrow',
    nextYear: 'fc-icon-right-double-arrow'
};
StandardTheme.prototype.iconOverrideOption = 'buttonIcons';
StandardTheme.prototype.iconOverrideCustomButtonOption = 'icon';
StandardTheme.prototype.iconOverridePrefix = 'fc-icon-';


/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var Theme_1 = __webpack_require__(27);
var JqueryUiTheme = /** @class */ (function (_super) {
    tslib_1.__extends(JqueryUiTheme, _super);
    function JqueryUiTheme() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return JqueryUiTheme;
}(Theme_1.default));
exports.default = JqueryUiTheme;
JqueryUiTheme.prototype.classes = {
    widget: 'ui-widget',
    widgetHeader: 'ui-widget-header',
    widgetContent: 'ui-widget-content',
    buttonGroup: 'fc-button-group',
    button: 'ui-button',
    cornerLeft: 'ui-corner-left',
    cornerRight: 'ui-corner-right',
    stateDefault: 'ui-state-default',
    stateActive: 'ui-state-active',
    stateDisabled: 'ui-state-disabled',
    stateHover: 'ui-state-hover',
    stateDown: 'ui-state-down',
    today: 'ui-state-highlight',
    popoverHeader: 'ui-widget-header',
    popoverContent: 'ui-widget-content',
    // day grid
    headerRow: 'ui-widget-header',
    dayRow: 'ui-widget-content',
    // list view
    listView: 'ui-widget-content'
};
JqueryUiTheme.prototype.baseIconClass = 'ui-icon';
JqueryUiTheme.prototype.iconClasses = {
    close: 'ui-icon-closethick',
    prev: 'ui-icon-circle-triangle-w',
    next: 'ui-icon-circle-triangle-e',
    prevYear: 'ui-icon-seek-prev',
    nextYear: 'ui-icon-seek-next'
};
JqueryUiTheme.prototype.iconOverrideOption = 'themeButtonIcons';
JqueryUiTheme.prototype.iconOverrideCustomButtonOption = 'themeIcon';
JqueryUiTheme.prototype.iconOverridePrefix = 'ui-icon-';


/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
/*
An object for getting/setting scroll-related information for an element.
Internally, this is done very differently for window versus DOM element,
so this object serves as a common interface.
*/
var ScrollController = /** @class */ (function () {
    function ScrollController() {
    }
    ScrollController.prototype.getMaxScrollTop = function () {
        return this.getScrollHeight() - this.getClientHeight();
    };
    ScrollController.prototype.getMaxScrollLeft = function () {
        return this.getScrollWidth() - this.getClientWidth();
    };
    ScrollController.prototype.canScrollVertically = function () {
        return this.getMaxScrollTop() > 0;
    };
    ScrollController.prototype.canScrollHorizontally = function () {
        return this.getMaxScrollLeft() > 0;
    };
    ScrollController.prototype.canScrollUp = function () {
        return this.getScrollTop() > 0;
    };
    ScrollController.prototype.canScrollDown = function () {
        return this.getScrollTop() < this.getMaxScrollTop();
    };
    ScrollController.prototype.canScrollLeft = function () {
        return this.getScrollLeft() > 0;
    };
    ScrollController.prototype.canScrollRight = function () {
        return this.getScrollLeft() < this.getMaxScrollLeft();
    };
    return ScrollController;
}());
exports.ScrollController = ScrollController;
var ElementScrollController = /** @class */ (function (_super) {
    tslib_1.__extends(ElementScrollController, _super);
    function ElementScrollController(el) {
        var _this = _super.call(this) || this;
        _this.el = el;
        return _this;
    }
    ElementScrollController.prototype.getScrollTop = function () {
        return this.el.scrollTop;
    };
    ElementScrollController.prototype.getScrollLeft = function () {
        return this.el.scrollLeft;
    };
    ElementScrollController.prototype.setScrollTop = function (top) {
        this.el.scrollTop = top;
    };
    ElementScrollController.prototype.setScrollLeft = function (left) {
        this.el.scrollLeft = left;
    };
    ElementScrollController.prototype.getScrollWidth = function () {
        return this.el.scrollWidth;
    };
    ElementScrollController.prototype.getScrollHeight = function () {
        return this.el.scrollHeight;
    };
    ElementScrollController.prototype.getClientHeight = function () {
        return this.el.clientHeight;
    };
    ElementScrollController.prototype.getClientWidth = function () {
        return this.el.clientWidth;
    };
    return ElementScrollController;
}(ScrollController));
exports.ElementScrollController = ElementScrollController;
var WindowScrollController = /** @class */ (function (_super) {
    tslib_1.__extends(WindowScrollController, _super);
    function WindowScrollController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WindowScrollController.prototype.getScrollTop = function () {
        return window.pageYOffset;
    };
    WindowScrollController.prototype.getScrollLeft = function () {
        return window.pageXOffset;
    };
    WindowScrollController.prototype.setScrollTop = function (n) {
        window.scroll(window.pageXOffset, n);
    };
    WindowScrollController.prototype.setScrollLeft = function (n) {
        window.scroll(n, window.pageYOffset);
    };
    WindowScrollController.prototype.getScrollWidth = function () {
        return document.documentElement.scrollWidth;
    };
    WindowScrollController.prototype.getScrollHeight = function () {
        return document.documentElement.scrollHeight;
    };
    WindowScrollController.prototype.getClientHeight = function () {
        return document.documentElement.clientHeight;
    };
    WindowScrollController.prototype.getClientWidth = function () {
        return document.documentElement.clientWidth;
    };
    return WindowScrollController;
}(ScrollController));
exports.WindowScrollController = WindowScrollController;


/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var dom_manip_1 = __webpack_require__(3);
var Component = /** @class */ (function () {
    function Component() {
    }
    Component.prototype.setElement = function (el) {
        this.el = el;
        this.bindGlobalHandlers();
    };
    Component.prototype.removeElement = function () {
        this.unbindGlobalHandlers();
        dom_manip_1.removeElement(this.el);
        // NOTE: don't null-out this.el in case the View was destroyed within an API callback.
        // We don't null-out the View's other element references upon destroy,
        //  so we shouldn't kill this.el either.
    };
    Component.prototype.bindGlobalHandlers = function () {
    };
    Component.prototype.unbindGlobalHandlers = function () {
    };
    return Component;
}());
exports.default = Component;


/***/ }),
/* 141 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var EventSourceApi = /** @class */ (function () {
    function EventSourceApi(calendar, internalEventSource) {
        this.calendar = calendar;
        this.internalEventSource = internalEventSource;
    }
    EventSourceApi.prototype.remove = function () {
        this.calendar.dispatch({
            type: 'REMOVE_EVENT_SOURCE',
            sourceId: this.internalEventSource.sourceId
        });
    };
    EventSourceApi.prototype.refetch = function () {
        this.calendar.dispatch({
            type: 'FETCH_EVENT_SOURCES',
            sourceIds: [this.internalEventSource.sourceId]
        });
    };
    Object.defineProperty(EventSourceApi.prototype, "id", {
        get: function () {
            return this.internalEventSource.publicId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventSourceApi.prototype, "url", {
        // only relevant to json-feed event sources
        get: function () {
            return this.internalEventSource.meta.url;
        },
        enumerable: true,
        configurable: true
    });
    return EventSourceApi;
}());
exports.default = EventSourceApi;


/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var dom_geom_1 = __webpack_require__(13);
var scroll_controller_1 = __webpack_require__(139);
/*
Is a cache for a given element's scroll information (all the info that ScrollController stores)
in addition the "client rectangle" of the element.. the area within the scrollbars.

The cache can be in one of two modes:
- doesListening:false - ignores when the container is scrolled by someone else
- doesListening:true - watch for scrolling and update the cache
*/
var ScrollGeomCache = /** @class */ (function (_super) {
    tslib_1.__extends(ScrollGeomCache, _super);
    function ScrollGeomCache(scrollController, doesListening) {
        var _this = _super.call(this) || this;
        _this.handleScroll = function () {
            _this.scrollTop = _this.scrollController.getScrollTop();
            _this.scrollLeft = _this.scrollController.getScrollLeft();
            _this.handleScrollChange();
        };
        _this.scrollController = scrollController;
        _this.doesListening = doesListening;
        _this.scrollTop = _this.origScrollTop = scrollController.getScrollTop();
        _this.scrollLeft = _this.origScrollLeft = scrollController.getScrollLeft();
        _this.scrollWidth = scrollController.getScrollWidth();
        _this.scrollHeight = scrollController.getScrollHeight();
        _this.clientWidth = scrollController.getClientWidth();
        _this.clientHeight = scrollController.getClientHeight();
        _this.clientRect = _this.computeClientRect(); // do last in case it needs cached values
        if (_this.doesListening) {
            _this.getEventTarget().addEventListener('scroll', _this.handleScroll);
        }
        return _this;
    }
    ScrollGeomCache.prototype.destroy = function () {
        if (this.doesListening) {
            this.getEventTarget().removeEventListener('scroll', this.handleScroll);
        }
    };
    ScrollGeomCache.prototype.getScrollTop = function () {
        return this.scrollTop;
    };
    ScrollGeomCache.prototype.getScrollLeft = function () {
        return this.scrollLeft;
    };
    ScrollGeomCache.prototype.setScrollTop = function (top) {
        this.scrollController.setScrollTop(top);
        if (!this.doesListening) {
            // we are not relying on the element to normalize out-of-bounds scroll values
            // so we need to sanitize ourselves
            this.scrollTop = Math.max(Math.min(top, this.getMaxScrollTop()), 0);
            this.handleScrollChange();
        }
    };
    ScrollGeomCache.prototype.setScrollLeft = function (top) {
        this.scrollController.setScrollLeft(top);
        if (!this.doesListening) {
            // we are not relying on the element to normalize out-of-bounds scroll values
            // so we need to sanitize ourselves
            this.scrollLeft = Math.max(Math.min(top, this.getMaxScrollLeft()), 0);
            this.handleScrollChange();
        }
    };
    ScrollGeomCache.prototype.getClientWidth = function () {
        return this.clientWidth;
    };
    ScrollGeomCache.prototype.getClientHeight = function () {
        return this.clientHeight;
    };
    ScrollGeomCache.prototype.getScrollWidth = function () {
        return this.scrollWidth;
    };
    ScrollGeomCache.prototype.getScrollHeight = function () {
        return this.scrollHeight;
    };
    ScrollGeomCache.prototype.handleScrollChange = function () {
    };
    return ScrollGeomCache;
}(scroll_controller_1.ScrollController));
exports.ScrollGeomCache = ScrollGeomCache;
var ElementScrollGeomCache = /** @class */ (function (_super) {
    tslib_1.__extends(ElementScrollGeomCache, _super);
    function ElementScrollGeomCache(el, doesListening) {
        return _super.call(this, new scroll_controller_1.ElementScrollController(el), doesListening) || this;
    }
    ElementScrollGeomCache.prototype.getEventTarget = function () {
        return this.scrollController.el;
    };
    ElementScrollGeomCache.prototype.computeClientRect = function () {
        return dom_geom_1.computeInnerRect(this.scrollController.el);
    };
    return ElementScrollGeomCache;
}(ScrollGeomCache));
exports.ElementScrollGeomCache = ElementScrollGeomCache;
var WindowScrollGeomCache = /** @class */ (function (_super) {
    tslib_1.__extends(WindowScrollGeomCache, _super);
    function WindowScrollGeomCache(doesListening) {
        return _super.call(this, new scroll_controller_1.WindowScrollController(), doesListening) || this;
    }
    WindowScrollGeomCache.prototype.getEventTarget = function () {
        return window;
    };
    WindowScrollGeomCache.prototype.computeClientRect = function () {
        return {
            left: this.scrollLeft,
            right: this.scrollLeft + this.clientWidth,
            top: this.scrollTop,
            bottom: this.scrollTop + this.clientHeight
        };
    };
    // the window is the only scroll object that changes it's rectangle relative
    // to the document's topleft as it scrolls
    WindowScrollGeomCache.prototype.handleScrollChange = function () {
        this.clientRect = this.computeClientRect();
    };
    return WindowScrollGeomCache;
}(ScrollGeomCache));
exports.WindowScrollGeomCache = WindowScrollGeomCache;


/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var EventRenderer_1 = __webpack_require__(18);
var HitDragging_1 = __webpack_require__(31);
var event_mutation_1 = __webpack_require__(55);
var browser_context_1 = __webpack_require__(53);
var marker_1 = __webpack_require__(6);
var dom_manip_1 = __webpack_require__(3);
var FeaturefulElementDragging_1 = __webpack_require__(30);
var event_store_1 = __webpack_require__(14);
var misc_1 = __webpack_require__(2);
var EventApi_1 = __webpack_require__(15);
var EventDragging = /** @class */ (function () {
    function EventDragging(component) {
        var _this = this;
        // internal state
        this.subjectSeg = null; // the seg being selected/dragged
        this.isDragging = false;
        this.eventRange = null;
        this.relevantEvents = null;
        this.receivingCalendar = null;
        this.validMutation = null;
        this.mutatedRelevantEvents = null;
        this.handlePointerDown = function (ev) {
            var origTarget = ev.origEvent.target;
            var _a = _this, component = _a.component, dragging = _a.dragging;
            var mirror = dragging.mirror;
            var initialCalendar = component.getCalendar();
            var subjectSeg = _this.subjectSeg = EventRenderer_1.getElSeg(ev.subjectEl);
            var eventRange = _this.eventRange = subjectSeg.eventRange;
            var eventInstanceId = eventRange.instance.instanceId;
            _this.relevantEvents = event_store_1.getRelevantEvents(initialCalendar.state.eventStore, eventInstanceId);
            dragging.minDistance = ev.isTouch ? 0 : component.opt('eventDragMinDistance');
            dragging.delay =
                // only do a touch delay if touch and this event hasn't been selected yet
                (ev.isTouch && eventInstanceId !== component.eventSelection) ?
                    getComponentTouchDelay(component) :
                    null;
            mirror.parentNode = initialCalendar.el;
            mirror.revertDuration = component.opt('dragRevertDuration');
            var isValid = _this.component.isValidSegDownEl(origTarget) &&
                !dom_manip_1.elementClosest(origTarget, '.fc-resizer');
            dragging.setIgnoreMove(!isValid);
            // disable dragging for elements that are resizable (ie, selectable)
            // but are not draggable
            _this.isDragging = isValid &&
                ev.subjectEl.classList.contains('fc-draggable');
        };
        this.handleDragStart = function (ev) {
            var initialCalendar = _this.component.getCalendar();
            var eventRange = _this.eventRange;
            var eventInstanceId = eventRange.instance.instanceId;
            if (ev.isTouch) {
                // need to select a different event?
                if (eventInstanceId !== _this.component.eventSelection) {
                    initialCalendar.dispatch({ type: 'SELECT_EVENT', eventInstanceId: eventInstanceId });
                }
            }
            else {
                // if now using mouse, but was previous touch interaction, clear selected event
                initialCalendar.dispatch({ type: 'UNSELECT_EVENT' });
            }
            if (_this.isDragging) {
                initialCalendar.unselect(ev); // unselect *date* selection
                initialCalendar.publiclyTrigger('eventDragStart', [
                    {
                        el: _this.subjectSeg.el,
                        event: new EventApi_1.default(initialCalendar, eventRange.def, eventRange.instance),
                        jsEvent: ev.origEvent,
                        view: _this.component.view
                    }
                ]);
            }
        };
        this.handleHitUpdate = function (hit, isFinal) {
            if (!_this.isDragging) {
                return;
            }
            var relevantEvents = _this.relevantEvents;
            var initialHit = _this.hitDragging.initialHit;
            var initialCalendar = _this.component.getCalendar();
            // states based on new hit
            var receivingCalendar = null;
            var mutation = null;
            var mutatedRelevantEvents = null;
            var isInvalid = false;
            if (hit) {
                var receivingComponent = hit.component;
                receivingCalendar = receivingComponent.getCalendar();
                if (initialCalendar === receivingCalendar ||
                    receivingComponent.opt('editable') && receivingComponent.opt('droppable')) {
                    mutation = computeEventMutation(initialHit, hit);
                    if (mutation) {
                        mutatedRelevantEvents = event_mutation_1.applyMutationToEventStore(relevantEvents, mutation, receivingCalendar);
                        if (!_this.component.isEventsValid(mutatedRelevantEvents)) {
                            isInvalid = true;
                            mutation = null;
                            mutatedRelevantEvents = null;
                        }
                    }
                }
                else {
                    receivingCalendar = null;
                }
            }
            _this.displayDrag(receivingCalendar, {
                affectedEvents: relevantEvents,
                mutatedEvents: mutatedRelevantEvents || event_store_1.createEmptyEventStore(),
                isEvent: true,
                origSeg: _this.subjectSeg
            });
            if (!isInvalid) {
                misc_1.enableCursor();
            }
            else {
                misc_1.disableCursor();
            }
            if (!isFinal) {
                if (initialCalendar === receivingCalendar && // TODO: write test for this
                    HitDragging_1.isHitsEqual(initialHit, hit)) {
                    mutation = null;
                }
                _this.dragging.setMirrorNeedsRevert(!mutation);
                // render the mirror if no already-rendered mirror
                // TODO: wish we could somehow wait for dispatch to guarantee render
                _this.dragging.setMirrorIsVisible(!hit || !document.querySelector('.fc-mirror'));
                // assign states based on new hit
                _this.receivingCalendar = receivingCalendar;
                _this.validMutation = mutation;
                _this.mutatedRelevantEvents = mutatedRelevantEvents;
            }
        };
        this.handlePointerUp = function () {
            if (!_this.isDragging) {
                _this.cleanup(); // because handleDragEnd won't fire
            }
        };
        this.handleDragEnd = function (ev) {
            if (_this.isDragging) {
                var initialCalendar_1 = _this.component.getCalendar();
                var initialView = _this.component.view;
                var receivingCalendar = _this.receivingCalendar;
                var eventDef = _this.eventRange.def;
                var eventInstance = _this.eventRange.instance;
                var eventApi = new EventApi_1.default(initialCalendar_1, eventDef, eventInstance);
                var relevantEvents_1 = _this.relevantEvents;
                var mutatedRelevantEvents = _this.mutatedRelevantEvents;
                _this.clearDrag(); // must happen after revert animation
                initialCalendar_1.publiclyTrigger('eventDragStop', [
                    {
                        el: _this.subjectSeg.el,
                        event: eventApi,
                        jsEvent: ev.origEvent,
                        view: initialView
                    }
                ]);
                if (_this.validMutation) {
                    // dropped within same calendar
                    if (receivingCalendar === initialCalendar_1) {
                        initialCalendar_1.dispatch({
                            type: 'MERGE_EVENTS',
                            eventStore: mutatedRelevantEvents
                        });
                        initialCalendar_1.publiclyTrigger('eventDrop', [
                            {
                                el: ev.subjectEl,
                                delta: _this.validMutation.startDelta,
                                prevEvent: eventApi,
                                event: new EventApi_1.default(// the data AFTER the mutation
                                initialCalendar_1, mutatedRelevantEvents.defs[eventDef.defId], eventInstance ? mutatedRelevantEvents.instances[eventInstance.instanceId] : null),
                                revert: function () {
                                    initialCalendar_1.dispatch({
                                        type: 'MERGE_EVENTS',
                                        eventStore: relevantEvents_1
                                    });
                                },
                                jsEvent: ev.origEvent,
                                view: initialView
                            }
                        ]);
                        // dropped in different calendar
                    }
                    else if (receivingCalendar) {
                        initialCalendar_1.publiclyTrigger('eventLeave', [
                            {
                                draggedEl: ev.subjectEl,
                                event: eventApi,
                                view: initialView
                            }
                        ]);
                        initialCalendar_1.dispatch({
                            type: 'REMOVE_EVENT_INSTANCES',
                            instances: _this.mutatedRelevantEvents.instances
                        });
                        receivingCalendar.dispatch({
                            type: 'MERGE_EVENTS',
                            eventStore: _this.mutatedRelevantEvents
                        });
                        if (ev.isTouch) {
                            receivingCalendar.dispatch({
                                type: 'SELECT_EVENT',
                                eventInstanceId: eventInstance.instanceId
                            });
                        }
                        receivingCalendar.publiclyTrigger('eventReceive', [
                            {
                                draggedEl: ev.subjectEl,
                                event: new EventApi_1.default(receivingCalendar, eventDef, eventInstance),
                                view: _this.hitDragging.finalHit.component
                            }
                        ]);
                    }
                }
                else {
                    initialCalendar_1.publiclyTrigger('_noEventDrop');
                }
            }
            _this.cleanup();
        };
        this.component = component;
        var dragging = this.dragging = new FeaturefulElementDragging_1.default(component.el);
        dragging.pointer.selector = EventDragging.SELECTOR;
        dragging.touchScrollAllowed = false;
        dragging.autoScroller.isEnabled = component.opt('dragScroll');
        var hitDragging = this.hitDragging = new HitDragging_1.default(this.dragging, browser_context_1.default.componentHash);
        hitDragging.useSubjectCenter = component.useEventCenter;
        hitDragging.emitter.on('pointerdown', this.handlePointerDown);
        hitDragging.emitter.on('dragstart', this.handleDragStart);
        hitDragging.emitter.on('hitupdate', this.handleHitUpdate);
        hitDragging.emitter.on('pointerup', this.handlePointerUp);
        hitDragging.emitter.on('dragend', this.handleDragEnd);
    }
    EventDragging.prototype.destroy = function () {
        this.dragging.destroy();
    };
    // render a drag state on the next receivingCalendar
    EventDragging.prototype.displayDrag = function (nextCalendar, state) {
        var initialCalendar = this.component.getCalendar();
        var prevCalendar = this.receivingCalendar;
        // does the previous calendar need to be cleared?
        if (prevCalendar && prevCalendar !== nextCalendar) {
            // does the initial calendar need to be cleared?
            // if so, don't clear all the way. we still need to to hide the affectedEvents
            if (prevCalendar === initialCalendar) {
                prevCalendar.dispatch({
                    type: 'SET_EVENT_DRAG',
                    state: {
                        affectedEvents: state.affectedEvents,
                        mutatedEvents: event_store_1.createEmptyEventStore(),
                        isEvent: true,
                        origSeg: state.origSeg
                    }
                });
                // completely clear the old calendar if it wasn't the initial
            }
            else {
                prevCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' });
            }
        }
        if (nextCalendar) {
            nextCalendar.dispatch({ type: 'SET_EVENT_DRAG', state: state });
        }
    };
    EventDragging.prototype.clearDrag = function () {
        var initialCalendar = this.component.getCalendar();
        var receivingCalendar = this.receivingCalendar;
        if (receivingCalendar) {
            receivingCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' });
        }
        // the initial calendar might have an dummy drag state from displayDrag
        if (initialCalendar !== receivingCalendar) {
            initialCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' });
        }
    };
    EventDragging.prototype.cleanup = function () {
        this.subjectSeg = null;
        this.isDragging = false;
        this.eventRange = null;
        this.relevantEvents = null;
        this.receivingCalendar = null;
        this.validMutation = null;
        this.mutatedRelevantEvents = null;
    };
    EventDragging.SELECTOR = '.fc-draggable, .fc-resizable'; // TODO: test this in IE11
    return EventDragging;
}());
exports.default = EventDragging;
function computeEventMutation(hit0, hit1) {
    var dateSpan0 = hit0.dateSpan;
    var dateSpan1 = hit1.dateSpan;
    var date0 = dateSpan0.range.start;
    var date1 = dateSpan1.range.start;
    var standardProps = null;
    if (dateSpan0.allDay !== dateSpan1.allDay) {
        standardProps = {
            allDay: dateSpan1.allDay,
            hasEnd: hit1.component.opt('allDayMaintainDuration')
        };
        if (dateSpan1.allDay) {
            // means date1 is already start-of-day,
            // but date0 needs to be converted
            date0 = marker_1.startOfDay(date0);
        }
    }
    var delta = misc_1.diffDates(date0, date1, hit0.component.getDateEnv(), hit0.component === hit1.component ?
        hit0.component.largeUnit :
        null);
    return {
        startDelta: delta,
        endDelta: delta,
        standardProps: standardProps
    };
}
function getComponentTouchDelay(component) {
    var delay = component.opt('eventLongPressDelay');
    if (delay == null) {
        delay = component.opt('longPressDelay');
    }
    return delay;
}


/***/ }),
/* 144 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var NamedTimeZoneImpl = /** @class */ (function () {
    function NamedTimeZoneImpl(name) {
        this.name = name;
    }
    return NamedTimeZoneImpl;
}());
exports.NamedTimeZoneImpl = NamedTimeZoneImpl;
var namedTimeZonedImpls = {};
function registerNamedTimeZoneImpl(implName, theClass) {
    namedTimeZonedImpls[implName] = theClass;
}
exports.registerNamedTimeZoneImpl = registerNamedTimeZoneImpl;
function createNamedTimeZoneImpl(implName, tzName) {
    var theClass = namedTimeZonedImpls[implName];
    if (theClass) {
        return new theClass(tzName);
    }
    return null;
}
exports.createNamedTimeZoneImpl = createNamedTimeZoneImpl;


/***/ }),
/* 145 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var ISO_START = /^\s*\d{4}-\d\d-\d\d([T ]\d)?/;
var ISO_TZO_RE = /(?:(Z)|([-+])(\d\d)(?::(\d\d))?)$/;
function parse(str) {
    var timeZoneOffset = null;
    var isTimeUnspecified = false;
    var m = ISO_START.exec(str);
    if (m) {
        isTimeUnspecified = !m[1];
        if (isTimeUnspecified) {
            str += 'T00:00:00Z';
        }
        else {
            str = str.replace(ISO_TZO_RE, function (whole, z, sign, minutes, seconds) {
                if (z) {
                    timeZoneOffset = 0;
                }
                else {
                    timeZoneOffset = (parseInt(minutes, 10) * 60 +
                        parseInt(seconds || 0, 10)) * (sign === '-' ? -1 : 1);
                }
                return '';
            }) + 'Z'; // otherwise will parse in local
        }
    }
    var marker = new Date(str);
    if (isNaN(marker.valueOf())) {
        return null;
    }
    return {
        marker: marker,
        isTimeUnspecified: isTimeUnspecified,
        timeZoneOffset: timeZoneOffset
    };
}
exports.parse = parse;


/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var html_1 = __webpack_require__(9);
var object_1 = __webpack_require__(4);
var dom_manip_1 = __webpack_require__(3);
var misc_1 = __webpack_require__(2);
var ScrollComponent_1 = __webpack_require__(37);
var View_1 = __webpack_require__(42);
var TimeGrid_1 = __webpack_require__(147);
var DayGrid_1 = __webpack_require__(62);
var duration_1 = __webpack_require__(10);
var formatting_1 = __webpack_require__(8);
var event_store_1 = __webpack_require__(14);
var reselector_1 = __webpack_require__(51);
var event_rendering_1 = __webpack_require__(28);
var AGENDA_ALL_DAY_EVENT_LIMIT = 5;
var WEEK_HEADER_FORMAT = formatting_1.createFormatter({ week: 'short' });
var agendaTimeGridMethods;
var agendaDayGridMethods;
/* An abstract class for all agenda-related views. Displays one more columns with time slots running vertically.
----------------------------------------------------------------------------------------------------------------------*/
// Is a manager for the TimeGrid subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
// Responsible for managing width/height.
var AgendaView = /** @class */ (function (_super) {
    tslib_1.__extends(AgendaView, _super);
    function AgendaView(calendar, viewSpec) {
        var _this = _super.call(this, calendar, viewSpec) || this;
        _this.usesMinMaxTime = true; // indicates that minTime/maxTime affects rendering
        _this.timeGrid = _this.instantiateTimeGrid();
        _this.addChild(_this.timeGrid);
        if (_this.opt('allDaySlot')) { // should we display the "all-day" area?
            _this.dayGrid = _this.instantiateDayGrid(); // the all-day subcomponent of this view
            _this.addChild(_this.dayGrid);
        }
        _this.scroller = new ScrollComponent_1.default('hidden', // overflow x
        'auto' // overflow y
        );
        _this.filterEventsForTimeGrid = reselector_1.default(filterEventsForTimeGrid);
        _this.filterEventsForDayGrid = reselector_1.default(filterEventsForDayGrid);
        _this.buildEventDragForTimeGrid = reselector_1.default(buildInteractionForTimeGrid);
        _this.buildEventDragForDayGrid = reselector_1.default(buildInteractionForDayGrid);
        _this.buildEventResizeForTimeGrid = reselector_1.default(buildInteractionForTimeGrid);
        _this.buildEventResizeForDayGrid = reselector_1.default(buildInteractionForDayGrid);
        return _this;
    }
    // Instantiates the TimeGrid object this view needs. Draws from this.timeGridClass
    AgendaView.prototype.instantiateTimeGrid = function () {
        var timeGrid = new this.timeGridClass(this);
        object_1.copyOwnProps(agendaTimeGridMethods, timeGrid);
        return timeGrid;
    };
    // Instantiates the DayGrid object this view might need. Draws from this.dayGridClass
    AgendaView.prototype.instantiateDayGrid = function () {
        var dayGrid = new this.dayGridClass(this);
        object_1.copyOwnProps(agendaDayGridMethods, dayGrid);
        return dayGrid;
    };
    /* Rendering
    ------------------------------------------------------------------------------------------------------------------*/
    AgendaView.prototype.renderSkeleton = function () {
        var timeGridWrapEl;
        var timeGridEl;
        this.el.classList.add('fc-agenda-view');
        this.el.innerHTML = this.renderSkeletonHtml();
        this.scroller.applyOverflow();
        timeGridWrapEl = this.scroller.el;
        timeGridWrapEl.classList.add('fc-time-grid-container');
        timeGridEl = dom_manip_1.createElement('div', { className: 'fc-time-grid' });
        timeGridWrapEl.appendChild(timeGridEl);
        this.el.querySelector('.fc-body > tr > td').appendChild(timeGridWrapEl);
        this.timeGrid.headContainerEl = this.el.querySelector('.fc-head-container');
        this.timeGrid.setElement(timeGridEl);
        if (this.dayGrid) {
            this.dayGrid.setElement(this.el.querySelector('.fc-day-grid'));
            // have the day-grid extend it's coordinate area over the <hr> dividing the two grids
            this.dayGrid.bottomCoordPadding = this.el.querySelector('.fc-divider').offsetHeight;
        }
    };
    AgendaView.prototype.unrenderSkeleton = function () {
        this.timeGrid.removeElement();
        if (this.dayGrid) {
            this.dayGrid.removeElement();
        }
        this.scroller.removeElement();
    };
    // Builds the HTML skeleton for the view.
    // The day-grid and time-grid components will render inside containers defined by this HTML.
    AgendaView.prototype.renderSkeletonHtml = function () {
        var theme = this.getTheme();
        return '' +
            '<table class="' + theme.getClass('tableGrid') + '">' +
            (this.opt('columnHeader') ?
                '<thead class="fc-head">' +
                    '<tr>' +
                    '<td class="fc-head-container ' + theme.getClass('widgetHeader') + '">&nbsp;</td>' +
                    '</tr>' +
                    '</thead>' :
                '') +
            '<tbody class="fc-body">' +
            '<tr>' +
            '<td class="' + theme.getClass('widgetContent') + '">' +
            (this.dayGrid ?
                '<div class="fc-day-grid"></div>' +
                    '<hr class="fc-divider ' + theme.getClass('widgetHeader') + '" />' :
                '') +
            '</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>';
    };
    // Generates an HTML attribute string for setting the width of the axis, if it is known
    AgendaView.prototype.axisStyleAttr = function () {
        if (this.axisWidth != null) {
            return 'style="width:' + this.axisWidth + 'px"';
        }
        return '';
    };
    /* Render Delegation
    ------------------------------------------------------------------------------------------------------------------*/
    AgendaView.prototype.renderChildren = function (renderState, forceFlags) {
        var allDaySeletion = null;
        var timedSelection = null;
        if (renderState.dateSelection) {
            if (renderState.dateSelection.allDay) {
                allDaySeletion = renderState.dateSelection;
            }
            else {
                timedSelection = renderState.dateSelection;
            }
        }
        this.timeGrid.render({
            dateProfile: renderState.dateProfile,
            eventStore: this.filterEventsForTimeGrid(renderState.eventStore, renderState.eventUis),
            eventUis: renderState.eventUis,
            dateSelection: timedSelection,
            eventSelection: renderState.eventSelection,
            eventDrag: this.buildEventDragForTimeGrid(renderState.eventDrag),
            eventResize: this.buildEventResizeForTimeGrid(renderState.eventResize),
            businessHours: renderState.businessHours
        }, forceFlags);
        if (this.dayGrid) {
            this.dayGrid.render({
                dateProfile: renderState.dateProfile,
                eventStore: this.filterEventsForDayGrid(renderState.eventStore, renderState.eventUis),
                eventUis: renderState.eventUis,
                dateSelection: allDaySeletion,
                eventSelection: renderState.eventSelection,
                eventDrag: this.buildEventDragForDayGrid(renderState.eventDrag),
                eventResize: this.buildEventResizeForDayGrid(renderState.eventResize),
                businessHours: renderState.businessHours
            }, forceFlags);
        }
    };
    /* Now Indicator
    ------------------------------------------------------------------------------------------------------------------*/
    AgendaView.prototype.getNowIndicatorUnit = function () {
        return this.timeGrid.getNowIndicatorUnit();
    };
    /* Dimensions
    ------------------------------------------------------------------------------------------------------------------*/
    // Adjusts the vertical dimensions of the view to the specified values
    AgendaView.prototype.updateBaseSize = function (totalHeight, isAuto) {
        var _this = this;
        var eventLimit;
        var scrollerHeight;
        var scrollbarWidths;
        // make all axis cells line up, and record the width so newly created axis cells will have it
        this.axisWidth = misc_1.matchCellWidths(dom_manip_1.findElements(this.el, '.fc-axis'));
        // hack to give the view some height prior to timeGrid's columns being rendered
        // TODO: separate setting height from scroller VS timeGrid.
        if (!this.timeGrid.colEls) {
            if (!isAuto) {
                scrollerHeight = this.computeScrollerHeight(totalHeight);
                this.scroller.setHeight(scrollerHeight);
            }
            return;
        }
        // set of fake row elements that must compensate when scroller has scrollbars
        var noScrollRowEls = dom_manip_1.findElements(this.el, '.fc-row').filter(function (node) {
            return !_this.scroller.el.contains(node);
        });
        // reset all dimensions back to the original state
        this.timeGrid.bottomRuleEl.style.display = 'none'; // will be shown later if this <hr> is necessary
        this.scroller.clear(); // sets height to 'auto' and clears overflow
        noScrollRowEls.forEach(misc_1.uncompensateScroll);
        // limit number of events in the all-day area
        if (this.dayGrid) {
            this.dayGrid.removeSegPopover(); // kill the "more" popover if displayed
            eventLimit = this.opt('eventLimit');
            if (eventLimit && typeof eventLimit !== 'number') {
                eventLimit = AGENDA_ALL_DAY_EVENT_LIMIT; // make sure "auto" goes to a real number
            }
            if (eventLimit) {
                this.dayGrid.limitRows(eventLimit);
            }
        }
        if (!isAuto) { // should we force dimensions of the scroll container?
            scrollerHeight = this.computeScrollerHeight(totalHeight);
            this.scroller.setHeight(scrollerHeight);
            scrollbarWidths = this.scroller.getScrollbarWidths();
            if (scrollbarWidths.left || scrollbarWidths.right) { // using scrollbars?
                // make the all-day and header rows lines up
                noScrollRowEls.forEach(function (rowEl) {
                    misc_1.compensateScroll(rowEl, scrollbarWidths);
                });
                // the scrollbar compensation might have changed text flow, which might affect height, so recalculate
                // and reapply the desired height to the scroller.
                scrollerHeight = this.computeScrollerHeight(totalHeight);
                this.scroller.setHeight(scrollerHeight);
            }
            // guarantees the same scrollbar widths
            this.scroller.lockOverflow(scrollbarWidths);
            // if there's any space below the slats, show the horizontal rule.
            // this won't cause any new overflow, because lockOverflow already called.
            if (this.timeGrid.getTotalSlatHeight() < scrollerHeight) {
                this.timeGrid.bottomRuleEl.style.display = '';
            }
        }
    };
    // given a desired total height of the view, returns what the height of the scroller should be
    AgendaView.prototype.computeScrollerHeight = function (totalHeight) {
        return totalHeight -
            misc_1.subtractInnerElHeight(this.el, this.scroller.el); // everything that's NOT the scroller
    };
    /* Scroll
    ------------------------------------------------------------------------------------------------------------------*/
    // Computes the initial pre-configured scroll state prior to allowing the user to change it
    AgendaView.prototype.computeInitialDateScroll = function () {
        var scrollTime = duration_1.createDuration(this.opt('scrollTime'));
        var top = this.timeGrid.computeTimeTop(scrollTime.milliseconds);
        // zoom can give weird floating-point values. rather scroll a little bit further
        top = Math.ceil(top);
        if (top) {
            top++; // to overcome top border that slots beyond the first have. looks better
        }
        return { top: top };
    };
    AgendaView.prototype.queryDateScroll = function () {
        return { top: this.scroller.getScrollTop() };
    };
    AgendaView.prototype.applyDateScroll = function (scroll) {
        if (scroll.top !== undefined) {
            this.scroller.setScrollTop(scroll.top);
        }
    };
    return AgendaView;
}(View_1.default));
exports.default = AgendaView;
AgendaView.prototype.timeGridClass = TimeGrid_1.default;
AgendaView.prototype.dayGridClass = DayGrid_1.default;
// Will customize the rendering behavior of the AgendaView's timeGrid
agendaTimeGridMethods = {
    // Generates the HTML that will go before the day-of week header cells
    renderHeadIntroHtml: function () {
        var view = this.view;
        var calendar = view.calendar;
        var dateEnv = calendar.dateEnv;
        var weekStart = this.dateProfile.renderRange.start;
        var weekText;
        if (this.opt('weekNumbers')) {
            weekText = dateEnv.format(weekStart, WEEK_HEADER_FORMAT);
            return '' +
                '<th class="fc-axis fc-week-number ' + calendar.theme.getClass('widgetHeader') + '" ' + view.axisStyleAttr() + '>' +
                view.buildGotoAnchorHtml(// aside from link, important for matchCellWidths
                { date: weekStart, type: 'week', forceOff: this.colCnt > 1 }, html_1.htmlEscape(weekText) // inner HTML
                ) +
                '</th>';
        }
        else {
            return '<th class="fc-axis ' + calendar.theme.getClass('widgetHeader') + '" ' + view.axisStyleAttr() + '></th>';
        }
    },
    // Generates the HTML that goes before the bg of the TimeGrid slot area. Long vertical column.
    renderBgIntroHtml: function () {
        var view = this.view;
        return '<td class="fc-axis ' + view.calendar.theme.getClass('widgetContent') + '" ' + view.axisStyleAttr() + '></td>';
    },
    // Generates the HTML that goes before all other types of cells.
    // Affects content-skeleton, mirror-skeleton, highlight-skeleton for both the time-grid and day-grid.
    renderIntroHtml: function () {
        var view = this.view;
        return '<td class="fc-axis" ' + view.axisStyleAttr() + '></td>';
    }
};
// Will customize the rendering behavior of the AgendaView's dayGrid
agendaDayGridMethods = {
    // Generates the HTML that goes before the all-day cells
    renderBgIntroHtml: function () {
        var view = this.view;
        return '' +
            '<td class="fc-axis ' + view.calendar.theme.getClass('widgetContent') + '" ' + view.axisStyleAttr() + '>' +
            '<span>' + // needed for matchCellWidths
            view.getAllDayHtml() +
            '</span>' +
            '</td>';
    },
    // Generates the HTML that goes before all other types of cells.
    // Affects content-skeleton, mirror-skeleton, highlight-skeleton for both the time-grid and day-grid.
    renderIntroHtml: function () {
        var view = this.view;
        return '<td class="fc-axis" ' + view.axisStyleAttr() + '></td>';
    }
};
function filterEventsForTimeGrid(eventStore, eventUis) {
    return event_store_1.filterEventStoreDefs(eventStore, function (eventDef) {
        return !eventDef.allDay || event_rendering_1.hasBgRendering(eventUis[eventDef.defId]);
    });
}
function filterEventsForDayGrid(eventStore, eventUis) {
    return event_store_1.filterEventStoreDefs(eventStore, function (eventDef) {
        return eventDef.allDay;
    });
}
function buildInteractionForTimeGrid(state) {
    if (state) {
        return {
            affectedEvents: state.affectedEvents,
            mutatedEvents: filterEventsForTimeGrid(state.mutatedEvents, state.eventUis),
            eventUis: state.eventUis,
            isEvent: state.isEvent,
            origSeg: state.origSeg
        };
    }
    return null;
}
function buildInteractionForDayGrid(state) {
    if (state) {
        return {
            affectedEvents: state.affectedEvents,
            mutatedEvents: filterEventsForDayGrid(state.mutatedEvents, state.eventUis),
            eventUis: state.eventUis,
            isEvent: state.isEvent,
            origSeg: state.origSeg
        };
    }
    return null;
}


/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var html_1 = __webpack_require__(9);
var dom_manip_1 = __webpack_require__(3);
var DayTableMixin_1 = __webpack_require__(58);
var PositionCache_1 = __webpack_require__(49);
var date_range_1 = __webpack_require__(11);
var TimeGridEventRenderer_1 = __webpack_require__(186);
var TimeGridMirrorRenderer_1 = __webpack_require__(187);
var TimeGridFillRenderer_1 = __webpack_require__(188);
var duration_1 = __webpack_require__(10);
var marker_1 = __webpack_require__(6);
var formatting_1 = __webpack_require__(8);
var DateComponent_1 = __webpack_require__(21);
var OffsetTracker_1 = __webpack_require__(61);
/* A component that renders one or more columns of vertical time slots
----------------------------------------------------------------------------------------------------------------------*/
// We mixin DayTable, even though there is only a single row of days
// potential nice values for the slot-duration and interval-duration
// from largest to smallest
var AGENDA_STOCK_SUB_DURATIONS = [
    { hours: 1 },
    { minutes: 30 },
    { minutes: 15 },
    { seconds: 30 },
    { seconds: 15 }
];
var TimeGrid = /** @class */ (function (_super) {
    tslib_1.__extends(TimeGrid, _super);
    function TimeGrid(view) {
        var _this = _super.call(this, view) || this;
        _this.isInteractable = true;
        _this.doesDragMirror = true;
        _this.doesDragHighlight = false;
        _this.slicingType = 'timed'; // stupid TypeScript
        _this.processOptions();
        return _this;
    }
    // Slices up the given span (unzoned start/end with other misc data) into an array of segments
    TimeGrid.prototype.rangeToSegs = function (range) {
        range = date_range_1.intersectRanges(range, this.dateProfile.validRange);
        if (range) {
            var segs = this.sliceRangeByTimes(range);
            var i = void 0;
            for (i = 0; i < segs.length; i++) {
                if (this.isRtl) {
                    segs[i].col = this.daysPerRow - 1 - segs[i].dayIndex;
                }
                else {
                    segs[i].col = segs[i].dayIndex;
                }
                segs[i].component = this;
            }
            return segs;
        }
        else {
            return [];
        }
    };
    /* Date Handling
    ------------------------------------------------------------------------------------------------------------------*/
    TimeGrid.prototype.sliceRangeByTimes = function (range) {
        var segs = [];
        var segRange;
        var dayIndex;
        for (dayIndex = 0; dayIndex < this.daysPerRow; dayIndex++) {
            segRange = date_range_1.intersectRanges(range, this.dayRanges[dayIndex]);
            if (segRange) {
                segs.push({
                    start: segRange.start,
                    end: segRange.end,
                    isStart: segRange.start.valueOf() === range.start.valueOf(),
                    isEnd: segRange.end.valueOf() === range.end.valueOf(),
                    dayIndex: dayIndex
                });
            }
        }
        return segs;
    };
    /* Options
    ------------------------------------------------------------------------------------------------------------------*/
    // Parses various options into properties of this object
    TimeGrid.prototype.processOptions = function () {
        var slotDuration = this.opt('slotDuration');
        var snapDuration = this.opt('snapDuration');
        var snapsPerSlot;
        var input;
        slotDuration = duration_1.createDuration(slotDuration);
        snapDuration = snapDuration ? duration_1.createDuration(snapDuration) : slotDuration;
        snapsPerSlot = duration_1.wholeDivideDurations(slotDuration, snapDuration);
        if (snapsPerSlot === null) {
            snapDuration = slotDuration;
            snapsPerSlot = 1;
            // TODO: say warning?
        }
        this.slotDuration = slotDuration;
        this.snapDuration = snapDuration;
        this.snapsPerSlot = snapsPerSlot;
        // might be an array value (for TimelineView).
        // if so, getting the most granular entry (the last one probably).
        input = this.opt('slotLabelFormat');
        if (Array.isArray(input)) {
            input = input[input.length - 1];
        }
        this.labelFormat = formatting_1.createFormatter(input || {
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: true,
            meridiem: 'short'
        });
        input = this.opt('slotLabelInterval');
        this.labelInterval = input ?
            duration_1.createDuration(input) :
            this.computeLabelInterval(slotDuration);
    };
    // Computes an automatic value for slotLabelInterval
    TimeGrid.prototype.computeLabelInterval = function (slotDuration) {
        var i;
        var labelInterval;
        var slotsPerLabel;
        // find the smallest stock label interval that results in more than one slots-per-label
        for (i = AGENDA_STOCK_SUB_DURATIONS.length - 1; i >= 0; i--) {
            labelInterval = duration_1.createDuration(AGENDA_STOCK_SUB_DURATIONS[i]);
            slotsPerLabel = duration_1.wholeDivideDurations(labelInterval, slotDuration);
            if (slotsPerLabel !== null && slotsPerLabel > 1) {
                return labelInterval;
            }
        }
        return slotDuration; // fall back
    };
    /* Date Rendering
    ------------------------------------------------------------------------------------------------------------------*/
    TimeGrid.prototype.renderDates = function () {
        this.updateDayTable();
        this.renderSlats();
        this.renderColumns();
    };
    TimeGrid.prototype.unrenderDates = function () {
        this.unrenderColumns();
        // we don't unrender slats because won't change between date navigation,
        // and if slat-related settings are changed, the whole component will be rerendered.
    };
    TimeGrid.prototype.renderSkeleton = function () {
        var theme = this.getTheme();
        this.el.innerHTML =
            '<div class="fc-bg"></div>' +
                '<div class="fc-slats"></div>' +
                '<hr class="fc-divider ' + theme.getClass('widgetHeader') + '" style="display:none" />';
        this.rootBgContainerEl = this.el.querySelector('.fc-bg');
        this.slatContainerEl = this.el.querySelector('.fc-slats');
        this.bottomRuleEl = this.el.querySelector('.fc-divider');
    };
    TimeGrid.prototype.renderSlats = function () {
        var theme = this.getTheme();
        this.slatContainerEl.innerHTML =
            '<table class="' + theme.getClass('tableGrid') + '">' +
                this.renderSlatRowHtml() +
                '</table>';
        this.slatEls = dom_manip_1.findElements(this.slatContainerEl, 'tr');
        this.slatPositions = new PositionCache_1.default(this.el, this.slatEls, false, true // vertical
        );
    };
    // Generates the HTML for the horizontal "slats" that run width-wise. Has a time axis on a side. Depends on RTL.
    TimeGrid.prototype.renderSlatRowHtml = function () {
        var view = this.view;
        var dateEnv = this.getDateEnv();
        var theme = this.getTheme();
        var isRtl = this.isRtl;
        var dateProfile = this.dateProfile;
        var html = '';
        var dayStart = marker_1.startOfDay(dateProfile.renderRange.start);
        var slotTime = dateProfile.minTime;
        var slotIterator = duration_1.createDuration(0);
        var slotDate; // will be on the view's first day, but we only care about its time
        var isLabeled;
        var axisHtml;
        // Calculate the time for each slot
        while (duration_1.asRoughMs(slotTime) < duration_1.asRoughMs(dateProfile.maxTime)) {
            slotDate = dateEnv.add(dayStart, slotTime);
            isLabeled = duration_1.wholeDivideDurations(slotIterator, this.labelInterval) !== null;
            axisHtml =
                '<td class="fc-axis fc-time ' + theme.getClass('widgetContent') + '" ' + view.axisStyleAttr() + '>' +
                    (isLabeled ?
                        '<span>' + // for matchCellWidths
                            html_1.htmlEscape(dateEnv.format(slotDate, this.labelFormat)) +
                            '</span>' :
                        '') +
                    '</td>';
            html +=
                '<tr data-time="' + formatting_1.formatIsoTimeString(slotDate) + '"' +
                    (isLabeled ? '' : ' class="fc-minor"') +
                    '>' +
                    (!isRtl ? axisHtml : '') +
                    '<td class="' + theme.getClass('widgetContent') + '"></td>' +
                    (isRtl ? axisHtml : '') +
                    '</tr>';
            slotTime = duration_1.addDurations(slotTime, this.slotDuration);
            slotIterator = duration_1.addDurations(slotIterator, this.slotDuration);
        }
        return html;
    };
    TimeGrid.prototype.renderColumns = function () {
        var dateProfile = this.dateProfile;
        var theme = this.getTheme();
        var dateEnv = this.getDateEnv();
        this.dayRanges = this.dayDates.map(function (dayDate) {
            return {
                start: dateEnv.add(dayDate, dateProfile.minTime),
                end: dateEnv.add(dayDate, dateProfile.maxTime)
            };
        });
        if (this.headContainerEl) {
            this.headContainerEl.innerHTML = this.renderHeadHtml();
        }
        this.rootBgContainerEl.innerHTML =
            '<table class="' + theme.getClass('tableGrid') + '">' +
                this.renderBgTrHtml(0) + // row=0
                '</table>';
        this.colEls = dom_manip_1.findElements(this.el, '.fc-day, .fc-disabled-day');
        this.colPositions = new PositionCache_1.default(this.el, this.colEls, true, // horizontal
        false);
        this.renderContentSkeleton();
    };
    TimeGrid.prototype.unrenderColumns = function () {
        this.unrenderContentSkeleton();
    };
    /* Content Skeleton
    ------------------------------------------------------------------------------------------------------------------*/
    // Renders the DOM that the view's content will live in
    TimeGrid.prototype.renderContentSkeleton = function () {
        var cellHtml = '';
        var i;
        var skeletonEl;
        for (i = 0; i < this.colCnt; i++) {
            cellHtml +=
                '<td>' +
                    '<div class="fc-content-col">' +
                    '<div class="fc-event-container fc-mirror-container"></div>' +
                    '<div class="fc-event-container"></div>' +
                    '<div class="fc-highlight-container"></div>' +
                    '<div class="fc-bgevent-container"></div>' +
                    '<div class="fc-business-container"></div>' +
                    '</div>' +
                    '</td>';
        }
        skeletonEl = this.contentSkeletonEl = dom_manip_1.htmlToElement('<div class="fc-content-skeleton">' +
            '<table>' +
            '<tr>' + cellHtml + '</tr>' +
            '</table>' +
            '</div>');
        this.colContainerEls = dom_manip_1.findElements(skeletonEl, '.fc-content-col');
        this.mirrorContainerEls = dom_manip_1.findElements(skeletonEl, '.fc-mirror-container');
        this.fgContainerEls = dom_manip_1.findElements(skeletonEl, '.fc-event-container:not(.fc-mirror-container)');
        this.bgContainerEls = dom_manip_1.findElements(skeletonEl, '.fc-bgevent-container');
        this.highlightContainerEls = dom_manip_1.findElements(skeletonEl, '.fc-highlight-container');
        this.businessContainerEls = dom_manip_1.findElements(skeletonEl, '.fc-business-container');
        this.bookendCells(skeletonEl.querySelector('tr')); // TODO: do this on string level
        this.el.appendChild(skeletonEl);
    };
    TimeGrid.prototype.unrenderContentSkeleton = function () {
        dom_manip_1.removeElement(this.contentSkeletonEl);
    };
    // Given a flat array of segments, return an array of sub-arrays, grouped by each segment's col
    TimeGrid.prototype.groupSegsByCol = function (segs) {
        var segsByCol = [];
        var i;
        for (i = 0; i < this.colCnt; i++) {
            segsByCol.push([]);
        }
        for (i = 0; i < segs.length; i++) {
            segsByCol[segs[i].col].push(segs[i]);
        }
        return segsByCol;
    };
    // Given segments grouped by column, insert the segments' elements into a parallel array of container
    // elements, each living within a column.
    TimeGrid.prototype.attachSegsByCol = function (segsByCol, containerEls) {
        var col;
        var segs;
        var i;
        for (col = 0; col < this.colCnt; col++) { // iterate each column grouping
            segs = segsByCol[col];
            for (i = 0; i < segs.length; i++) {
                containerEls[col].appendChild(segs[i].el);
            }
        }
    };
    /* Now Indicator
    ------------------------------------------------------------------------------------------------------------------*/
    TimeGrid.prototype.getNowIndicatorUnit = function () {
        return 'minute'; // will refresh on the minute
    };
    TimeGrid.prototype.renderNowIndicator = function (date) {
        // HACK: if date columns not ready for some reason (scheduler)
        if (!this.colContainerEls) {
            return;
        }
        // seg system might be overkill, but it handles scenario where line needs to be rendered
        //  more than once because of columns with the same date (resources columns for example)
        var segs = this.rangeToSegs({
            start: date,
            end: marker_1.addMs(date, 1) // protect against null range
        });
        var top = this.computeDateTop(date);
        var nodes = [];
        var i;
        // render lines within the columns
        for (i = 0; i < segs.length; i++) {
            var lineEl = dom_manip_1.createElement('div', { className: 'fc-now-indicator fc-now-indicator-line' });
            lineEl.style.top = top + 'px';
            this.colContainerEls[segs[i].col].appendChild(lineEl);
            nodes.push(lineEl);
        }
        // render an arrow over the axis
        if (segs.length > 0) { // is the current time in view?
            var arrowEl = dom_manip_1.createElement('div', { className: 'fc-now-indicator fc-now-indicator-arrow' });
            arrowEl.style.top = top + 'px';
            this.contentSkeletonEl.appendChild(arrowEl);
            nodes.push(arrowEl);
        }
        this.nowIndicatorEls = nodes;
    };
    TimeGrid.prototype.unrenderNowIndicator = function () {
        if (this.nowIndicatorEls) {
            this.nowIndicatorEls.forEach(dom_manip_1.removeElement);
            this.nowIndicatorEls = null;
        }
    };
    /* Coordinates
    ------------------------------------------------------------------------------------------------------------------*/
    TimeGrid.prototype.getTotalSlatHeight = function () {
        return this.slatContainerEl.offsetHeight;
    };
    // Computes the top coordinate, relative to the bounds of the grid, of the given date.
    // A `startOfDayDate` must be given for avoiding ambiguity over how to treat midnight.
    TimeGrid.prototype.computeDateTop = function (when, startOfDayDate) {
        if (!startOfDayDate) {
            startOfDayDate = marker_1.startOfDay(when);
        }
        return this.computeTimeTop(when.valueOf() - startOfDayDate.valueOf());
    };
    // Computes the top coordinate, relative to the bounds of the grid, of the given time (a Duration).
    TimeGrid.prototype.computeTimeTop = function (timeMs) {
        var len = this.slatEls.length;
        var dateProfile = this.dateProfile;
        var slatCoverage = (timeMs - duration_1.asRoughMs(dateProfile.minTime)) / duration_1.asRoughMs(this.slotDuration); // floating-point value of # of slots covered
        var slatIndex;
        var slatRemainder;
        // compute a floating-point number for how many slats should be progressed through.
        // from 0 to number of slats (inclusive)
        // constrained because minTime/maxTime might be customized.
        slatCoverage = Math.max(0, slatCoverage);
        slatCoverage = Math.min(len, slatCoverage);
        // an integer index of the furthest whole slat
        // from 0 to number slats (*exclusive*, so len-1)
        slatIndex = Math.floor(slatCoverage);
        slatIndex = Math.min(slatIndex, len - 1);
        // how much further through the slatIndex slat (from 0.0-1.0) must be covered in addition.
        // could be 1.0 if slatCoverage is covering *all* the slots
        slatRemainder = slatCoverage - slatIndex;
        return this.slatPositions.tops[slatIndex] +
            this.slatPositions.getHeight(slatIndex) * slatRemainder;
    };
    // For each segment in an array, computes and assigns its top and bottom properties
    TimeGrid.prototype.computeSegVerticals = function (segs) {
        var eventMinHeight = this.opt('agendaEventMinHeight');
        var i;
        var seg;
        var dayDate;
        for (i = 0; i < segs.length; i++) {
            seg = segs[i];
            dayDate = this.dayDates[seg.dayIndex];
            seg.top = this.computeDateTop(seg.start, dayDate);
            seg.bottom = Math.max(seg.top + eventMinHeight, this.computeDateTop(seg.end, dayDate));
        }
    };
    // Given segments that already have their top/bottom properties computed, applies those values to
    // the segments' elements.
    TimeGrid.prototype.assignSegVerticals = function (segs) {
        var i;
        var seg;
        for (i = 0; i < segs.length; i++) {
            seg = segs[i];
            dom_manip_1.applyStyle(seg.el, this.generateSegVerticalCss(seg));
        }
    };
    // Generates an object with CSS properties for the top/bottom coordinates of a segment element
    TimeGrid.prototype.generateSegVerticalCss = function (seg) {
        return {
            top: seg.top,
            bottom: -seg.bottom // flipped because needs to be space beyond bottom edge of event container
        };
    };
    /* Sizing
    ------------------------------------------------------------------------------------------------------------------*/
    TimeGrid.prototype.buildPositionCaches = function () {
        this.colPositions.build();
        this.slatPositions.build();
    };
    /* Hit System
    ------------------------------------------------------------------------------------------------------------------*/
    TimeGrid.prototype.prepareHits = function () {
        this.offsetTracker = new OffsetTracker_1.default(this.el);
    };
    TimeGrid.prototype.releaseHits = function () {
        this.offsetTracker.destroy();
    };
    TimeGrid.prototype.queryHit = function (leftOffset, topOffset) {
        var _a = this, snapsPerSlot = _a.snapsPerSlot, slatPositions = _a.slatPositions, colPositions = _a.colPositions, offsetTracker = _a.offsetTracker;
        if (offsetTracker.isWithinClipping(leftOffset, topOffset)) {
            var leftOrigin = offsetTracker.computeLeft();
            var topOrigin = offsetTracker.computeTop();
            var colIndex = colPositions.leftToIndex(leftOffset - leftOrigin);
            var slatIndex = slatPositions.topToIndex(topOffset - topOrigin);
            if (colIndex != null && slatIndex != null) {
                var slatTop = slatPositions.tops[slatIndex] + topOrigin;
                var slatHeight = slatPositions.getHeight(slatIndex);
                var partial = (topOffset - slatTop) / slatHeight; // floating point number between 0 and 1
                var localSnapIndex = Math.floor(partial * snapsPerSlot); // the snap # relative to start of slat
                var snapIndex = slatIndex * snapsPerSlot + localSnapIndex;
                var dayDate = this.getCellDate(0, colIndex); // row=0
                var time = duration_1.addDurations(this.dateProfile.minTime, duration_1.multiplyDuration(this.snapDuration, snapIndex));
                var dateEnv = this.getDateEnv();
                var start = dateEnv.add(dayDate, time);
                var end = dateEnv.add(start, this.snapDuration);
                return {
                    component: this,
                    dateSpan: {
                        range: { start: start, end: end },
                        allDay: false
                    },
                    dayEl: this.colEls[colIndex],
                    rect: {
                        left: colPositions.lefts[colIndex] + leftOrigin,
                        right: colPositions.rights[colIndex] + leftOrigin,
                        top: slatTop,
                        bottom: slatTop + slatHeight
                    },
                    layer: 0
                };
            }
        }
    };
    /* Event Resize Visualization
    ------------------------------------------------------------------------------------------------------------------*/
    // Renders a visual indication of an event being resized
    TimeGrid.prototype.renderEventResize = function (eventStore, eventUis, origSeg) {
        var segs = this.eventRangesToSegs(this.eventStoreToRanges(eventStore, eventUis));
        this.mirrorRenderer.renderEventResizingSegs(segs, origSeg);
    };
    // Unrenders any visual indication of an event being resized
    TimeGrid.prototype.unrenderEventResize = function () {
        this.mirrorRenderer.unrender();
    };
    /* Selection
    ------------------------------------------------------------------------------------------------------------------*/
    // Renders a visual indication of a selection. Overrides the default, which was to simply render a highlight.
    TimeGrid.prototype.renderDateSelection = function (selection) {
        if (this.opt('selectMirror')) {
            this.mirrorRenderer.renderEventSegs(this.selectionToSegs(selection, true));
        }
        else {
            this.renderHighlightSegs(this.selectionToSegs(selection, false));
        }
    };
    // Unrenders any visual indication of a selection
    TimeGrid.prototype.unrenderDateSelection = function () {
        this.mirrorRenderer.unrender();
        this.unrenderHighlight();
    };
    return TimeGrid;
}(DateComponent_1.default));
exports.default = TimeGrid;
TimeGrid.prototype.eventRendererClass = TimeGridEventRenderer_1.default;
TimeGrid.prototype.mirrorRendererClass = TimeGridMirrorRenderer_1.default;
TimeGrid.prototype.fillRendererClass = TimeGridFillRenderer_1.default;
DayTableMixin_1.default.mixInto(TimeGrid);


/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var html_1 = __webpack_require__(9);
var dom_manip_1 = __webpack_require__(3);
var EventRenderer_1 = __webpack_require__(18);
/* Event-rendering methods for the DayGrid class
----------------------------------------------------------------------------------------------------------------------*/
var DayGridEventRenderer = /** @class */ (function (_super) {
    tslib_1.__extends(DayGridEventRenderer, _super);
    function DayGridEventRenderer(dayGrid, fillRenderer) {
        var _this = _super.call(this, dayGrid, fillRenderer) || this;
        _this.dayGrid = dayGrid;
        return _this;
    }
    DayGridEventRenderer.prototype.renderBgSegs = function (segs) {
        // don't render timed background events
        segs = segs.filter(function (seg) {
            return seg.eventRange.def.allDay;
        });
        return _super.prototype.renderBgSegs.call(this, segs);
    };
    // Renders the given foreground event segments onto the grid
    DayGridEventRenderer.prototype.renderFgSegs = function (segs) {
        var rowStructs = this.rowStructs = this.renderSegRows(segs);
        // append to each row's content skeleton
        this.dayGrid.rowEls.forEach(function (rowNode, i) {
            rowNode.querySelector('.fc-content-skeleton > table').appendChild(rowStructs[i].tbodyEl);
        });
    };
    // Unrenders all currently rendered foreground event segments
    DayGridEventRenderer.prototype.unrenderFgSegs = function () {
        var rowStructs = this.rowStructs || [];
        var rowStruct;
        while ((rowStruct = rowStructs.pop())) {
            dom_manip_1.removeElement(rowStruct.tbodyEl);
        }
        this.rowStructs = null;
    };
    // Uses the given events array to generate <tbody> elements that should be appended to each row's content skeleton.
    // Returns an array of rowStruct objects (see the bottom of `renderSegRow`).
    // PRECONDITION: each segment shoud already have a rendered and assigned `.el`
    DayGridEventRenderer.prototype.renderSegRows = function (segs) {
        var rowStructs = [];
        var segRows;
        var row;
        segRows = this.groupSegRows(segs); // group into nested arrays
        // iterate each row of segment groupings
        for (row = 0; row < segRows.length; row++) {
            rowStructs.push(this.renderSegRow(row, segRows[row]));
        }
        return rowStructs;
    };
    // Given a row # and an array of segments all in the same row, render a <tbody> element, a skeleton that contains
    // the segments. Returns object with a bunch of internal data about how the render was calculated.
    // NOTE: modifies rowSegs
    DayGridEventRenderer.prototype.renderSegRow = function (row, rowSegs) {
        var colCnt = this.dayGrid.colCnt;
        var segLevels = this.buildSegLevels(rowSegs); // group into sub-arrays of levels
        var levelCnt = Math.max(1, segLevels.length); // ensure at least one level
        var tbody = document.createElement('tbody');
        var segMatrix = []; // lookup for which segments are rendered into which level+col cells
        var cellMatrix = []; // lookup for all <td> elements of the level+col matrix
        var loneCellMatrix = []; // lookup for <td> elements that only take up a single column
        var i;
        var levelSegs;
        var col;
        var tr;
        var j;
        var seg;
        var td;
        // populates empty cells from the current column (`col`) to `endCol`
        function emptyCellsUntil(endCol) {
            while (col < endCol) {
                // try to grab a cell from the level above and extend its rowspan. otherwise, create a fresh cell
                td = (loneCellMatrix[i - 1] || [])[col];
                if (td) {
                    td.rowSpan = (td.rowSpan || 1) + 1;
                }
                else {
                    td = document.createElement('td');
                    tr.appendChild(td);
                }
                cellMatrix[i][col] = td;
                loneCellMatrix[i][col] = td;
                col++;
            }
        }
        for (i = 0; i < levelCnt; i++) { // iterate through all levels
            levelSegs = segLevels[i];
            col = 0;
            tr = document.createElement('tr');
            segMatrix.push([]);
            cellMatrix.push([]);
            loneCellMatrix.push([]);
            // levelCnt might be 1 even though there are no actual levels. protect against this.
            // this single empty row is useful for styling.
            if (levelSegs) {
                for (j = 0; j < levelSegs.length; j++) { // iterate through segments in level
                    seg = levelSegs[j];
                    emptyCellsUntil(seg.leftCol);
                    // create a container that occupies or more columns. append the event element.
                    td = dom_manip_1.createElement('td', { className: 'fc-event-container' }, seg.el);
                    if (seg.leftCol !== seg.rightCol) {
                        td.colSpan = seg.rightCol - seg.leftCol + 1;
                    }
                    else { // a single-column segment
                        loneCellMatrix[i][col] = td;
                    }
                    while (col <= seg.rightCol) {
                        cellMatrix[i][col] = td;
                        segMatrix[i][col] = seg;
                        col++;
                    }
                    tr.appendChild(td);
                }
            }
            emptyCellsUntil(colCnt); // finish off the row
            this.dayGrid.bookendCells(tr);
            tbody.appendChild(tr);
        }
        return {
            row: row,
            tbodyEl: tbody,
            cellMatrix: cellMatrix,
            segMatrix: segMatrix,
            segLevels: segLevels,
            segs: rowSegs
        };
    };
    // Stacks a flat array of segments, which are all assumed to be in the same row, into subarrays of vertical levels.
    // NOTE: modifies segs
    DayGridEventRenderer.prototype.buildSegLevels = function (segs) {
        var levels = [];
        var i;
        var seg;
        var j;
        // Give preference to elements with certain criteria, so they have
        // a chance to be closer to the top.
        segs = this.sortEventSegs(segs);
        for (i = 0; i < segs.length; i++) {
            seg = segs[i];
            // loop through levels, starting with the topmost, until the segment doesn't collide with other segments
            for (j = 0; j < levels.length; j++) {
                if (!isDaySegCollision(seg, levels[j])) {
                    break;
                }
            }
            // `j` now holds the desired subrow index
            seg.level = j;
            // create new level array if needed and append segment
            (levels[j] || (levels[j] = [])).push(seg);
        }
        // order segments left-to-right. very important if calendar is RTL
        for (j = 0; j < levels.length; j++) {
            levels[j].sort(compareDaySegCols);
        }
        return levels;
    };
    // Given a flat array of segments, return an array of sub-arrays, grouped by each segment's row
    DayGridEventRenderer.prototype.groupSegRows = function (segs) {
        var segRows = [];
        var i;
        for (i = 0; i < this.dayGrid.rowCnt; i++) {
            segRows.push([]);
        }
        for (i = 0; i < segs.length; i++) {
            segRows[segs[i].row].push(segs[i]);
        }
        return segRows;
    };
    // Computes a default event time formatting string if `eventTimeFormat` is not explicitly defined
    DayGridEventRenderer.prototype.computeEventTimeFormat = function () {
        return {
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: true,
            meridiem: 'narrow'
        };
    };
    // Computes a default `displayEventEnd` value if one is not expliclty defined
    DayGridEventRenderer.prototype.computeDisplayEventEnd = function () {
        return this.dayGrid.colCnt === 1; // we'll likely have space if there's only one day
    };
    // Builds the HTML to be used for the default element for an individual segment
    DayGridEventRenderer.prototype.fgSegHtml = function (seg) {
        var eventRange = seg.eventRange;
        var eventDef = eventRange.def;
        var eventUi = eventRange.ui;
        var allDay = eventDef.allDay;
        var isDraggable = eventUi.startEditable;
        var isResizableFromStart = allDay && seg.isStart && eventUi.durationEditable && this.opt('eventResizableFromStart');
        var isResizableFromEnd = allDay && seg.isEnd && eventUi.durationEditable;
        var classes = this.getSegClasses(seg, isDraggable, isResizableFromStart || isResizableFromEnd);
        var skinCss = html_1.cssToStr(this.getSkinCss(eventUi));
        var timeHtml = '';
        var timeText;
        var titleHtml;
        classes.unshift('fc-day-grid-event', 'fc-h-event');
        // Only display a timed events time if it is the starting segment
        if (seg.isStart) {
            timeText = this.getTimeText(eventRange);
            if (timeText) {
                timeHtml = '<span class="fc-time">' + html_1.htmlEscape(timeText) + '</span>';
            }
        }
        titleHtml =
            '<span class="fc-title">' +
                (html_1.htmlEscape(eventDef.title || '') || '&nbsp;') + // we always want one line of height
                '</span>';
        return '<a class="' + classes.join(' ') + '"' +
            (eventDef.url ?
                ' href="' + html_1.htmlEscape(eventDef.url) + '"' :
                '') +
            (skinCss ?
                ' style="' + skinCss + '"' :
                '') +
            '>' +
            '<div class="fc-content">' +
            (this.component.isRtl ?
                titleHtml + ' ' + timeHtml : // put a natural space in between
                timeHtml + ' ' + titleHtml //
            ) +
            '</div>' +
            (isResizableFromStart ?
                '<div class="fc-resizer fc-start-resizer"></div>' :
                '') +
            (isResizableFromEnd ?
                '<div class="fc-resizer fc-end-resizer"></div>' :
                '') +
            '</a>';
    };
    return DayGridEventRenderer;
}(EventRenderer_1.default));
exports.default = DayGridEventRenderer;
// Computes whether two segments' columns collide. They are assumed to be in the same row.
function isDaySegCollision(seg, otherSegs) {
    var i;
    var otherSeg;
    for (i = 0; i < otherSegs.length; i++) {
        otherSeg = otherSegs[i];
        if (otherSeg.leftCol <= seg.rightCol &&
            otherSeg.rightCol >= seg.leftCol) {
            return true;
        }
    }
    return false;
}
// A cmp function for determining the leftmost event
function compareDaySegCols(a, b) {
    return a.leftCol - b.leftCol;
}


/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var DateProfileGenerator_1 = __webpack_require__(57);
var marker_1 = __webpack_require__(6);
var BasicViewDateProfileGenerator = /** @class */ (function (_super) {
    tslib_1.__extends(BasicViewDateProfileGenerator, _super);
    function BasicViewDateProfileGenerator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Computes the date range that will be rendered.
    BasicViewDateProfileGenerator.prototype.buildRenderRange = function (currentRange, currentRangeUnit, isRangeAllDay) {
        var dateEnv = this._view.calendar.dateEnv;
        var renderRange = _super.prototype.buildRenderRange.call(this, currentRange, currentRangeUnit, isRangeAllDay);
        var start = renderRange.start;
        var end = renderRange.end;
        var endOfWeek;
        // year and month views should be aligned with weeks. this is already done for week
        if (/^(year|month)$/.test(currentRangeUnit)) {
            start = dateEnv.startOfWeek(start);
            // make end-of-week if not already
            endOfWeek = dateEnv.startOfWeek(end);
            if (endOfWeek.valueOf() !== end.valueOf()) {
                end = marker_1.addWeeks(endOfWeek, 1);
            }
        }
        return { start: start, end: end };
    };
    return BasicViewDateProfileGenerator;
}(DateProfileGenerator_1.default));
exports.default = BasicViewDateProfileGenerator;


/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var misc_1 = __webpack_require__(2);
var BasicView_1 = __webpack_require__(63);
var MonthViewDateProfileGenerator_1 = __webpack_require__(193);
/* A month view with day cells running in rows (one-per-week) and columns
----------------------------------------------------------------------------------------------------------------------*/
var MonthView = /** @class */ (function (_super) {
    tslib_1.__extends(MonthView, _super);
    function MonthView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Overrides the default BasicView behavior to have special multi-week auto-height logic
    MonthView.prototype.setGridHeight = function (height, isAuto) {
        // if auto, make the height of each row the height that it would be if there were 6 weeks
        if (isAuto) {
            height *= this.dayGrid.rowCnt / 6;
        }
        misc_1.distributeHeight(this.dayGrid.rowEls, height, !isAuto); // if auto, don't compensate for height-hogging rows
    };
    MonthView.prototype.isDateInOtherMonth = function (date, dateProfile) {
        var dateEnv = this.getDateEnv();
        return dateEnv.getMonth(date) !== dateEnv.getMonth(dateProfile.currentRange.start);
    };
    return MonthView;
}(BasicView_1.default));
exports.default = MonthView;
MonthView.prototype.dateProfileGeneratorClass = MonthViewDateProfileGenerator_1.default;


/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var dom_manip_1 = __webpack_require__(3);
var html_1 = __webpack_require__(9);
var misc_1 = __webpack_require__(2);
var View_1 = __webpack_require__(42);
var ScrollComponent_1 = __webpack_require__(37);
var ListEventRenderer_1 = __webpack_require__(194);
var marker_1 = __webpack_require__(6);
var formatting_1 = __webpack_require__(8);
var date_range_1 = __webpack_require__(11);
/*
Responsible for the scroller, and forwarding event-related actions into the "grid".
*/
var ListView = /** @class */ (function (_super) {
    tslib_1.__extends(ListView, _super);
    function ListView(calendar, viewSpec) {
        var _this = _super.call(this, calendar, viewSpec) || this;
        _this.isInteractable = true;
        _this.slicingType = 'all-day'; // stupid TypeScript
        _this.fgSegSelector = '.fc-list-item'; // which elements accept event actions
        _this.scroller = new ScrollComponent_1.default('hidden', // overflow x
        'auto' // overflow y
        );
        return _this;
    }
    ListView.prototype.renderSkeleton = function () {
        this.el.classList.add('fc-list-view');
        var themeClass = this.calendar.theme.getClass('listView');
        if (themeClass) {
            this.el.classList.add(themeClass);
        }
        this.scroller.applyOverflow();
        this.el.appendChild(this.scroller.el);
        this.contentEl = this.scroller.el; // shortcut
    };
    ListView.prototype.unrenderSkeleton = function () {
        this.scroller.removeElement(); // will remove the Grid too
    };
    ListView.prototype.updateBaseSize = function (totalHeight, isAuto) {
        this.scroller.clear(); // sets height to 'auto' and clears overflow
        if (!isAuto) {
            this.scroller.setHeight(this.computeScrollerHeight(totalHeight));
        }
    };
    ListView.prototype.computeScrollerHeight = function (totalHeight) {
        return totalHeight -
            misc_1.subtractInnerElHeight(this.el, this.scroller.el); // everything that's NOT the scroller
    };
    ListView.prototype.renderDates = function (dateProfile) {
        var dayStart = marker_1.startOfDay(dateProfile.renderRange.start);
        var viewEnd = dateProfile.renderRange.end;
        var dayDates = [];
        var dayRanges = [];
        while (dayStart < viewEnd) {
            dayDates.push(dayStart);
            dayRanges.push({
                start: dayStart,
                end: marker_1.addDays(dayStart, 1)
            });
            dayStart = marker_1.addDays(dayStart, 1);
        }
        this.dayDates = dayDates;
        this.dayRanges = dayRanges;
        // all real rendering happens in EventRenderer
    };
    // slices by day
    ListView.prototype.rangeToSegs = function (range, allDay) {
        var dateEnv = this.getDateEnv();
        var dayRanges = this.dayRanges;
        var dayIndex;
        var segRange;
        var seg;
        var segs = [];
        for (dayIndex = 0; dayIndex < dayRanges.length; dayIndex++) {
            segRange = date_range_1.intersectRanges(range, dayRanges[dayIndex]);
            if (segRange) {
                seg = {
                    component: this,
                    start: segRange.start,
                    end: segRange.end,
                    isStart: segRange.start.valueOf() === range.start.valueOf(),
                    isEnd: segRange.end.valueOf() === range.end.valueOf(),
                    dayIndex: dayIndex
                };
                segs.push(seg);
                // detect when range won't go fully into the next day,
                // and mutate the latest seg to the be the end.
                if (!seg.isEnd && !allDay &&
                    dayIndex + 1 < dayRanges.length &&
                    range.end <
                        dateEnv.add(dayRanges[dayIndex + 1].start, this.nextDayThreshold)) {
                    seg.end = range.end;
                    seg.isEnd = true;
                    break;
                }
            }
        }
        return segs;
    };
    ListView.prototype.renderEmptyMessage = function () {
        this.contentEl.innerHTML =
            '<div class="fc-list-empty-wrap2">' + // TODO: try less wraps
                '<div class="fc-list-empty-wrap1">' +
                '<div class="fc-list-empty">' +
                html_1.htmlEscape(this.opt('noEventsMessage')) +
                '</div>' +
                '</div>' +
                '</div>';
    };
    // render the event segments in the view
    ListView.prototype.renderSegList = function (allSegs) {
        var segsByDay = this.groupSegsByDay(allSegs); // sparse array
        var dayIndex;
        var daySegs;
        var i;
        var tableEl = dom_manip_1.htmlToElement('<table class="fc-list-table ' + this.calendar.theme.getClass('tableList') + '"><tbody></tbody></table>');
        var tbodyEl = tableEl.querySelector('tbody');
        for (dayIndex = 0; dayIndex < segsByDay.length; dayIndex++) {
            daySegs = segsByDay[dayIndex];
            if (daySegs) { // sparse array, so might be undefined
                // append a day header
                tbodyEl.appendChild(this.buildDayHeaderRow(this.dayDates[dayIndex]));
                daySegs = this.eventRenderer.sortEventSegs(daySegs);
                for (i = 0; i < daySegs.length; i++) {
                    tbodyEl.appendChild(daySegs[i].el); // append event row
                }
            }
        }
        this.contentEl.innerHTML = '';
        this.contentEl.appendChild(tableEl);
    };
    // Returns a sparse array of arrays, segs grouped by their dayIndex
    ListView.prototype.groupSegsByDay = function (segs) {
        var segsByDay = []; // sparse array
        var i;
        var seg;
        for (i = 0; i < segs.length; i++) {
            seg = segs[i];
            (segsByDay[seg.dayIndex] || (segsByDay[seg.dayIndex] = []))
                .push(seg);
        }
        return segsByDay;
    };
    // generates the HTML for the day headers that live amongst the event rows
    ListView.prototype.buildDayHeaderRow = function (dayDate) {
        var dateEnv = this.getDateEnv();
        var mainFormat = formatting_1.createFormatter(this.opt('listDayFormat')); // TODO: cache
        var altFormat = formatting_1.createFormatter(this.opt('listDayAltFormat')); // TODO: cache
        return dom_manip_1.createElement('tr', {
            className: 'fc-list-heading',
            'data-date': dateEnv.formatIso(dayDate, { omitTime: true })
        }, '<td class="' + (this.calendar.theme.getClass('tableListHeading') ||
            this.calendar.theme.getClass('widgetHeader')) + '" colspan="3">' +
            (mainFormat ?
                this.buildGotoAnchorHtml(dayDate, { 'class': 'fc-list-heading-main' }, html_1.htmlEscape(dateEnv.format(dayDate, mainFormat)) // inner HTML
                ) :
                '') +
            (altFormat ?
                this.buildGotoAnchorHtml(dayDate, { 'class': 'fc-list-heading-alt' }, html_1.htmlEscape(dateEnv.format(dayDate, altFormat)) // inner HTML
                ) :
                '') +
            '</td>');
    };
    return ListView;
}(View_1.default));
exports.default = ListView;
ListView.prototype.eventRendererClass = ListEventRenderer_1.default;


/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var HitDragging_1 = __webpack_require__(31);
var browser_context_1 = __webpack_require__(53);
var event_1 = __webpack_require__(29);
var event_store_1 = __webpack_require__(14);
var externalHooks = __webpack_require__(25);
var drag_meta_1 = __webpack_require__(196);
var EventApi_1 = __webpack_require__(15);
var dom_manip_1 = __webpack_require__(3);
var misc_1 = __webpack_require__(2);
var validation_1 = __webpack_require__(39);
/*
Given an already instantiated draggable object for one-or-more elements,
Interprets any dragging as an attempt to drag an events that lives outside
of a calendar onto a calendar.
*/
var ExternalElementDragging = /** @class */ (function () {
    function ExternalElementDragging(dragging, suppliedDragMeta) {
        var _this = this;
        this.receivingCalendar = null;
        this.droppableEvent = null; // will exist for all drags, even if create:false
        this.suppliedDragMeta = null;
        this.dragMeta = null;
        this.handleDragStart = function (ev) {
            _this.dragMeta = _this.buildDragMeta(ev.subjectEl);
        };
        this.handleHitUpdate = function (hit, isFinal, ev) {
            var dragging = _this.hitDragging.dragging;
            var receivingCalendar = null;
            var droppableEvent = null;
            var isInvalid = false;
            if (hit) {
                receivingCalendar = hit.component.getCalendar();
                if (_this.canDropElOnCalendar(ev.subjectEl, receivingCalendar)) {
                    droppableEvent = computeEventForDateSpan(hit.dateSpan, _this.dragMeta, receivingCalendar);
                    // TODO: fix inefficiency of calling eventTupleToStore again, and eventToDateSpan
                    if (_this.dragMeta.create) {
                        isInvalid = !validation_1.isEventsValid(event_store_1.eventTupleToStore(droppableEvent), receivingCalendar);
                    }
                    else { // treat non-event-creating drags as selection validation
                        isInvalid = !validation_1.isSelectionValid(validation_1.eventToDateSpan(droppableEvent.def, droppableEvent.instance), receivingCalendar);
                    }
                    if (isInvalid) {
                        droppableEvent = null;
                    }
                }
            }
            // TODO: always store as event-store?
            var droppableEventStore = droppableEvent ? event_store_1.eventTupleToStore(droppableEvent) : event_store_1.createEmptyEventStore();
            _this.displayDrag(receivingCalendar, {
                affectedEvents: event_store_1.createEmptyEventStore(),
                mutatedEvents: droppableEventStore,
                isEvent: _this.dragMeta.create,
                origSeg: null
            });
            // show mirror if no already-rendered mirror element OR if we are shutting down the mirror
            // TODO: wish we could somehow wait for dispatch to guarantee render
            dragging.setMirrorIsVisible(isFinal || !droppableEvent || !document.querySelector('.fc-mirror'));
            if (!isInvalid) {
                misc_1.enableCursor();
            }
            else {
                misc_1.disableCursor();
            }
            if (!isFinal) {
                dragging.setMirrorNeedsRevert(!droppableEvent);
                _this.receivingCalendar = receivingCalendar;
                _this.droppableEvent = droppableEvent;
            }
        };
        this.handleDragEnd = function (pev) {
            var _a = _this, receivingCalendar = _a.receivingCalendar, droppableEvent = _a.droppableEvent;
            _this.clearDrag();
            if (receivingCalendar && droppableEvent) {
                var finalHit = _this.hitDragging.finalHit;
                var finalView = finalHit.component.view;
                var dragMeta = _this.dragMeta;
                receivingCalendar.publiclyTrigger('drop', [
                    {
                        draggedEl: pev.subjectEl,
                        date: receivingCalendar.dateEnv.toDate(finalHit.dateSpan.range.start),
                        allDay: finalHit.dateSpan.allDay,
                        jsEvent: pev.origEvent,
                        view: finalView
                    }
                ]);
                if (dragMeta.create) {
                    receivingCalendar.dispatch({
                        type: 'MERGE_EVENTS',
                        eventStore: event_store_1.eventTupleToStore(droppableEvent)
                    });
                    if (pev.isTouch) {
                        receivingCalendar.dispatch({
                            type: 'SELECT_EVENT',
                            eventInstanceId: droppableEvent.instance.instanceId
                        });
                    }
                    // signal that an external event landed
                    receivingCalendar.publiclyTrigger('eventReceive', [
                        {
                            draggedEl: pev.subjectEl,
                            event: new EventApi_1.default(receivingCalendar, droppableEvent.def, droppableEvent.instance),
                            view: finalView
                        }
                    ]);
                }
            }
            _this.receivingCalendar = null;
            _this.droppableEvent = null;
        };
        var hitDragging = this.hitDragging = new HitDragging_1.default(dragging, browser_context_1.default.componentHash);
        hitDragging.requireInitial = false; // will start outside of a component
        hitDragging.emitter.on('dragstart', this.handleDragStart);
        hitDragging.emitter.on('hitupdate', this.handleHitUpdate);
        hitDragging.emitter.on('dragend', this.handleDragEnd);
        this.suppliedDragMeta = suppliedDragMeta;
    }
    ExternalElementDragging.prototype.buildDragMeta = function (subjectEl) {
        if (typeof this.suppliedDragMeta === 'object') {
            return drag_meta_1.parseDragMeta(this.suppliedDragMeta);
        }
        else if (typeof this.suppliedDragMeta === 'function') {
            return drag_meta_1.parseDragMeta(this.suppliedDragMeta(subjectEl));
        }
        else {
            return getDragMetaFromEl(subjectEl);
        }
    };
    ExternalElementDragging.prototype.displayDrag = function (nextCalendar, state) {
        var prevCalendar = this.receivingCalendar;
        if (prevCalendar && prevCalendar !== nextCalendar) {
            prevCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' });
        }
        if (nextCalendar) {
            nextCalendar.dispatch({ type: 'SET_EVENT_DRAG', state: state });
        }
    };
    ExternalElementDragging.prototype.clearDrag = function () {
        if (this.receivingCalendar) {
            this.receivingCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' });
        }
    };
    ExternalElementDragging.prototype.canDropElOnCalendar = function (el, receivingCalendar) {
        var dropAccept = receivingCalendar.opt('dropAccept');
        if (typeof dropAccept === 'function') {
            return dropAccept(el);
        }
        else if (typeof dropAccept === 'string' && dropAccept) {
            return Boolean(dom_manip_1.elementMatches(el, dropAccept));
        }
        return true;
    };
    return ExternalElementDragging;
}());
exports.default = ExternalElementDragging;
// Utils for computing event store from the DragMeta
// ----------------------------------------------------------------------------------------------------
function computeEventForDateSpan(dateSpan, dragMeta, calendar) {
    var def = event_1.parseEventDef(dragMeta.leftoverProps, dragMeta.sourceId, dateSpan.allDay, Boolean(dragMeta.duration), // hasEnd
    calendar);
    var start = dateSpan.range.start;
    // only rely on time info if drop zone is all-day,
    // otherwise, we already know the time
    if (dateSpan.allDay && dragMeta.time) {
        start = calendar.dateEnv.add(start, dragMeta.time);
    }
    var end = dragMeta.duration ?
        calendar.dateEnv.add(start, dragMeta.duration) :
        calendar.getDefaultEventEnd(dateSpan.allDay, start);
    var instance = event_1.createEventInstance(def.defId, { start: start, end: end });
    return { def: def, instance: instance };
}
// Utils for extracting data from element
// ----------------------------------------------------------------------------------------------------
function getDragMetaFromEl(el) {
    var str = getEmbeddedElData(el, 'event');
    var obj = str ?
        JSON.parse(str) :
        { create: false }; // if no embedded data, assume no event creation
    return drag_meta_1.parseDragMeta(obj);
}
externalHooks.dataAttrPrefix = '';
function getEmbeddedElData(el, name) {
    var prefix = externalHooks.dataAttrPrefix;
    var prefixedName = (prefix ? prefix + '-' : '') + name;
    return el.getAttribute('data-' + prefixedName) || '';
}


/***/ }),
/* 153 */,
/* 154 */,
/* 155 */,
/* 156 */,
/* 157 */,
/* 158 */,
/* 159 */,
/* 160 */,
/* 161 */,
/* 162 */,
/* 163 */,
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

var exportHooks = __webpack_require__(25);
// for intentional side-effects
__webpack_require__(200);
__webpack_require__(203);
__webpack_require__(204);
__webpack_require__(205);
__webpack_require__(206);
__webpack_require__(207);
__webpack_require__(209);
__webpack_require__(210);
module.exports = exportHooks;


/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var dom_manip_1 = __webpack_require__(3);
// Logic for determining if, when the element is right-to-left, the scrollbar appears on the left side
var isRtlScrollbarOnLeft = null;
function getIsRtlScrollbarOnLeft() {
    if (isRtlScrollbarOnLeft === null) {
        isRtlScrollbarOnLeft = computeIsRtlScrollbarOnLeft();
    }
    return isRtlScrollbarOnLeft;
}
exports.getIsRtlScrollbarOnLeft = getIsRtlScrollbarOnLeft;
function computeIsRtlScrollbarOnLeft() {
    var outerEl = dom_manip_1.createElement('div', {
        style: {
            position: 'absolute',
            top: -1000,
            left: 0,
            border: 0,
            padding: 0,
            overflow: 'scroll',
            direction: 'rtl'
        }
    }, '<div></div>');
    document.body.appendChild(outerEl);
    var innerEl = outerEl.firstChild;
    var res = innerEl.getBoundingClientRect().left > outerEl.getBoundingClientRect().left;
    dom_manip_1.removeElement(outerEl);
    return res;
}
// The scrollbar width computations in computeEdges are sometimes flawed when it comes to
// retina displays, rounding, and IE11. Massage them into a usable value.
function sanitizeScrollbarWidth(width) {
    width = Math.max(0, width); // no negatives
    width = Math.round(width);
    return width;
}
exports.sanitizeScrollbarWidth = sanitizeScrollbarWidth;


/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var object_1 = __webpack_require__(4);
var marker_1 = __webpack_require__(6);
var formatting_1 = __webpack_require__(8);
var reselector_1 = __webpack_require__(51);
var EXTENDED_SETTINGS_AND_SEVERITIES = {
    week: 3,
    separator: 0,
    omitZeroMinute: 0,
    meridiem: 0,
    omitCommas: 0
};
var STANDARD_DATE_PROP_SEVERITIES = {
    timeZoneName: 7,
    era: 6,
    year: 5,
    month: 4,
    day: 2,
    weekday: 2,
    hour: 1,
    minute: 1,
    second: 1
};
var MERIDIEM_RE = /\s*([ap])\.?m\.?/i; // eats up leading spaces too
var COMMA_RE = /,/g; // we need re for globalness
var MULTI_SPACE_RE = /\s+/g;
var LTR_RE = /\u200e/g; // control character
var UTC_RE = /UTC|GMT/;
var NativeFormatter = /** @class */ (function () {
    function NativeFormatter(formatSettings) {
        var standardDateProps = {};
        var extendedSettings = {};
        var severity = 0;
        for (var name_1 in formatSettings) {
            if (name_1 in EXTENDED_SETTINGS_AND_SEVERITIES) {
                extendedSettings[name_1] = formatSettings[name_1];
                severity = Math.max(EXTENDED_SETTINGS_AND_SEVERITIES[name_1], severity);
            }
            else {
                standardDateProps[name_1] = formatSettings[name_1];
                if (name_1 in STANDARD_DATE_PROP_SEVERITIES) {
                    severity = Math.max(STANDARD_DATE_PROP_SEVERITIES[name_1], severity);
                }
            }
        }
        this.standardDateProps = standardDateProps;
        this.extendedSettings = extendedSettings;
        this.severity = severity;
        this.buildFormattingFunc = reselector_1.default(buildFormattingFunc);
    }
    NativeFormatter.prototype.format = function (date, context) {
        return this.buildFormattingFunc(this.standardDateProps, this.extendedSettings, context)(date);
    };
    NativeFormatter.prototype.formatRange = function (start, end, context) {
        var _a = this, standardDateProps = _a.standardDateProps, extendedSettings = _a.extendedSettings;
        var diffSeverity = computeMarkerDiffSeverity(start.marker, end.marker, context.calendarSystem);
        if (!diffSeverity) {
            return this.format(start, context);
        }
        var biggestUnitForPartial = diffSeverity;
        if (biggestUnitForPartial > 1 && // the two dates are different in a way that's larger scale than time
            (standardDateProps.year === 'numeric' || standardDateProps.year === '2-digit') &&
            (standardDateProps.month === 'numeric' || standardDateProps.month === '2-digit') &&
            (standardDateProps.day === 'numeric' || standardDateProps.day === '2-digit')) {
            biggestUnitForPartial = 1; // make it look like the dates are only different in terms of time
        }
        var full0 = this.format(start, context);
        var full1 = this.format(end, context);
        if (full0 === full1) {
            return full0;
        }
        var partialDateProps = computePartialFormattingOptions(standardDateProps, biggestUnitForPartial);
        var partialFormattingFunc = buildFormattingFunc(partialDateProps, extendedSettings, context);
        var partial0 = partialFormattingFunc(start);
        var partial1 = partialFormattingFunc(end);
        var insertion = findCommonInsertion(full0, partial0, full1, partial1);
        var separator = extendedSettings.separator || '';
        if (insertion) {
            return insertion.before + partial0 + separator + partial1 + insertion.after;
        }
        return full0 + separator + full1;
    };
    NativeFormatter.prototype.getLargestUnit = function () {
        switch (this.severity) {
            case 7:
            case 6:
            case 5:
                return 'year';
            case 4:
                return 'month';
            case 3:
                return 'week';
            default:
                return 'day';
        }
    };
    return NativeFormatter;
}());
exports.NativeFormatter = NativeFormatter;
function buildFormattingFunc(standardDateProps, extendedSettings, context) {
    var standardDatePropCnt = Object.keys(standardDateProps).length;
    if (standardDatePropCnt === 1 && standardDateProps.timeZoneName === 'short') {
        return function (date) {
            return formatting_1.formatTimeZoneOffset(date.timeZoneOffset);
        };
    }
    if (standardDatePropCnt === 0 && extendedSettings.week) {
        return function (date) {
            return formatWeekNumber(context.computeWeekNumber(date.marker), context.weekLabel, context.locale, extendedSettings.week);
        };
    }
    return buildNativeFormattingFunc(standardDateProps, extendedSettings, context);
}
function buildNativeFormattingFunc(standardDateProps, extendedSettings, context) {
    standardDateProps = object_1.assignTo({}, standardDateProps); // copy
    extendedSettings = object_1.assignTo({}, extendedSettings); // copy
    sanitizeSettings(standardDateProps, extendedSettings);
    standardDateProps.timeZone = 'UTC'; // we leverage the only guaranteed timeZone for our UTC markers
    var normalFormat = new Intl.DateTimeFormat(context.locale.codes, standardDateProps);
    var zeroFormat; // needed?
    if (extendedSettings.omitZeroMinute) {
        var zeroProps = object_1.assignTo({}, standardDateProps);
        delete zeroProps.minute; // seconds and ms were already considered in sanitizeSettings
        zeroFormat = new Intl.DateTimeFormat(context.locale.codes, zeroProps);
    }
    return function (date) {
        var marker = date.marker;
        var format;
        if (zeroFormat && !marker.getUTCMinutes()) {
            format = zeroFormat;
        }
        else {
            format = normalFormat;
        }
        var s = format.format(marker);
        return postProcess(s, date, standardDateProps, extendedSettings, context);
    };
}
function sanitizeSettings(standardDateProps, extendedSettings) {
    // deal with a browser inconsistency where formatting the timezone
    // requires that the hour/minute be present.
    if (standardDateProps.timeZoneName) {
        if (!standardDateProps.hour) {
            standardDateProps.hour = '2-digit';
        }
        if (!standardDateProps.minute) {
            standardDateProps.minute = '2-digit';
        }
    }
    // only support short timezone names
    if (standardDateProps.timeZoneName === 'long') {
        standardDateProps.timeZoneName = 'short';
    }
    // if requesting to display seconds, MUST display minutes
    if (extendedSettings.omitZeroMinute && (standardDateProps.second || standardDateProps.millisecond)) {
        delete extendedSettings.omitZeroMinute;
    }
}
function postProcess(s, date, standardDateProps, extendedSettings, context) {
    s = s.replace(LTR_RE, ''); // remove left-to-right control chars. do first. good for other regexes
    if (standardDateProps.timeZoneName === 'short') {
        s = injectTzoStr(s, (context.timeZone === 'UTC' || date.timeZoneOffset == null) ?
            'UTC' : // important to normalize for IE, which does "GMT"
            formatting_1.formatTimeZoneOffset(date.timeZoneOffset));
    }
    if (extendedSettings.omitCommas) {
        s = s.replace(COMMA_RE, '').trim();
    }
    if (extendedSettings.omitZeroMinute) {
        s = s.replace(':00', ''); // zeroFormat doesn't always achieve this
    }
    // ^ do anything that might create adjacent spaces before this point,
    // because MERIDIEM_RE likes to eat up loading spaces
    if (extendedSettings.meridiem === false) {
        s = s.replace(MERIDIEM_RE, '').trim();
    }
    else if (extendedSettings.meridiem === 'narrow') { // a/p
        s = s.replace(MERIDIEM_RE, function (m0, m1) {
            return m1.toLocaleLowerCase();
        });
    }
    else if (extendedSettings.meridiem === 'short') { // am/pm
        s = s.replace(MERIDIEM_RE, function (m0, m1) {
            return m1.toLocaleLowerCase() + 'm';
        });
    }
    else if (extendedSettings.meridiem === 'lowercase') { // other meridiem transformers already converted to lowercase
        s = s.replace(MERIDIEM_RE, function (m0) {
            return m0.toLocaleLowerCase();
        });
    }
    s = s.replace(MULTI_SPACE_RE, ' ');
    s = s.trim();
    return s;
}
function injectTzoStr(s, tzoStr) {
    var replaced = false;
    s = s.replace(UTC_RE, function () {
        replaced = true;
        return tzoStr;
    });
    // IE11 doesn't include UTC/GMT in the original string, so append to end
    if (!replaced) {
        s += ' ' + tzoStr;
    }
    return s;
}
function formatWeekNumber(num, weekLabel, locale, display) {
    var parts = [];
    if (display === 'narrow') {
        parts.push(weekLabel);
    }
    else if (display === 'short') {
        parts.push(weekLabel, ' ');
    }
    // otherwise, considered 'numeric'
    parts.push(locale.simpleNumberFormat.format(num));
    if (locale.options.isRtl) { // TODO: use control characters instead?
        parts.reverse();
    }
    return parts.join('');
}
// Range Formatting Utils
// 0 = exactly the same
// 1 = different by time
// and bigger
function computeMarkerDiffSeverity(d0, d1, ca) {
    if (ca.getMarkerYear(d0) !== ca.getMarkerYear(d1)) {
        return 5;
    }
    if (ca.getMarkerMonth(d0) !== ca.getMarkerMonth(d1)) {
        return 4;
    }
    if (ca.getMarkerDay(d0) !== ca.getMarkerDay(d1)) {
        return 2;
    }
    if (marker_1.timeAsMs(d0) !== marker_1.timeAsMs(d1)) {
        return 1;
    }
    return 0;
}
function computePartialFormattingOptions(options, biggestUnit) {
    var partialOptions = {};
    for (var name_2 in options) {
        if (!(name_2 in STANDARD_DATE_PROP_SEVERITIES) || // not a date part prop (like timeZone)
            STANDARD_DATE_PROP_SEVERITIES[name_2] <= biggestUnit) {
            partialOptions[name_2] = options[name_2];
        }
    }
    return partialOptions;
}
function findCommonInsertion(full0, partial0, full1, partial1) {
    var i0 = 0;
    while (i0 < full0.length) {
        var found0 = full0.indexOf(partial0, i0);
        if (found0 === -1) {
            break;
        }
        var before0 = full0.substr(0, found0);
        i0 = found0 + partial0.length;
        var after0 = full0.substr(i0);
        var i1 = 0;
        while (i1 < full1.length) {
            var found1 = full1.indexOf(partial1, i1);
            if (found1 === -1) {
                break;
            }
            var before1 = full1.substr(0, found1);
            i1 = found1 + partial1.length;
            var after1 = full1.substr(i1);
            if (before0 === before1 && after0 === after1) {
                return {
                    before: before0,
                    after: after0
                };
            }
        }
    }
    return null;
}


/***/ }),
/* 167 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var formatting_1 = __webpack_require__(8);
var FuncFormatter = /** @class */ (function () {
    function FuncFormatter(func) {
        this.func = func;
    }
    FuncFormatter.prototype.format = function (date, context) {
        return this.func(formatting_1.createVerboseFormattingArg(date, null, context));
    };
    FuncFormatter.prototype.formatRange = function (start, end, context) {
        return this.func(formatting_1.createVerboseFormattingArg(start, end, context));
    };
    return FuncFormatter;
}());
exports.FuncFormatter = FuncFormatter;


/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var FeaturefulElementDragging_1 = __webpack_require__(30);
var HitDragging_1 = __webpack_require__(31);
/*
Monitors when the user clicks on a specific date/time of a component.
A pointerdown+pointerup on the same "hit" constitutes a click.
*/
var DateClicking = /** @class */ (function () {
    function DateClicking(component) {
        var _this = this;
        this.handlePointerDown = function (ev) {
            var dragging = _this.dragging;
            // do this in pointerdown (not dragend) because DOM might be mutated by the time dragend is fired
            dragging.setIgnoreMove(!_this.component.isValidDateDownEl(dragging.pointer.downEl));
        };
        // won't even fire if moving was ignored
        this.handleDragEnd = function (ev) {
            var component = _this.component;
            var pointer = _this.dragging.pointer;
            if (!pointer.wasTouchScroll) {
                var _a = _this.hitDragging, initialHit = _a.initialHit, finalHit = _a.finalHit;
                if (initialHit && finalHit && HitDragging_1.isHitsEqual(initialHit, finalHit)) {
                    component.getCalendar().triggerDayClick(initialHit.dateSpan, initialHit.dayEl, component.view, ev.origEvent);
                }
            }
        };
        this.component = component;
        // we DO want to watch pointer moves because otherwise finalHit won't get populated
        this.dragging = new FeaturefulElementDragging_1.default(component.el);
        this.dragging.autoScroller.isEnabled = false;
        var hitDragging = this.hitDragging = new HitDragging_1.default(this.dragging, component);
        hitDragging.emitter.on('pointerdown', this.handlePointerDown);
        hitDragging.emitter.on('dragend', this.handleDragEnd);
    }
    DateClicking.prototype.destroy = function () {
        this.dragging.destroy();
    };
    return DateClicking;
}());
exports.default = DateClicking;


/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var dom_manip_1 = __webpack_require__(3);
var dom_event_1 = __webpack_require__(19);
/*
An effect in which an element follows the movement of a pointer across the screen.
The moving element is a clone of some other element.
Must call start + handleMove + stop.
*/
var ElementMirror = /** @class */ (function () {
    function ElementMirror() {
        this.isVisible = false; // must be explicitly enabled
        this.sourceEl = null;
        this.mirrorEl = null;
        this.sourceElRect = null; // screen coords relative to viewport
        // options that can be set directly by caller
        this.parentNode = document.body;
        this.zIndex = 9999;
        this.revertDuration = 0;
    }
    ElementMirror.prototype.start = function (sourceEl, pageX, pageY) {
        this.sourceEl = sourceEl;
        this.sourceElRect = this.sourceEl.getBoundingClientRect();
        this.origScreenX = pageX - window.pageXOffset;
        this.origScreenY = pageY - window.pageYOffset;
        this.deltaX = 0;
        this.deltaY = 0;
        this.updateElPosition();
    };
    ElementMirror.prototype.handleMove = function (pageX, pageY) {
        this.deltaX = (pageX - window.pageXOffset) - this.origScreenX;
        this.deltaY = (pageY - window.pageYOffset) - this.origScreenY;
        this.updateElPosition();
    };
    // can be called before start
    ElementMirror.prototype.setIsVisible = function (bool) {
        if (bool) {
            if (!this.isVisible) {
                if (this.mirrorEl) {
                    this.mirrorEl.style.display = '';
                }
                this.isVisible = bool; // needs to happen before updateElPosition
                this.updateElPosition(); // because was not updating the position while invisible
            }
        }
        else {
            if (this.isVisible) {
                if (this.mirrorEl) {
                    this.mirrorEl.style.display = 'none';
                }
                this.isVisible = bool;
            }
        }
    };
    // always async
    ElementMirror.prototype.stop = function (needsRevertAnimation, callback) {
        var _this = this;
        var done = function () {
            _this.cleanup();
            callback();
        };
        if (needsRevertAnimation &&
            this.mirrorEl &&
            this.isVisible &&
            this.revertDuration && // if 0, transition won't work
            (this.deltaX || this.deltaY) // if same coords, transition won't work
        ) {
            this.doRevertAnimation(done, this.revertDuration);
        }
        else {
            setTimeout(done, 0);
        }
    };
    ElementMirror.prototype.doRevertAnimation = function (callback, revertDuration) {
        var mirrorEl = this.mirrorEl;
        var finalSourceElRect = this.sourceEl.getBoundingClientRect(); // because autoscrolling might have happened
        mirrorEl.style.transition =
            'top ' + revertDuration + 'ms,' +
                'left ' + revertDuration + 'ms';
        dom_manip_1.applyStyle(mirrorEl, {
            left: finalSourceElRect.left,
            top: finalSourceElRect.top
        });
        dom_event_1.whenTransitionDone(mirrorEl, function () {
            mirrorEl.style.transition = '';
            callback();
        });
    };
    ElementMirror.prototype.cleanup = function () {
        if (this.mirrorEl) {
            dom_manip_1.removeElement(this.mirrorEl);
            this.mirrorEl = null;
        }
        this.sourceEl = null;
    };
    ElementMirror.prototype.updateElPosition = function () {
        if (this.sourceEl && this.isVisible) {
            dom_manip_1.applyStyle(this.getMirrorEl(), {
                left: this.sourceElRect.left + this.deltaX,
                top: this.sourceElRect.top + this.deltaY
            });
        }
    };
    ElementMirror.prototype.getMirrorEl = function () {
        var sourceElRect = this.sourceElRect;
        var mirrorEl = this.mirrorEl;
        if (!mirrorEl) {
            mirrorEl = this.mirrorEl = this.sourceEl.cloneNode(true); // cloneChildren=true
            // we don't want long taps or any mouse interaction causing selection/menus.
            // would use preventSelection(), but that prevents selectstart, causing problems.
            mirrorEl.classList.add('fc-unselectable');
            mirrorEl.classList.add('fc-dragging');
            dom_manip_1.applyStyle(mirrorEl, {
                position: 'fixed',
                zIndex: this.zIndex,
                visibility: '',
                boxSizing: 'border-box',
                width: sourceElRect.right - sourceElRect.left,
                height: sourceElRect.bottom - sourceElRect.top,
                right: 'auto',
                bottom: 'auto',
                margin: 0
            });
            this.parentNode.appendChild(mirrorEl);
        }
        return mirrorEl;
    };
    return ElementMirror;
}());
exports.default = ElementMirror;


/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var scroll_geom_cache_1 = __webpack_require__(142);
// If available we are using native "performance" API instead of "Date"
// Read more about it on MDN:
// https://developer.mozilla.org/en-US/docs/Web/API/Performance
var getTime = typeof performance === 'function' ? performance.now : Date.now;
/*
For a pointer interaction, automatically scrolls certain scroll containers when the pointer
approaches the edge.

The caller must call start + handleMove + stop.
*/
var AutoScroller = /** @class */ (function () {
    function AutoScroller() {
        var _this = this;
        // options that can be set by caller
        this.isEnabled = true;
        this.scrollQuery = [window, '.fc-scroller'];
        this.edgeThreshold = 50; // pixels
        this.maxVelocity = 300; // pixels per second
        // internal state
        this.pointerScreenX = null;
        this.pointerScreenY = null;
        this.isAnimating = false;
        this.scrollCaches = null;
        // protect against the initial pointerdown being too close to an edge and starting the scroll
        this.everMovedUp = false;
        this.everMovedDown = false;
        this.everMovedLeft = false;
        this.everMovedRight = false;
        this.animate = function () {
            if (_this.isAnimating) { // wasn't cancelled between animation calls
                var edge = _this.computeBestEdge(_this.pointerScreenX + window.pageXOffset, _this.pointerScreenY + window.pageYOffset);
                if (edge) {
                    var now = getTime();
                    _this.handleSide(edge, (now - _this.msSinceRequest) / 1000);
                    _this.requestAnimation(now);
                }
                else {
                    _this.isAnimating = false; // will stop animation
                }
            }
        };
    }
    AutoScroller.prototype.start = function (pageX, pageY) {
        if (this.isEnabled) {
            this.scrollCaches = this.buildCaches();
            this.pointerScreenX = null;
            this.pointerScreenY = null;
            this.everMovedUp = false;
            this.everMovedDown = false;
            this.everMovedLeft = false;
            this.everMovedRight = false;
            this.handleMove(pageX, pageY);
        }
    };
    AutoScroller.prototype.handleMove = function (pageX, pageY) {
        if (this.isEnabled) {
            var pointerScreenX = pageX - window.pageXOffset;
            var pointerScreenY = pageY - window.pageYOffset;
            var yDelta = this.pointerScreenY === null ? 0 : pointerScreenY - this.pointerScreenY;
            var xDelta = this.pointerScreenX === null ? 0 : pointerScreenX - this.pointerScreenX;
            if (yDelta < 0) {
                this.everMovedUp = true;
            }
            else if (yDelta > 0) {
                this.everMovedDown = true;
            }
            if (xDelta < 0) {
                this.everMovedLeft = true;
            }
            else if (yDelta > 0) {
                this.everMovedRight = true;
            }
            this.pointerScreenX = pointerScreenX;
            this.pointerScreenY = pointerScreenY;
            if (!this.isAnimating) {
                this.isAnimating = true;
                this.requestAnimation(getTime());
            }
        }
    };
    AutoScroller.prototype.stop = function () {
        if (this.isEnabled) {
            this.isAnimating = false; // will stop animation
            for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
                var scrollCache = _a[_i];
                scrollCache.destroy();
            }
            this.scrollCaches = null;
        }
    };
    AutoScroller.prototype.requestAnimation = function (now) {
        this.msSinceRequest = now;
        requestAnimationFrame(this.animate);
    };
    AutoScroller.prototype.handleSide = function (edge, seconds) {
        var scrollCache = edge.scrollCache;
        var edgeThreshold = this.edgeThreshold;
        var invDistance = edgeThreshold - edge.distance;
        var velocity = // the closer to the edge, the faster we scroll
         (invDistance * invDistance) / (edgeThreshold * edgeThreshold) * // quadratic
            this.maxVelocity * seconds;
        var sign = 1;
        switch (edge.name) {
            case 'left':
                sign = -1;
            // falls through
            case 'right':
                scrollCache.setScrollLeft(scrollCache.getScrollLeft() + velocity * sign);
                break;
            case 'top':
                sign = -1;
            // falls through
            case 'bottom':
                scrollCache.setScrollTop(scrollCache.getScrollTop() + velocity * sign);
                break;
        }
    };
    // left/top are relative to document topleft
    AutoScroller.prototype.computeBestEdge = function (left, top) {
        var edgeThreshold = this.edgeThreshold;
        var bestSide = null;
        for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
            var scrollCache = _a[_i];
            var rect = scrollCache.clientRect;
            var leftDist = left - rect.left;
            var rightDist = rect.right - left;
            var topDist = top - rect.top;
            var bottomDist = rect.bottom - top;
            // completely within the rect?
            if (leftDist >= 0 && rightDist >= 0 && topDist >= 0 && bottomDist >= 0) {
                if (topDist <= edgeThreshold && this.everMovedUp && scrollCache.canScrollUp() &&
                    (!bestSide || bestSide.distance > topDist)) {
                    bestSide = { scrollCache: scrollCache, name: 'top', distance: topDist };
                }
                if (bottomDist <= edgeThreshold && this.everMovedDown && scrollCache.canScrollDown() &&
                    (!bestSide || bestSide.distance > bottomDist)) {
                    bestSide = { scrollCache: scrollCache, name: 'bottom', distance: bottomDist };
                }
                if (leftDist <= edgeThreshold && this.everMovedLeft && scrollCache.canScrollLeft() &&
                    (!bestSide || bestSide.distance > leftDist)) {
                    bestSide = { scrollCache: scrollCache, name: 'left', distance: leftDist };
                }
                if (rightDist <= edgeThreshold && this.everMovedRight && scrollCache.canScrollRight() &&
                    (!bestSide || bestSide.distance > rightDist)) {
                    bestSide = { scrollCache: scrollCache, name: 'right', distance: rightDist };
                }
            }
        }
        return bestSide;
    };
    AutoScroller.prototype.buildCaches = function () {
        return this.queryScrollEls().map(function (el) {
            if (el === window) {
                return new scroll_geom_cache_1.WindowScrollGeomCache(false); // false = don't listen to user-generated scrolls
            }
            else {
                return new scroll_geom_cache_1.ElementScrollGeomCache(el, false); // false = don't listen to user-generated scrolls
            }
        });
    };
    AutoScroller.prototype.queryScrollEls = function () {
        var els = [];
        for (var _i = 0, _a = this.scrollQuery; _i < _a.length; _i++) {
            var query = _a[_i];
            if (typeof query === 'object') {
                els.push(query);
            }
            else {
                els.push.apply(els, Array.prototype.slice.call(document.querySelectorAll(query)));
            }
        }
        return els;
    };
    return AutoScroller;
}());
exports.default = AutoScroller;


/***/ }),
/* 171 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var misc_1 = __webpack_require__(2);
var HitDragging_1 = __webpack_require__(31);
var FeaturefulElementDragging_1 = __webpack_require__(30);
/*
Tracks when the user selects a portion of time of a component,
constituted by a drag over date cells, with a possible delay at the beginning of the drag.
*/
var DateSelecting = /** @class */ (function () {
    function DateSelecting(component) {
        var _this = this;
        this.dragSelection = null;
        this.handlePointerDown = function (ev) {
            var _a = _this, component = _a.component, dragging = _a.dragging;
            var canSelect = component.opt('selectable') &&
                component.isValidDateDownEl(ev.origEvent.target);
            // don't bother to watch expensive moves if component won't do selection
            dragging.setIgnoreMove(!canSelect);
            // if touch, require user to hold down
            dragging.delay = ev.isTouch ? getComponentTouchDelay(component) : null;
        };
        this.handleDragStart = function (ev) {
            _this.component.getCalendar().unselect(ev); // unselect previous selections
        };
        this.handleHitUpdate = function (hit, isFinal) {
            var calendar = _this.component.getCalendar();
            var dragSelection = null;
            var isInvalid = false;
            if (hit) {
                dragSelection = computeSelection(_this.hitDragging.initialHit.dateSpan, hit.dateSpan);
                if (!_this.component.isSelectionValid(dragSelection)) {
                    isInvalid = true;
                    dragSelection = null;
                }
            }
            if (dragSelection) {
                calendar.dispatch({ type: 'SELECT_DATES', selection: dragSelection });
            }
            else if (!isFinal) { // only unselect if moved away while dragging
                calendar.dispatch({ type: 'UNSELECT_DATES' });
            }
            if (!isInvalid) {
                misc_1.enableCursor();
            }
            else {
                misc_1.disableCursor();
            }
            if (!isFinal) {
                _this.dragSelection = dragSelection; // only clear if moved away from all hits while dragging
            }
        };
        this.handlePointerUp = function (pev) {
            if (_this.dragSelection) {
                // selection is already rendered, so just need to report selection
                _this.component.getCalendar().triggerDateSelect(_this.dragSelection, pev);
                _this.dragSelection = null;
            }
        };
        this.component = component;
        var dragging = this.dragging = new FeaturefulElementDragging_1.default(component.el);
        dragging.touchScrollAllowed = false;
        dragging.minDistance = component.opt('selectMinDistance') || 0;
        dragging.autoScroller.isEnabled = component.opt('dragScroll');
        var hitDragging = this.hitDragging = new HitDragging_1.default(this.dragging, component);
        hitDragging.emitter.on('pointerdown', this.handlePointerDown);
        hitDragging.emitter.on('dragstart', this.handleDragStart);
        hitDragging.emitter.on('hitupdate', this.handleHitUpdate);
        hitDragging.emitter.on('pointerup', this.handlePointerUp);
    }
    DateSelecting.prototype.destroy = function () {
        this.dragging.destroy();
    };
    return DateSelecting;
}());
exports.default = DateSelecting;
function getComponentTouchDelay(component) {
    var delay = component.opt('selectLongPressDelay');
    if (delay == null) {
        delay = component.opt('longPressDelay');
    }
    return delay;
}
function computeSelection(dateSpan0, dateSpan1) {
    var ms = [
        dateSpan0.range.start,
        dateSpan0.range.end,
        dateSpan1.range.start,
        dateSpan1.range.end
    ];
    ms.sort(misc_1.compareNumbers);
    return {
        range: { start: ms[0], end: ms[3] },
        allDay: dateSpan0.allDay
    };
}


/***/ }),
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var dom_event_1 = __webpack_require__(19);
var EventRenderer_1 = __webpack_require__(18);
var EventApi_1 = __webpack_require__(15);
var dom_manip_1 = __webpack_require__(3);
/*
Detects when the user clicks on an event within a DateComponent
*/
var EventClicking = /** @class */ (function () {
    function EventClicking(component) {
        var _this = this;
        this.handleSegClick = function (ev, segEl) {
            var component = _this.component;
            var seg = EventRenderer_1.getElSeg(segEl);
            if (component.isValidSegDownEl(ev.target)) {
                // our way to simulate a link click for elements that can't be <a> tags
                // grab before trigger fired in case trigger trashes DOM thru rerendering
                var hasUrlContainer = dom_manip_1.elementClosest(ev.target, '.fc-has-url');
                var url = hasUrlContainer ? hasUrlContainer.querySelector('a[href]').href : '';
                component.publiclyTrigger('eventClick', [
                    {
                        el: segEl,
                        event: new EventApi_1.default(component.getCalendar(), seg.eventRange.def, seg.eventRange.instance),
                        jsEvent: ev,
                        view: component.view
                    }
                ]);
                if (url && !ev.defaultPrevented) {
                    window.location.href = url;
                }
            }
        };
        this.component = component;
        this.destroy = dom_event_1.listenBySelector(component.el, 'click', component.fgSegSelector + ',' + component.bgSegSelector, this.handleSegClick);
    }
    return EventClicking;
}());
exports.default = EventClicking;


/***/ }),
/* 173 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var dom_event_1 = __webpack_require__(19);
var EventRenderer_1 = __webpack_require__(18);
var EventApi_1 = __webpack_require__(15);
/*
Triggers events and adds/removes core classNames when the user's pointer
enters/leaves event-elements of a component.
*/
var EventHovering = /** @class */ (function () {
    function EventHovering(component) {
        var _this = this;
        // for simulating an eventMouseLeave when the event el is destroyed while mouse is over it
        this.handleEventElRemove = function (el) {
            if (el === _this.currentSegEl) {
                _this.handleSegLeave(null, _this.currentSegEl);
            }
        };
        this.handleSegEnter = function (ev, segEl) {
            if (EventRenderer_1.getElSeg(segEl)) { // TODO: better way to make sure not hovering over more+ link or its wrapper
                segEl.classList.add('fc-allow-mouse-resize');
                _this.currentSegEl = segEl;
                _this.triggerEvent('eventMouseEnter', ev, segEl);
            }
        };
        this.handleSegLeave = function (ev, segEl) {
            if (_this.currentSegEl) {
                segEl.classList.remove('fc-allow-mouse-resize');
                _this.currentSegEl = null;
                _this.triggerEvent('eventMouseLeave', ev, segEl);
            }
        };
        this.component = component;
        this.removeHoverListeners = dom_event_1.listenToHoverBySelector(component.el, component.fgSegSelector + ',' + component.bgSegSelector, this.handleSegEnter, this.handleSegLeave);
        component.emitter.on('eventElRemove', this.handleEventElRemove);
    }
    EventHovering.prototype.destroy = function () {
        this.removeHoverListeners();
        this.component.emitter.off('eventElRemove', this.handleEventElRemove);
    };
    EventHovering.prototype.triggerEvent = function (publicEvName, ev, segEl) {
        var component = this.component;
        var seg = EventRenderer_1.getElSeg(segEl);
        if (!ev || component.isValidSegDownEl(ev.target)) {
            component.publiclyTrigger(publicEvName, [
                {
                    el: segEl,
                    event: new EventApi_1.default(this.component.getCalendar(), seg.eventRange.def, seg.eventRange.instance),
                    jsEvent: ev,
                    view: component.view
                }
            ]);
        }
    };
    return EventHovering;
}());
exports.default = EventHovering;


/***/ }),
/* 174 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var HitDragging_1 = __webpack_require__(31);
var event_mutation_1 = __webpack_require__(55);
var dom_manip_1 = __webpack_require__(3);
var FeaturefulElementDragging_1 = __webpack_require__(30);
var EventRenderer_1 = __webpack_require__(18);
var event_store_1 = __webpack_require__(14);
var misc_1 = __webpack_require__(2);
var EventApi_1 = __webpack_require__(15);
var duration_1 = __webpack_require__(10);
var EventDragging = /** @class */ (function () {
    function EventDragging(component) {
        var _this = this;
        // internal state
        this.draggingSeg = null; // TODO: rename to resizingSeg? subjectSeg?
        this.eventRange = null;
        this.relevantEvents = null;
        this.validMutation = null;
        this.mutatedRelevantEvents = null;
        this.handlePointerDown = function (ev) {
            var seg = _this.querySeg(ev);
            var eventRange = _this.eventRange = seg.eventRange;
            _this.dragging.minDistance = 5; // TODO: make this a constant
            // if touch, need to be working with a selected event
            _this.dragging.setIgnoreMove(!_this.component.isValidSegDownEl(ev.origEvent.target) ||
                (ev.isTouch && _this.component.eventSelection !== eventRange.instance.instanceId));
        };
        this.handleDragStart = function (ev) {
            var calendar = _this.component.getCalendar();
            var eventRange = _this.eventRange;
            _this.relevantEvents = event_store_1.getRelevantEvents(calendar.state.eventStore, _this.eventRange.instance.instanceId);
            _this.draggingSeg = _this.querySeg(ev);
            calendar.unselect();
            calendar.publiclyTrigger('eventResizeStart', [
                {
                    el: _this.draggingSeg.el,
                    event: new EventApi_1.default(calendar, eventRange.def, eventRange.instance),
                    jsEvent: ev.origEvent,
                    view: _this.component.view
                }
            ]);
        };
        this.handleHitUpdate = function (hit, isFinal, ev) {
            var calendar = _this.component.getCalendar();
            var relevantEvents = _this.relevantEvents;
            var initialHit = _this.hitDragging.initialHit;
            var eventInstance = _this.eventRange.instance;
            var mutation = null;
            var mutatedRelevantEvents = null;
            var isInvalid = false;
            if (hit) {
                mutation = computeMutation(initialHit, hit, ev.subjectEl.classList.contains('fc-start-resizer'), eventInstance.range);
            }
            if (mutation) {
                mutatedRelevantEvents = event_mutation_1.applyMutationToEventStore(relevantEvents, mutation, calendar);
                if (!_this.component.isEventsValid(mutatedRelevantEvents)) {
                    isInvalid = true;
                    mutation = null;
                    mutatedRelevantEvents = null;
                }
            }
            if (mutatedRelevantEvents) {
                calendar.dispatch({
                    type: 'SET_EVENT_RESIZE',
                    state: {
                        affectedEvents: relevantEvents,
                        mutatedEvents: mutatedRelevantEvents,
                        isEvent: true,
                        origSeg: _this.draggingSeg
                    }
                });
            }
            else {
                calendar.dispatch({ type: 'UNSET_EVENT_RESIZE' });
            }
            if (!isInvalid) {
                misc_1.enableCursor();
            }
            else {
                misc_1.disableCursor();
            }
            if (!isFinal) {
                if (mutation && HitDragging_1.isHitsEqual(initialHit, hit)) {
                    mutation = null;
                }
                _this.validMutation = mutation;
                _this.mutatedRelevantEvents = mutatedRelevantEvents;
            }
        };
        this.handleDragEnd = function (ev) {
            var calendar = _this.component.getCalendar();
            var view = _this.component.view;
            var eventDef = _this.eventRange.def;
            var eventInstance = _this.eventRange.instance;
            var eventApi = new EventApi_1.default(calendar, eventDef, eventInstance);
            var relevantEvents = _this.relevantEvents;
            var mutatedRelevantEvents = _this.mutatedRelevantEvents;
            calendar.publiclyTrigger('eventResizeStop', [
                {
                    el: _this.draggingSeg.el,
                    event: eventApi,
                    jsEvent: ev.origEvent,
                    view: view
                }
            ]);
            if (_this.validMutation) {
                calendar.dispatch({
                    type: 'MERGE_EVENTS',
                    eventStore: mutatedRelevantEvents
                });
                calendar.publiclyTrigger('eventResize', [
                    {
                        el: _this.draggingSeg.el,
                        startDelta: _this.validMutation.startDelta || duration_1.createDuration(0),
                        endDelta: _this.validMutation.endDelta || duration_1.createDuration(0),
                        prevEvent: eventApi,
                        event: new EventApi_1.default(// the data AFTER the mutation
                        calendar, mutatedRelevantEvents.defs[eventDef.defId], eventInstance ? mutatedRelevantEvents.instances[eventInstance.instanceId] : null),
                        revert: function () {
                            calendar.dispatch({
                                type: 'MERGE_EVENTS',
                                eventStore: relevantEvents
                            });
                        },
                        jsEvent: ev.origEvent,
                        view: view
                    }
                ]);
            }
            else {
                calendar.publiclyTrigger('_noEventResize');
            }
            // reset all internal state
            _this.draggingSeg = null;
            _this.relevantEvents = null;
            _this.validMutation = null;
            // okay to keep eventInstance around. useful to set it in handlePointerDown
        };
        this.component = component;
        var dragging = this.dragging = new FeaturefulElementDragging_1.default(component.el);
        dragging.pointer.selector = '.fc-resizer';
        dragging.touchScrollAllowed = false;
        dragging.autoScroller.isEnabled = component.opt('dragScroll');
        var hitDragging = this.hitDragging = new HitDragging_1.default(this.dragging, component);
        hitDragging.emitter.on('pointerdown', this.handlePointerDown);
        hitDragging.emitter.on('dragstart', this.handleDragStart);
        hitDragging.emitter.on('hitupdate', this.handleHitUpdate);
        hitDragging.emitter.on('dragend', this.handleDragEnd);
    }
    EventDragging.prototype.destroy = function () {
        this.dragging.destroy();
    };
    EventDragging.prototype.querySeg = function (ev) {
        return EventRenderer_1.getElSeg(dom_manip_1.elementClosest(ev.subjectEl, this.component.fgSegSelector));
    };
    return EventDragging;
}());
exports.default = EventDragging;
function computeMutation(hit0, hit1, isFromStart, instanceRange) {
    var dateEnv = hit0.component.getDateEnv();
    var date0 = hit0.dateSpan.range.start;
    var date1 = hit1.dateSpan.range.start;
    var delta = misc_1.diffDates(date0, date1, dateEnv, hit0.component.largeUnit);
    if (isFromStart) {
        if (dateEnv.add(instanceRange.start, delta) < instanceRange.end) {
            return { startDelta: delta };
        }
    }
    else {
        if (dateEnv.add(instanceRange.end, delta) > instanceRange.start) {
            return { endDelta: delta };
        }
    }
    return null;
}


/***/ }),
/* 175 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var dom_manip_1 = __webpack_require__(3);
var dom_geom_1 = __webpack_require__(13);
var dom_event_1 = __webpack_require__(19);
var misc_1 = __webpack_require__(2);
var EmitterMixin_1 = __webpack_require__(20);
var Toolbar_1 = __webpack_require__(176);
var OptionsManager_1 = __webpack_require__(177);
var ThemeRegistry_1 = __webpack_require__(48);
var locale_1 = __webpack_require__(41);
var env_1 = __webpack_require__(56);
var marker_1 = __webpack_require__(6);
var formatting_1 = __webpack_require__(8);
var duration_1 = __webpack_require__(10);
var main_1 = __webpack_require__(179);
var date_span_1 = __webpack_require__(50);
var reselector_1 = __webpack_require__(51);
var object_1 = __webpack_require__(4);
var date_range_1 = __webpack_require__(11);
var event_source_1 = __webpack_require__(22);
var event_1 = __webpack_require__(29);
var EventSourceApi_1 = __webpack_require__(141);
var EventApi_1 = __webpack_require__(15);
var event_store_1 = __webpack_require__(14);
var event_rendering_1 = __webpack_require__(28);
var business_hours_1 = __webpack_require__(182);
var PointerDragging_1 = __webpack_require__(40);
var EventDragging_1 = __webpack_require__(143);
var view_spec_1 = __webpack_require__(183);
var exportHooks = __webpack_require__(25);
var Calendar = /** @class */ (function () {
    function Calendar(el, overrides) {
        var _this = this;
        this.isRecentPointerDateSelect = false; // wish we could use a selector to detect date selection, but uses hit system
        this.ignoreUpdateViewSize = 0;
        this.actionQueue = [];
        this.isReducing = false;
        this.isDisplaying = false; // installed in DOM? accepting renders?
        this.isRendering = false; // currently in the _render function?
        this.isSkeletonRendered = false; // fyi: set within the debounce delay
        this.renderingPauseDepth = 0;
        this.afterSizingTriggers = {};
        // for unfocusing selections
        this.onDocumentPointerUp = function (pev) {
            var _a = _this, state = _a.state, view = _a.view, documentPointer = _a.documentPointer;
            // touch-scrolling should never unfocus any type of selection
            if (!documentPointer.wasTouchScroll) {
                if (state.dateSelection && // an existing date selection?
                    !_this.isRecentPointerDateSelect // a new pointer-initiated date selection since last onDocumentPointerUp?
                ) {
                    var unselectAuto = view.opt('unselectAuto');
                    var unselectCancel = view.opt('unselectCancel');
                    if (unselectAuto && (!unselectAuto || !dom_manip_1.elementClosest(documentPointer.downEl, unselectCancel))) {
                        _this.unselect(pev);
                    }
                }
                if (state.eventSelection && // an existing event selected?
                    !dom_manip_1.elementClosest(documentPointer.downEl, EventDragging_1.default.SELECTOR) // interaction DIDN'T start on an event
                ) {
                    _this.dispatch({ type: 'UNSELECT_EVENT' });
                }
            }
            _this.isRecentPointerDateSelect = false;
        };
        this.el = el;
        this.viewsByType = {};
        this.optionsManager = new OptionsManager_1.default(overrides);
        this.buildDateEnv = reselector_1.default(buildDateEnv);
        this.buildTheme = reselector_1.default(buildTheme);
        this.buildDelayedRerender = reselector_1.default(buildDelayedRerender);
        this.computeEventDefUis = reselector_1.default(event_rendering_1.computeEventDefUis);
        this.parseBusinessHours = reselector_1.default(function (input) {
            return business_hours_1.parseBusinessHours(input, _this);
        });
        this.handleOptions(this.optionsManager.computed);
        this.hydrate();
    }
    Calendar.prototype.getView = function () {
        return this.view;
    };
    // Public API for rendering
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype.render = function () {
        if (!this.isDisplaying) {
            this.isDisplaying = true;
            this.renderableEventStore = event_store_1.createEmptyEventStore();
            this.bindGlobalHandlers();
            this.el.classList.add('fc');
            this._render();
        }
        else if (this.elementVisible()) {
            this.calcSize();
            this.requestRerender(true);
        }
    };
    Calendar.prototype.destroy = function () {
        if (this.isDisplaying) {
            this.isDisplaying = false;
            this.unbindGlobalHandlers();
            this._destroy();
            this.el.classList.remove('fc');
        }
    };
    // General Rendering
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype._render = function () {
        var rerenderFlags = this.rerenderFlags;
        this.rerenderFlags = null; // clear for future requestRerender calls, which might happen during render
        this.isRendering = true;
        this.applyElClassNames();
        if (!this.isSkeletonRendered) {
            this.renderSkeleton();
            this.isSkeletonRendered = true;
        }
        this.freezeContentHeight(); // do after contentEl is created in renderSkeleton
        this.renderView(rerenderFlags);
        if (this.view) { // toolbar rendering heavily depends on view
            this.renderToolbars(rerenderFlags);
        }
        if (this.updateViewSize()) { // success?
            this.renderedView.popScroll();
        }
        this.thawContentHeight();
        this.releaseAfterSizingTriggers();
        this.isRendering = false;
        this.trigger('_rendered'); // for tests
        // another render requested during this most recent rendering?
        if (this.rerenderFlags) {
            this.delayedRerender();
        }
    };
    Calendar.prototype._destroy = function () {
        this.view = null;
        if (this.renderedView) {
            this.renderedView.removeElement();
            this.renderedView = null;
        }
        if (this.header) {
            this.header.removeElement();
            this.header = null;
        }
        if (this.footer) {
            this.footer.removeElement();
            this.footer = null;
        }
        this.unrenderSkeleton();
        this.isSkeletonRendered = false;
        this.removeElClassNames();
    };
    Calendar.prototype.smash = function () {
        var _this = this;
        this.batchRendering(function () {
            var oldView = _this.view;
            // reinstantiate/rerender the entire view
            if (oldView) {
                _this.viewsByType = {}; // so that getViewByType will generate fresh views
                _this.view = _this.getViewByType(oldView.type); // will be rendered in renderView
                // recompute dateProfile
                _this.setCurrentDateMarker(_this.state.dateProfile.currentDate);
                // transfer scroll from old view
                var scroll_1 = oldView.queryScroll();
                scroll_1.isLocked = true; // will prevent view from computing own values
                _this.view.addScroll(scroll_1);
            }
            _this.requestRerender(true); // force=true
        });
    };
    // Classnames on root elements
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype.applyElClassNames = function () {
        var classList = this.el.classList;
        var elDirClassName = 'fc-' + this.opt('dir');
        var elThemeClassName = this.theme.getClass('widget');
        if (elDirClassName !== this.elDirClassName) {
            if (this.elDirClassName) {
                classList.remove(this.elDirClassName);
            }
            classList.add(elDirClassName);
            this.elDirClassName = elDirClassName;
        }
        if (elThemeClassName !== this.elThemeClassName) {
            if (this.elThemeClassName) {
                classList.remove(this.elThemeClassName);
            }
            classList.add(elThemeClassName);
            this.elThemeClassName = elThemeClassName;
        }
    };
    Calendar.prototype.removeElClassNames = function () {
        var classList = this.el.classList;
        if (this.elDirClassName) {
            classList.remove(this.elDirClassName);
            this.elDirClassName = null;
        }
        if (this.elThemeClassName) {
            classList.remove(this.elThemeClassName);
            this.elThemeClassName = null;
        }
    };
    // Skeleton Rendering
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype.renderSkeleton = function () {
        var _this = this;
        dom_manip_1.prependToElement(this.el, this.contentEl = dom_manip_1.createElement('div', { className: 'fc-view-container' }));
        // event delegation for nav links
        this.removeNavLinkListener = dom_event_1.listenBySelector(this.el, 'click', 'a[data-goto]', function (ev, anchorEl) {
            var gotoOptions = anchorEl.getAttribute('data-goto');
            gotoOptions = gotoOptions ? JSON.parse(gotoOptions) : {};
            var date = _this.dateEnv.createMarker(gotoOptions.date);
            var viewType = gotoOptions.type;
            // property like "navLinkDayClick". might be a string or a function
            var customAction = _this.renderedView.opt('navLink' + misc_1.capitaliseFirstLetter(viewType) + 'Click');
            if (typeof customAction === 'function') {
                customAction(date, ev);
            }
            else {
                if (typeof customAction === 'string') {
                    viewType = customAction;
                }
                _this.zoomTo(date, viewType);
            }
        });
    };
    Calendar.prototype.unrenderSkeleton = function () {
        dom_manip_1.removeElement(this.contentEl);
        this.removeNavLinkListener();
    };
    // Global Handlers
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype.bindGlobalHandlers = function () {
        var documentPointer = this.documentPointer = new PointerDragging_1.default(document);
        documentPointer.shouldIgnoreMove = true;
        documentPointer.shouldWatchScroll = false;
        documentPointer.emitter.on('pointerup', this.onDocumentPointerUp);
        if (this.opt('handleWindowResize')) {
            window.addEventListener('resize', this.windowResizeProxy = misc_1.debounce(// prevents rapid calls
            this.windowResize.bind(this), this.opt('windowResizeDelay')));
        }
    };
    Calendar.prototype.unbindGlobalHandlers = function () {
        this.documentPointer.destroy();
        if (this.windowResizeProxy) {
            window.removeEventListener('resize', this.windowResizeProxy);
            this.windowResizeProxy = null;
        }
    };
    // Dispatcher
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype.hydrate = function () {
        this.state = this.buildInitialState();
        var rawSources = this.opt('eventSources') || [];
        var singleRawSource = this.opt('events');
        var sources = []; // parsed
        if (singleRawSource) {
            rawSources.unshift(singleRawSource);
        }
        for (var _i = 0, rawSources_1 = rawSources; _i < rawSources_1.length; _i++) {
            var rawSource = rawSources_1[_i];
            var source = event_source_1.parseEventSource(rawSource, this);
            if (source) {
                sources.push(source);
            }
        }
        this.dispatch({ type: 'ADD_EVENT_SOURCES', sources: sources });
        this.setViewType(this.opt('defaultView'), this.getInitialDate());
    };
    Calendar.prototype.buildInitialState = function () {
        return {
            loadingLevel: 0,
            eventSourceLoadingLevel: 0,
            dateProfile: null,
            eventSources: {},
            eventStore: event_store_1.createEmptyEventStore(),
            eventUis: {},
            businessHours: event_store_1.createEmptyEventStore(),
            dateSelection: null,
            eventSelection: '',
            eventDrag: null,
            eventResize: null
        };
    };
    Calendar.prototype.dispatch = function (action) {
        this.actionQueue.push(action);
        if (!this.isReducing) {
            this.isReducing = true;
            var oldState = this.state;
            while (this.actionQueue.length) {
                this.state = this.reduce(this.state, this.actionQueue.shift(), this);
            }
            var newState = this.state;
            this.isReducing = false;
            if (!oldState.loadingLevel && newState.loadingLevel) {
                this.publiclyTrigger('loading', [true, this.view]);
            }
            else if (oldState.loadingLevel && !newState.loadingLevel) {
                this.publiclyTrigger('loading', [false, this.view]);
            }
            this.requestRerender();
        }
    };
    Calendar.prototype.reduce = function (state, action, calendar) {
        return main_1.default(state, action, calendar);
    };
    // Render Queue
    // -----------------------------------------------------------------------------------------------------------------
    /*
    the force flags force certain entities to be rerendered.
    it does not avoid the delay if one is configured.
    */
    Calendar.prototype.requestRerender = function (forceFlags) {
        if (forceFlags === void 0) { forceFlags = {}; }
        if (forceFlags === true || !this.rerenderFlags) {
            this.rerenderFlags = forceFlags; // true, or the first object
        }
        else {
            object_1.assignTo(this.rerenderFlags, forceFlags); // merge the objects
        }
        this.delayedRerender(); // will call a debounced-version of tryRerender
    };
    Calendar.prototype.tryRerender = function () {
        if (this.isDisplaying && // must be accepting renders
            this.rerenderFlags && // indicates that a rerender was requested
            !this.renderingPauseDepth && // not paused
            !this.isRendering // not currently in the render loop
        ) {
            this._render();
        }
    };
    Calendar.prototype.batchRendering = function (func) {
        this.renderingPauseDepth++;
        func();
        this.renderingPauseDepth--;
        this.requestRerender();
    };
    // Options
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype.setOption = function (name, value) {
        var oldDateEnv = this.dateEnv;
        this.optionsManager.add(name, value);
        this.handleOptions(this.optionsManager.computed);
        if (name === 'height' || name === 'contentHeight' || name === 'aspectRatio') {
            this.updateSize();
        }
        else if (name === 'timeZone') {
            this.dispatch({
                type: 'CHANGE_TIMEZONE',
                oldDateEnv: oldDateEnv
            });
        }
        else if (name === 'defaultDate') {
            // can't change date this way. use gotoDate instead
        }
        else if (/^(event|select)(Overlap|Constraint|Allow)$/.test(name)) {
            // doesn't affect rendering. only interactions.
        }
        else {
            this.smash();
        }
    };
    Calendar.prototype.getOption = function (name) {
        return this.optionsManager.computed[name];
    };
    Calendar.prototype.opt = function (name) {
        return this.optionsManager.computed[name];
    };
    Calendar.prototype.handleOptions = function (options) {
        this.defaultAllDayEventDuration = duration_1.createDuration(options.defaultAllDayEventDuration);
        this.defaultTimedEventDuration = duration_1.createDuration(options.defaultTimedEventDuration);
        this.delayedRerender = this.buildDelayedRerender(options.rerenderDelay);
        this.theme = this.buildTheme(options);
        this.dateEnv = this.buildDateEnv(options.locale, options.timeZone, options.timeZoneImpl, options.firstDay, options.weekNumberCalculation, options.weekLabel, options.cmdFormatter);
        this.viewSpecs = view_spec_1.buildViewSpecs(// ineffecient to do every time?
        exportHooks.views, this.optionsManager);
    };
    // Trigger
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype.hasPublicHandlers = function (name) {
        return this.hasHandlers(name) ||
            this.opt(name); // handler specified in options
    };
    Calendar.prototype.publiclyTrigger = function (name, args) {
        var optHandler = this.opt(name);
        this.triggerWith(name, this, args);
        if (optHandler) {
            return optHandler.apply(this, args);
        }
    };
    Calendar.prototype.publiclyTriggerAfterSizing = function (name, args) {
        var afterSizingTriggers = this.afterSizingTriggers;
        (afterSizingTriggers[name] || (afterSizingTriggers[name] = [])).push(args);
    };
    Calendar.prototype.releaseAfterSizingTriggers = function () {
        var afterSizingTriggers = this.afterSizingTriggers;
        for (var name_1 in afterSizingTriggers) {
            for (var _i = 0, _a = afterSizingTriggers[name_1]; _i < _a.length; _i++) {
                var args = _a[_i];
                this.publiclyTrigger(name_1, args);
            }
        }
        this.afterSizingTriggers = {};
    };
    // View
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype.renderView = function (forceFlags) {
        var _a = this, state = _a.state, renderedView = _a.renderedView;
        if (renderedView !== this.view) {
            if (renderedView) {
                renderedView.removeElement();
            }
            renderedView = this.renderedView = this.view;
        }
        if (!renderedView.el) {
            renderedView.setElement(dom_manip_1.createElement('div', { className: 'fc-view fc-' + renderedView.type + '-view' }));
        }
        else {
            // because removeElement must have been called previously, which unbinds global handlers
            renderedView.bindGlobalHandlers();
        }
        if (!renderedView.el.parentNode) {
            this.contentEl.appendChild(renderedView.el);
        }
        else {
            renderedView.addScroll(renderedView.queryScroll());
        }
        // if event sources are still loading and progressive rendering hasn't been enabled,
        // keep rendering the last fully loaded set of events
        var renderableEventStore = this.renderableEventStore =
            (state.eventSourceLoadingLevel && !this.opt('progressiveEventRendering')) ?
                this.renderableEventStore :
                state.eventStore;
        // setting state here, eek
        var eventUis = this.state.eventUis = this.computeEventDefUis(renderableEventStore.defs, state.eventSources, renderedView.options);
        renderedView.render({
            dateProfile: state.dateProfile,
            eventStore: renderableEventStore,
            eventUis: eventUis,
            businessHours: this.parseBusinessHours(renderedView.opt('businessHours')),
            dateSelection: state.dateSelection,
            eventSelection: state.eventSelection,
            eventDrag: state.eventDrag,
            eventResize: state.eventResize
        }, forceFlags);
    };
    Calendar.prototype.getViewByType = function (viewType) {
        return this.viewsByType[viewType] ||
            (this.viewsByType[viewType] = this.instantiateView(viewType));
    };
    // Given a view name for a custom view or a standard view, creates a ready-to-go View object
    Calendar.prototype.instantiateView = function (viewType) {
        var spec = this.viewSpecs[viewType];
        if (!spec) {
            throw new Error("View type \"" + viewType + "\" is not valid");
        }
        return new spec['class'](this, spec);
    };
    // Returns a boolean about whether the view is okay to instantiate at some point
    Calendar.prototype.isValidViewType = function (viewType) {
        return Boolean(this.viewSpecs[viewType]);
    };
    Calendar.prototype.changeView = function (viewType, dateOrRange) {
        var dateMarker = null;
        if (dateOrRange) {
            if (dateOrRange.start && dateOrRange.end) { // a range
                this.optionsManager.add('visibleRange', dateOrRange); // will not rerender
                this.handleOptions(this.optionsManager.computed); // ...but yuck
            }
            else { // a date
                dateMarker = this.dateEnv.createMarker(dateOrRange); // just like gotoDate
            }
        }
        this.setViewType(viewType, dateMarker);
    };
    // Forces navigation to a view for the given date.
    // `viewType` can be a specific view name or a generic one like "week" or "day".
    // needs to change
    Calendar.prototype.zoomTo = function (dateMarker, viewType) {
        var spec;
        viewType = viewType || 'day'; // day is default zoom
        spec = this.viewSpecs[viewType] ||
            this.getUnitViewSpec(viewType);
        if (spec) {
            this.setViewType(spec.type, dateMarker);
        }
        else {
            this.setCurrentDateMarker(dateMarker);
        }
    };
    // Given a duration singular unit, like "week" or "day", finds a matching view spec.
    // Preference is given to views that have corresponding buttons.
    Calendar.prototype.getUnitViewSpec = function (unit) {
        var viewTypes;
        var i;
        var spec;
        // put views that have buttons first. there will be duplicates, but oh well
        viewTypes = this.header.getViewsWithButtons(); // TODO: include footer as well?
        for (var viewType in this.viewSpecs) {
            viewTypes.push(viewType);
        }
        for (i = 0; i < viewTypes.length; i++) {
            spec = this.viewSpecs[viewTypes[i]];
            if (spec) {
                if (spec.singleUnit === unit) {
                    return spec;
                }
            }
        }
    };
    // internal use only
    // does not cause a render
    Calendar.prototype.setViewType = function (viewType, dateMarker) {
        if (!this.view || this.view.type !== viewType) {
            this.view = this.getViewByType(viewType);
            // luckily, will always cause a rerender
            this.setCurrentDateMarker(dateMarker || this.state.dateProfile.currentDate);
        }
    };
    // Current Date
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype.getInitialDate = function () {
        var defaultDateInput = this.opt('defaultDate');
        // compute the initial ambig-timezone date
        if (defaultDateInput != null) {
            return this.dateEnv.createMarker(defaultDateInput);
        }
        else {
            return this.getNow(); // getNow already returns unzoned
        }
    };
    Calendar.prototype.prev = function () {
        this.setDateProfile(this.view.dateProfileGenerator.buildPrev(this.state.dateProfile));
    };
    Calendar.prototype.next = function () {
        this.setDateProfile(this.view.dateProfileGenerator.buildNext(this.state.dateProfile));
    };
    Calendar.prototype.prevYear = function () {
        this.setCurrentDateMarker(this.dateEnv.addYears(this.state.dateProfile.currentDate, -1));
    };
    Calendar.prototype.nextYear = function () {
        this.setCurrentDateMarker(this.dateEnv.addYears(this.state.dateProfile.currentDate, 1));
    };
    Calendar.prototype.today = function () {
        this.setCurrentDateMarker(this.getNow());
    };
    Calendar.prototype.gotoDate = function (zonedDateInput) {
        this.setCurrentDateMarker(this.dateEnv.createMarker(zonedDateInput));
    };
    Calendar.prototype.incrementDate = function (deltaInput) {
        var delta = duration_1.createDuration(deltaInput);
        if (delta) { // else, warn about invalid input?
            this.setCurrentDateMarker(this.dateEnv.add(this.state.dateProfile.currentDate, delta));
        }
    };
    // for external API
    Calendar.prototype.getDate = function () {
        return this.dateEnv.toDate(this.state.dateProfile.currentDate);
    };
    Calendar.prototype.setCurrentDateMarker = function (date) {
        this.setDateProfile(this.view.computeDateProfile(date));
    };
    Calendar.prototype.setDateProfile = function (dateProfile) {
        this.unselect();
        this.dispatch({
            type: 'SET_DATE_PROFILE',
            dateProfile: dateProfile
        });
    };
    // Date Formatting Utils
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype.formatDate = function (d, formatter) {
        var dateEnv = this.dateEnv;
        return dateEnv.format(dateEnv.createMarker(d), formatting_1.createFormatter(formatter));
    };
    // `settings` is for formatter AND isEndExclusive
    Calendar.prototype.formatRange = function (d0, d1, settings) {
        var dateEnv = this.dateEnv;
        return dateEnv.formatRange(dateEnv.createMarker(d0), dateEnv.createMarker(d1), formatting_1.createFormatter(settings, this.opt('defaultRangeSeparator')), settings);
    };
    Calendar.prototype.formatIso = function (d, omitTime) {
        var dateEnv = this.dateEnv;
        return dateEnv.formatIso(dateEnv.createMarker(d), { omitTime: omitTime });
    };
    // Resizing
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype.updateSize = function () {
        this.updateViewSize(true); // force=true
    };
    Calendar.prototype.getSuggestedViewHeight = function () {
        if (this.suggestedViewHeight == null) {
            this.calcSize();
        }
        return this.suggestedViewHeight;
    };
    Calendar.prototype.isHeightAuto = function () {
        return this.opt('contentHeight') === 'auto' || this.opt('height') === 'auto';
    };
    Calendar.prototype.updateViewSize = function (isResize) {
        if (isResize === void 0) { isResize = false; }
        var renderedView = this.renderedView;
        var scroll;
        if (!this.ignoreUpdateViewSize && renderedView) {
            if (isResize) {
                this.calcSize();
                scroll = renderedView.queryScroll();
            }
            this.ignoreUpdateViewSize++;
            renderedView.updateSize(this.getSuggestedViewHeight(), this.isHeightAuto(), isResize);
            this.ignoreUpdateViewSize--;
            if (isResize) {
                renderedView.applyScroll(scroll);
            }
            return true; // signal success
        }
    };
    Calendar.prototype.calcSize = function () {
        if (this.elementVisible()) {
            this._calcSize();
        }
    };
    Calendar.prototype._calcSize = function () {
        var contentHeightInput = this.opt('contentHeight');
        var heightInput = this.opt('height');
        if (typeof contentHeightInput === 'number') { // exists and not 'auto'
            this.suggestedViewHeight = contentHeightInput;
        }
        else if (typeof contentHeightInput === 'function') { // exists and is a function
            this.suggestedViewHeight = contentHeightInput();
        }
        else if (typeof heightInput === 'number') { // exists and not 'auto'
            this.suggestedViewHeight = heightInput - this.queryToolbarsHeight();
        }
        else if (typeof heightInput === 'function') { // exists and is a function
            this.suggestedViewHeight = heightInput() - this.queryToolbarsHeight();
        }
        else if (heightInput === 'parent') { // set to height of parent element
            this.suggestedViewHeight = this.el.parentNode.offsetHeight - this.queryToolbarsHeight();
        }
        else {
            this.suggestedViewHeight = Math.round(this.contentEl.offsetWidth /
                Math.max(this.opt('aspectRatio'), .5));
        }
    };
    Calendar.prototype.elementVisible = function () {
        return Boolean(this.el.offsetWidth);
    };
    Calendar.prototype.windowResize = function (ev) {
        if (
        // the purpose: so we don't process jqui "resize" events that have bubbled up
        // cast to any because .target, which is Element, can't be compared to window for some reason.
        ev.target === window &&
            this.renderedView &&
            this.renderedView.renderedFlags.dates) {
            if (this.updateViewSize(true)) { // force=true, returns true on success
                this.publiclyTrigger('windowResize', [this.renderedView]);
            }
        }
    };
    // Height "Freezing"
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype.freezeContentHeight = function () {
        dom_manip_1.applyStyle(this.contentEl, {
            width: '100%',
            height: this.contentEl.offsetHeight,
            overflow: 'hidden'
        });
    };
    Calendar.prototype.thawContentHeight = function () {
        dom_manip_1.applyStyle(this.contentEl, {
            width: '',
            height: '',
            overflow: ''
        });
    };
    // Toolbar
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype.renderToolbars = function (forceFlags) {
        var headerLayout = this.opt('header');
        var footerLayout = this.opt('footer');
        var now = this.getNow();
        var dateProfile = this.state.dateProfile;
        var view = this.view; // use the view that intends to be rendered
        var todayInfo = view.dateProfileGenerator.build(now);
        var prevInfo = view.dateProfileGenerator.buildPrev(dateProfile);
        var nextInfo = view.dateProfileGenerator.buildNext(dateProfile);
        var props = {
            title: view.title,
            activeButton: view.type,
            isTodayEnabled: todayInfo.isValid && !date_range_1.rangeContainsMarker(dateProfile.currentRange, now),
            isPrevEnabled: prevInfo.isValid,
            isNextEnabled: nextInfo.isValid
        };
        if ((!headerLayout || forceFlags === true) && this.header) {
            this.header.removeElement();
            this.header = null;
        }
        if (headerLayout) {
            if (!this.header) {
                this.header = new Toolbar_1.default(this, 'fc-header-toolbar');
                dom_manip_1.prependToElement(this.el, this.header.el);
            }
            this.header.render(object_1.assignTo({ layout: headerLayout }, props), forceFlags);
        }
        if ((!footerLayout || forceFlags === true) && this.footer) {
            this.footer.removeElement();
            this.footer = null;
        }
        if (footerLayout) {
            if (!this.footer) {
                this.footer = new Toolbar_1.default(this, 'fc-footer-toolbar');
                dom_manip_1.appendToElement(this.el, this.footer.el);
            }
            this.footer.render(object_1.assignTo({ layout: footerLayout }, props), forceFlags);
        }
    };
    Calendar.prototype.queryToolbarsHeight = function () {
        var height = 0;
        if (this.header) {
            height += dom_geom_1.computeHeightAndMargins(this.header.el);
        }
        if (this.footer) {
            height += dom_geom_1.computeHeightAndMargins(this.footer.el);
        }
        return height;
    };
    // Date Selection / Event Selection / DayClick
    // -----------------------------------------------------------------------------------------------------------------
    // this public method receives start/end dates in any format, with any timezone
    // NOTE: args were changed from v3
    Calendar.prototype.select = function (dateOrObj, endDate) {
        var selectionInput;
        if (endDate == null) {
            if (dateOrObj.start != null) {
                selectionInput = dateOrObj;
            }
            else {
                selectionInput = {
                    start: dateOrObj,
                    end: null
                };
            }
        }
        else {
            selectionInput = {
                start: dateOrObj,
                end: endDate
            };
        }
        var selection = date_span_1.parseDateSpan(selectionInput, this.dateEnv, duration_1.createDuration({ days: 1 }) // TODO: cache this?
        );
        if (selection) { // throw parse error otherwise?
            this.dispatch({ type: 'SELECT_DATES', selection: selection });
            this.triggerDateSelect(selection);
        }
    };
    // public method
    Calendar.prototype.unselect = function (pev) {
        if (this.state.dateSelection) {
            this.dispatch({ type: 'UNSELECT_DATES' });
            this.triggerDateUnselect(pev);
        }
    };
    Calendar.prototype.triggerDateSelect = function (selection, pev) {
        var arg = date_span_1.buildDateSpanApi(selection, this.dateEnv);
        arg.jsEvent = pev ? pev.origEvent : null;
        arg.view = this.view;
        this.publiclyTrigger('select', [arg]);
        if (pev) {
            this.isRecentPointerDateSelect = true;
        }
    };
    Calendar.prototype.triggerDateUnselect = function (pev) {
        this.publiclyTrigger('unselect', [
            {
                jsEvent: pev ? pev.origEvent : null,
                view: this.view
            }
        ]);
    };
    // TODO: receive pev?
    Calendar.prototype.triggerDayClick = function (dateSpan, dayEl, view, ev) {
        this.publiclyTrigger('dateClick', [
            {
                date: this.dateEnv.toDate(dateSpan.range.start),
                dateStr: this.dateEnv.formatIso(dateSpan.range.start, { omitTime: dateSpan.allDay }),
                allDay: dateSpan.allDay,
                dayEl: dayEl,
                jsEvent: ev,
                view: view
            }
        ]);
    };
    // Date Utils
    // -----------------------------------------------------------------------------------------------------------------
    // Returns a DateMarker for the current date, as defined by the client's computer or from the `now` option
    Calendar.prototype.getNow = function () {
        var now = this.opt('now');
        if (typeof now === 'function') {
            now = now();
        }
        if (now == null) {
            return this.dateEnv.createNowMarker();
        }
        return this.dateEnv.createMarker(now);
    };
    // Event-Date Utilities
    // -----------------------------------------------------------------------------------------------------------------
    // Given an event's allDay status and start date, return what its fallback end date should be.
    // TODO: rename to computeDefaultEventEnd
    Calendar.prototype.getDefaultEventEnd = function (allDay, marker) {
        var end = marker;
        if (allDay) {
            end = marker_1.startOfDay(end);
            end = this.dateEnv.add(end, this.defaultAllDayEventDuration);
        }
        else {
            end = this.dateEnv.add(end, this.defaultTimedEventDuration);
        }
        return end;
    };
    // Public Events API
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype.addEvent = function (eventInput, sourceInput) {
        if (eventInput instanceof EventApi_1.default) {
            // not already present? don't want to add an old snapshot
            if (!this.state.eventStore.defs[eventInput.def.defId]) {
                this.dispatch({
                    type: 'ADD_EVENTS',
                    eventStore: event_store_1.eventTupleToStore(eventInput)
                });
            }
            return eventInput;
        }
        var sourceId;
        if (sourceInput && sourceInput.sourceId !== undefined) { // can accept a source object
            sourceId = sourceInput.sourceId;
        }
        else if (typeof sourceInput === 'string') { // can accept a sourceId string
            sourceId = sourceInput;
        }
        else {
            sourceId = '';
        }
        var tuple = event_1.parseEvent(eventInput, sourceId, this);
        if (tuple) {
            this.dispatch({
                type: 'ADD_EVENTS',
                eventStore: event_store_1.eventTupleToStore(tuple)
            });
            return new EventApi_1.default(this, tuple.def, tuple.def.recurringDef ? null : tuple.instance);
        }
        return null;
    };
    // TODO: optimize
    Calendar.prototype.getEventById = function (id) {
        var _a = this.state.eventStore, defs = _a.defs, instances = _a.instances;
        id = String(id);
        for (var defId in defs) {
            var def = defs[defId];
            if (def.publicId === id) {
                if (def.recurringDef) {
                    return new EventApi_1.default(this, def, null);
                }
                else {
                    for (var instanceId in instances) {
                        var instance = instances[instanceId];
                        if (instance.defId === def.defId) {
                            return new EventApi_1.default(this, def, instance);
                        }
                    }
                }
            }
        }
        return null;
    };
    Calendar.prototype.getEvents = function () {
        var _a = this.state.eventStore, defs = _a.defs, instances = _a.instances;
        var eventApis = [];
        for (var id in instances) {
            var instance = instances[id];
            var def = defs[instance.defId];
            eventApis.push(new EventApi_1.default(this, def, instance));
        }
        return eventApis;
    };
    Calendar.prototype.removeAllEvents = function () {
        this.dispatch({ type: 'REMOVE_ALL_EVENTS' });
    };
    Calendar.prototype.rerenderEvents = function () {
        this.requestRerender({ events: true }); // TODO: test this
    };
    // Public Event Sources API
    // -----------------------------------------------------------------------------------------------------------------
    Calendar.prototype.getEventSources = function () {
        var sourceHash = this.state.eventSources;
        var sourceApis = [];
        for (var internalId in sourceHash) {
            sourceApis.push(new EventSourceApi_1.default(this, sourceHash[internalId]));
        }
        return sourceApis;
    };
    Calendar.prototype.getEventSourceById = function (id) {
        var sourceHash = this.state.eventSources;
        id = String(id);
        for (var sourceId in sourceHash) {
            if (sourceHash[sourceId].publicId === id) {
                return new EventSourceApi_1.default(this, sourceHash[sourceId]);
            }
        }
        return null;
    };
    Calendar.prototype.addEventSource = function (sourceInput) {
        if (sourceInput instanceof EventSourceApi_1.default) {
            // not already present? don't want to add an old snapshot
            if (!this.state.eventSources[sourceInput.internalEventSource.sourceId]) {
                this.dispatch({
                    type: 'ADD_EVENT_SOURCES',
                    sources: [sourceInput.internalEventSource]
                });
            }
            return sourceInput;
        }
        var eventSource = event_source_1.parseEventSource(sourceInput, this);
        if (eventSource) { // TODO: error otherwise?
            this.dispatch({ type: 'ADD_EVENT_SOURCES', sources: [eventSource] });
            return new EventSourceApi_1.default(this, eventSource);
        }
        return null;
    };
    Calendar.prototype.removeAllEventSources = function () {
        this.dispatch({ type: 'REMOVE_ALL_EVENT_SOURCES' });
    };
    Calendar.prototype.refetchEvents = function () {
        this.dispatch({ type: 'FETCH_EVENT_SOURCES' });
    };
    return Calendar;
}());
exports.default = Calendar;
EmitterMixin_1.default.mixInto(Calendar);
// for reselectors
// -----------------------------------------------------------------------------------------------------------------
function buildDateEnv(locale, timeZone, timeZoneImpl, firstDay, weekNumberCalculation, weekLabel, cmdFormatter) {
    return new env_1.DateEnv({
        calendarSystem: 'gregory',
        timeZone: timeZone,
        timeZoneImpl: timeZoneImpl,
        locale: locale_1.getLocale(locale),
        weekNumberCalculation: weekNumberCalculation,
        firstDay: firstDay,
        weekLabel: weekLabel,
        cmdFormatter: cmdFormatter
    });
}
function buildTheme(calendarOptions) {
    var themeClass = ThemeRegistry_1.getThemeSystemClass(calendarOptions.themeSystem || calendarOptions.theme);
    return new themeClass(calendarOptions);
}
function buildDelayedRerender(wait) {
    var func = this.tryRerender.bind(this);
    if (wait != null) {
        func = misc_1.debounce(func, wait);
    }
    return func;
}


/***/ }),
/* 176 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var html_1 = __webpack_require__(9);
var dom_manip_1 = __webpack_require__(3);
var Component_1 = __webpack_require__(140);
var Toolbar = /** @class */ (function (_super) {
    tslib_1.__extends(Toolbar, _super);
    function Toolbar(calendar, extraClassName) {
        var _this = _super.call(this) || this;
        _this.el = null;
        _this.calendar = calendar;
        _this.setElement(dom_manip_1.createElement('div', { className: 'fc-toolbar ' + extraClassName }));
        return _this;
    }
    Toolbar.prototype.render = function (renderProps, forceFlags) {
        // TODO: break layout into left/center/right props, to prevent unnecessary rerenders
        if (renderProps.layout !== this.layout || forceFlags === true) {
            if (this.isLayoutRendered) {
                this.unrenderLayout();
            }
            this.renderLayout(renderProps.layout);
            this.layout = renderProps.layout;
            this.isLayoutRendered = true;
            forceFlags = true; // everything else must render
        }
        if (renderProps.title !== this.title || forceFlags === true) {
            this.updateTitle(renderProps.title);
            this.title = renderProps.title;
        }
        if (renderProps.activeButton !== this.activeButton || forceFlags === true) {
            if (this.activeButton) {
                this.deactivateButton(this.activeButton);
            }
            this.activateButton(renderProps.activeButton);
            this.activeButton = renderProps.activeButton;
        }
        if (renderProps.isTodayEnabled !== this.isTodayEnabled || forceFlags === true) {
            if (renderProps.isTodayEnabled) {
                this.enableButton('today');
            }
            else {
                this.disableButton('today');
            }
            this.isTodayEnabled = renderProps.isTodayEnabled;
        }
        if (renderProps.isPrevEnabled !== this.isPrevEnabled || forceFlags === true) {
            if (renderProps.isPrevEnabled) {
                this.enableButton('prev');
            }
            else {
                this.disableButton('prev');
            }
            this.isPrevEnabled = renderProps.isPrevEnabled;
        }
        if (renderProps.isNextEnabled !== this.isNextEnabled || forceFlags === true) {
            if (renderProps.isNextEnabled) {
                this.enableButton('next');
            }
            else {
                this.disableButton('next');
            }
            this.isNextEnabled = renderProps.isNextEnabled;
        }
    };
    Toolbar.prototype.renderLayout = function (layout) {
        var el = this.el;
        this.viewsWithButtons = [];
        dom_manip_1.appendToElement(el, this.renderSection('left', layout.left));
        dom_manip_1.appendToElement(el, this.renderSection('right', layout.right));
        dom_manip_1.appendToElement(el, this.renderSection('center', layout.center));
        dom_manip_1.appendToElement(el, '<div class="fc-clear"></div>');
    };
    Toolbar.prototype.unrenderLayout = function () {
        this.el.innerHTML = '';
    };
    Toolbar.prototype.removeElement = function () {
        this.unrenderLayout();
        this.isLayoutRendered = false;
        this.layout = null;
        this.title = null;
        this.activeButton = null;
        this.isTodayEnabled = null;
        this.isPrevEnabled = null;
        this.isNextEnabled = null;
        _super.prototype.removeElement.call(this);
    };
    Toolbar.prototype.renderSection = function (position, buttonStr) {
        var _this = this;
        var calendar = this.calendar;
        var theme = calendar.theme;
        var optionsManager = calendar.optionsManager;
        var viewSpecs = calendar.viewSpecs;
        var sectionEl = dom_manip_1.createElement('div', { className: 'fc-' + position });
        var calendarCustomButtons = optionsManager.computed.customButtons || {};
        var calendarButtonTextOverrides = optionsManager.overrides.buttonText || {};
        var calendarButtonText = optionsManager.computed.buttonText || {};
        if (buttonStr) {
            buttonStr.split(' ').forEach(function (buttonGroupStr, i) {
                var groupChildren = [];
                var isOnlyButtons = true;
                var groupEl;
                buttonGroupStr.split(',').forEach(function (buttonName, j) {
                    var customButtonProps;
                    var viewSpec;
                    var buttonClick;
                    var buttonIcon; // only one of these will be set
                    var buttonText; // "
                    var buttonInnerHtml;
                    var buttonClasses;
                    var buttonEl;
                    var buttonAriaAttr;
                    if (buttonName === 'title') {
                        groupChildren.push(dom_manip_1.htmlToElement('<h2>&nbsp;</h2>')); // we always want it to take up height
                        isOnlyButtons = false;
                    }
                    else {
                        if ((customButtonProps = calendarCustomButtons[buttonName])) {
                            buttonClick = function (ev) {
                                if (customButtonProps.click) {
                                    customButtonProps.click.call(buttonEl, ev);
                                }
                            };
                            (buttonIcon = theme.getCustomButtonIconClass(customButtonProps)) ||
                                (buttonIcon = theme.getIconClass(buttonName)) ||
                                (buttonText = customButtonProps.text);
                        }
                        else if ((viewSpec = viewSpecs[buttonName])) {
                            _this.viewsWithButtons.push(buttonName);
                            buttonClick = function () {
                                calendar.changeView(buttonName);
                            };
                            (buttonText = viewSpec.buttonTextOverride) ||
                                (buttonIcon = theme.getIconClass(buttonName)) ||
                                (buttonText = viewSpec.buttonTextDefault);
                        }
                        else if (calendar[buttonName]) { // a calendar method
                            buttonClick = function () {
                                calendar[buttonName]();
                            };
                            (buttonText = calendarButtonTextOverrides[buttonName]) ||
                                (buttonIcon = theme.getIconClass(buttonName)) ||
                                (buttonText = calendarButtonText[buttonName]);
                            //            ^ everything else is considered default
                        }
                        if (buttonClick) {
                            buttonClasses = [
                                'fc-' + buttonName + '-button',
                                theme.getClass('button'),
                                theme.getClass('stateDefault')
                            ];
                            if (buttonText) {
                                buttonInnerHtml = html_1.htmlEscape(buttonText);
                                buttonAriaAttr = '';
                            }
                            else if (buttonIcon) {
                                buttonInnerHtml = "<span class='" + buttonIcon + "'></span>";
                                buttonAriaAttr = ' aria-label="' + buttonName + '"';
                            }
                            buttonEl = dom_manip_1.htmlToElement(// type="button" so that it doesn't submit a form
                            '<button type="button" class="' + buttonClasses.join(' ') + '"' +
                                buttonAriaAttr +
                                '>' + buttonInnerHtml + '</button>');
                            var allowInteraction_1 = function () {
                                var activeClassName = theme.getClass('stateActive');
                                var disabledClassName = theme.getClass('stateDisabled');
                                return (!activeClassName || !buttonEl.classList.contains(activeClassName)) &&
                                    (!disabledClassName || !buttonEl.classList.contains(disabledClassName));
                            };
                            buttonEl.addEventListener('click', function (ev) {
                                var disabledClassName = theme.getClass('stateDisabled');
                                var hoverClassName = theme.getClass('stateHover');
                                // don't process clicks for disabled buttons
                                if (!disabledClassName || !buttonEl.classList.contains(disabledClassName)) {
                                    buttonClick(ev);
                                    // after the click action, if the button becomes the "active" tab, or disabled,
                                    // it should never have a hover class, so remove it now.
                                    if (!allowInteraction_1() && hoverClassName) {
                                        buttonEl.classList.remove(hoverClassName);
                                    }
                                }
                            });
                            buttonEl.addEventListener('mousedown', function (ev) {
                                var downClassName = theme.getClass('stateDown');
                                // the *down* effect (mouse pressed in).
                                // only on buttons that are not the "active" tab, or disabled
                                if (allowInteraction_1() && downClassName) {
                                    buttonEl.classList.add(downClassName);
                                }
                            });
                            buttonEl.addEventListener('mouseup', function (ev) {
                                var downClassName = theme.getClass('stateDown');
                                // undo the *down* effect
                                if (downClassName) {
                                    buttonEl.classList.remove(downClassName);
                                }
                            });
                            buttonEl.addEventListener('mouseenter', function (ev) {
                                var hoverClassName = theme.getClass('stateHover');
                                // the *hover* effect.
                                // only on buttons that are not the "active" tab, or disabled
                                if (allowInteraction_1() && hoverClassName) {
                                    buttonEl.classList.add(hoverClassName);
                                }
                            });
                            buttonEl.addEventListener('mouseleave', function (ev) {
                                var hoverClassName = theme.getClass('stateHover');
                                var downClassName = theme.getClass('stateDown');
                                // undo the *hover* effect
                                if (hoverClassName) {
                                    buttonEl.classList.remove(hoverClassName);
                                }
                                if (downClassName) {
                                    buttonEl.classList.remove(downClassName); // if mouseleave happens before mouseup
                                }
                            });
                            groupChildren.push(buttonEl);
                        }
                    }
                });
                if (isOnlyButtons && groupChildren.length > 0) {
                    var cornerLeftClassName = theme.getClass('cornerLeft');
                    var cornerRightClassName = theme.getClass('cornerRight');
                    if (cornerLeftClassName) {
                        groupChildren[0].classList.add(cornerLeftClassName);
                    }
                    if (cornerRightClassName) {
                        groupChildren[groupChildren.length - 1].classList.add(cornerRightClassName);
                    }
                }
                if (groupChildren.length > 1) {
                    groupEl = document.createElement('div');
                    var buttonGroupClassName = theme.getClass('buttonGroup');
                    if (isOnlyButtons && buttonGroupClassName) {
                        groupEl.classList.add(buttonGroupClassName);
                    }
                    dom_manip_1.appendToElement(groupEl, groupChildren);
                    sectionEl.appendChild(groupEl);
                }
                else {
                    dom_manip_1.appendToElement(sectionEl, groupChildren); // 1 or 0 children
                }
            });
        }
        return sectionEl;
    };
    Toolbar.prototype.updateTitle = function (text) {
        dom_manip_1.findElements(this.el, 'h2').forEach(function (titleEl) {
            titleEl.innerText = text;
        });
    };
    Toolbar.prototype.activateButton = function (buttonName) {
        var _this = this;
        dom_manip_1.findElements(this.el, '.fc-' + buttonName + '-button').forEach(function (buttonEl) {
            buttonEl.classList.add(_this.calendar.theme.getClass('stateActive'));
        });
    };
    Toolbar.prototype.deactivateButton = function (buttonName) {
        var _this = this;
        dom_manip_1.findElements(this.el, '.fc-' + buttonName + '-button').forEach(function (buttonEl) {
            buttonEl.classList.remove(_this.calendar.theme.getClass('stateActive'));
        });
    };
    Toolbar.prototype.disableButton = function (buttonName) {
        var _this = this;
        dom_manip_1.findElements(this.el, '.fc-' + buttonName + '-button').forEach(function (buttonEl) {
            buttonEl.disabled = true;
            buttonEl.classList.add(_this.calendar.theme.getClass('stateDisabled'));
        });
    };
    Toolbar.prototype.enableButton = function (buttonName) {
        var _this = this;
        dom_manip_1.findElements(this.el, '.fc-' + buttonName + '-button').forEach(function (buttonEl) {
            buttonEl.disabled = false;
            buttonEl.classList.remove(_this.calendar.theme.getClass('stateDisabled'));
        });
    };
    Toolbar.prototype.getViewsWithButtons = function () {
        return this.viewsWithButtons;
    };
    return Toolbar;
}(Component_1.default));
exports.default = Toolbar;


/***/ }),
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var object_1 = __webpack_require__(4);
var misc_1 = __webpack_require__(2);
var options_1 = __webpack_require__(32);
var locale_1 = __webpack_require__(41);
var OptionsManager = /** @class */ (function () {
    function OptionsManager(overrides) {
        this.overrides = object_1.assignTo({}, overrides); // make a copy
        this.dynamicOverrides = {};
        this.compute();
    }
    OptionsManager.prototype.add = function (name, value) {
        this.dynamicOverrides[name] = value;
        this.compute();
    };
    // Computes the flattened options hash for the calendar and assigns to `this.options`.
    // Assumes this.overrides and this.dynamicOverrides have already been initialized.
    OptionsManager.prototype.compute = function () {
        var locale;
        var localeDefaults;
        var dir;
        var dirDefaults;
        locale = misc_1.firstDefined(// explicit locale option given?
        this.dynamicOverrides.locale, this.overrides.locale, options_1.globalDefaults.locale);
        localeDefaults = locale_1.getLocale(locale).options; // TODO: not efficient bc calendar already queries this
        dir = misc_1.firstDefined(// based on options computed so far, is direction RTL?
        this.dynamicOverrides.dir, this.overrides.dir, localeDefaults.dir);
        dirDefaults = dir === 'rtl' ? options_1.rtlDefaults : {};
        this.dirDefaults = dirDefaults;
        this.localeDefaults = localeDefaults;
        this.computed = options_1.mergeOptions([
            options_1.globalDefaults,
            dirDefaults,
            localeDefaults,
            this.overrides,
            this.dynamicOverrides
        ]);
    };
    return OptionsManager;
}());
exports.default = OptionsManager;


/***/ }),
/* 178 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var marker_1 = __webpack_require__(6);
var calendarSystemClassMap = {};
function registerCalendarSystem(name, theClass) {
    calendarSystemClassMap[name] = theClass;
}
exports.registerCalendarSystem = registerCalendarSystem;
function createCalendarSystem(name) {
    return new calendarSystemClassMap[name]();
}
exports.createCalendarSystem = createCalendarSystem;
var GregorianCalendarSystem = /** @class */ (function () {
    function GregorianCalendarSystem() {
    }
    GregorianCalendarSystem.prototype.getMarkerYear = function (d) {
        return d.getUTCFullYear();
    };
    GregorianCalendarSystem.prototype.getMarkerMonth = function (d) {
        return d.getUTCMonth();
    };
    GregorianCalendarSystem.prototype.getMarkerDay = function (d) {
        return d.getUTCDate();
    };
    GregorianCalendarSystem.prototype.arrayToMarker = function (arr) {
        return marker_1.arrayToUtcDate(arr);
    };
    GregorianCalendarSystem.prototype.markerToArray = function (marker) {
        return marker_1.dateToUtcArray(marker);
    };
    return GregorianCalendarSystem;
}());
registerCalendarSystem('gregory', GregorianCalendarSystem);


/***/ }),
/* 179 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var eventSources_1 = __webpack_require__(180);
var eventStore_1 = __webpack_require__(181);
var DateProfileGenerator_1 = __webpack_require__(57);
var event_rendering_1 = __webpack_require__(28);
function default_1(state, action, calendar) {
    calendar.publiclyTrigger(action.type, action); // for testing hooks
    var dateProfile = reduceDateProfile(state.dateProfile, action);
    var eventSources = eventSources_1.default(state.eventSources, action, dateProfile, calendar);
    return {
        dateProfile: dateProfile,
        eventSources: eventSources,
        eventStore: eventStore_1.default(state.eventStore, action, eventSources, dateProfile, calendar),
        eventUis: state.eventUis,
        businessHours: state.businessHours,
        dateSelection: reduceDateSelection(state.dateSelection, action, calendar),
        eventSelection: reduceSelectedEvent(state.eventSelection, action),
        eventDrag: reduceEventDrag(state.eventDrag, action, eventSources, calendar),
        eventResize: reduceEventResize(state.eventResize, action, eventSources, calendar),
        eventSourceLoadingLevel: computeLoadingLevel(eventSources),
        loadingLevel: computeLoadingLevel(eventSources)
    };
}
exports.default = default_1;
function reduceDateProfile(currentDateProfile, action) {
    switch (action.type) {
        case 'SET_DATE_PROFILE':
            return (currentDateProfile && DateProfileGenerator_1.isDateProfilesEqual(currentDateProfile, action.dateProfile)) ?
                currentDateProfile : // if same, reuse the same object, better for rerenders
                action.dateProfile;
        default:
            return currentDateProfile;
    }
}
function reduceDateSelection(currentSelection, action, calendar) {
    switch (action.type) {
        case 'SELECT_DATES':
            return action.selection;
        case 'UNSELECT_DATES':
            return null;
        default:
            return currentSelection;
    }
}
function reduceSelectedEvent(currentInstanceId, action) {
    switch (action.type) {
        case 'SELECT_EVENT':
            return action.eventInstanceId;
        case 'UNSELECT_EVENT':
            return '';
        default:
            return currentInstanceId;
    }
}
function reduceEventDrag(currentDrag, action, sources, calendar) {
    switch (action.type) {
        case 'SET_EVENT_DRAG':
            var newDrag = action.state;
            var eventUis = event_rendering_1.computeEventDefUis(newDrag.mutatedEvents.defs, sources, calendar.view ? calendar.view.options : {} // yuck
            );
            return {
                affectedEvents: newDrag.affectedEvents,
                mutatedEvents: newDrag.mutatedEvents,
                isEvent: newDrag.isEvent,
                origSeg: newDrag.origSeg,
                eventUis: eventUis
            };
        case 'UNSET_EVENT_DRAG':
            return null;
        default:
            return currentDrag;
    }
}
function reduceEventResize(currentResize, action, sources, calendar) {
    switch (action.type) {
        case 'SET_EVENT_RESIZE':
            var newResize = action.state;
            var eventUis = event_rendering_1.computeEventDefUis(newResize.mutatedEvents.defs, sources, calendar.view ? calendar.view.options : {} // yuck
            );
            return {
                affectedEvents: newResize.affectedEvents,
                mutatedEvents: newResize.mutatedEvents,
                isEvent: newResize.isEvent,
                origSeg: newResize.origSeg,
                eventUis: eventUis
            };
        case 'UNSET_EVENT_RESIZE':
            return null;
        default:
            return currentResize;
    }
}
function computeLoadingLevel(eventSources) {
    var cnt = 0;
    for (var sourceId in eventSources) {
        if (eventSources[sourceId].isFetching) {
            cnt++;
        }
    }
    return cnt;
}


/***/ }),
/* 180 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var event_source_1 = __webpack_require__(22);
var object_1 = __webpack_require__(4);
var misc_1 = __webpack_require__(2);
function default_1(eventSources, action, dateProfile, calendar) {
    switch (action.type) {
        case 'ADD_EVENT_SOURCES': // already parsed
            return addSources(eventSources, action.sources, dateProfile ? dateProfile.activeRange : null, calendar);
        case 'REMOVE_EVENT_SOURCE':
            return removeSource(eventSources, action.sourceId);
        case 'SET_DATE_PROFILE':
            return fetchDirtySources(eventSources, action.dateProfile.activeRange, calendar);
        case 'FETCH_EVENT_SOURCES':
        case 'CHANGE_TIMEZONE':
            return fetchSourcesByIds(eventSources, action.sourceIds ?
                object_1.arrayToHash(action.sourceIds) :
                excludeStaticSources(eventSources), dateProfile ? dateProfile.activeRange : null, calendar);
        case 'RECEIVE_EVENTS':
        case 'RECEIVE_EVENT_ERROR':
            return receiveResponse(eventSources, action.sourceId, action.fetchId, action.fetchRange);
        case 'REMOVE_ALL_EVENT_SOURCES':
            return {};
        default:
            return eventSources;
    }
}
exports.default = default_1;
var uid = 0;
function addSources(eventSourceHash, sources, fetchRange, calendar) {
    var hash = {};
    for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
        var source = sources_1[_i];
        hash[source.sourceId] = source;
    }
    hash = fetchDirtySources(hash, fetchRange, calendar);
    return object_1.assignTo({}, eventSourceHash, hash);
}
function removeSource(eventSourceHash, sourceId) {
    return object_1.filterHash(eventSourceHash, function (eventSource) {
        return eventSource.sourceId !== sourceId;
    });
}
function fetchDirtySources(sourceHash, fetchRange, calendar) {
    return fetchSourcesByIds(sourceHash, object_1.filterHash(sourceHash, function (eventSource) {
        return isSourceDirty(eventSource, fetchRange, calendar);
    }), fetchRange, calendar);
}
function isSourceDirty(eventSource, fetchRange, calendar) {
    if (!event_source_1.doesSourceNeedRange(eventSource)) {
        return !eventSource.latestFetchId;
    }
    else if (fetchRange) {
        return !calendar.opt('lazyFetching') ||
            !eventSource.fetchRange ||
            fetchRange.start < eventSource.fetchRange.start ||
            fetchRange.end > eventSource.fetchRange.end;
    }
    return false;
}
function fetchSourcesByIds(prevSources, sourceIdHash, fetchRange, calendar) {
    var nextSources = {};
    for (var sourceId in prevSources) {
        var source = prevSources[sourceId];
        if (sourceIdHash[sourceId]) {
            nextSources[sourceId] = fetchSource(source, fetchRange, calendar);
        }
        else {
            nextSources[sourceId] = source;
        }
    }
    return nextSources;
}
function fetchSource(eventSource, fetchRange, calendar) {
    var sourceDef = event_source_1.getEventSourceDef(eventSource.sourceDefId);
    var fetchId = String(uid++);
    sourceDef.fetch({
        eventSource: eventSource,
        calendar: calendar,
        range: fetchRange
    }, function (res) {
        var rawEvents = res.rawEvents;
        var calSuccess = calendar.opt('eventSourceSuccess');
        var calSuccessRes;
        var sourceSuccessRes;
        if (eventSource.success) {
            sourceSuccessRes = eventSource.success(rawEvents, res.response);
        }
        if (calSuccess) {
            calSuccessRes = calSuccess(rawEvents, res.response);
        }
        rawEvents = sourceSuccessRes || calSuccessRes || rawEvents;
        calendar.dispatch({
            type: 'RECEIVE_EVENTS',
            sourceId: eventSource.sourceId,
            fetchId: fetchId,
            fetchRange: fetchRange,
            rawEvents: rawEvents
        });
    }, function (error) {
        var callFailure = calendar.opt('eventSourceFailure');
        misc_1.warn(error.message, error);
        if (eventSource.failure) {
            eventSource.failure(error);
        }
        if (callFailure) {
            callFailure(error);
        }
        calendar.dispatch({
            type: 'RECEIVE_EVENT_ERROR',
            sourceId: eventSource.sourceId,
            fetchId: fetchId,
            fetchRange: fetchRange,
            error: error
        });
    });
    return object_1.assignTo({}, eventSource, {
        isFetching: true,
        latestFetchId: fetchId
    });
}
function receiveResponse(sourceHash, sourceId, fetchId, fetchRange) {
    var _a;
    var eventSource = sourceHash[sourceId];
    if (eventSource && // not already removed
        fetchId === eventSource.latestFetchId) {
        return object_1.assignTo({}, sourceHash, (_a = {},
            _a[sourceId] = object_1.assignTo({}, eventSource, {
                isFetching: false,
                fetchRange: fetchRange
            }),
            _a));
    }
    return sourceHash;
}
function excludeStaticSources(eventSources) {
    return object_1.filterHash(eventSources, function (eventSource) {
        return event_source_1.doesSourceNeedRange(eventSource);
    });
}


/***/ }),
/* 181 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var object_1 = __webpack_require__(4);
var event_mutation_1 = __webpack_require__(55);
var event_store_1 = __webpack_require__(14);
function default_1(eventStore, action, eventSources, dateProfile, calendar) {
    switch (action.type) {
        case 'RECEIVE_EVENTS': // raw
            return receiveRawEvents(eventStore, eventSources[action.sourceId], action.fetchId, action.fetchRange, action.rawEvents, calendar);
        case 'ADD_EVENTS': // already parsed, but not expanded
            return addEvent(eventStore, action.eventStore, // new ones
            dateProfile ? dateProfile.activeRange : null, calendar);
        case 'MERGE_EVENTS': // already parsed and expanded
            return event_store_1.mergeEventStores(eventStore, action.eventStore);
        case 'SET_DATE_PROFILE':
            if (dateProfile) {
                return event_store_1.expandRecurring(eventStore, dateProfile.activeRange, calendar);
            }
            else {
                return eventStore;
            }
        case 'CHANGE_TIMEZONE':
            return rezoneDates(eventStore, action.oldDateEnv, calendar.dateEnv);
        case 'MUTATE_EVENTS':
            return applyMutationToRelated(eventStore, action.instanceId, action.mutation, calendar);
        case 'REMOVE_EVENT_INSTANCES':
            return excludeInstances(eventStore, action.instances);
        case 'REMOVE_EVENT_DEF':
            return event_store_1.filterEventStoreDefs(eventStore, function (eventDef) {
                return eventDef.defId !== action.defId;
            });
        case 'REMOVE_EVENT_SOURCE':
            return excludeEventsBySourceId(eventStore, action.sourceId);
        case 'REMOVE_ALL_EVENT_SOURCES':
            return event_store_1.filterEventStoreDefs(eventStore, function (eventDef) {
                return !eventDef.sourceId; // only keep events with no source id
            });
        case 'REMOVE_ALL_EVENTS':
            return event_store_1.createEmptyEventStore();
        default:
            return eventStore;
    }
}
exports.default = default_1;
function receiveRawEvents(eventStore, eventSource, fetchId, fetchRange, rawEvents, calendar) {
    if (eventSource && // not already removed
        fetchId === eventSource.latestFetchId // TODO: wish this logic was always in event-sources
    ) {
        var subset = event_store_1.parseEvents(event_store_1.transformRawEvents(rawEvents, eventSource, calendar), eventSource.sourceId, calendar);
        if (fetchRange) {
            subset = event_store_1.expandRecurring(subset, fetchRange, calendar);
        }
        return event_store_1.mergeEventStores(excludeEventsBySourceId(eventStore, eventSource.sourceId), subset);
    }
    return eventStore;
}
function addEvent(eventStore, subset, expandRange, calendar) {
    if (expandRange) {
        subset = event_store_1.expandRecurring(subset, expandRange, calendar);
    }
    return event_store_1.mergeEventStores(eventStore, subset);
}
function rezoneDates(eventStore, oldDateEnv, newDateEnv) {
    var defs = eventStore.defs;
    var instances = object_1.mapHash(eventStore.instances, function (instance) {
        var def = defs[instance.defId];
        if (def.allDay || def.recurringDef) {
            return instance; // isn't dependent on timezone
        }
        else {
            return object_1.assignTo({}, instance, {
                range: {
                    start: newDateEnv.createMarker(oldDateEnv.toDate(instance.range.start, instance.forcedStartTzo)),
                    end: newDateEnv.createMarker(oldDateEnv.toDate(instance.range.end, instance.forcedEndTzo))
                },
                forcedStartTzo: newDateEnv.canComputeOffset ? null : instance.forcedStartTzo,
                forcedEndTzo: newDateEnv.canComputeOffset ? null : instance.forcedEndTzo
            });
        }
    });
    return { defs: defs, instances: instances };
}
function applyMutationToRelated(eventStore, instanceId, mutation, calendar) {
    var relevant = event_store_1.getRelevantEvents(eventStore, instanceId);
    relevant = event_mutation_1.applyMutationToEventStore(relevant, mutation, calendar);
    return event_store_1.mergeEventStores(eventStore, relevant);
}
function excludeEventsBySourceId(eventStore, sourceId) {
    return event_store_1.filterEventStoreDefs(eventStore, function (eventDef) {
        return eventDef.sourceId !== sourceId;
    });
}
function excludeInstances(eventStore, removals) {
    return {
        defs: eventStore.defs,
        instances: object_1.filterHash(eventStore.instances, function (instance) {
            return !removals[instance.instanceId];
        })
    };
}


/***/ }),
/* 182 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var object_1 = __webpack_require__(4);
var event_store_1 = __webpack_require__(14);
var DEF_DEFAULTS = {
    startTime: '09:00',
    endTime: '17:00',
    daysOfWeek: [1, 2, 3, 4, 5],
    rendering: 'inverse-background',
    classNames: 'fc-nonbusiness',
    groupId: '_businessHours' // so multiple defs get grouped
};
function parseBusinessHours(input, calendar) {
    return event_store_1.parseEvents(refineInputs(input), '', calendar);
}
exports.parseBusinessHours = parseBusinessHours;
function refineInputs(input) {
    var rawDefs;
    if (input === true) {
        rawDefs = [{}]; // will get DEF_DEFAULTS verbatim
    }
    else if (Array.isArray(input)) {
        // if specifying an array, every sub-definition NEEDS a day-of-week
        rawDefs = input.filter(function (rawDef) {
            return rawDef.daysOfWeek;
        });
    }
    else if (typeof input === 'object' && input) { // non-null object
        rawDefs = [input];
    }
    else { // is probably false
        rawDefs = [];
    }
    rawDefs = rawDefs.map(function (rawDef) {
        return object_1.assignTo({}, DEF_DEFAULTS, rawDef);
    });
    return rawDefs;
}


/***/ }),
/* 183 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var view_def_1 = __webpack_require__(184);
var duration_1 = __webpack_require__(10);
var object_1 = __webpack_require__(4);
var options_1 = __webpack_require__(32);
var view_config_1 = __webpack_require__(185);
function buildViewSpecs(defaultInputs, optionsManager) {
    var defaultConfigs = view_config_1.parseViewConfigs(defaultInputs);
    var overrideConfigs = view_config_1.parseViewConfigs(optionsManager.overrides.views);
    var viewDefs = view_def_1.compileViewDefs(defaultConfigs, overrideConfigs);
    return object_1.mapHash(viewDefs, function (viewDef) {
        return buildViewSpec(viewDef, overrideConfigs, optionsManager);
    });
}
exports.buildViewSpecs = buildViewSpecs;
function buildViewSpec(viewDef, overrideConfigs, optionsManager) {
    var durationInput = viewDef.overrides.duration ||
        viewDef.defaults.duration ||
        optionsManager.dynamicOverrides.duration ||
        optionsManager.overrides.duration;
    var duration = null;
    var durationUnit = '';
    var singleUnit = '';
    var singleUnitOverrides = {};
    if (durationInput) {
        duration = duration_1.createDuration(durationInput);
        if (duration) { // valid?
            var denom = duration_1.greatestDurationDenominator(duration, !duration_1.getWeeksFromInput(durationInput));
            durationUnit = denom.unit;
            if (denom.value === 1) {
                singleUnit = durationUnit;
                singleUnitOverrides = overrideConfigs[durationUnit] ? overrideConfigs[durationUnit].options : {};
            }
        }
    }
    var queryButtonText = function (options) {
        var buttonText = options.buttonText || {};
        if (buttonText[viewDef.type] != null) {
            return buttonText[viewDef.type];
        }
        if (buttonText[singleUnit] != null) {
            return buttonText[singleUnit];
        }
    };
    return {
        type: viewDef.type,
        class: viewDef.class,
        duration: duration,
        durationUnit: durationUnit,
        singleUnit: singleUnit,
        options: object_1.assignTo({}, options_1.globalDefaults, viewDef.defaults, optionsManager.dirDefaults, optionsManager.localeDefaults, optionsManager.overrides, singleUnitOverrides, viewDef.overrides, optionsManager.dynamicOverrides),
        buttonTextOverride: queryButtonText(optionsManager.dynamicOverrides) ||
            queryButtonText(optionsManager.overrides) || // constructor-specified buttonText lookup hash takes precedence
            viewDef.overrides.buttonText,
        buttonTextDefault: queryButtonText(optionsManager.localeDefaults) ||
            queryButtonText(optionsManager.dirDefaults) ||
            viewDef.defaults.buttonText || // a single string. from ViewSubclass.defaults
            queryButtonText(options_1.globalDefaults) ||
            viewDef.type // fall back to given view name
    };
}


/***/ }),
/* 184 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var object_1 = __webpack_require__(4);
function compileViewDefs(defaultConfigs, overrideConfigs) {
    var hash = {};
    var viewType;
    for (viewType in defaultConfigs) {
        ensureViewDef(viewType, hash, defaultConfigs, overrideConfigs);
    }
    for (viewType in overrideConfigs) {
        ensureViewDef(viewType, hash, defaultConfigs, overrideConfigs);
    }
    return hash;
}
exports.compileViewDefs = compileViewDefs;
function ensureViewDef(viewType, hash, defaultConfigs, overrideConfigs) {
    if (hash[viewType]) {
        return hash[viewType];
    }
    var viewDef = buildViewDef(viewType, hash, defaultConfigs, overrideConfigs);
    if (viewDef) {
        hash[viewType] = viewDef;
    }
    return viewDef;
}
function buildViewDef(viewType, hash, defaultConfigs, overrideConfigs) {
    var defaultConfig = defaultConfigs[viewType];
    var overrideConfig = overrideConfigs[viewType];
    var queryProp = function (name) {
        return (defaultConfig && defaultConfig[name] !== null) ? defaultConfig[name] :
            ((overrideConfig && overrideConfig[name] !== null) ? overrideConfig[name] : null);
    };
    var theClass = queryProp('class');
    var superType = queryProp('superType');
    if (!superType && theClass) {
        superType =
            findViewNameBySubclass(theClass, overrideConfigs) ||
                findViewNameBySubclass(theClass, defaultConfigs);
    }
    var superDef = superType ? ensureViewDef(superType, hash, defaultConfigs, overrideConfigs) : null;
    if (!theClass && superDef) {
        theClass = superDef.class;
    }
    if (!theClass) {
        return null; // don't throw a warning, might be settings for a single-unit view
    }
    return {
        type: viewType,
        class: theClass,
        defaults: object_1.assignTo({}, superDef ? superDef.defaults : {}, defaultConfig ? defaultConfig.options : {}),
        overrides: object_1.assignTo({}, superDef ? superDef.overrides : {}, overrideConfig ? overrideConfig.options : {})
    };
}
function findViewNameBySubclass(viewSubclass, configs) {
    var superProto = Object.getPrototypeOf(viewSubclass.prototype);
    for (var viewType in configs) {
        var parsed = configs[viewType];
        // need DIRECT subclass, so instanceof won't do it
        if (parsed.class && parsed.class.prototype === superProto) {
            return viewType;
        }
    }
    return '';
}


/***/ }),
/* 185 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var misc_1 = __webpack_require__(2);
var object_1 = __webpack_require__(4);
function parseViewConfigs(inputs) {
    return object_1.mapHash(inputs, parseViewConfig);
}
exports.parseViewConfigs = parseViewConfigs;
var VIEW_DEF_PROPS = {
    type: String,
    class: null
};
function parseViewConfig(input) {
    if (typeof input === 'function') {
        input = { class: input };
    }
    var options = {};
    var props = misc_1.refineProps(input, VIEW_DEF_PROPS, {}, options);
    return {
        superType: props.type,
        class: props.class,
        options: options
    };
}


/***/ }),
/* 186 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var html_1 = __webpack_require__(9);
var dom_manip_1 = __webpack_require__(3);
var formatting_1 = __webpack_require__(8);
var EventRenderer_1 = __webpack_require__(18);
var misc_1 = __webpack_require__(2);
/*
Only handles foreground segs.
Does not own rendering. Use for low-level util methods by TimeGrid.
*/
var TimeGridEventRenderer = /** @class */ (function (_super) {
    tslib_1.__extends(TimeGridEventRenderer, _super);
    function TimeGridEventRenderer(timeGrid, fillRenderer) {
        var _this = _super.call(this, timeGrid, fillRenderer) || this;
        _this.timeGrid = timeGrid;
        _this.fullTimeFormat = formatting_1.createFormatter({
            hour: 'numeric',
            minute: '2-digit',
            separator: _this.opt('defaultRangeSeparator')
        });
        return _this;
    }
    TimeGridEventRenderer.prototype.renderFgSegs = function (segs) {
        this.renderFgSegsIntoContainers(segs, this.timeGrid.fgContainerEls);
    };
    // Given an array of foreground segments, render a DOM element for each, computes position,
    // and attaches to the column inner-container elements.
    TimeGridEventRenderer.prototype.renderFgSegsIntoContainers = function (segs, containerEls) {
        this.segsByCol = this.timeGrid.groupSegsByCol(segs);
        this.timeGrid.attachSegsByCol(this.segsByCol, containerEls);
    };
    TimeGridEventRenderer.prototype.unrenderFgSegs = function () {
        if (this.fgSegs) { // hack
            this.fgSegs.forEach(function (seg) {
                dom_manip_1.removeElement(seg.el);
            });
        }
        this.segsByCol = null;
    };
    TimeGridEventRenderer.prototype.computeFgSize = function () {
        var timeGrid = this.timeGrid;
        for (var col = 0; col < timeGrid.colCnt; col++) {
            var segs = this.segsByCol[col];
            timeGrid.computeSegVerticals(segs); // horizontals relies on this
            this.computeFgSegHorizontals(segs); // compute horizontal coordinates, z-index's, and reorder the array
        }
    };
    TimeGridEventRenderer.prototype.assignFgSize = function () {
        var timeGrid = this.timeGrid;
        for (var col = 0; col < timeGrid.colCnt; col++) {
            var segs = this.segsByCol[col];
            timeGrid.assignSegVerticals(segs);
            this.assignFgSegHorizontals(segs);
        }
    };
    // Computes a default event time formatting string if `eventTimeFormat` is not explicitly defined
    TimeGridEventRenderer.prototype.computeEventTimeFormat = function () {
        return {
            hour: 'numeric',
            minute: '2-digit',
            meridiem: false
        };
    };
    // Computes a default `displayEventEnd` value if one is not expliclty defined
    TimeGridEventRenderer.prototype.computeDisplayEventEnd = function () {
        return true;
    };
    // Renders the HTML for a single event segment's default rendering
    TimeGridEventRenderer.prototype.fgSegHtml = function (seg) {
        var eventRange = seg.eventRange;
        var eventDef = eventRange.def;
        var eventUi = eventRange.ui;
        var allDay = eventDef.allDay;
        var isDraggable = eventUi.startEditable;
        var isResizableFromStart = seg.isStart && eventUi.durationEditable && this.opt('eventResizableFromStart');
        var isResizableFromEnd = seg.isEnd && eventUi.durationEditable;
        var classes = this.getSegClasses(seg, isDraggable, isResizableFromStart || isResizableFromEnd);
        var skinCss = html_1.cssToStr(this.getSkinCss(eventUi));
        var timeText;
        var fullTimeText; // more verbose time text. for the print stylesheet
        var startTimeText; // just the start time text
        classes.unshift('fc-time-grid-event', 'fc-v-event');
        // if the event appears to span more than one day...
        if (misc_1.isMultiDayRange(eventRange.range)) {
            // Don't display time text on segments that run entirely through a day.
            // That would appear as midnight-midnight and would look dumb.
            // Otherwise, display the time text for the *segment's* times (like 6pm-midnight or midnight-10am)
            if (seg.isStart || seg.isEnd) {
                var unzonedStart = seg.start;
                var unzonedEnd = seg.end;
                timeText = this._getTimeText(unzonedStart, unzonedEnd, allDay); // TODO: give the timezones
                fullTimeText = this._getTimeText(unzonedStart, unzonedEnd, allDay, this.fullTimeFormat);
                startTimeText = this._getTimeText(unzonedStart, unzonedEnd, allDay, null, false); // displayEnd=false
            }
        }
        else {
            // Display the normal time text for the *event's* times
            timeText = this.getTimeText(eventRange);
            fullTimeText = this.getTimeText(eventRange, this.fullTimeFormat);
            startTimeText = this.getTimeText(eventRange, null, false); // displayEnd=false
        }
        return '<a class="' + classes.join(' ') + '"' +
            (eventDef.url ?
                ' href="' + html_1.htmlEscape(eventDef.url) + '"' :
                '') +
            (skinCss ?
                ' style="' + skinCss + '"' :
                '') +
            '>' +
            '<div class="fc-content">' +
            (timeText ?
                '<div class="fc-time"' +
                    ' data-start="' + html_1.htmlEscape(startTimeText) + '"' +
                    ' data-full="' + html_1.htmlEscape(fullTimeText) + '"' +
                    '>' +
                    '<span>' + html_1.htmlEscape(timeText) + '</span>' +
                    '</div>' :
                '') +
            (eventDef.title ?
                '<div class="fc-title">' +
                    html_1.htmlEscape(eventDef.title) +
                    '</div>' :
                '') +
            '</div>' +
            '<div class="fc-bg"></div>' +
            /* TODO: write CSS for this
            (isResizableFromStart ?
              '<div class="fc-resizer fc-start-resizer"></div>' :
              ''
              ) +
            */
            (isResizableFromEnd ?
                '<div class="fc-resizer fc-end-resizer"></div>' :
                '') +
            '</a>';
    };
    // Given an array of segments that are all in the same column, sets the backwardCoord and forwardCoord on each.
    // NOTE: Also reorders the given array by date!
    TimeGridEventRenderer.prototype.computeFgSegHorizontals = function (segs) {
        var levels;
        var level0;
        var i;
        segs = this.sortEventSegs(segs); // order by certain criteria
        levels = buildSlotSegLevels(segs);
        computeForwardSlotSegs(levels);
        if ((level0 = levels[0])) {
            for (i = 0; i < level0.length; i++) {
                computeSlotSegPressures(level0[i]);
            }
            for (i = 0; i < level0.length; i++) {
                this.computeFgSegForwardBack(level0[i], 0, 0);
            }
        }
    };
    // Calculate seg.forwardCoord and seg.backwardCoord for the segment, where both values range
    // from 0 to 1. If the calendar is left-to-right, the seg.backwardCoord maps to "left" and
    // seg.forwardCoord maps to "right" (via percentage). Vice-versa if the calendar is right-to-left.
    //
    // The segment might be part of a "series", which means consecutive segments with the same pressure
    // who's width is unknown until an edge has been hit. `seriesBackwardPressure` is the number of
    // segments behind this one in the current series, and `seriesBackwardCoord` is the starting
    // coordinate of the first segment in the series.
    TimeGridEventRenderer.prototype.computeFgSegForwardBack = function (seg, seriesBackwardPressure, seriesBackwardCoord) {
        var forwardSegs = seg.forwardSegs;
        var i;
        if (seg.forwardCoord === undefined) { // not already computed
            if (!forwardSegs.length) {
                // if there are no forward segments, this segment should butt up against the edge
                seg.forwardCoord = 1;
            }
            else {
                // sort highest pressure first
                this.sortForwardSegs(forwardSegs);
                // this segment's forwardCoord will be calculated from the backwardCoord of the
                // highest-pressure forward segment.
                this.computeFgSegForwardBack(forwardSegs[0], seriesBackwardPressure + 1, seriesBackwardCoord);
                seg.forwardCoord = forwardSegs[0].backwardCoord;
            }
            // calculate the backwardCoord from the forwardCoord. consider the series
            seg.backwardCoord = seg.forwardCoord -
                (seg.forwardCoord - seriesBackwardCoord) / // available width for series
                    (seriesBackwardPressure + 1); // # of segments in the series
            // use this segment's coordinates to computed the coordinates of the less-pressurized
            // forward segments
            for (i = 0; i < forwardSegs.length; i++) {
                this.computeFgSegForwardBack(forwardSegs[i], 0, seg.forwardCoord);
            }
        }
    };
    TimeGridEventRenderer.prototype.sortForwardSegs = function (forwardSegs) {
        var objs = forwardSegs.map(buildTimeGridSegCompareObj);
        var specs = [
            // put higher-pressure first
            { field: 'forwardPressure', order: -1 },
            // put segments that are closer to initial edge first (and favor ones with no coords yet)
            { field: 'backwardCoord', order: 1 }
        ].concat(this.view.eventOrderSpecs);
        objs.sort(function (obj0, obj1) {
            return misc_1.compareByFieldSpecs(obj0, obj1, specs);
        });
        return objs.map(function (c) {
            return c._seg;
        });
    };
    // Given foreground event segments that have already had their position coordinates computed,
    // assigns position-related CSS values to their elements.
    TimeGridEventRenderer.prototype.assignFgSegHorizontals = function (segs) {
        var i;
        var seg;
        for (i = 0; i < segs.length; i++) {
            seg = segs[i];
            dom_manip_1.applyStyle(seg.el, this.generateFgSegHorizontalCss(seg));
            // if the height is short, add a className for alternate styling
            if (seg.bottom - seg.top < 30) {
                seg.el.classList.add('fc-short');
            }
        }
    };
    // Generates an object with CSS properties/values that should be applied to an event segment element.
    // Contains important positioning-related properties that should be applied to any event element, customized or not.
    TimeGridEventRenderer.prototype.generateFgSegHorizontalCss = function (seg) {
        var shouldOverlap = this.opt('slotEventOverlap');
        var backwardCoord = seg.backwardCoord; // the left side if LTR. the right side if RTL. floating-point
        var forwardCoord = seg.forwardCoord; // the right side if LTR. the left side if RTL. floating-point
        var props = this.timeGrid.generateSegVerticalCss(seg); // get top/bottom first
        var isRtl = this.timeGrid.isRtl;
        var left; // amount of space from left edge, a fraction of the total width
        var right; // amount of space from right edge, a fraction of the total width
        if (shouldOverlap) {
            // double the width, but don't go beyond the maximum forward coordinate (1.0)
            forwardCoord = Math.min(1, backwardCoord + (forwardCoord - backwardCoord) * 2);
        }
        if (isRtl) {
            left = 1 - forwardCoord;
            right = backwardCoord;
        }
        else {
            left = backwardCoord;
            right = 1 - forwardCoord;
        }
        props.zIndex = seg.level + 1; // convert from 0-base to 1-based
        props.left = left * 100 + '%';
        props.right = right * 100 + '%';
        if (shouldOverlap && seg.forwardPressure) {
            // add padding to the edge so that forward stacked events don't cover the resizer's icon
            props[isRtl ? 'marginLeft' : 'marginRight'] = 10 * 2; // 10 is a guesstimate of the icon's width
        }
        return props;
    };
    return TimeGridEventRenderer;
}(EventRenderer_1.default));
exports.default = TimeGridEventRenderer;
// Builds an array of segments "levels". The first level will be the leftmost tier of segments if the calendar is
// left-to-right, or the rightmost if the calendar is right-to-left. Assumes the segments are already ordered by date.
function buildSlotSegLevels(segs) {
    var levels = [];
    var i;
    var seg;
    var j;
    for (i = 0; i < segs.length; i++) {
        seg = segs[i];
        // go through all the levels and stop on the first level where there are no collisions
        for (j = 0; j < levels.length; j++) {
            if (!computeSlotSegCollisions(seg, levels[j]).length) {
                break;
            }
        }
        seg.level = j;
        (levels[j] || (levels[j] = [])).push(seg);
    }
    return levels;
}
// For every segment, figure out the other segments that are in subsequent
// levels that also occupy the same vertical space. Accumulate in seg.forwardSegs
function computeForwardSlotSegs(levels) {
    var i;
    var level;
    var j;
    var seg;
    var k;
    for (i = 0; i < levels.length; i++) {
        level = levels[i];
        for (j = 0; j < level.length; j++) {
            seg = level[j];
            seg.forwardSegs = [];
            for (k = i + 1; k < levels.length; k++) {
                computeSlotSegCollisions(seg, levels[k], seg.forwardSegs);
            }
        }
    }
}
// Figure out which path forward (via seg.forwardSegs) results in the longest path until
// the furthest edge is reached. The number of segments in this path will be seg.forwardPressure
function computeSlotSegPressures(seg) {
    var forwardSegs = seg.forwardSegs;
    var forwardPressure = 0;
    var i;
    var forwardSeg;
    if (seg.forwardPressure === undefined) { // not already computed
        for (i = 0; i < forwardSegs.length; i++) {
            forwardSeg = forwardSegs[i];
            // figure out the child's maximum forward path
            computeSlotSegPressures(forwardSeg);
            // either use the existing maximum, or use the child's forward pressure
            // plus one (for the forwardSeg itself)
            forwardPressure = Math.max(forwardPressure, 1 + forwardSeg.forwardPressure);
        }
        seg.forwardPressure = forwardPressure;
    }
}
// Find all the segments in `otherSegs` that vertically collide with `seg`.
// Append into an optionally-supplied `results` array and return.
function computeSlotSegCollisions(seg, otherSegs, results) {
    if (results === void 0) { results = []; }
    for (var i = 0; i < otherSegs.length; i++) {
        if (isSlotSegCollision(seg, otherSegs[i])) {
            results.push(otherSegs[i]);
        }
    }
    return results;
}
// Do these segments occupy the same vertical space?
function isSlotSegCollision(seg1, seg2) {
    return seg1.bottom > seg2.top && seg1.top < seg2.bottom;
}
function buildTimeGridSegCompareObj(seg) {
    var obj = EventRenderer_1.buildSegCompareObj(seg);
    obj.forwardPressure = seg.forwardPressure;
    obj.backwardCoord = seg.backwardCoord;
    return obj;
}


/***/ }),
/* 187 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var dom_manip_1 = __webpack_require__(3);
var MirrorRenderer_1 = __webpack_require__(60);
var TimeGridMirrorRenderer = /** @class */ (function (_super) {
    tslib_1.__extends(TimeGridMirrorRenderer, _super);
    function TimeGridMirrorRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TimeGridMirrorRenderer.prototype.renderSegs = function (segs, sourceSeg) {
        var mirrorNodes = [];
        var i;
        var seg;
        var sourceEl;
        var computedStyle;
        // TODO: not good to call eventRenderer this way
        this.eventRenderer.renderFgSegsIntoContainers(segs, this.component.mirrorContainerEls);
        // Try to make the segment that is in the same row as sourceSeg look the same
        for (i = 0; i < segs.length; i++) {
            seg = segs[i];
            if (sourceSeg && sourceSeg.col === seg.col) {
                sourceEl = sourceSeg.el;
                computedStyle = window.getComputedStyle(sourceEl);
                dom_manip_1.applyStyle(seg.el, {
                    left: computedStyle.left,
                    right: computedStyle.right,
                    marginLeft: computedStyle.marginLeft,
                    marginRight: computedStyle.marginRight
                });
            }
            else {
                dom_manip_1.applyStyle(seg.el, {
                    left: 0,
                    right: 0
                });
            }
            mirrorNodes.push(seg.el);
        }
        return mirrorNodes; // must return the elements rendered
    };
    TimeGridMirrorRenderer.prototype.computeSize = function () {
        this.component.computeSegVerticals(this.segs || []);
    };
    TimeGridMirrorRenderer.prototype.assignSize = function () {
        this.component.assignSegVerticals(this.segs || []);
    };
    return TimeGridMirrorRenderer;
}(MirrorRenderer_1.default));
exports.default = TimeGridMirrorRenderer;


/***/ }),
/* 188 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var FillRenderer_1 = __webpack_require__(59);
var TimeGridFillRenderer = /** @class */ (function (_super) {
    tslib_1.__extends(TimeGridFillRenderer, _super);
    function TimeGridFillRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TimeGridFillRenderer.prototype.attachSegEls = function (type, segs) {
        var timeGrid = this.component;
        var containerEls;
        // TODO: more efficient lookup
        if (type === 'bgEvent') {
            containerEls = timeGrid.bgContainerEls;
        }
        else if (type === 'businessHours') {
            containerEls = timeGrid.businessContainerEls;
        }
        else if (type === 'highlight') {
            containerEls = timeGrid.highlightContainerEls;
        }
        timeGrid.attachSegsByCol(timeGrid.groupSegsByCol(segs), containerEls);
        return segs.map(function (seg) {
            return seg.el;
        });
    };
    TimeGridFillRenderer.prototype.computeSize = function (type) {
        this.component.computeSegVerticals(this.renderedSegsByType[type] || []);
    };
    TimeGridFillRenderer.prototype.assignSize = function (type) {
        this.component.assignSegVerticals(this.renderedSegsByType[type] || []);
    };
    return TimeGridFillRenderer;
}(FillRenderer_1.default));
exports.default = TimeGridFillRenderer;


/***/ }),
/* 189 */
/***/ (function(module, exports, __webpack_require__) {

/* A rectangular panel that is absolutely positioned over other content
------------------------------------------------------------------------------------------------------------------------
Options:
  - className (string)
  - content (HTML string, element, or element array)
  - parentEl
  - top
  - left
  - right (the x coord of where the right edge should be. not a "CSS" right)
  - autoHide (boolean)
  - show (callback)
  - hide (callback)
*/
Object.defineProperty(exports, "__esModule", { value: true });
var dom_manip_1 = __webpack_require__(3);
var dom_event_1 = __webpack_require__(19);
var dom_geom_1 = __webpack_require__(13);
var Popover = /** @class */ (function () {
    function Popover(options) {
        var _this = this;
        this.isHidden = true;
        this.margin = 10; // the space required between the popover and the edges of the scroll container
        // Triggered when the user clicks *anywhere* in the document, for the autoHide feature
        this.documentMousedown = function (ev) {
            // only hide the popover if the click happened outside the popover
            if (_this.el && !_this.el.contains(ev.target)) {
                _this.hide();
            }
        };
        this.options = options;
    }
    // Shows the popover on the specified position. Renders it if not already
    Popover.prototype.show = function () {
        if (this.isHidden) {
            if (!this.el) {
                this.render();
            }
            this.el.style.display = '';
            this.position();
            this.isHidden = false;
            this.trigger('show');
        }
    };
    // Hides the popover, through CSS, but does not remove it from the DOM
    Popover.prototype.hide = function () {
        if (!this.isHidden) {
            this.el.style.display = 'none';
            this.isHidden = true;
            this.trigger('hide');
        }
    };
    // Creates `this.el` and renders content inside of it
    Popover.prototype.render = function () {
        var _this = this;
        var options = this.options;
        var el = this.el = dom_manip_1.createElement('div', {
            className: 'fc-popover ' + (options.className || ''),
            style: {
                top: '0',
                left: '0'
            }
        });
        if (typeof options.content === 'function') {
            options.content(el);
        }
        options.parentEl.appendChild(el);
        // when a click happens on anything inside with a 'fc-close' className, hide the popover
        dom_event_1.listenBySelector(el, 'click', '.fc-close', function (ev) {
            _this.hide();
        });
        if (options.autoHide) {
            document.addEventListener('mousedown', this.documentMousedown);
        }
    };
    // Hides and unregisters any handlers
    Popover.prototype.removeElement = function () {
        this.hide();
        if (this.el) {
            dom_manip_1.removeElement(this.el);
            this.el = null;
        }
        document.removeEventListener('mousedown', this.documentMousedown);
    };
    // Positions the popover optimally, using the top/left/right options
    Popover.prototype.position = function () {
        var options = this.options;
        var el = this.el;
        var elDims = el.getBoundingClientRect(); // only used for width,height
        var origin = dom_geom_1.computeRect(el.offsetParent);
        var clippingRect = dom_geom_1.computeClippingRect(options.parentEl);
        var top; // the "position" (not "offset") values for the popover
        var left; //
        // compute top and left
        top = options.top || 0;
        if (options.left !== undefined) {
            left = options.left;
        }
        else if (options.right !== undefined) {
            left = options.right - elDims.width; // derive the left value from the right value
        }
        else {
            left = 0;
        }
        // constrain to the view port. if constrained by two edges, give precedence to top/left
        top = Math.min(top, clippingRect.bottom - elDims.height - this.margin);
        top = Math.max(top, clippingRect.top + this.margin);
        left = Math.min(left, clippingRect.right - elDims.width - this.margin);
        left = Math.max(left, clippingRect.left + this.margin);
        dom_manip_1.applyStyle(el, {
            top: top - origin.top,
            left: left - origin.left
        });
    };
    // Triggers a callback. Calls a function in the option hash of the same name.
    // Arguments beyond the first `name` are forwarded on.
    // TODO: better code reuse for this. Repeat code
    // can kill this???
    Popover.prototype.trigger = function (name) {
        if (this.options[name]) {
            this.options[name].apply(this, Array.prototype.slice.call(arguments, 1));
        }
    };
    return Popover;
}());
exports.default = Popover;


/***/ }),
/* 190 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var dom_manip_1 = __webpack_require__(3);
var MirrorRenderer_1 = __webpack_require__(60);
var DayGridMirrorRenderer = /** @class */ (function (_super) {
    tslib_1.__extends(DayGridMirrorRenderer, _super);
    function DayGridMirrorRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Renders a mock "mirror" event. `sourceSeg` is the associated internal segment object. It can be null.
    DayGridMirrorRenderer.prototype.renderSegs = function (segs, sourceSeg) {
        var mirrorNodes = [];
        var rowStructs;
        // TODO: not good to call eventRenderer this way
        rowStructs = this.eventRenderer.renderSegRows(segs);
        // inject each new event skeleton into each associated row
        this.component.rowEls.forEach(function (rowNode, row) {
            var skeletonEl = dom_manip_1.htmlToElement('<div class="fc-mirror-skeleton"><table></table></div>'); // will be absolutely positioned
            var skeletonTopEl;
            var skeletonTop;
            // If there is an original segment, match the top position. Otherwise, put it at the row's top level
            if (sourceSeg && sourceSeg.row === row) {
                skeletonTopEl = sourceSeg.el;
            }
            else {
                skeletonTopEl = rowNode.querySelector('.fc-content-skeleton tbody');
                if (!skeletonTopEl) { // when no events
                    skeletonTopEl = rowNode.querySelector('.fc-content-skeleton table');
                }
            }
            skeletonTop = skeletonTopEl.getBoundingClientRect().top -
                rowNode.getBoundingClientRect().top; // the offsetParent origin
            skeletonEl.style.top = skeletonTop + 'px';
            skeletonEl.querySelector('table').appendChild(rowStructs[row].tbodyEl);
            rowNode.appendChild(skeletonEl);
            mirrorNodes.push(skeletonEl);
        });
        return mirrorNodes; // must return the elements rendered
    };
    return DayGridMirrorRenderer;
}(MirrorRenderer_1.default));
exports.default = DayGridMirrorRenderer;


/***/ }),
/* 191 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var dom_manip_1 = __webpack_require__(3);
var FillRenderer_1 = __webpack_require__(59);
var DayGridFillRenderer = /** @class */ (function (_super) {
    tslib_1.__extends(DayGridFillRenderer, _super);
    function DayGridFillRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fillSegTag = 'td'; // override the default tag name
        return _this;
    }
    DayGridFillRenderer.prototype.attachSegEls = function (type, segs) {
        var els = [];
        var i;
        var seg;
        var skeletonEl;
        for (i = 0; i < segs.length; i++) {
            seg = segs[i];
            skeletonEl = this.renderFillRow(type, seg);
            this.component.rowEls[seg.row].appendChild(skeletonEl);
            els.push(skeletonEl);
        }
        return els;
    };
    // Generates the HTML needed for one row of a fill. Requires the seg's el to be rendered.
    DayGridFillRenderer.prototype.renderFillRow = function (type, seg) {
        var colCnt = this.component.colCnt;
        var startCol = seg.leftCol;
        var endCol = seg.rightCol + 1;
        var className;
        var skeletonEl;
        var trEl;
        if (type === 'businessHours') {
            className = 'bgevent';
        }
        else {
            className = type.toLowerCase();
        }
        skeletonEl = dom_manip_1.htmlToElement('<div class="fc-' + className + '-skeleton">' +
            '<table><tr></tr></table>' +
            '</div>');
        trEl = skeletonEl.getElementsByTagName('tr')[0];
        if (startCol > 0) {
            trEl.appendChild(dom_manip_1.createElement('td', { colSpan: startCol }));
        }
        seg.el.colSpan = endCol - startCol;
        trEl.appendChild(seg.el);
        if (endCol < colCnt) {
            trEl.appendChild(dom_manip_1.createElement('td', { colSpan: colCnt - endCol }));
        }
        this.component.bookendCells(trEl);
        return skeletonEl;
    };
    return DayGridFillRenderer;
}(FillRenderer_1.default));
exports.default = DayGridFillRenderer;


/***/ }),
/* 192 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var DateComponent_1 = __webpack_require__(21);
var DayGridEventRenderer_1 = __webpack_require__(148);
var html_1 = __webpack_require__(9);
var formatting_1 = __webpack_require__(8);
var OffsetTracker_1 = __webpack_require__(61);
var dom_geom_1 = __webpack_require__(13);
var geom_1 = __webpack_require__(26);
var marker_1 = __webpack_require__(6);
var DayTile = /** @class */ (function (_super) {
    tslib_1.__extends(DayTile, _super);
    function DayTile(component, date) {
        var _this = _super.call(this, component) || this;
        _this.isInteractable = true;
        _this.useEventCenter = false;
        _this.date = date;
        return _this;
    }
    DayTile.prototype.renderSkeleton = function () {
        var theme = this.getTheme();
        var dateEnv = this.getDateEnv();
        var title = dateEnv.format(this.date, formatting_1.createFormatter(this.opt('dayPopoverFormat')) // TODO: cache
        );
        this.el.innerHTML =
            '<div class="fc-header ' + theme.getClass('popoverHeader') + '">' +
                '<span class="fc-close ' + theme.getIconClass('close') + '"></span>' +
                '<span class="fc-title">' +
                html_1.htmlEscape(title) +
                '</span>' +
                '<div class="fc-clear"></div>' +
                '</div>' +
                '<div class="fc-body ' + theme.getClass('popoverContent') + '">' +
                '<div class="fc-event-container"></div>' +
                '</div>';
        this.segContainerEl = this.el.querySelector('.fc-event-container');
    };
    DayTile.prototype.prepareHits = function () {
        var rect = dom_geom_1.computeRect(this.el);
        this.width = rect.right - rect.left;
        this.height = rect.bottom - rect.top;
        this.offsetTracker = new OffsetTracker_1.default(this.el);
    };
    DayTile.prototype.releaseHits = function () {
        this.offsetTracker.destroy();
    };
    DayTile.prototype.queryHit = function (leftOffset, topOffset) {
        var rectLeft = this.offsetTracker.computeLeft();
        var rectTop = this.offsetTracker.computeTop();
        var rect = {
            left: rectLeft,
            right: rectLeft + this.width,
            top: rectTop,
            bottom: rectTop + this.height
        };
        if (geom_1.pointInsideRect({ left: leftOffset, top: topOffset }, rect)) {
            return {
                component: this,
                dateSpan: {
                    allDay: true,
                    range: { start: this.date, end: marker_1.addDays(this.date, 1) }
                },
                dayEl: this.el,
                rect: rect,
                layer: 1
            };
        }
        return null;
    };
    return DayTile;
}(DateComponent_1.default));
exports.default = DayTile;
// hack
var DayTileEventRenderer = /** @class */ (function (_super) {
    tslib_1.__extends(DayTileEventRenderer, _super);
    function DayTileEventRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // simply append the els the container element
    DayTileEventRenderer.prototype.renderFgSegs = function (segs) {
        for (var _i = 0, segs_1 = segs; _i < segs_1.length; _i++) {
            var seg = segs_1[_i];
            this.component.segContainerEl.appendChild(seg.el);
        }
    };
    return DayTileEventRenderer;
}(DayGridEventRenderer_1.default));
exports.DayTileEventRenderer = DayTileEventRenderer;
DayTile.prototype.eventRendererClass = DayTileEventRenderer;


/***/ }),
/* 193 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var BasicViewDateProfileGenerator_1 = __webpack_require__(149);
var marker_1 = __webpack_require__(6);
var MonthViewDateProfileGenerator = /** @class */ (function (_super) {
    tslib_1.__extends(MonthViewDateProfileGenerator, _super);
    function MonthViewDateProfileGenerator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Computes the date range that will be rendered.
    MonthViewDateProfileGenerator.prototype.buildRenderRange = function (currentRange, currentRangeUnit, isRangeAllDay) {
        var renderRange = _super.prototype.buildRenderRange.call(this, currentRange, currentRangeUnit, isRangeAllDay);
        var start = renderRange.start;
        var end = renderRange.end;
        var rowCnt;
        // ensure 6 weeks
        if (this.opt('fixedWeekCount')) {
            rowCnt = Math.ceil(// could be partial weeks due to hiddenDays
            marker_1.diffWeeks(start, end));
            end = marker_1.addWeeks(end, 6 - rowCnt);
        }
        return { start: start, end: end };
    };
    return MonthViewDateProfileGenerator;
}(BasicViewDateProfileGenerator_1.default));
exports.default = MonthViewDateProfileGenerator;


/***/ }),
/* 194 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var html_1 = __webpack_require__(9);
var EventRenderer_1 = __webpack_require__(18);
var misc_1 = __webpack_require__(2);
var ListEventRenderer = /** @class */ (function (_super) {
    tslib_1.__extends(ListEventRenderer, _super);
    function ListEventRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ListEventRenderer.prototype.renderFgSegs = function (segs) {
        if (!segs.length) {
            this.component.renderEmptyMessage();
        }
        else {
            this.component.renderSegList(segs);
        }
    };
    // generates the HTML for a single event row
    ListEventRenderer.prototype.fgSegHtml = function (seg) {
        var view = this.view;
        var calendar = view.calendar;
        var theme = calendar.theme;
        var eventRange = seg.eventRange;
        var eventDef = eventRange.def;
        var eventInstance = eventRange.instance;
        var eventUi = eventRange.ui;
        var url = eventDef.url;
        var classes = ['fc-list-item'].concat(eventUi.classNames);
        var bgColor = eventUi.backgroundColor;
        var timeHtml;
        if (eventDef.allDay) {
            timeHtml = view.getAllDayHtml();
        }
        else if (misc_1.isMultiDayRange(eventRange.range)) {
            if (seg.isStart) {
                timeHtml = html_1.htmlEscape(this._getTimeText(eventInstance.range.start, seg.end, false // allDay
                ));
            }
            else if (seg.isEnd) {
                timeHtml = html_1.htmlEscape(this._getTimeText(seg.start, eventInstance.range.end, false // allDay
                ));
            }
            else { // inner segment that lasts the whole day
                timeHtml = view.getAllDayHtml();
            }
        }
        else {
            // Display the normal time text for the *event's* times
            timeHtml = html_1.htmlEscape(this.getTimeText(eventRange));
        }
        if (url) {
            classes.push('fc-has-url');
        }
        return '<tr class="' + classes.join(' ') + '">' +
            (this.displayEventTime ?
                '<td class="fc-list-item-time ' + theme.getClass('widgetContent') + '">' +
                    (timeHtml || '') +
                    '</td>' :
                '') +
            '<td class="fc-list-item-marker ' + theme.getClass('widgetContent') + '">' +
            '<span class="fc-event-dot"' +
            (bgColor ?
                ' style="background-color:' + bgColor + '"' :
                '') +
            '></span>' +
            '</td>' +
            '<td class="fc-list-item-title ' + theme.getClass('widgetContent') + '">' +
            '<a' + (url ? ' href="' + html_1.htmlEscape(url) + '"' : '') + '>' +
            html_1.htmlEscape(eventDef.title || '') +
            '</a>' +
            '</td>' +
            '</tr>';
    };
    // like "4:00am"
    ListEventRenderer.prototype.computeEventTimeFormat = function () {
        return {
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
        };
    };
    return ListEventRenderer;
}(EventRenderer_1.default));
exports.default = ListEventRenderer;


/***/ }),
/* 195 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var FeaturefulElementDragging_1 = __webpack_require__(30);
var ExternalElementDragging_1 = __webpack_require__(152);
var options_1 = __webpack_require__(32);
/*
Makes an element (that is *external* to any calendar) draggable.
Can pass in data that determines how an event will be created when dropped onto a calendar.
Leverages FullCalendar's internal drag-n-drop functionality WITHOUT a third-party drag system.
*/
var ExternalDraggable = /** @class */ (function () {
    function ExternalDraggable(el, settings) {
        if (settings === void 0) { settings = {}; }
        var _this = this;
        this.handlePointerDown = function (ev) {
            var dragging = _this.dragging;
            var _a = _this.settings, minDistance = _a.minDistance, longPressDelay = _a.longPressDelay;
            dragging.minDistance =
                minDistance != null ?
                    minDistance :
                    (ev.isTouch ? 0 : options_1.globalDefaults.eventDragMinDistance);
            dragging.delay =
                ev.isTouch ? // TODO: eventually read eventLongPressDelay instead vvv
                    (longPressDelay != null ? longPressDelay : options_1.globalDefaults.longPressDelay) :
                    0;
        };
        this.handleDragStart = function (ev) {
            if (ev.isTouch &&
                _this.dragging.delay &&
                ev.subjectEl.classList.contains('fc-event')) {
                _this.dragging.mirror.getMirrorEl().classList.add('fc-selected');
            }
        };
        this.settings = settings;
        var dragging = this.dragging = new FeaturefulElementDragging_1.default(el);
        dragging.touchScrollAllowed = false;
        if (settings.itemSelector != null) {
            dragging.pointer.selector = settings.itemSelector;
        }
        if (settings.appendTo != null) {
            dragging.mirror.parentNode = settings.appendTo; // TODO: write tests
        }
        dragging.emitter.on('pointerdown', this.handlePointerDown);
        dragging.emitter.on('dragstart', this.handleDragStart);
        new ExternalElementDragging_1.default(dragging, settings.eventData);
    }
    ExternalDraggable.prototype.destroy = function () {
        this.dragging.destroy();
    };
    return ExternalDraggable;
}());
exports.default = ExternalDraggable;


/***/ }),
/* 196 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var duration_1 = __webpack_require__(10);
var misc_1 = __webpack_require__(2);
var DRAG_META_PROPS = {
    time: duration_1.createDuration,
    duration: duration_1.createDuration,
    create: Boolean,
    sourceId: String
};
var DRAG_META_DEFAULTS = {
    create: true
};
function parseDragMeta(raw) {
    var leftoverProps = {};
    var refined = misc_1.refineProps(raw, DRAG_META_PROPS, DRAG_META_DEFAULTS, leftoverProps);
    refined.leftoverProps = leftoverProps;
    return refined;
}
exports.parseDragMeta = parseDragMeta;


/***/ }),
/* 197 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var ExternalElementDragging_1 = __webpack_require__(152);
var InferredElementDragging_1 = __webpack_require__(198);
/*
Bridges third-party drag-n-drop systems with FullCalendar.
Must be instantiated and destroyed by caller.
*/
var ThirdPartyDraggable = /** @class */ (function () {
    function ThirdPartyDraggable(containerOrSettings, settings) {
        var containerEl = document;
        if (
        // wish we could just test instanceof EventTarget, but doesn't work in IE11
        containerOrSettings === document ||
            containerOrSettings instanceof Element) {
            containerEl = containerOrSettings;
            settings = settings || {};
        }
        else {
            settings = (containerOrSettings || {});
        }
        var dragging = this.dragging = new InferredElementDragging_1.default(containerEl);
        if (typeof settings.itemSelector === 'string') {
            dragging.pointer.selector = settings.itemSelector;
        }
        else if (containerEl === document) {
            dragging.pointer.selector = '[data-event]';
        }
        if (typeof settings.mirrorSelector === 'string') {
            dragging.mirrorSelector = settings.mirrorSelector;
        }
        new ExternalElementDragging_1.default(dragging, settings.eventData);
    }
    ThirdPartyDraggable.prototype.destroy = function () {
        this.dragging.destroy();
    };
    return ThirdPartyDraggable;
}());
exports.default = ThirdPartyDraggable;


/***/ }),
/* 198 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var PointerDragging_1 = __webpack_require__(40);
var ElementDragging_1 = __webpack_require__(54);
/*
Detects when a *THIRD-PARTY* drag-n-drop system interacts with elements.
The third-party system is responsible for drawing the visuals effects of the drag.
This class simply monitors for pointer movements and fires events.
It also has the ability to hide the moving element (the "mirror") during the drag.
*/
var InferredElementDragging = /** @class */ (function (_super) {
    tslib_1.__extends(InferredElementDragging, _super);
    function InferredElementDragging(containerEl) {
        var _this = _super.call(this) || this;
        _this.shouldIgnoreMove = false;
        _this.mirrorSelector = '';
        _this.currentMirrorEl = null;
        _this.handlePointerDown = function (ev) {
            _this.emitter.trigger('pointerdown', ev);
            if (!_this.shouldIgnoreMove) {
                // fire dragstart right away. does not support delay or min-distance
                _this.emitter.trigger('dragstart', ev);
            }
        };
        _this.handlePointerMove = function (ev) {
            if (!_this.shouldIgnoreMove) {
                _this.emitter.trigger('dragmove', ev);
            }
        };
        _this.handlePointerUp = function (ev) {
            _this.emitter.trigger('pointerup', ev);
            if (!_this.shouldIgnoreMove) {
                // fire dragend right away. does not support a revert animation
                _this.emitter.trigger('dragend', ev);
            }
        };
        var pointer = _this.pointer = new PointerDragging_1.default(containerEl);
        pointer.emitter.on('pointerdown', _this.handlePointerDown);
        pointer.emitter.on('pointermove', _this.handlePointerMove);
        pointer.emitter.on('pointerup', _this.handlePointerUp);
        return _this;
    }
    InferredElementDragging.prototype.destroy = function () {
        this.pointer.destroy();
    };
    InferredElementDragging.prototype.setIgnoreMove = function (bool) {
        this.shouldIgnoreMove = bool;
    };
    InferredElementDragging.prototype.setMirrorIsVisible = function (bool) {
        if (bool) {
            // restore a previously hidden element.
            // use the reference in case the selector class has already been removed.
            if (this.currentMirrorEl) {
                this.currentMirrorEl.style.visibility = '';
                this.currentMirrorEl = null;
            }
        }
        else {
            var mirrorEl = this.mirrorSelector ?
                document.querySelector(this.mirrorSelector) :
                null;
            if (mirrorEl) {
                this.currentMirrorEl = mirrorEl;
                mirrorEl.style.visibility = 'hidden';
            }
        }
    };
    return InferredElementDragging;
}(ElementDragging_1.default));
exports.default = InferredElementDragging;


/***/ }),
/* 199 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var env_1 = __webpack_require__(56);
var object_1 = __webpack_require__(4);
var formatting_1 = __webpack_require__(8);
var locale_1 = __webpack_require__(41);
var options_1 = __webpack_require__(32);
function formatDate(dateInput, settings) {
    if (settings === void 0) { settings = {}; }
    var dateEnv = buildDateEnv(settings);
    var formatter = formatting_1.createFormatter(settings);
    var dateMeta = dateEnv.createMarkerMeta(dateInput);
    if (!dateMeta) { // TODO: warning?
        return '';
    }
    return dateEnv.format(dateMeta.marker, formatter, {
        forcedTzo: dateMeta.forcedTzo
    });
}
exports.formatDate = formatDate;
function formatRange(startInput, endInput, settings // mixture of env and formatter settings
) {
    var dateEnv = buildDateEnv(typeof settings === 'object' && settings ? settings : {}); // pass in if non-null object
    var formatter = formatting_1.createFormatter(settings, options_1.globalDefaults.defaultRangeSeparator);
    var startMeta = dateEnv.createMarkerMeta(startInput);
    var endMeta = dateEnv.createMarkerMeta(endInput);
    if (!startMeta || !endMeta) { // TODO: warning?
        return '';
    }
    return dateEnv.formatRange(startMeta.marker, endMeta.marker, formatter, {
        forcedStartTzo: startMeta.forcedTzo,
        forcedEndTzo: endMeta.forcedTzo,
        isEndExclusive: settings.isEndExclusive
    });
}
exports.formatRange = formatRange;
function buildDateEnv(settings) {
    var locale = settings.locale || options_1.globalDefaults.locale;
    // ensure required settings
    settings = object_1.assignTo({
        timeZone: options_1.globalDefaults.timeZone,
        timeZoneImpl: options_1.globalDefaults.timeZoneImpl,
        calendarSystem: 'gregory'
    }, settings, {
        locale: locale_1.getLocale(locale)
    });
    return new env_1.DateEnv(settings);
}


/***/ }),
/* 200 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var ThemeRegistry_1 = __webpack_require__(48);
var StandardTheme_1 = __webpack_require__(137);
var JqueryUiTheme_1 = __webpack_require__(138);
var Bootstrap3Theme_1 = __webpack_require__(201);
var Bootstrap4Theme_1 = __webpack_require__(202);
ThemeRegistry_1.defineThemeSystem('standard', StandardTheme_1.default);
ThemeRegistry_1.defineThemeSystem('jquery-ui', JqueryUiTheme_1.default);
ThemeRegistry_1.defineThemeSystem('bootstrap3', Bootstrap3Theme_1.default);
ThemeRegistry_1.defineThemeSystem('bootstrap4', Bootstrap4Theme_1.default);


/***/ }),
/* 201 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var Theme_1 = __webpack_require__(27);
var Bootstrap3Theme = /** @class */ (function (_super) {
    tslib_1.__extends(Bootstrap3Theme, _super);
    function Bootstrap3Theme() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Bootstrap3Theme;
}(Theme_1.default));
exports.default = Bootstrap3Theme;
Bootstrap3Theme.prototype.classes = {
    widget: 'fc-bootstrap3',
    tableGrid: 'table-bordered',
    tableList: 'table',
    tableListHeading: 'active',
    buttonGroup: 'btn-group',
    button: 'btn btn-default',
    stateActive: 'active',
    stateDisabled: 'disabled',
    today: 'alert alert-info',
    popover: 'panel panel-default',
    popoverHeader: 'panel-heading',
    popoverContent: 'panel-body',
    // day grid
    // for left/right border color when border is inset from edges (all-day in agenda view)
    // avoid `panel` class b/c don't want margins/radius. only border color.
    headerRow: 'panel-default',
    dayRow: 'panel-default',
    // list view
    listView: 'panel panel-default'
};
Bootstrap3Theme.prototype.baseIconClass = 'glyphicon';
Bootstrap3Theme.prototype.iconClasses = {
    close: 'glyphicon-remove',
    prev: 'glyphicon-chevron-left',
    next: 'glyphicon-chevron-right',
    prevYear: 'glyphicon-backward',
    nextYear: 'glyphicon-forward'
};
Bootstrap3Theme.prototype.iconOverrideOption = 'bootstrapGlyphicons';
Bootstrap3Theme.prototype.iconOverrideCustomButtonOption = 'bootstrapGlyphicon';
Bootstrap3Theme.prototype.iconOverridePrefix = 'glyphicon-';


/***/ }),
/* 202 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(1);
var Theme_1 = __webpack_require__(27);
var Bootstrap4Theme = /** @class */ (function (_super) {
    tslib_1.__extends(Bootstrap4Theme, _super);
    function Bootstrap4Theme() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Bootstrap4Theme;
}(Theme_1.default));
exports.default = Bootstrap4Theme;
Bootstrap4Theme.prototype.classes = {
    widget: 'fc-bootstrap4',
    tableGrid: 'table-bordered',
    tableList: 'table',
    tableListHeading: 'table-active',
    buttonGroup: 'btn-group',
    button: 'btn btn-primary',
    stateActive: 'active',
    stateDisabled: 'disabled',
    today: 'alert alert-info',
    popover: 'card card-primary',
    popoverHeader: 'card-header',
    popoverContent: 'card-body',
    // day grid
    // for left/right border color when border is inset from edges (all-day in agenda view)
    // avoid `table` class b/c don't want margins/padding/structure. only border color.
    headerRow: 'table-bordered',
    dayRow: 'table-bordered',
    // list view
    listView: 'card card-primary'
};
Bootstrap4Theme.prototype.baseIconClass = 'fa';
Bootstrap4Theme.prototype.iconClasses = {
    close: 'fa-times',
    prev: 'fa-chevron-left',
    next: 'fa-chevron-right',
    prevYear: 'fa-angle-double-left',
    nextYear: 'fa-angle-double-right'
};
Bootstrap4Theme.prototype.iconOverrideOption = 'bootstrapFontAwesome';
Bootstrap4Theme.prototype.iconOverrideCustomButtonOption = 'bootstrapFontAwesome';
Bootstrap4Theme.prototype.iconOverridePrefix = 'fa-';


/***/ }),
/* 203 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var ViewRegistry_1 = __webpack_require__(43);
var BasicView_1 = __webpack_require__(63);
var MonthView_1 = __webpack_require__(150);
ViewRegistry_1.defineView('basic', BasicView_1.default);
ViewRegistry_1.defineView('basicDay', {
    type: 'basic',
    duration: { days: 1 }
});
ViewRegistry_1.defineView('basicWeek', {
    type: 'basic',
    duration: { weeks: 1 }
});
ViewRegistry_1.defineView('month', {
    'class': MonthView_1.default,
    duration: { months: 1 },
    fixedWeekCount: true
});


/***/ }),
/* 204 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var ViewRegistry_1 = __webpack_require__(43);
var AgendaView_1 = __webpack_require__(146);
ViewRegistry_1.defineView('agenda', {
    class: AgendaView_1.default,
    allDaySlot: true,
    slotDuration: '00:30:00',
    slotEventOverlap: true // a bad name. confused with overlap/constraint system
});
ViewRegistry_1.defineView('agendaDay', {
    type: 'agenda',
    duration: { days: 1 }
});
ViewRegistry_1.defineView('agendaWeek', {
    type: 'agenda',
    duration: { weeks: 1 }
});


/***/ }),
/* 205 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var ViewRegistry_1 = __webpack_require__(43);
var ListView_1 = __webpack_require__(151);
ViewRegistry_1.defineView('list', {
    class: ListView_1.default,
    listDayFormat: { month: 'long', day: 'numeric', year: 'numeric' } // like "January 1, 2016"
});
ViewRegistry_1.defineView('listDay', {
    type: 'list',
    duration: { days: 1 },
    listDayFormat: { weekday: 'long' } // day-of-week is all we need. full date is probably in header
});
ViewRegistry_1.defineView('listWeek', {
    type: 'list',
    duration: { weeks: 1 },
    listDayFormat: { weekday: 'long' },
    listDayAltFormat: { month: 'long', day: 'numeric', year: 'numeric' }
});
ViewRegistry_1.defineView('listMonth', {
    type: 'list',
    duration: { month: 1 },
    listDayAltFormat: { weekday: 'long' } // day-of-week is nice-to-have
});
ViewRegistry_1.defineView('listYear', {
    type: 'list',
    duration: { year: 1 },
    listDayAltFormat: { weekday: 'long' } // day-of-week is nice-to-have
});


/***/ }),
/* 206 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var event_source_1 = __webpack_require__(22);
event_source_1.registerEventSourceDef({
    ignoreRange: true,
    parseMeta: function (raw) {
        if (Array.isArray(raw)) { // short form
            return raw;
        }
        else if (Array.isArray(raw.events)) {
            return raw.events;
        }
        return null;
    },
    fetch: function (arg, success) {
        success({
            rawEvents: arg.eventSource.meta
        });
    }
});


/***/ }),
/* 207 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var promise_1 = __webpack_require__(208);
var event_source_1 = __webpack_require__(22);
event_source_1.registerEventSourceDef({
    parseMeta: function (raw) {
        if (typeof raw === 'function') { // short form
            return raw;
        }
        else if (typeof raw.events === 'function') {
            return raw.events;
        }
        return null;
    },
    fetch: function (arg, success, failure) {
        var dateEnv = arg.calendar.dateEnv;
        var func = arg.eventSource.meta;
        promise_1.unpromisify(func.bind(null, {
            start: dateEnv.toDate(arg.range.start),
            end: dateEnv.toDate(arg.range.end),
            startStr: dateEnv.formatIso(arg.range.start),
            endStr: dateEnv.formatIso(arg.range.end),
            timeZone: dateEnv.timeZone
        }), function (rawEvents) {
            success({ rawEvents: rawEvents }); // needs an object response
        }, failure // send errorObj directly to failure callback
        );
    }
});


/***/ }),
/* 208 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
// given a function that resolves a result asynchronously.
// the function can either call passed-in success and failure callbacks,
// or it can return a promise.
// if you need to pass additional params to func, bind them first.
function unpromisify(func, success, failure) {
    // guard against success/failure callbacks being called more than once
    // and guard against a promise AND callback being used together.
    var isResolved = false;
    var wrappedSuccess = function () {
        if (!isResolved) {
            isResolved = true;
            success.apply(this, arguments);
        }
    };
    var wrappedFailure = function () {
        if (!isResolved) {
            isResolved = true;
            if (failure) {
                failure.apply(this, arguments);
            }
        }
    };
    var res = func(wrappedSuccess, wrappedFailure);
    if (res && typeof res.then === 'function') {
        res.then(wrappedSuccess, wrappedFailure);
    }
}
exports.unpromisify = unpromisify;


/***/ }),
/* 209 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var request = __webpack_require__(64);
var object_1 = __webpack_require__(4);
var event_source_1 = __webpack_require__(22);
event_source_1.registerEventSourceDef({
    parseMeta: function (raw) {
        if (typeof raw === 'string') { // short form
            raw = { url: raw };
        }
        else if (!raw || typeof raw !== 'object' || !raw.url) {
            return null;
        }
        return {
            url: raw.url,
            method: (raw.method || 'GET').toUpperCase(),
            extraData: raw.data,
            startParam: raw.startParam,
            endParam: raw.endParam,
            timeZoneParam: raw.timeZoneParam
        };
    },
    fetch: function (arg, success, failure) {
        var meta = arg.eventSource.meta;
        var theRequest;
        var requestParams = buildRequestParams(meta, arg.range, arg.calendar);
        if (meta.method === 'GET') {
            theRequest = request.get(meta.url).query(requestParams); // querystring params
        }
        else {
            theRequest = request(meta.method, meta.url).send(requestParams); // body data
        }
        theRequest.end(function (error, res) {
            var rawEvents;
            if (!error) {
                if (res.body) { // parsed JSON
                    rawEvents = res.body;
                }
                else if (res.text) {
                    // if the server doesn't set Content-Type, won't be parsed as JSON. parse anyway.
                    rawEvents = JSON.parse(res.text);
                }
                if (rawEvents) {
                    success({ rawEvents: rawEvents, response: res });
                }
                else {
                    failure({ message: 'Invalid JSON response', response: res });
                }
            }
            else {
                failure(error); // error has { error, response }
            }
        });
    }
});
function buildRequestParams(meta, range, calendar) {
    var dateEnv = calendar.dateEnv;
    var startParam;
    var endParam;
    var timeZoneParam;
    var customRequestParams;
    var params = {};
    startParam = meta.startParam;
    if (startParam == null) {
        startParam = calendar.opt('startParam');
    }
    endParam = meta.endParam;
    if (endParam == null) {
        endParam = calendar.opt('endParam');
    }
    timeZoneParam = meta.timeZoneParam;
    if (timeZoneParam == null) {
        timeZoneParam = calendar.opt('timeZoneParam');
    }
    // retrieve any outbound GET/POST data from the options
    if (typeof meta.extraData === 'function') {
        // supplied as a function that returns a key/value object
        customRequestParams = meta.extraData();
    }
    else {
        // probably supplied as a straight key/value object
        customRequestParams = meta.extraData || {};
    }
    object_1.assignTo(params, customRequestParams);
    params[startParam] = dateEnv.formatIso(range.start);
    params[endParam] = dateEnv.formatIso(range.end);
    if (dateEnv.timeZone !== 'local') {
        params[timeZoneParam] = dateEnv.timeZone;
    }
    return params;
}


/***/ }),
/* 210 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var marker_1 = __webpack_require__(6);
var duration_1 = __webpack_require__(10);
var object_1 = __webpack_require__(4);
var misc_1 = __webpack_require__(2);
var recurring_event_1 = __webpack_require__(38);
var date_range_1 = __webpack_require__(11);
recurring_event_1.registerRecurringType({
    parse: function (rawEvent, leftoverProps, dateEnv) {
        var createMarker = dateEnv.createMarker.bind(dateEnv);
        var processors = {
            daysOfWeek: null,
            startTime: duration_1.createDuration,
            endTime: duration_1.createDuration,
            startRecur: createMarker,
            endRecur: createMarker
        };
        var props = misc_1.refineProps(rawEvent, processors, {}, leftoverProps);
        var anyValid = false;
        for (var propName in props) {
            if (props[propName] != null) {
                anyValid = true;
                break;
            }
        }
        if (anyValid) {
            return {
                allDay: !props.startTime && !props.endTime,
                duration: (props.startTime && props.endTime) ?
                    duration_1.subtractDurations(props.endTime, props.startTime) :
                    null,
                typeData: props // doesn't need endTime anymore but oh well
            };
        }
        return null;
    },
    expand: function (typeData, eventDef, framingRange, dateEnv) {
        return expandRanges(typeData.daysOfWeek, typeData.startTime, { start: typeData.startRecur, end: typeData.endRecur }, framingRange, dateEnv);
    }
});
function expandRanges(daysOfWeek, startTime, recurRange, framingRange, dateEnv) {
    framingRange = date_range_1.intersectRanges(framingRange, recurRange);
    var dowHash = daysOfWeek ? object_1.arrayToHash(daysOfWeek) : null;
    var dayMarker = marker_1.startOfDay(framingRange.start);
    var endMarker = framingRange.end;
    var instanceStarts = [];
    while (dayMarker < endMarker) {
        var instanceStart 
        // if everyday, or this particular day-of-week
        = void 0;
        // if everyday, or this particular day-of-week
        if (!dowHash || dowHash[dayMarker.getUTCDay()]) {
            if (startTime) {
                instanceStart = dateEnv.add(dayMarker, startTime);
            }
            else {
                instanceStart = dayMarker;
            }
            instanceStarts.push(instanceStart);
        }
        dayMarker = marker_1.addDays(dayMarker, 1);
    }
    return instanceStarts;
}


/***/ })
/******/ ]);
});