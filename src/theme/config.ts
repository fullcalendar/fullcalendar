
import { defineThemeSystem } from './ThemeRegistry';

import StandardTheme from './StandardTheme';
import JqueryUiTheme from './JqueryUiTheme';
import BootstrapTheme from './BootstrapTheme';

defineThemeSystem('standard', StandardTheme);
defineThemeSystem('jquery-ui', JqueryUiTheme);
defineThemeSystem('bootstrap3', BootstrapTheme);
