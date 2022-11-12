import './index.js'

{{#each extensionlessTestPaths}}
  import '{{this}}.js'
{{/each}}
