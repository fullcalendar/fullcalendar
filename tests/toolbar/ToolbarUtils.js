
var ToolbarUtils = {

	expectButtonEnabled: function(name, bool) {
		var el = $('.fc-' + name + '-button');
		expect(el.length).toBe(1);
		expect(el.prop('disabled')).toBe(!bool);
		expect(el.hasClass('fc-state-disabled')).toBe(!bool);
	},


	getTitleText: function() {
		return $.trim($('.fc-toolbar h2').text());
	}

};
