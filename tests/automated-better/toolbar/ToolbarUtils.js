
var ToolbarUtils = {

	expectButtonEnabled: function(name, bool) {
		var el = $('.fc-' + name + '-button');
		expect(el.length).toBe(1);
		expect(el.hasClass('fc-enabled')).toBe(bool);
	}

};
