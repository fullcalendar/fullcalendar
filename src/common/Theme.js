var themes = {
	builtin: {
		classes: {
			listContent: 'fc-widget-content',
			widgetHeader: 'fc-widget-header',
			widgetContent: 'fc-widget-content',
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
		}
	},
	jQueryUI: {
		classes: {
			listContent: 'ui-widget-content',
			widgetHeader: 'ui-widget-header',
			widgetContent: 'ui-widget-content',
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
		}
	},
	bootstrap3: {
		classes: {
			listContent: 'panel-default',
			popover: 'panel panel-default',
			popoverHeader: 'panel-heading',
			popoverContent: 'panel-body',
			stateActive: 'active',
			stateDisabled: 'disabled',
			button: 'btn btn-default',
			buttonGroup: 'btn-group',
			tableHeader: 'panel-default',
			tableContent: 'panel-default',
			tableGrid: 'table-bordered',
			tableList: 'table'
		}
	}
};

FC.Theme = Class.extend({
	constructor: function(theme) {
		this.setTheme(theme);
	},

	setTheme: function(theme) {
		if (theme === true) {
			this.theme = 'jQueryUI';
		} else if (themes.hasOwnProperty(theme)) {
			this.theme = theme;
		} else {
			this.theme = 'builtin';
		}
	},

	getClass: function(key) {
		return themes[this.theme].classes[key] || '';
	}
});
