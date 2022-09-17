import 'jquery-simulate'
import 'jasmine-jquery'

import './lib/globals'
import './lib/install-plugins'
import './index.css'

{{#each testPaths}}
import '{{this}}'
{{/each}}
