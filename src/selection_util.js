

function selection_dayMousedown(view, hoverListener, cellDate, cellIsAllDay, renderSelection, clearSelection, reportSelection, unselect) {
	return function(ev) {
		if (view.option('selectable')) {
			unselect();
			var _mousedownElement = this;
			var dates;
			hoverListener.start(function(cell, origCell) {
				clearSelection();
				if (cell && cellIsAllDay(cell)) {
					dates = [ cellDate(origCell), cellDate(cell) ].sort(cmp);
					renderSelection(dates[0], addDays(cloneDate(dates[1]), 1), true);
				}else{
					dates = null;
				}
			}, ev);
			$(document).one('mouseup', function(ev) {
				hoverListener.stop();
				if (dates) {
					if (+dates[0] == +dates[1]) {
						view.trigger('dayClick', _mousedownElement, dates[0], true, ev);
					}
					reportSelection(dates[0], dates[1], true);
				}
			});
		}
	}
}


function selection_unselectAuto(view, unselect) {
	if (view.option('selectable') && view.option('unselectAuto')) {
		$(document).mousedown(function(ev) {
			var ignore = view.option('unselectCancel');
			if (ignore) {
				if ($(ev.target).parents(ignore).length) { // could be optimized to stop after first match
					return;
				}
			}
			unselect();
		});
	}
}
