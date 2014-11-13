/* A month view with day cells running in one single row and columns (one-per-day)
----------------------------------------------------------------------------------------------------------------------*/

setDefaults({
	fixedWeekCount: true
});

fcViews.singleRowMonth = SingleRowMonthView;

function SingleRowMonthView(calendar) {
	BasicView.call(this, calendar); // call the super-constructor
}


SingleRowMonthView.prototype = createObject(BasicView.prototype); // define the super-class
$.extend(SingleRowMonthView.prototype, {

	name: 'SingleRowMonth',


	incrementDate: function(date, delta) {
		return date.clone().stripTime().add(delta, 'months').startOf('month');
	},


	render: function(date) {
		var rowCnt;
		this.calendar.options.contentHeight = 93;

		this.intervalStart = date.clone().stripTime().startOf('month');
		this.intervalEnd = this.intervalStart.clone().add('days', 31);

		this.start = this.intervalStart.clone().startOf('month');
		this.start = this.skipHiddenDays(this.start);

		this.end = this.intervalEnd.clone().add('days', (7 - this.intervalEnd.weekday()) % 7);
		this.end = this.skipHiddenDays(this.end, -1, true);

		rowCnt = 1;

		BasicView.prototype.render.call(this, rowCnt, 31, true); // call the super-method
	}
});
