import StandardTheme from './StandardTheme'
import JqueryUiTheme from './JqueryUiTheme'

export default {

	themeClassHash: {},


	register: function(themeName, themeClass) {
		this.themeClassHash[themeName] = themeClass;
	},


	getThemeClass: function(themeSetting) {
		if (!themeSetting) {
			return StandardTheme;
		}
		else if (themeSetting === true) {
			return JqueryUiTheme;
		}
		else {
			return this.themeClassHash[themeSetting];
		}
	}

}
