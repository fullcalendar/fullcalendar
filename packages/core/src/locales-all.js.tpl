
{{#each localePaths}}
import l{{@index}} from '{{this}}'
{{/each}}

export default [
  {{#each localePaths}}l{{@index}}, {{/each}}
]
