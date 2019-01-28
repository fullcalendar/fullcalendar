
import { defineThemeSystem } from './ThemeRegistry'

import StandardTheme from './StandardTheme'
import JqueryUiTheme from './JqueryUiTheme'
import Bootstrap4Theme from './Bootstrap4Theme'

defineThemeSystem('standard', StandardTheme)
defineThemeSystem('jquery-ui', JqueryUiTheme)
defineThemeSystem('bootstrap4', Bootstrap4Theme)
