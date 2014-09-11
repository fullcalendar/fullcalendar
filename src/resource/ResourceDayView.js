
fcViews.resourceDay = ResourceDayView;

function ResourceDayView(calendar) {
  ResourceView.call(this, calendar); // call the super-constructor
}

ResourceDayView.prototype = createObject(ResourceView.prototype); // define the super-class TODO: make a DayView mixin
$.extend(ResourceDayView.prototype, {

  name: 'resourceDay',

  incrementDate: function(date, delta) {
    AgendaView.prototype.incrementDate.apply(this, arguments);
  },

  render: function(date) {

    this.start = this.intervalStart = date.clone().stripTime();
    this.end = this.intervalEnd = this.start.clone().add(1, 'days');

    this.title = this.calendar.formatDate(this.start, this.opt('titleFormat'));

    ResourceView.prototype.render.call(this, this.calendar.fetchResources().length || 1); // call the super-method
  }

});
