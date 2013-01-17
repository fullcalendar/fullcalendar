
function HoverListener(coordinateGrid) {


	var t = this;
	var bindType;
	var change;
	var firstCell;
	var cell;
	var pageY;
	
	t.start = function(_change, ev, _bindType) {
		change = _change;
		firstCell = cell = null;
		coordinateGrid.build();
		mouse(ev);
		bindType = _bindType || 'mousemove';
		$(document).bind(bindType, mouse);
	};
	
	
	function mouse(ev) {
		_fixUIEvent(ev); // see below
		// TODO: make alt key configurable
		var disableSnapping = ev.altKey ? true : false;
		if (disableSnapping) {
			if (!pageY) {
				pageY = ev.pageY;
			}
		} else {
			pageY = null;
		}
		var newCell = (disableSnapping && cell) ? cell : coordinateGrid.cell(ev.pageX, ev.pageY);
		var callChange = disableSnapping || (!newCell != !cell || newCell && (newCell.row != cell.row || newCell.col != cell.col));
		if (callChange) {
			if (newCell) {
				newCell.pixelDelta = disableSnapping ? ev.pageY - pageY : 0;
				if (!firstCell) {
					firstCell = newCell;
				}
				change(newCell, firstCell, newCell.row-firstCell.row, newCell.col-firstCell.col);
			}else{
				change(newCell, firstCell);
			}
			cell = newCell;
		}
	}
	
	
	t.stop = function() {
		$(document).unbind(bindType, mouse);
		return cell;
	};
	
	
}



// this fix was only necessary for jQuery UI 1.8.16 (and jQuery 1.7 or 1.7.1)
// upgrading to jQuery UI 1.8.17 (and using either jQuery 1.7 or 1.7.1) fixed the problem
// but keep this in here for 1.8.16 users
// and maybe remove it down the line

function _fixUIEvent(event) { // for issue 1168
	if (event.pageX === undefined) {
		event.pageX = event.originalEvent.pageX;
		event.pageY = event.originalEvent.pageY;
	}
}