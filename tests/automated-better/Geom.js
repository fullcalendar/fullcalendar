
var Geom = {

	getRectCenter: function(rect) {
		return this.buildPoint(
			rect.left + rect.width / 2,
			rect.top + rect.height / 2
		);
	},

	intersectRects: function(rect0, rect1) {
		return this.buildRectViaEdges(
			Math.max(rect0.left, rect1.left),
			Math.max(rect0.top, rect1.top),
			Math.min(rect0.right, rect1.right),
			Math.min(rect0.bottom, rect1.bottom)
		);
	},

	buildRectViaDims: function(left, top, width, height) {
		return {
			left: left,
			top: top,
			width: width,
			height: height,
			right: x + width,
			bottom: y + height
		};
	},

	buildRectViaEdges: function(left, top, right, bottom) {
		return {
			left: left,
			top: top,
			width: right - left,
			height: bottom - top,
			right: right,
			bottom: bottom
		};
	},

	buildPoint: function(left, top) {
		return {
			left: left,
			top: top
		};
	},

	subtractPoints: function(point1, point0) {
		return this.buildPoint(
			point1.left - point0.left,
			point1.top - point0.top
		);
	},

	addPoints: function(point0, point1) {
		return this.buildPoint(
			point0.left + point1.left,
			point0.top + point1.top
		);
	},

	getRectTopLeft: function(rect) {
		return this.buildPoint(rect.left, rect.top);
	}

};
