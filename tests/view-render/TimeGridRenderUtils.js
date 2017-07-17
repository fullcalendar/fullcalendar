
var TimeGridRenderUtils = {

	getTimeAxisInfo: function() {
		return $('.fc-slats tr[data-time]').map(function(i, tr) {
			return {
				text: $(tr).find('.fc-time').text(),
				isMajor: !$(tr).hasClass('fc-minor')
			};
		}).get();
	}
};
