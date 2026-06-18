{{#each localeCodes}}
import l{{@index}} from '@fullcalendar/react/locales/{{this}}';
{{/each}}

export default [
  {{#each localeCodes}}l{{@index}}, {{/each}}
];
