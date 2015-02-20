
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

	var innerEl = el.children();
	var width = el.width();
	var height = el.height();
	var offset = el.offset();
	var innerOffset = innerEl.offset();
	var girths = {
		left: innerOffset.left - offset.left,
		right: offset.left + width - innerOffset.left,
		top: innerOffset.top - offset.top,
		bottom: offset.top + height - innerOffset.top
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
