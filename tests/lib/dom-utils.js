
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