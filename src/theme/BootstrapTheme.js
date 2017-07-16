
var BootstrapTheme = Theme.extend({

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

	baseIconClass: 'glyphicon',
	iconClasses: {
		close: 'glyphicon-remove',
		prev: 'glyphicon-chevron-left',
		next: 'glyphicon-chevron-right',
		prevYear: 'glyphicon-backward',
		nextYear: 'glyphicon-forward'
	},

	iconOverrideSingularOption: 'bootstrapGlyphicon',
	iconOverridePluralOption: 'bootstrapGlyphicons',
	iconOverridePrefix: 'glyphicon-'

});

ThemeRegistry.register('bootstrap3', BootstrapTheme);
