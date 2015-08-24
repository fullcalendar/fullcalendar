
/* A component that renders one or more columns of vertical time slots
----------------------------------------------------------------------------------------------------------------------*/

var TimeGrid = Grid.extend({

	slotDuration: null, // duration of a "slot", a distinct time segment on given day, visualized by lines
	snapDuration: null, // granularity of time for dragging and selecting
	slots: null, // an array of custom slots, replacing the automatic slots every 'slotDuration'
	showSlotEndTime: null, // display the end time of each custom slot
	snapOnSlots: null, // snap to whole slots when using custom slots
	minTime: null, // Duration object that denotes the first visible time of any given day
	maxTime: null, // Duration object that denotes the exclusive visible end time of any given day
	colDates: null, // whole-day dates for each column. left to right
	axisFormat: null, // formatting string for times running along vertical axis

	dayEls: null, // cells elements in the day-row background
	slatElsBreaks: null, // elements minus breaks running horizontally across all columns
	slatEls: null, // elements running horizontally across all columns

	slatTops: null, // an array of top positions, relative to the container. last item holds bottom of last slot
	breakHeights: null, // an array of break heights

	helperEl: null, // cell skeleton element for rendering the mock event "helper"

	businessHourSegs: null,


	constructor: function() {
		Grid.apply(this, arguments); // call the super-constructor
		this.processOptions();
	},


	// Renders the time grid into `this.el`, which should already be assigned.
	// Relies on the view's colCnt. In the future, this component should probably be self-sufficient.
	renderDates: function() {
		this.el.html(this.renderHtml());
		this.dayEls = this.el.find('.fc-day');

		var slots = this.slots;
		var snapOnSlots = this.snapOnSlots;

		this.slatElsBreaks = this.el.find('.fc-slats tr:not(.fc-timeslots-break)');
		this.slatEls = (slots && snapOnSlots) ? this.slatElsBreaks : this.el.find('.fc-slats tr');
	},


	renderBusinessHours: function() {
		var events = this.view.calendar.getBusinessHoursEvents();
		this.businessHourSegs = this.renderFill('businessHours', this.eventsToSegs(events), 'bgevent');
	},


	// Renders the basic HTML skeleton for the grid
	renderHtml: function() {
		return '' +
			'<div class="fc-bg">' +
				'<table>' +
					this.rowHtml('slotBg') + // leverages RowRenderer, which will call slotBgCellHtml
				'</table>' +
			'</div>' +
			'<div class="fc-slats">' +
				'<table>' +
					this.slatRowHtml() +
				'</table>' +
			'</div>';
	},


	// Renders the HTML for a vertical background cell behind the slots.
	// This method is distinct from 'bg' because we wanted a new `rowType` so the View could customize the rendering.
	slotBgCellHtml: function(cell) {
		return this.bgCellHtml(cell);
	},


	// Generates the HTML for the horizontal "slats" that run width-wise. Has a time axis on a side. Depends on RTL.
	slatRowHtml: function() {
		var view = this.view;
		var isRTL = this.isRTL;
		var html = '';
		var slotNormal = this.slotDuration.asMinutes() % 15 === 0;
		var slotTime = moment.duration(+this.minTime); // wish there was .clone() for durations
		var slotDate; // will be on the view's first day, but we only care about its time
		var minutes;
		var axisHtml;

		var slots = this.slots;
		if (slots) {
			var slot;
			var nextSlot;
			var startTime;
			var endTime;
			var nextStartTime;
			var breakHtml;
			var breakHeight;
			var slotHeight;

			for (var i = 0; i < slots.length; i++) {
				// generate HTML for each horizontal slot
				var showSlotEndTime = this.showSlotEndTime;

				slot = slots[i];
				nextSlot = slots[i + 1];
				startTime = this.start.clone().time(slot.start);
				endTime = this.start.clone().time(slot.end);

				if (nextSlot) {
					nextStartTime = this.start.clone().time(nextSlot.start);

					breakHeight = moment.duration(nextStartTime.diff(endTime)).asMinutes();
					breakHtml = (breakHeight > 0) ? '<tr class="fc-timeslots-break" style="height:' + breakHeight + 'px;"><td class="fc-break-axis"></td><td class="fc-timeslots-break-content"></td></tr>' : '';
				}

				slotHeight = moment.duration(endTime.diff(startTime)).asMinutes();

				var timeHtml = htmlEscape(startTime.format(this.axisFormat));
				if (showSlotEndTime === true) {
					timeHtml += htmlEscape("\n" + endTime.format(this.axisFormat));
				}
				axisHtml =
					'<td class="fc-axis fc-time ' + view.widgetContentClass + '" ' + view.axisStyleAttr() + '>' +
						'<div class="fc-timeslots-axis">' + timeHtml + '</div>' +
					'</td>';

				html +=
					'<tr class="fc-minor" '+ 'style="height: '+ slotHeight + 'px">' +
						(!isRTL ? axisHtml : '') +
						'<td class="' + view.widgetContentClass + '"/>' +
						(isRTL ? axisHtml : '') +
					"</tr>"  + breakHtml;
				breakHtml = '';
			}
		}
		else {
			// Calculate the time for each slot
			while (slotTime < this.maxTime) {
				slotDate = this.start.clone().time(slotTime); // will be in UTC but that's good. to avoid DST issues
				minutes = slotDate.minutes();

				axisHtml =
					'<td class="fc-axis fc-time ' + view.widgetContentClass + '" ' + view.axisStyleAttr() + '>' +
						((!slotNormal || !minutes) ? // if irregular slot duration, or on the hour, then display the time
							'<span>' + // for matchCellWidths
								htmlEscape(slotDate.format(this.axisFormat)) +
							'</span>' :
							''
							) +
					'</td>';

				html +=
					'<tr ' + (!minutes ? '' : 'class="fc-minor"') + '>' +
						(!isRTL ? axisHtml : '') +
						'<td class="' + view.widgetContentClass + '"/>' +
						(isRTL ? axisHtml : '') +
					"</tr>";

				slotTime.add(this.slotDuration);
			}
		}

		return html;
	},


	/* Options
	------------------------------------------------------------------------------------------------------------------*/


	// Parses various options into properties of this object
	processOptions: function() {
		var view = this.view;
		var slotDuration = view.opt('slotDuration');
		var snapDuration = view.opt('snapDuration');

		slotDuration = moment.duration(slotDuration);
		snapDuration = snapDuration ? moment.duration(snapDuration) : slotDuration;

		this.slotDuration = slotDuration;
		this.snapDuration = snapDuration;
		this.cellDuration = snapDuration; // for Grid system

		this.minTime = moment.duration(view.opt('minTime'));
		this.maxTime = moment.duration(view.opt('maxTime'));

		this.axisFormat = view.opt('axisFormat') || view.opt('smallTimeFormat');

		// custom slots
		var slots = view.opt('slots');
		if (slots && Array.isArray(slots)) {
			// filter valid slots
			slots = $.grep(slots, function(sl) {
				return sl.hasOwnProperty("start") && sl.hasOwnProperty("end") &&
					typeof(sl.start) === "string" && typeof(sl.end) === "string" &&
					sl.start.match(/^[0-9]{1,2}:[0-9]{1,2}(:[0-9]{1,2})?$/) &&
					sl.end.match(/^[0-9]{1,2}:[0-9]{1,2}(:[0-9]{1,2})?$/) &&
					true;
			});
			if (slots.length >= 2) { // require at least 2 slots to display properly
				// sort slots by start time
				slots.sort(function(sl1, sl2) {
					var start1 = moment(sl1.start, "HH:mm:ss");
					var start2 = moment(sl2.start, "HH:mm:ss");
					if (start1.isBefore(start2)) {
						return -1;
					} else if (start2.isBefore(start1)) {
						return 1;
					} else {
						return 0;
					}
				});
				// make sure each slot ends after it starts, and before the next one starts
				for (var i = 0; i < slots.length; i++) {
					var start1 = moment(slots[i].start, "HH:mm:ss");
					var end1 = moment(slots[i].end, "HH:mm:ss");
					if (end1.isBefore(start1)) {
						slots[i].end = slots[i].start;
					}
					if (i + 1 < slots.length) {
						var start2 = moment(slots[i+1].start, "HH:mm:ss");
						if (start2.isBefore(end1)) {
							slots[i].end = slots[i+1].start;
						}
					}
				}
				this.slots = slots;

				// options related to slots
				var showSlotEndTime = this.view.opt('showSlotEndTime');
				if (showSlotEndTime !== false) { // defaults to true
					this.showSlotEndTime = true;
				}
				var snapOnSlots = this.view.opt('snapOnSlots');
				if (snapOnSlots === true) { // defaults to false
					this.snapOnSlots = true;
				}
			}
		}
	},


	// Computes a default column header formatting string if `colFormat` is not explicitly defined
	computeColHeadFormat: function() {
		if (this.colCnt > 1) { // multiple days, so full single date string WON'T be in title text
			return this.view.opt('dayOfMonthFormat'); // "Sat 12/10"
		}
		else { // single day, so full single date string will probably be in title text
			return 'dddd'; // "Saturday"
		}
	},


	// Computes a default event time formatting string if `timeFormat` is not explicitly defined
	computeEventTimeFormat: function() {
		return this.view.opt('noMeridiemTimeFormat'); // like "6:30" (no AM/PM)
	},


	// Computes a default `displayEventEnd` value if one is not expliclty defined
	computeDisplayEventEnd: function() {
		return true;
	},


	/* Cell System
	------------------------------------------------------------------------------------------------------------------*/


	rangeUpdated: function() {
		var view = this.view;
		var colDates = [];
		var date;
		var slots = this.slots;
		var snapOnSlots = this.snapOnSlots;

		date = this.start.clone();
		while (date.isBefore(this.end)) {
			colDates.push(date.clone());
			date.add(1, 'day');
			date = view.skipHiddenDays(date);
		}

		if (this.isRTL) {
			colDates.reverse();
		}

		this.colDates = colDates;
		this.colCnt = colDates.length;
		this.rowCnt = (slots && snapOnSlots) ? slots.length : Math.ceil((this.maxTime - this.minTime) / this.snapDuration); // # of vertical snaps
	},


	// Given a cell object, generates its start date. Returns a reference-free copy.
	computeCellDate: function(cell) {
		var date = this.colDates[cell.col];
		var time = this.computeSnapTime(cell.row);

		date = this.view.calendar.rezoneDate(date); // give it a 00:00 time
		date.time(time);

		return date;
	},


	// Retrieves the element representing the given column
	getColEl: function(col) {
		return this.dayEls.eq(col);
	},


	/* Dates
	------------------------------------------------------------------------------------------------------------------*/


	// Given a row number of the grid, representing a "snap", returns a time (Duration) from its start-of-day
	computeSnapTime: function(row) {
		var slots = this.slots;
		var snapOnSlots = this.snapOnSlots;
		if (slots && snapOnSlots) {
			var beginTime = this.start.clone();
			var rowTime;

			if(row == slots.length) {
				rowTime = this.start.clone().time(slots[row - 1].start);
			}
			else {
				rowTime = this.start.clone().time(slots[row].start);
			}

			return moment.duration(rowTime.diff(beginTime));
		}
		else {
			return moment.duration(this.minTime + this.snapDuration * row);
		}
	},


	// Given a row number of the grid for a bottom, representing a "snap", returns a time (Duration) from its start-of-day
	computeSnapTimeBottom: function(row) {
		var slots = this.view.opt('slots');
		var beginTime = this.start.clone();
		var rowTime;

		if(row == slots.length) {
			rowTime = this.start.clone().time(slots[row - 1].end);
		}
		else {
			rowTime = this.start.clone().time(slots[row].end);
		}

		return moment.duration(rowTime.diff(beginTime));
	},


	// Slices up a date range by column into an array of segments
	rangeToSegs: function(range) {
		var colCnt = this.colCnt;
		var segs = [];
		var seg;
		var col;
		var colDate;
		var colRange;

		// normalize :(
		range = {
			start: range.start.clone().stripZone(),
			end: range.end.clone().stripZone()
		};

		for (col = 0; col < colCnt; col++) {
			colDate = this.colDates[col]; // will be ambig time/timezone
			colRange = {
				start: colDate.clone().time(this.minTime),
				end: colDate.clone().time(this.maxTime)
			};
			seg = intersectionToSeg(range, colRange); // both will be ambig timezone
			if (seg) {
				seg.col = col;
				segs.push(seg);
			}
		}

		return segs;
	},


	/* Coordinates
	------------------------------------------------------------------------------------------------------------------*/


	updateSize: function(isResize) { // NOT a standard Grid method
		this.computeSlatTops();
		this.computeBreakHeights();

		if (isResize) {
			this.updateSegVerticals();
		}
	},

	// Computes the top/bottom coordinates of each "snap" rows
	computeRowCoords: function() {
		var originTop = this.el.offset().top;
		var items = [];
		var i;
		var item;

		for (i = 0; i < this.rowCnt; i++) {
			item = {
				top: originTop + this.computeTimeTop(this.computeSnapTime(i))
			};
			if (i > 0) {
				items[i - 1].bottom = item.top;
			}
			items.push(item);
		}

		var slots = this.slots;
		var snapOnSlots = this.snapOnSlots;
		if (slots && snapOnSlots) {
			item.bottom = item.top + this.computeTimeTop(this.computeSnapTimeBottom(i));
		}
		else {
			item.bottom = originTop + this.computeTimeTop(this.computeSnapTime(i));
		}

		return items;
	},


	// Computes the top coordinate, relative to the bounds of the grid, of the given date.
	// A `startOfDayDate` must be given for avoiding ambiguity over how to treat midnight.
	computeDateTop: function(date, startOfDayDate) {
		return this.computeTimeTop(
			moment.duration(
				date.clone().stripZone() - startOfDayDate.clone().stripTime()
			)
		);
	},


	// Computes the top coordinate, relative to the bounds of the grid, of the given time (a Duration).
	computeTimeTop: function(time) {
		var slots = this.view.opt('slots');
		var snapOnSlots = this.view.opt('snapOnSlots');
		var slatTop;
		if (slots) {
			var time2 = this.start.clone().time(moment.utc(time.asMilliseconds()).format("HH:mm:ss")); // Convert duration to time;

			var row;
			var isBottom = false;
			var remainder;
			var remainder2;

			var slot;
			var previousSlot;

			var startTime;
			var endTime;

			var previousEndTime;
			var previousStartTime;

			var isSameAsEnd = false;
			var isSameAsStart = false;
			var isBetween = false;

			var isBetween2 = false;
			var isSameAsPreviousEnd = false;

			var i;
			for (i=0; i<slots.length; i++) {
				slot = slots[i];
				previousSlot = slots[i - 1];

				startTime = this.start.clone().time(slot.start);
				endTime = this.start.clone().time(slot.end);

				isSameAsEnd = time2.isSame(endTime);
				isSameAsStart = time2.isSame(startTime);
				isBetween = time2.isBetween(startTime, endTime);

				if(previousSlot) {
					previousEndTime = this.start.clone().time(previousSlot.end);
					previousStartTime = this.start.clone().time(previousSlot.start);

					isBetween2 = time2.isBetween(previousEndTime, startTime);
					isSameAsPreviousEnd = time2.isSame(previousEndTime);
				}

				if((isSameAsStart || isSameAsEnd || isBetween) || (isBetween2 || isSameAsPreviousEnd)) {
					if(isSameAsEnd) {
						isBottom = true;
						i++;
					}
					else if ((!isSameAsStart && isBetween) || (!isSameAsPreviousEnd && isBetween2)) {
						if (endTime.diff(startTime, "minutes") > 32) { // Higher than 32 minutes (= 32 pixels = 2em)
							if(!isSameAsStart && isBetween) {
								remainder = time2.diff(startTime, 'm'); // So 1 minute == 1 pixel
							}
							else {
								remainder2 = time2.diff(previousEndTime, 'm'); // So 1 minute == 1 pixel
							}
						}
						else {  // Not higher than 2em but the timeslot minimal height is 2em
							var diffTop;
							var diffBottom;
							var diffStartEnd;
							if(!isSameAsStart && isBetween) {
								diffTop = time2.diff(startTime, 'm');
								diffBottom = startTime.clone().add(33, 'm').diff(time2, 'm');
								diffStartEnd = endTime.diff(startTime, 'm');

								remainder = Number((diffTop * (((diffTop + diffBottom) / 2) / (diffStartEnd / 2))).toFixed(2)); // So 1 minute > 1 pixel
							}
							else {
								diffTop = time2.diff(previousEndTime, 'm');
								diffBottom = previousEndTime.clone().add(33, 'm').diff(time2, 'm');
								diffStartEnd = endTime.diff(previousEndTime, 'm');

								remainder2 = Number((diffTop * (((diffTop + diffBottom) / 2) / (diffStartEnd / 2))).toFixed(2)); // So 1 minute > 1 pixel
							}
						}
					}
					row = i;
					break;
				}
			}

			var orginalRow = row;
			if(!snapOnSlots) {
				var previousSlotSnap;
				var slotSnap;
				var nextSlotSnap;

				for (i=0; i<orginalRow; i++) {
					previousSlotSnap = slots[i - 1];
					slotSnap = slots[i];
					nextSlotSnap = slots[i + 1];

					if(isBottom && nextSlotSnap && !(this.start.clone().time(slotSnap.end).isSame(this.start.clone().time(nextSlotSnap.start)))) {
						row++;
					}
					else if(!isBottom && previousSlotSnap && !(this.start.clone().time(previousSlotSnap.end).isSame(this.start.clone().time(slotSnap.start)))) {
						row++;
					}
				}
			}

			slatTop = this.slatTops[row]; // the top position of the furthest whole slot;

			var breakHeight = isNaN(this.breakHeights[orginalRow - 1]) ? 0 : this.breakHeights[orginalRow - 1];
			if (remainder) { // time spans part-way into the slot
				return (!snapOnSlots) ? slatTop + breakHeight + remainder : slatTop + remainder;
			}
			else if (remainder2) {  // time spans part-way into the break
				return (!snapOnSlots) ? slatTop + remainder2 : (slatTop - breakHeight) + remainder2;
			}
			else {
				if(isBottom && snapOnSlots) {
					return slatTop - breakHeight;
				}
				else if (!snapOnSlots && isBottom) {
					return slatTop - breakHeight;
				}
				else if (!snapOnSlots && !isBottom) {
					return slatTop + breakHeight;
				}
				else {
					return slatTop;
				}
			}
		}
		else {
			var slatCoverage = (time - this.minTime) / this.slotDuration; // floating-point value of # of slots covered
			var slatIndex;
			var slatRemainder;
			var slatBottom;

			// constrain. because minTime/maxTime might be customized
			slatCoverage = Math.max(0, slatCoverage);
			slatCoverage = Math.min(this.slatEls.length, slatCoverage);

			slatIndex = Math.floor(slatCoverage); // an integer index of the furthest whole slot
			slatRemainder = slatCoverage - slatIndex;
			slatTop = this.slatTops[slatIndex]; // the top position of the furthest whole slot

			if (slatRemainder) { // time spans part-way into the slot
				slatBottom = this.slatTops[slatIndex + 1];
				return slatTop + (slatBottom - slatTop) * slatRemainder; // part-way between slots
			}
			else {
				return slatTop;
			}
		}
	},


	// Queries each `slatEl` for its position relative to the grid's container and stores it in `slatTops`.
	// Includes the bottom of the last slat as the last item in the array.
	computeSlatTops: function() {
		var tops = [];
		var top;

		this.slatEls.each(function(i, node) {
			top = $(node).position().top;
			tops.push(top);
		});

		tops.push(top + this.slatEls.last().outerHeight()); // bottom of the last slat

		this.slatTops = tops;
	},

	// Queries each `slatEl` and check if it's next item has a break
	// if so, store the height of the break in `breakHeights`.
	computeBreakHeights: function() {
		var heights = [];
		var height;

		var breakNode;

		this.slatElsBreaks.each(function(i, node) {
			breakNode = $(node).next(".fc-timeslots-break");
			if (breakNode.length !== 0) {
				height = breakNode.height();
			} else {
				height = 0;
			}
			heights.push(height);
		});

		this.breakHeights = heights;
	},


	/* Event Drag Visualization
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of an event being dragged over the specified date(s).
	// dropLocation's end might be null, as well as `seg`. See Grid::renderDrag for more info.
	// A returned value of `true` signals that a mock "helper" event has been rendered.
	renderDrag: function(dropLocation, seg) {

		if (seg) { // if there is event information for this drag, render a helper event
			this.renderRangeHelper(dropLocation, seg);
			this.applyDragOpacity(this.helperEl);

			return true; // signal that a helper has been rendered
		}
		else {
			// otherwise, just render a highlight
			this.renderHighlight(this.eventRangeToSegs(dropLocation));
		}
	},


	// Unrenders any visual indication of an event being dragged
	unrenderDrag: function() {
		this.unrenderHelper();
		this.unrenderHighlight();
	},


	/* Event Resize Visualization
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of an event being resized
	renderEventResize: function(range, seg) {
		this.renderRangeHelper(range, seg);
	},


	// Unrenders any visual indication of an event being resized
	unrenderEventResize: function() {
		this.unrenderHelper();
	},


	/* Event Helper
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a mock "helper" event. `sourceSeg` is the original segment object and might be null (an external drag)
	renderHelper: function(event, sourceSeg) {
		var segs = this.eventsToSegs([ event ]);
		var tableEl;
		var i, seg;
		var sourceEl;

		segs = this.renderFgSegEls(segs); // assigns each seg's el and returns a subset of segs that were rendered
		tableEl = this.renderSegTable(segs);

		// Try to make the segment that is in the same row as sourceSeg look the same
		for (i = 0; i < segs.length; i++) {
			seg = segs[i];
			if (sourceSeg && sourceSeg.col === seg.col) {
				sourceEl = sourceSeg.el;
				seg.el.css({
					left: sourceEl.css('left'),
					right: sourceEl.css('right'),
					'margin-left': sourceEl.css('margin-left'),
					'margin-right': sourceEl.css('margin-right')
				});
			}
		}

		this.helperEl = $('<div class="fc-helper-skeleton"/>')
			.append(tableEl)
				.appendTo(this.el);
	},


	// Unrenders any mock helper event
	unrenderHelper: function() {
		if (this.helperEl) {
			this.helperEl.remove();
			this.helperEl = null;
		}
	},


	/* Selection
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a visual indication of a selection. Overrides the default, which was to simply render a highlight.
	renderSelection: function(range) {
		if (this.view.opt('selectHelper')) { // this setting signals that a mock helper event should be rendered
			this.renderRangeHelper(range);
		}
		else {
			this.renderHighlight(this.selectionRangeToSegs(range));
		}
	},


	// Unrenders any visual indication of a selection
	unrenderSelection: function() {
		this.unrenderHelper();
		this.unrenderHighlight();
	},


	/* Fill System (highlight, background events, business hours)
	------------------------------------------------------------------------------------------------------------------*/


	// Renders a set of rectangles over the given time segments.
	// Only returns segments that successfully rendered.
	renderFill: function(type, segs, className) {
		var segCols;
		var skeletonEl;
		var trEl;
		var col, colSegs;
		var tdEl;
		var containerEl;
		var dayDate;
		var i, seg;

		if (segs.length) {

			segs = this.renderFillSegEls(type, segs); // assignes `.el` to each seg. returns successfully rendered segs
			segCols = this.groupSegCols(segs); // group into sub-arrays, and assigns 'col' to each seg

			className = className || type.toLowerCase();
			skeletonEl = $(
				'<div class="fc-' + className + '-skeleton">' +
					'<table><tr/></table>' +
				'</div>'
			);
			trEl = skeletonEl.find('tr');

			for (col = 0; col < segCols.length; col++) {
				colSegs = segCols[col];
				tdEl = $('<td/>').appendTo(trEl);

				if (colSegs.length) {
					containerEl = $('<div class="fc-' + className + '-container"/>').appendTo(tdEl);
					dayDate = this.colDates[col];

					for (i = 0; i < colSegs.length; i++) {
						seg = colSegs[i];
						containerEl.append(
							seg.el.css({
								top: this.computeDateTop(seg.start, dayDate),
								bottom: -this.computeDateTop(seg.end, dayDate) // the y position of the bottom edge
							})
						);
					}
				}
			}

			this.bookendCells(trEl, type);

			this.el.append(skeletonEl);
			this.elsByFill[type] = skeletonEl;
		}

		return segs;
	}

});
