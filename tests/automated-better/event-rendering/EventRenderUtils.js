
var EventRenderUtils = {

	expectIsStart: function(bool) {
		var els = $('.fc-event');
		expect(els).toHaveLength(1);

		if (bool) {
			expect(els).toHaveClass('fc-start');
		}
		else {
			expect(els).not.toHaveClass('fc-start');
		}
	},

	expectIsEnd: function(bool) {
		var els = $('.fc-event');
		expect(els).toHaveLength(1);

		if (bool) {
			expect(els).toHaveClass('fc-end');
		}
		else {
			expect(els).not.toHaveClass('fc-end');
		}
	}

};
