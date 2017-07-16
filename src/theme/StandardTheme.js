
var StandardTheme = Theme.extend({

	classes: {
		widget: 'fc-unthemed',
		widgetHeader: 'fc-widget-header',
		widgetContent: 'fc-widget-content',
		listContent: 'fc-widget-content',
		popoverHeader: 'fc-widget-header',
		popoverContent: 'fc-widget-content',
		stateHighlight: 'fc-state-highlight',
		stateDefault: 'fc-state-default',
		stateActive: 'fc-state-active',
		stateDisabled: 'fc-state-disabled',
		stateHover: 'fc-state-hover',
		stateDown: 'fc-state-down',
		button: 'fc-button',
		cornerLeft: 'fc-corner-left',
		cornerRight: 'fc-corner-right',
		buttonGroup: 'fc-button-group',
		tableHeader: 'fc-widget-header',
		tableContent: 'fc-widget-content'
	},

	baseIconClass: 'fc-icon',
	iconClasses: {
		close: 'fc-icon-x',
		prev: 'fc-icon-left-single-arrow',
		next: 'fc-icon-right-single-arrow',
		prevYear: 'fc-icon-left-double-arrow',
		nextYear: 'fc-icon-right-double-arrow'
	},

	iconOverrideSingularOption: 'buttonIcon',
	iconOverridePluralOption: 'buttonIcons',
	iconOverridePrefix: 'fc-icon-'

});
