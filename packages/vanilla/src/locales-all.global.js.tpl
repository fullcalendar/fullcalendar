import { globalLocales } from '@fullcalendar/preact';

{{#each localeCodes}}
import l{{@index}} from '@fullcalendar/preact/locales/{{this}}';
{{/each}}

globalLocales.push(
  {{#each localeCodes}}l{{@index}}, {{/each}}
);
