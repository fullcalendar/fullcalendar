
var RED_REGEX = /red|rgb\(255,\s*0,\s*0\)/;
var GREEN_REGEX = /green|rgb\(0,\s*255,\s*0\)/;
var BLUE_REGEX = /blue|rgb\(0,\s*0,\s*255\)/;


function getStockScrollbarWidths(dir) {
	var el = $('<div><div style="position:relative"/></div>')
		.css({
			position: 'absolute',
			top: -1000,
			left: 0,
			border: 0,
			padding: 0,
			overflow: 'scroll',
			direction: dir || 'ltr'
		})
		.appendTo('body');

	var elRect = el[0].getBoundingClientRect();
	var innerEl = el.children();
	var innerElRect = innerEl[0].getBoundingClientRect();

	var girths = {
		left: innerElRect.left - elRect.left,
		right: elRect.left + elRect.width - innerElRect.left,
		top: innerElRect.top - elRect.top,
		bottom: elRect.top + elRect.height - innerElRect.top
	};

	el.remove();

	return girths;
}


function countHandlers(el) {
	var hash = getHandlerHash(el);
	var cnt = 0;

	$.each(hash, function(name, handlers) {
		cnt += handlers.length;
	});

	return cnt;
}


function getHandlerHash(el) {
	return $._data($(el)[0], 'events') || {};
}


/* copied from other proj
----------------------------------------------------------------------------------------------------------------------*/

function doElsMatchSegs(els, segs, segToRectFunc) {
	var elRect, found, i, j, k, len, len1, seg, segRect, unmatchedRects;
	unmatchedRects = getBoundingRects(els);
	if (unmatchedRects.length !== segs.length) {
		return false;
	}
	for (j = 0, len = segs.length; j < len; j++) {
		seg = segs[j];
		segRect = segToRectFunc(seg);
		found = false;
		for (i = k = 0, len1 = unmatchedRects.length; k < len1; i = ++k) {
			elRect = unmatchedRects[i];
			if (isRectsSimilar(elRect, segRect)) {
				unmatchedRects.splice(i, 1);
				found = true;
				break;
			}
		}
		if (!found) {
			return false;
		}
	}
	return true;
}

function getBoundingRects(els) {
	var node;
	return (function() {
		var i, len, results;
		results = [];
		for (i = 0, len = els.length; i < len; i++) {
			node = els[i];
			results.push(getBoundingRect(node));
		}
		return results;
	})();
}

function getBoundingRect(el) {
	var rect;
	el = $(el);
	expect(el.length).toBe(1);
	rect = el.offset();
	rect.right = rect.left + el.outerWidth();
	rect.bottom = rect.top + el.outerHeight();
	rect.node = el[0];
	return rect;
}

function isRectsSimilar(rect1, rect2) {
	return isRectsHSimilar(rect1, rect2) && isRectsVSimilar(rect1, rect2);
}

function isRectsHSimilar(rect1, rect2) {
	return Math.abs(rect1.left - rect2.left) <= 1.1 && Math.abs(rect1.right - rect2.right) <= 1.1;
}

function isRectsVSimilar(rect1, rect2) {
	return Math.abs(rect1.top - rect2.top) <= 1.1 && Math.abs(rect1.bottom - rect2.bottom) <= 1.1;
}
