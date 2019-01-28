
import { defineThemeSystem } from './ThemeRegistry'

import StandardTheme from './StandardTheme'
import Bootstrap4Theme from './Bootstrap4Theme'

defineThemeSystem('standard', StandardTheme)
defineThemeSystem('bootstrap4', Bootstrap4Theme)
