{{#each localeCodes}}
import l{{@index}} from './locales/{{this}}.js'
{{/each}}

export default [
  {{#each localeCodes}}l{{@index}}, {{/each}}
]
