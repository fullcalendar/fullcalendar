{{#each localeCodes}}
import l{{@index}} from 'fullcalendar/locales/{{this}}';
{{/each}}

export default [
  {{#each localeCodes}}l{{@index}}, {{/each}}
];
