import 'jquery-simulate'
import 'jasmine-jquery'

import './lib/globals'
import './lib/install-plugins'
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
