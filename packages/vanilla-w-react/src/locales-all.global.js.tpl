import { globalLocales } from '@fullcalendar/react';

{{#each localeCodes}}
import l{{@index}} from '@fullcalendar/react/locales/{{this}}';
{{/each}}

globalLocales.push(
  {{#each localeCodes}}l{{@index}}, {{/each}}
);
