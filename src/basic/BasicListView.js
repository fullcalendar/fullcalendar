/* A view with a simple list
----------------------------------------------------------------------------------------------------------------------*/

fcViews.basicList = BasicListView; // register this view

function BasicListView(calendar) {
    BasicView.call(this, calendar); // call the super-constructor
}


BasicListView.prototype = createObject(BasicView.prototype); // define the super-class
$.extend(BasicListView.prototype, {

    name: 'basicList',


    incrementDate: function(date, delta) {
        var out = date.clone().stripTime().add(delta, 'days');
        out = this.skipHiddenDays(out, delta < 0 ? -1 : 1);
        return out;
    },


    render: function(date) {

		this.intervalStart = date.clone().stripTime();
		this.intervalEnd = this.intervalStart.clone().add(this.opt('basicListDays'), 'days');

		this.start = this.skipHiddenDays(this.intervalStart);
		this.end = this.skipHiddenDays(this.intervalEnd, -1, true);
		
		this.title = this.calendar.formatRange(
			this.start,
			this.end.clone().subtract(1), // make inclusive by subtracting 1 ms
			this.opt('titleFormat'),
			' \u2014 ' // emphasized dash
		);

        BasicView.prototype.render.call(this, 7, 1, true); // call the super-method
    }

});
