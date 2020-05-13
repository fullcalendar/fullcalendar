
{{#each localeImportPaths}}
import l{{@index}} from '{{this}}'
{{/each}}

export default [
  {{#each localeImportPaths}}l{{@index}}, {{/each}}
]
