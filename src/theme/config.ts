
import { defineThemeSystem } from './ThemeRegistry'

import StandardTheme from './StandardTheme'
import JqueryUiTheme from './JqueryUiTheme'
import BootstrapTheme from './BootstrapTheme'
import Bootstrap4Theme from './Bootstrap4Theme'

defineThemeSystem('standard', StandardTheme)
defineThemeSystem('jquery-ui', JqueryUiTheme)
defineThemeSystem('bootstrap3', BootstrapTheme)
defineThemeSystem('bootstrap4', Bootstrap4Theme)
