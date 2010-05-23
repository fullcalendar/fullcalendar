
function SelectionManager(view, displayFunc, clearFunc) {

	var t = this;
	var selected = false;
	var initialElement;
	var initialRange;
	var start;
	var end;
	var allDay;
	
	
	t.dragStart = function(ev) {
		unselect();
		start = end = undefined;
		initialRange = undefined;
		initialElement = ev.currentTarget;
	};
	
	
	t.drag = function(currentStart, currentEnd, currentAllDay) {
		if (currentStart) {
			var range = [currentStart, currentEnd];
			if (!initialRange) {
				initialRange = range;
			}
			var dates = initialRange.concat(range).sort(cmp);
			start = dates[0];
			end = dates[3];
			allDay = currentAllDay;
			clearFunc();
			displayFunc(cloneDate(start), cloneDate(end), allDay);
		}else{
			// called with no arguments
			start = end = undefined;
			clearFunc();
		}
	};
	
	
	t.dragStop = function(ev) {
		if (start) {
			if (+initialRange[0] == +start && +initialRange[1] == +end) {
				view.trigger('dayClick', initialElement, start, allDay, ev);
			}
			selected = true;
			view.trigger('select', view, start, end, allDay);
		}
	};
	
	
	t.select = function(newStart, newEnd, newAllDay) {
		unselect();
		start = newStart;
		end = newEnd;
		allDay = newAllDay;
		selected = true;
		displayFunc(start, end, allDay);
	};
	
	
	function unselect() {
		if (selected) {
			selected = false;
			start = end = undefined;
			clearFunc();
			view.trigger('unselect', view);
		}
	}
	t.unselect = unselect;

}


function documentDragHelp(mousemove, mouseup) {
	function _mouseup(ev) {
		mouseup(ev);
		$(document)
			.unbind('mousemove', mousemove)
			.unbind('mouseup', _mouseup);
	}
	$(document)
		.mousemove(mousemove)
		.mouseup(_mouseup);
}


function documentAutoUnselect(view, unselectFunc) {
	if (view.option('unselectAuto')) {
		$(document).mousedown(function(ev) {
			var ignore = view.option('unselectCancel');
			if (ignore) {
				if ($(ev.target).parents(ignore).length) { // could be optimized to stop after first match
					return;
				}
			}
			unselectFunc();
		});
	}
}



