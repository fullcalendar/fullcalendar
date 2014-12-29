
function ResourceView(calendar) {
	AgendaView.call(this, calendar); // call the super-constructor

	this.cellToDate = function() {
		return this.start.clone();
	};
}


ResourceView.prototype = createObject(AgendaView.prototype); // extends AgendaView
$.extend(ResourceView.prototype, {

	resources: function() {
		this._resources = this._resources || this.calendar.fetchResources();
		return this._resources;
	},

	hasResource: function(event, resource) {
		if(this.opt('hasResource')) {
			return this.opt('hasResource').apply(this, arguments);
		}
		
		return event.resources && $.grep(event.resources, function(id) {
			return id == resource.id;
		}).length;
	},

	// Called when a new selection is made. Updates internal state and triggers handlers.
	reportSelection: function(start, end, ev, resources) {
		this.isSelected = true;

		this.calendar.trigger.apply(
			this.calendar, ['select', this, start, end, ev, this, resources]
		);
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
