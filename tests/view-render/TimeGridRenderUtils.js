
var TimeGridRenderUtils = {

	getTimeAxisText: function() {
		return $('.fc-slats tr[data-time]').map(function(i, tr) {
			return $(tr).find('.fc-time').text();
		}).get();
	}
};
