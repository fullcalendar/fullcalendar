import './lib/global.css'
import './lib/global.js'

{{#each extensionlessTestPaths}}
  import '{{this}}.js'
{{/each}}
