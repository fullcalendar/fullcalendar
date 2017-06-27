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
		},
		iconClasses: {
			close: 'fc-icon fc-icon-x',
			prev: 'fc-icon fc-icon-left-single-arrow',
			next: 'fc-icon fc-icon-right-single-arrow',
			prevYear: 'fc-icon fc-icon-left-double-arrow',
			nextYear: 'fc-icon fc-icon-right-double-arrow'
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
		},
		iconClasses: {
			close: 'ui-icon ui-icon-closethick',
			prev: 'ui-icon ui-icon-circle-triangle-w',
			next: 'ui-icon ui-icon-circle-triangle-e',
			prevYear: 'ui-icon ui-icon-seek-prev',
			nextYear: 'ui-icon ui-icon-seek-next'
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
		},
		iconClasses: {
			close: 'fc-icon fc-icon-x',
			prev: 'fc-icon fc-icon-left-single-arrow',
			next: 'fc-icon fc-icon-right-single-arrow',
			prevYear: 'fc-icon fc-icon-left-double-arrow',
			nextYear: 'fc-icon fc-icon-right-double-arrow'
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
	},

	getIconClass: function(buttonName) {
		return themes[this.theme].iconClasses[buttonName] || '';
	},

	getIconClassWithOverride: function(buttonName, customButtonProps, calendar) {
		if (this.theme === 'builtin') {
			if (customButtonProps) {
				return customButtonProps.icon;
			} else if (!calendar.opt('buttonIcons')) {
				return undefined;
			} else if (calendar.opt('buttonIcons')[buttonName]) {
				return 'fc-icon fc-icon-' + calendar.opt('buttonIcons')[buttonName];
			}
		} else if (this.theme === 'jQueryUI') {
			if (customButtonProps) {
				return customButtonProps.themeIcon;
			} else if (!calendar.opt('themeButtonIcons')) {
				return undefined;
			} else if (calendar.opt('themeButtonIcons')[buttonName]) {
				return 'ui-icon ui-icon-' + calendar.opt('themeButtonIcons')[buttonName];
			}
		}

		return this.getIconClass(buttonName);
	}
});
