(function($, undefined) {



var fc = $.fullCalendar,
	setOuterWidth = fc.setOuterWidth,
	setOuterHeight = fc.setOuterHeight,
	addDays = fc.addDays,
	cloneDate = fc.cloneDate,
	cmp = fc.cmp;



var selectionManagers = {};

$.fullCalendar.bindBgHandlers = function(view, elements, allDay) {
	if (view.option('selectable')) {
		getSelectionManager(view).bind(elements, allDay);
	}
};

function getSelectionManager(view) {
	var name = view.name,
		manager = selectionManagers[name];
	if (!manager) {
		if (name.indexOf('agenda') == 0) {
			manager = new AgendaSelectionManager(view);
		}else{
			manager = new GridSelectionManager(view);
		}
		selectionManagers[name] = manager;
	}
	return manager;
}



/* methods
---------------------------------------------------*/

$.extend($.fullCalendar.publicMethods, {

	select: function(start, end, allDay) {
		getSelectionManager($(this).fullCalendar('getView')).select(start, end, allDay);
		// not yet implemented...
	},
	
	unselect: function() {
		for (var name in selectionManagers) {
			selectionManagers[name].unselect();
		}
	}
	
});



/* month, basicWeek, basicDay
---------------------------------------------------*/

function GridSelectionManager(view) {
	
	var selected=false,
		matrix,
		start,	// the "offset" (row*colCnt+col) of the cell
		end,	// the "offset" (row*colCnt+col) of the cell (inclusive)
		range;  // sorted array
		
	this.bind = function(elements) {
		elements.mousedown(mousedown);
	};
	
	function mousedown(ev) {
		start = undefined;
		matrix = view.buildMatrix(function(cell) {
			view.clearOverlays();
			if (cell) {
				end = cell.row * view.colCnt + cell.col;
				if (start === undefined) {
					unselect();
					start = end;
				}
				range = [start, end].sort(cmp);
				view.renderOverlays(matrix, range[0], range[1]+1);
				$.each(view.overlays, function() {
					view.bindDayHandlers(this);
				});
				selected = true;
			}else{
				selected = false;
			}
		});
		$(document)
			.mousemove(mousemove)
			.mouseup(mouseup);
		matrix.mouse(ev.pageX, ev.pageY);
		ev.stopPropagation();
	}
	
	function mousemove(ev) {
		matrix.mouse(ev.pageX, ev.pageY);
	}
	
	function mouseup(ev) {
		$(document)
			.unbind('mousemove', mousemove)
			.unbind('mouseup', mouseup);
		if (selected) {
			view.trigger(
				'select',
				view,
				view.offset2date(range[0]),
				view.offset2date(range[1]+1),
				true
			);
		}
	}
	
	function unselect() {
		if (selected) {
			view.clearOverlays();
			view.trigger('unselect', view);
			selected = false;
		}
	}
	this.unselect = unselect;
	view.viewUpdate = unselect;
	
	if (view.option('unselectable')) {
		$(document).mousedown(function() {
			unselect();
		});
	}
	
}



/* agenda views
-----------------------------------------------*/

function AgendaSelectionManager(view) {

	var selected=false,
		matrix,
		start, // for all-day, the COLUMN of the day. for slot, the ROW of the slot
		end,   // for all-day, the COLUMN of the day. for slot, the ROW of the slot
		day,   // only used for slots. the COLUMN of the day
		range, // start & end, sorted array
		helper;

	this.bind = function(elements, allDay) {
		if (allDay) {
			dayBind(elements);
		}else{
			slotBind(elements);
		}
	};

	// all-day
	
	function dayBind(elements) {
		elements.mousedown(dayMousedown);
	}
	
	function dayMousedown(ev) {
		start = undefined;
		matrix = view.buildMainMatrix(function(cell) {
			clear();
			if (cell) {
				end = cell.col;
				if (start === undefined) {
					unselect();
					start = end;
				}
				range = [start, end].sort(cmp);
				view.renderDayOverlay(matrix, range[0], range[1]+1);
				view.bindDayHandlers(view.overlays[0]);
				selected = true;
			}else{
				selected = false;
			}
		});
		$(document)
			.mousemove(dayMousemove)
			.mouseup(dayMouseup);
		matrix.mouse(ev.pageX, ev.pageY);
		ev.stopPropagation();
	}
	
	function dayMousemove(ev) {
		matrix.mouse(ev.pageX, ev.pageY);
	}
	
	function dayMouseup(ev) {
		$(document)
			.unbind('mousemove', dayMousemove)
			.unbind('mouseup', dayMouseup);
		if (selected) {
			view.trigger(
				'select',
				view,
				addDays(cloneDate(view.visStart), range[0]),
				addDays(cloneDate(view.visStart), range[1]+1),
				true
			);
		}
	}

	// slot

	function slotBind(elements) {
		elements.mousedown(slotMousedown);
	}
	
	function slotMousedown(ev) {
		day = undefined;
		matrix = view.buildSlotMatrix(function(cell) {
			clear();
			if (cell) {
				if (day === undefined) {
					unselect();
					day = cell.col;
					start = cell.row;
				}
				end = cell.row;
				range = [start, end].sort(cmp);
				var helperOption = view.option('selectHelper'),
					bodyContent = view.bodyContent;
				if (helperOption) {
					var rect = matrix.rect(range[0], day, range[1]+1, day+1, bodyContent);
					rect.left += 2;
					rect.width -= 5;
					if ($.isFunction(helperOption)) {
						helper = helperOption();
						if (helper) {
							helper.css(rect);
						}
					}else{
						helper = $(view.segHtml(
							{
								title: '',
								start: view.slotTime(day, range[0]),
								end: view.slotTime(day, range[1]+1),
								className: [],
								editable: false
							},
							rect,
							'fc-event fc-event-vert fc-corner-top fc-corner-bottom '
						));
						if (!$.browser.msie) {
							// IE makes the event completely clear!!?
							helper.css('opacity', view.option('dragOpacity'));
						}
					}
					if (helper) {
						// TODO: change cursor
						view.bindSlotHandlers(helper);
						bodyContent.append(helper);
						setOuterWidth(helper, rect.width, true);
						setOuterHeight(helper, rect.height, true);
					}
				}else{
					view.renderOverlay(
						matrix.rect(range[0], day, range[1]+1, day+1, bodyContent),
						bodyContent
					);
					view.bindSlotHandlers(view.overlays[0]);
				}
				selected = true;
			}else{
				selected = false;
			}
		});
		matrix.mouse(ev.pageX, ev.pageY);
		$(document)
			.mousemove(slotMousemove)
			.mouseup(slotMouseup);
		ev.stopPropagation();
	}
	
	function slotMousemove(ev) {
		matrix.mouse(ev.pageX, ev.pageY);
	}
	
	function slotMouseup(ev) {
		$(document)
			.unbind('mousemove', slotMousemove)
			.unbind('mouseup', slotMouseup);
		if (selected) {
			view.trigger('select',
				view,
				view.slotTime(day, range[0]),
				view.slotTime(day, range[1]+1),
				false
			);
		}
	}

	// common

	function unselect() {
		if (selected) {
			clear();
			view.trigger('unselect', view);
			selected = false;
		}
	}
	this.unselect = unselect;
	view.viewUpdate = unselect;

	function clear() {
		if (helper) {
			helper.remove();
			helper = null;
		}
		view.clearOverlays();
	}

	if (view.option('unselectable')) {
		$(document).mousedown(function() {
			unselect();
		});
	}

}

})(jQuery);
