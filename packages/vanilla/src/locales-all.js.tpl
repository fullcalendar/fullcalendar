{{#each localeCodes}}
import l{{@index}} from '@fullcalendar/preact/locales/{{this}}';
{{/each}}

export default [
  {{#each localeCodes}}l{{@index}}, {{/each}}
];
