import 'jquery-simulate'
import 'jasmine-jquery'

import './lib/globals.js'
import './lib/install-plugins.js'
import './index.css'

// temporary
window.karmaConfig = {
  isCi: false,
}

/* generate-index
{{#each testPaths}}
import '{{this}}'
{{/each}}
*/
