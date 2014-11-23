
/* A view with a single simple day cell
----------------------------------------------------------------------------------------------------------------------*/

fcViews.basicDay = BasicDayView; // register this view

function BasicDayView(calendar) {
	BasicView.call(this, calendar); // call the super-constructor
}


BasicDayView.prototype = createObject(BasicView.prototype); // define the super-class
$.extend(BasicDayView.prototype, {

	name: 'basicDay',


	incrementDate: function(date, delta) {
		var out = date.clone().stripTime().add(delta, 'days');
		out = this.skipHiddenDays(out, delta < 0 ? -1 : 1);
		return out;
	},


	render: function(date) {

		this.start = this.intervalStart = date.clone().stripTime();
		this.end = this.intervalEnd = this.start.clone().add(1, 'days');

		this.title = this.calendar.formatDate(this.start, this.opt('titleFormat'));

		BasicView.prototype.render.call(this, 1, 1, false); // call the super-method
	}

});