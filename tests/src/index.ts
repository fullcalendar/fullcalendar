
/*
The following packages were poorly-compatible with esm/cjs and have been included
at the top-level by karma:
  - jquery
  - jasmine-jquery
  - jquery-simulate
  - components-jqueryui
Caller packages are still responsible for types.
*/

import './lib/globals.js'
import './lib/install-plugins.js'
import './index.css'
