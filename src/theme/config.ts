
import ThemeRegistry from './ThemeRegistry';

import StandardTheme from './StandardTheme';
import JqueryUiTheme from './JqueryUiTheme';
import BootstrapTheme from './BootstrapTheme';

ThemeRegistry.register('standard', StandardTheme);
ThemeRegistry.register('jquery-ui', JqueryUiTheme);
ThemeRegistry.register('bootstrap3', BootstrapTheme);
