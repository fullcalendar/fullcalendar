/* eslint max-len: off */
/* eslint no-trailing-spaces: off */

// automatically generated

{{#each localeImportPaths}}
import l{{@index}} from '{{this}}'
{{/each}}

export default [
  {{#each localeImportPaths}}l{{@index}}, {{/each}}
]
