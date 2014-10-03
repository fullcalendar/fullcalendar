
function ResourceView(calendar) {
	AgendaView.call(this, calendar); // call the super-constructor

	this.cellToDate = function() {
		return this.start.clone();
	};
}


ResourceView.prototype = createObject(AgendaView.prototype); // extends AgendaView
$.extend(ResourceView.prototype, {

	resources: function() {
		return this.calendar.fetchResources();
	},

	hasResource: function(event, resource) {
		return event.resources && $.grep(event.resources, function(id) {
			return id == resource.id;
		}).length;
	},

	// Used by the `headHtml` method, via RowRenderer, for rendering the HTML of a day-of-week header cell
	headCellHtml: function(row, col, date) {
		var resource = this.resources()[col];
		var classes = [
			'fc-day-header',
			this.widgetHeaderClass,
			'fc-' + dayIDs[date.day()]
		];

		if(resource) {
			classes.push(resource.className);
		}

		return '' +
			'<th class="'+ classes.join(' ') +'">' +
			((resource) ? htmlEscape(resource.name) : '') +
			'</th>';
	}

});
