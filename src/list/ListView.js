
/*
Responsible for the scroller, and forwarding event-related actions into the "grid".
TODO: remove CoordChronoComponentMixin
BUT FIRST... need to decouple event click/mouseover/mouseout handlers
*/
var ListView = View.extend(CoordChronoComponentMixin, SegChronoComponentMixin, {

	scroller: null,
	contentEl: null,

	dayDates: null, // localized ambig-time moment array
	dayRanges: null, // UnzonedRange[], of start-end of each day
	segSelector: '.fc-list-item', // which elements accept event actions
	hasDayInteractions: false, // no day selection or day clicking


	initialize: function() {
		// a requirement for CoordChronoComponentMixin
		this.initCoordChronoComponent();

		// a requirement for SegChronoComponentMixin
		this.initSegChronoComponent();

		this.scroller = new Scroller({
			overflowX: 'hidden',
			overflowY: 'auto'
		});
	},


	_getView: function() {
		return this;
	},


	renderSkeleton: function() {
		this.el.addClass(
			'fc-list-view ' +
			this.calendar.theme.getClass('listView')
		);

		this.scroller.render();
		this.scroller.el.appendTo(this.el);

		this.contentEl = this.scroller.scrollEl; // shortcut
	},


	unrenderSkeleton: function() {
		this.scroller.destroy(); // will remove the Grid too
	},


	setHeight: function(totalHeight, isAuto) {
		this.scroller.setHeight(this.computeScrollerHeight(totalHeight));
	},


	computeScrollerHeight: function(totalHeight) {
		return totalHeight -
			subtractInnerElHeight(this.el, this.scroller.el); // everything that's NOT the scroller
	},


	renderDates: function() {
		var calendar = this.calendar;
		var dayStart = calendar.msToUtcMoment(this.renderUnzonedRange.startMs, true);
		var viewEnd = calendar.msToUtcMoment(this.renderUnzonedRange.endMs, true);
		var dayDates = [];
		var dayRanges = [];

		while (dayStart < viewEnd) {

			dayDates.push(dayStart.clone());

			dayRanges.push(new UnzonedRange(
				dayStart,
				dayStart.clone().add(1, 'day')
			));

			dayStart.add(1, 'day');
		}

		this.dayDates = dayDates;
		this.dayRanges = dayRanges;

		// a requirement of SegChronoComponentMixin. TODO: more elegant
		this.initEventRenderingUtils();
	},


	isEventDefResizable: function(eventDef) {
		return false;
	},


	isEventDefDraggable: function(eventDef) {
		return false;
	},


	// slices by day
	componentFootprintToSegs: function(footprint) {
		var dayRanges = this.dayRanges;
		var dayIndex;
		var segRange;
		var seg;
		var segs = [];

		for (dayIndex = 0; dayIndex < dayRanges.length; dayIndex++) {
			segRange = footprint.unzonedRange.intersect(dayRanges[dayIndex]);

			if (segRange) {
				seg = {
					startMs: segRange.startMs,
					endMs: segRange.endMs,
					isStart: segRange.isStart,
					isEnd: segRange.isEnd,
					dayIndex: dayIndex
				};

				segs.push(seg);

				// detect when footprint won't go fully into the next day,
				// and mutate the latest seg to the be the end.
				if (
					!seg.isEnd && !footprint.isAllDay &&
					footprint.unzonedRange.endMs < dayRanges[dayIndex + 1].startMs + this.nextDayThreshold
				) {
					seg.endMs = footprint.unzonedRange.endMs;
					seg.isEnd = true;
					break;
				}
			}
		}

		return segs;
	},


	// like "4:00am"
	computeEventTimeFormat: function() {
		return this.opt('mediumTimeFormat');
	},


	// for events with a url, the whole <tr> should be clickable,
	// but it's impossible to wrap with an <a> tag. simulate this.
	handleSegClick: function(seg, ev) {
		var url;

		CoordChronoComponentMixin.handleSegClick.apply(this, arguments); // super. might prevent the default action

		// not clicking on or within an <a> with an href
		if (!$(ev.target).closest('a[href]').length) {
			url = seg.footprint.eventDef.url;

			if (url && !ev.isDefaultPrevented()) { // jsEvent not cancelled in handler
				window.location.href = url; // simulate link click
			}
		}
	},


	// returns list of foreground segs that were actually rendered
	renderFgSegs: function(segs) {
		segs = this.renderFgSegEls(segs); // might filter away hidden events

		if (!segs.length) {
			this.renderEmptyMessage();
		}
		else {
			this.renderSegList(segs);
		}

		return segs;
	},


	renderEmptyMessage: function() {
		this.contentEl.html(
			'<div class="fc-list-empty-wrap2">' + // TODO: try less wraps
			'<div class="fc-list-empty-wrap1">' +
			'<div class="fc-list-empty">' +
				htmlEscape(this.opt('noEventsMessage')) +
			'</div>' +
			'</div>' +
			'</div>'
		);
	},


	// render the event segments in the view
	renderSegList: function(allSegs) {
		var segsByDay = this.groupSegsByDay(allSegs); // sparse array
		var dayIndex;
		var daySegs;
		var i;
		var tableEl = $('<table class="fc-list-table ' + this.calendar.theme.getClass('tableList') + '"><tbody/></table>');
		var tbodyEl = tableEl.find('tbody');

		for (dayIndex = 0; dayIndex < segsByDay.length; dayIndex++) {
			daySegs = segsByDay[dayIndex];

			if (daySegs) { // sparse array, so might be undefined

				// append a day header
				tbodyEl.append(this.dayHeaderHtml(this.dayDates[dayIndex]));

				this.sortEventSegs(daySegs);

				for (i = 0; i < daySegs.length; i++) {
					tbodyEl.append(daySegs[i].el); // append event row
				}
			}
		}

		this.contentEl.empty().append(tableEl);
	},


	// Returns a sparse array of arrays, segs grouped by their dayIndex
	groupSegsByDay: function(segs) {
		var segsByDay = []; // sparse array
		var i, seg;

		for (i = 0; i < segs.length; i++) {
			seg = segs[i];
			(segsByDay[seg.dayIndex] || (segsByDay[seg.dayIndex] = []))
				.push(seg);
		}

		return segsByDay;
	},


	// generates the HTML for the day headers that live amongst the event rows
	dayHeaderHtml: function(dayDate) {
		var mainFormat = this.opt('listDayFormat');
		var altFormat = this.opt('listDayAltFormat');

		return '<tr class="fc-list-heading" data-date="' + dayDate.format('YYYY-MM-DD') + '">' +
			'<td class="' + this.calendar.theme.getClass('widgetHeader') + '" colspan="3">' +
				(mainFormat ?
					this.buildGotoAnchorHtml(
						dayDate,
						{ 'class': 'fc-list-heading-main' },
						htmlEscape(dayDate.format(mainFormat)) // inner HTML
					) :
					'') +
				(altFormat ?
					this.buildGotoAnchorHtml(
						dayDate,
						{ 'class': 'fc-list-heading-alt' },
						htmlEscape(dayDate.format(altFormat)) // inner HTML
					) :
					'') +
			'</td>' +
		'</tr>';
	},


	// generates the HTML for a single event row
	fgSegHtml: function(seg) {
		var calendar = this.calendar;
		var theme = calendar.theme;
		var eventFootprint = seg.footprint;
		var eventDef = eventFootprint.eventDef;
		var componentFootprint = eventFootprint.componentFootprint;
		var url = eventDef.url;
		var classes = [ 'fc-list-item' ].concat(this.getEventFootprintClasses(seg.footprint));
		var bgColor = this.getEventFootprintBackgroundColor(seg.footprint);
		var timeHtml;

		if (componentFootprint.isAllDay) {
			timeHtml = this.getAllDayHtml();
		}
		// if the event appears to span more than one day
		else if (this.isMultiDayRange(componentFootprint.unzonedRange)) {
			if (seg.isStart || seg.isEnd) { // outer segment that probably lasts part of the day
				timeHtml = htmlEscape(this._getEventTimeText(
					calendar.msToMoment(seg.startMs),
					calendar.msToMoment(seg.endMs),
					componentFootprint.isAllDay
				));
			}
			else { // inner segment that lasts the whole day
				timeHtml = this.getAllDayHtml();
			}
		}
		else {
			// Display the normal time text for the *event's* times
			timeHtml = htmlEscape(this.getEventTimeText(eventFootprint));
		}

		if (url) {
			classes.push('fc-has-url');
		}

		return '<tr class="' + classes.join(' ') + '">' +
			(this.displayEventTime ?
				'<td class="fc-list-item-time ' + theme.getClass('widgetContent') + '">' +
					(timeHtml || '') +
				'</td>' :
				'') +
			'<td class="fc-list-item-marker ' + theme.getClass('widgetContent') + '">' +
				'<span class="fc-event-dot"' +
				(bgColor ?
					' style="background-color:' + bgColor + '"' :
					'') +
				'></span>' +
			'</td>' +
			'<td class="fc-list-item-title ' + theme.getClass('widgetContent') + '">' +
				'<a' + (url ? ' href="' + htmlEscape(url) + '"' : '') + '>' +
					htmlEscape(eventDef.title || '') +
				'</a>' +
			'</td>' +
		'</tr>';
	}

});
