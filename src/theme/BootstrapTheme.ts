import Theme from './Theme'

export default class BootstrapTheme extends Theme {
}

BootstrapTheme.prototype.classes = {
	widget: 'fc-bootstrap3',

	tableGrid: 'table-bordered', // avoid `table` class b/c don't want margins. only border color
	tableList: 'table table-striped', // `table` class creates bottom margin but who cares

	buttonGroup: 'btn-group',
	button: 'btn btn-default',
	stateActive: 'active',
	stateDisabled: 'disabled',

	today: 'alert alert-info', // the plain `info` class requires `.table`, too much to ask

	popover: 'panel panel-default',
	popoverHeader: 'panel-heading',
	popoverContent: 'panel-body',

	// day grid
	headerRow: 'panel-default', // avoid `panel` class b/c don't want margins/radius. only border color
	dayRow: 'panel-default', // "

	// list view
	listView: 'panel panel-default'
}

BootstrapTheme.prototype.baseIconClass = 'glyphicon'
BootstrapTheme.prototype.iconClasses = {
	close: 'glyphicon-remove',
	prev: 'glyphicon-chevron-left',
	next: 'glyphicon-chevron-right',
	prevYear: 'glyphicon-backward',
	nextYear: 'glyphicon-forward'
}

BootstrapTheme.prototype.iconOverrideOption = 'bootstrapGlyphicons'
BootstrapTheme.prototype.iconOverrideCustomButtonOption = 'bootstrapGlyphicon'
BootstrapTheme.prototype.iconOverridePrefix = 'glyphicon-'
