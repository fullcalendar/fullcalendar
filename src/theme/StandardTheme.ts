
var StandardTheme = Theme.extend({

	classes: {
		widget: 'fc-unthemed',
		widgetHeader: 'fc-widget-header',
		widgetContent: 'fc-widget-content',

		buttonGroup: 'fc-button-group',
		button: 'fc-button',
		cornerLeft: 'fc-corner-left',
		cornerRight: 'fc-corner-right',
		stateDefault: 'fc-state-default',
		stateActive: 'fc-state-active',
		stateDisabled: 'fc-state-disabled',
		stateHover: 'fc-state-hover',
		stateDown: 'fc-state-down',

		popoverHeader: 'fc-widget-header',
		popoverContent: 'fc-widget-content',

		// day grid
		headerRow: 'fc-widget-header',
		dayRow: 'fc-widget-content',

		// list view
		listView: 'fc-widget-content'
	},

	baseIconClass: 'fc-icon',
	iconClasses: {
		close: 'fc-icon-x',
		prev: 'fc-icon-left-single-arrow',
		next: 'fc-icon-right-single-arrow',
		prevYear: 'fc-icon-left-double-arrow',
		nextYear: 'fc-icon-right-double-arrow'
	},

	iconOverrideOption: 'buttonIcons',
	iconOverrideCustomButtonOption: 'icon',
	iconOverridePrefix: 'fc-icon-'

});

ThemeRegistry.register('standard', StandardTheme);
