

function selection_dayMousedown(view, hoverListener, cellDate, renderSelection, clearSelection, reportSelection, unselect) {
	return function(ev) {
		if (view.option('selectable')) {
			unselect();
			var dates;
			hoverListener.start(function(cell, origCell) {
				clearSelection();
				if (cell) {
					dates = [ cellDate(origCell), cellDate(cell) ].sort(cmp);
					renderSelection(dates[0], addDays(cloneDate(dates[1]), 1), true);
				}
			}, ev);
			$(document).one('mouseup', function(ev) {
				if (hoverListener.stop()) { // over a cell?
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
