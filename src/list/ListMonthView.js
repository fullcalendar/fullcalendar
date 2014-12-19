
/* A list view with simple day cells
----------------------------------------------------------------------------------------------------------------------*/

fcViews.listMonth = ListMonthView; // register this view

function ListMonthView(calendar) {
	ListView.call(this, calendar); // call the super-constructor
}


ListMonthView.prototype = createObject(ListView.prototype); // define the super-class
$.extend(ListMonthView.prototype, {

	name: 'listMonth',

	incrementDate: function(date, delta) {
		return date.clone().stripTime().add(delta, 'months').startOf('month');
	},

	render: function(date) {

		this.intervalStart = date.clone().stripTime().startOf('month');
		this.intervalEnd = this.intervalStart.clone().add(1, 'months');

		this.start = this.skipHiddenDays(this.intervalStart);
		this.end = this.skipHiddenDays(this.intervalEnd, -1, true);

		this.title = this.calendar.formatRange(
			this.start,
			this.end.clone().subtract(1), // make inclusive by subtracting 1 ms
			this.opt('titleFormat'),
			' \u2014 ' // emphasized dash
		);

		ListView.prototype.render.call(this, 40); // call the super-method
	}
	
});