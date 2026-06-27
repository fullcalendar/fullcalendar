import { TemplateRef } from '@angular/core';
import { CalendarOptions } from 'fullcalendar';

export type CalendarOption<OptionName> = OptionName extends keyof CalendarOptions
  ? CalendarOptions[OptionName]
  : never

export type CalendarTemplateRef<OptionName> = TemplateRef<{
  $implicit: CalendarArgLookup<OptionName>
}>

type CalendarArgLookup<OptionName> = OptionName extends keyof CalendarOptions
  ? FirstParam<CalendarOptions[OptionName]>
  : never

type FirstParam<Func> = Func extends ((...args: any) => any)
  ? Parameters<Func>[0]
  : never
