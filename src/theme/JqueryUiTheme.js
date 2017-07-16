
var JqueryUiTheme = Theme.extend({

	classes: {
		widget: 'ui-widget',
		widgetHeader: 'ui-widget-header',
		widgetContent: 'ui-widget-content',
		listContent: 'ui-widget-content',
		popoverHeader: 'ui-widget-header',
		popoverContent: 'ui-widget-content',
		stateHighlight: 'ui-state-highlight',
		stateDefault: 'ui-state-default',
		stateActive: 'ui-state-active',
		stateDisabled: 'ui-state-disabled',
		stateHover: 'ui-state-hover',
		stateDown: 'ui-state-down',
		button: 'ui-button',
		cornerLeft: 'ui-corner-left',
		cornerRight: 'ui-corner-right',
		buttonGroup: 'fc-button-group',
		tableHeader: 'ui-widget-header',
		tableContent: 'ui-widget-content'
	},

	baseIconClass: 'ui-icon',
	iconClasses: {
		close: 'ui-icon-closethick',
		prev: 'ui-icon-circle-triangle-w',
		next: 'ui-icon-circle-triangle-e',
		prevYear: 'ui-icon-seek-prev',
		nextYear: 'ui-icon-seek-next'
	},

	iconOverrideSingularOption: 'themeButtonIcons',
	iconOverridePluralOption: 'themeButtonIcons',
	iconOverridePrefix: 'ui-icon-'

});

ThemeRegistry.register('jquery-ui', JqueryUiTheme);
