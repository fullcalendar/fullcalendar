
var Theme = FC.Theme = Class.extend({

	classes: {},
	iconClasses: {},
	baseIconClass: '',
	iconOverrideOption: null,
	iconOverrideCustomButtonOption: null,
	iconOverridePrefix: '',


	constructor: function(optionsModel) {
		this.optionsModel = optionsModel;
		this.processIconOverride();
	},


	processIconOverride: function() {
		if (this.iconOverrideOption) {
			this.setIconOverride(
				this.optionsModel.get(this.iconOverrideOption)
			);
		}
	},


	setIconOverride: function(iconOverrideHash) {
		var iconClassesCopy;
		var buttonName;

		if ($.isPlainObject(iconOverrideHash)) {
			iconClassesCopy = $.extend({}, this.iconClasses);

			for (buttonName in iconOverrideHash) {
				iconClassesCopy[buttonName] = this.applyIconOverridePrefix(
					iconOverrideHash[buttonName]
				);
			}

			this.iconClasses = iconClassesCopy;
		}
		else if (iconOverrideHash === false) {
			this.iconClasses = {};
		}
	},


	applyIconOverridePrefix: function(className) {
		var prefix = this.iconOverridePrefix;

		if (prefix && className.indexOf(prefix) !== 0) { // if not already present
			className = prefix + className;
		}

		return className;
	},


	getClass: function(key) {
		return this.classes[key] || '';
	},


	getIconClass: function(buttonName) {
		var className = this.iconClasses[buttonName];

		if (className) {
			return this.baseIconClass + ' ' + className;
		}

		return '';
	},


	getCustomButtonIconClass: function(customButtonProps) {
		var className;

		if (this.iconOverrideCustomButtonOption) {
			className = customButtonProps[this.iconOverrideCustomButtonOption];

			if (className) {
				return this.baseIconClass + ' ' + this.applyIconOverridePrefix(className);
			}
		}

		return '';
	}

});
