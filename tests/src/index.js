
/*
jquery and jasmine-jquery already globally imported
(were having troubles shimming into modules)
caller packages STILL must require typescript types for these libs
*/

import 'jquery-simulate'

import './lib/globals.js'
import './lib/install-plugins.js'
import './index.css'

/* generate-index
{{#each testPaths}}
import '{{this}}'
{{/each}}
*/
