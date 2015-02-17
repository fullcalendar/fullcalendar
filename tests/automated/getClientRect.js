
describe('getClientRect', function() {

	var getClientRect = $.fullCalendar.getClientRect;

	defineTests(
		'when margin',
		{ margin: '5px 10px' },
		{ width: 100, height: 100 },
		{ width: 100, height: 100 }
	);
	defineTests(
		'when border',
		{ border: '5px solid red' },
		{ width: 100, height: 100 },
		{ width: 100, height: 100 }
	);
	defineTests(
		'when padding',
		{ padding: '5px 10px' },
		{ width: 100, height: 100 },
		{ width: 120, height: 110 }
	);
	defineTests(
		'when border and padding',
		{ border: '5px solid red', padding: '5px 10px' },
		{ width: 100, height: 100 },
		{ width: 120, height: 110 }
	);

	function defineTests(description, cssProps, innerDims, dims) {
		describe(description, function() {
			describe('when no scrolling', function() {
				describe('when LTR', function() {
					defineTest(false, 'ltr', cssProps, innerDims, dims);
				});
				describe('when RTL', function() {
					defineTest(false, 'rtl', cssProps, innerDims, dims);
				});
			});
			describe('when scrolling', function() {
				describe('when LTR', function() {
					defineTest(true, 'ltr', cssProps, innerDims, dims);
				});
				describe('when RTL', function() {
					defineTest(true, 'rtl', cssProps, innerDims, dims);
				});
			});
		});
	}

	function defineTest(isScrolling, dir, cssProps, innerDims, dims) {
		it('computes correct dimensions', function() {
			var el = $(
				'<div style="position:absolute" />'
				)
				.css('overflow', isScrolling ? 'scroll' : 'hidden')
				.css('direction', dir)
				.css(cssProps)
				.append(
					$('<div style="position:relative" />').css(innerDims)
				)
				.appendTo('body');

			var rect = getClientRect(el);
			var offset = el.offset();
			var borderLeftWidth = parseFloat(el.css('border-left-width')) || 0;
			var borderTopWidth = parseFloat(el.css('border-top-width')) || 0;
			var scrollbarWidths;

			if (isScrolling) {
				scrollbarWidths = getStockScrollbarWidths(dir);
			}
			else {
				scrollbarWidths = { left: 0, right: 0, top: 0, bottom: 0 };
			}

			expect(rect.left).toBe(offset.left + borderLeftWidth + scrollbarWidths.left);
			expect(rect.top).toBe(offset.top + borderTopWidth + scrollbarWidths.top);
			expect(rect.right - rect.left).toBe(dims.width);
			expect(rect.bottom - rect.top).toBe(dims.height);

			el.remove();
		});
	}
});
