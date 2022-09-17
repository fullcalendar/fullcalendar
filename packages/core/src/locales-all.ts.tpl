{{#each localeCodes}}
import l{{@index}} from './locales/{{this}}'
{{/each}}

export default [
  {{#each localeCodes}}l{{@index}}, {{/each}}
]
