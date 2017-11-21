
export default class BusinessHourRenderer {

	component: any
	fillRenderer: any
	segs: any


	/*
	component implements:
		- eventRangesToEventFootprints
		- eventFootprintsToSegs
	*/
	constructor(component, fillRenderer) {
		this.component = component;
		this.fillRenderer = fillRenderer;
	}


	render(businessHourGenerator) {
		var component = this.component;
		var unzonedRange = component._getDateProfile().activeUnzonedRange;

		var eventInstanceGroup = businessHourGenerator.buildEventInstanceGroup(
			component.hasAllDayBusinessHours,
			unzonedRange
		);

		var eventFootprints = eventInstanceGroup ?
			component.eventRangesToEventFootprints(
				eventInstanceGroup.sliceRenderRanges(unzonedRange)
			) :
			[];

		this.renderEventFootprints(eventFootprints);
	}


	renderEventFootprints(eventFootprints) {
		var segs = this.component.eventFootprintsToSegs(eventFootprints);

		this.renderSegs(segs);
		this.segs = segs;
	}


	renderSegs(segs) {
		if (this.fillRenderer) {
			this.fillRenderer.renderSegs('businessHours', segs, {
				getClasses(seg) {
					return [ 'fc-nonbusiness', 'fc-bgevent' ];
				}
			});
		}
	}


	unrender() {
		if (this.fillRenderer) {
			this.fillRenderer.unrender('businessHours');
		}

		this.segs = null;
	}


	getSegs() {
		return this.segs || [];
	}

}
