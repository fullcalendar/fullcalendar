
var EventRenderUtils = {

	expectIsStart: function(bool) {
		var el = this.getSingleEl();

		if (bool) {
			expect(el).toHaveClass('fc-start');
		}
		else {
			expect(el).not.toHaveClass('fc-start');
		}
	},

	expectIsEnd: function(bool) {
		var el = this.getSingleEl();

		if (bool) {
			expect(el).toHaveClass('fc-end');
		}
		else {
			expect(el).not.toHaveClass('fc-end');
		}
	},

	getSingleEl: function() {
		var els = $('.fc-event');
		expect(els).toHaveLength(1);
		return els;
	}

};
