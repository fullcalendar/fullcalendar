import { globalLocales } from 'fullcalendar';

{{#each localeCodes}}
import l{{@index}} from 'fullcalendar/locales/{{this}}';
{{/each}}

globalLocales.push(
  {{#each localeCodes}}l{{@index}}, {{/each}}
);
