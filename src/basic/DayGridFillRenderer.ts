import * as $ from 'jquery'
import FillRenderer from '../component/renderers/FillRenderer'


export default class DayGridFillRenderer extends FillRenderer {

	fillSegTag: string = 'td' // override the default tag name


	attachSegEls(type, segs) {
		var nodes = [];
		var i, seg;
		var skeletonEl;

		for (i = 0; i < segs.length; i++) {
			seg = segs[i];
			skeletonEl = this.renderFillRow(type, seg);
			this.component.rowEls.eq(seg.row).append(skeletonEl);
			nodes.push(skeletonEl[0]);
		}

		return nodes;
	}


	// Generates the HTML needed for one row of a fill. Requires the seg's el to be rendered.
	renderFillRow(type, seg) {
		var colCnt = this.component.colCnt;
		var startCol = seg.leftCol;
		var endCol = seg.rightCol + 1;
		var className;
		var skeletonEl;
		var trEl;

		if (type === 'businessHours') {
			className = 'bgevent';
		}
		else {
			className = type.toLowerCase();
		}

		skeletonEl = $(
			'<div class="fc-' + className + '-skeleton">' +
				'<table><tr/></table>' +
			'</div>'
		);
		trEl = skeletonEl.find('tr');

		if (startCol > 0) {
			trEl.append('<td colspan="' + startCol + '"/>');
		}

		trEl.append(
			seg.el.attr('colspan', endCol - startCol)
		);

		if (endCol < colCnt) {
			trEl.append('<td colspan="' + (colCnt - endCol) + '"/>');
		}

		this.component.bookendCells(trEl);

		return skeletonEl;
	}

}
