 
function OverlayManager() {
	var t = this;
	
	
	// exports
	t.renderOverlay = renderOverlay;
	t.clearOverlays = clearOverlays;
	
	
	// locals
	var usedOverlays = [];
	var unusedOverlays = [];
	
	
	function renderOverlay(rect, parent) {
		var e = unusedOverlays.shift();
		if (!e) {
			e = $("<div class='fc-cell-overlay' style='position:absolute;z-index:3'/>");
		}
		if (e[0].parentNode != parent[0]) {
			e.appendTo(parent);
		}
		usedOverlays.push(e.css(rect).show());
		return e;
	}
	

	function clearOverlays() {
		var e;
		while (e = usedOverlays.shift()) {
			unusedOverlays.push(e.hide().unbind());
		}
	}


}
