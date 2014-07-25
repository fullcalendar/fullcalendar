
//BUG: unselect needs to be triggered when events are dragged+dropped

function SelectionManager() {
	var t = this;
	
	
	// exports
	t.select = select;
	t.unselect = unselect;
	t.reportSelection = reportSelection;
	t.daySelectionMousedown = daySelectionMousedown;
	t.selectionManagerDestroy = destroy;
	
	
	// imports
	var calendar = t.calendar;
	var opt = t.opt;
	var trigger = t.trigger;
	var defaultSelectionEnd = t.defaultSelectionEnd;
	var renderSelection = t.renderSelection;
	var clearSelection = t.clearSelection;
	
	
	// locals
	var selected = false;



	// unselectAuto
	if (opt('selectable') && opt('unselectAuto')) {
		$(document).on('mousedown', documentMousedown);
	}


	function documentMousedown(ev) {
		var ignore = opt('unselectCancel');
		if (ignore) {
			if ($(ev.target).parents(ignore).length) { // could be optimized to stop after first match
				return;
			}
		}
		unselect(ev);
	}
	

	function select(start, end) {
		unselect();

		start = calendar.moment(start);
		if (end) {
			end = calendar.moment(end);
		}
		else {
			end = defaultSelectionEnd(start);
		}

		renderSelection(start, end);
		reportSelection(start, end);
	}
	// TODO: better date normalization. see notes in automated test
	
	
	function unselect(ev) {
		if (selected) {
			selected = false;
			clearSelection();
			trigger('unselect', null, ev);
		}
	}
	
	
	function reportSelection(start, end, ev) {
		selected = true;
		trigger('select', null, start, end, ev);
	}
	
	
	function daySelectionMousedown(ev) { // not really a generic manager method, oh well
		var cellToDate = t.cellToDate;
		var getIsCellAllDay = t.getIsCellAllDay;
		var hoverListener = t.getHoverListener();
		var reportDayClick = t.reportDayClick; // this is hacky and sort of weird

		if (ev.which == 1 && opt('selectable')) { // which==1 means left mouse button
			unselect(ev);
			var dates;
			hoverListener.start(function(cell, origCell) { // TODO: maybe put cellToDate/getIsCellAllDay info in cell
				clearSelection();
				if (cell && getIsCellAllDay(cell)) {
					dates = [ cellToDate(origCell), cellToDate(cell) ].sort(dateCompare);
					renderSelection(
						dates[0],
						dates[1].clone().add('days', 1) // make exclusive
					);
				}else{
					dates = null;
				}
			}, ev);
			$(document).one('mouseup', function(ev) {
				hoverListener.stop();
				if (dates) {
					if (+dates[0] == +dates[1]) {
						reportDayClick(dates[0], ev);
					}
					reportSelection(
						dates[0],
						dates[1].clone().add('days', 1), // make exclusive
						ev
					);
				}
			});
		}
	}


	function destroy() {
		$(document).off('mousedown', documentMousedown);
	}


}
