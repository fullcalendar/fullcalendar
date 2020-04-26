import { RawLocale } from './datelib/locale'
import { hashValuesToArray } from './util/object'


export function getGlobalRawLocales(): RawLocale[] {

  // NOTE: make sure this global variable name is in-sync with the rollup bundle locale script
  let globalStore = window['FullCalendarLocales']

  return Array.isArray(globalStore) ? globalStore : // assigned by locales-all
    hashValuesToArray(globalStore) // assigned by individual locale file(s)
}
