import { basename } from 'path'

export default function(entryId) {
  const localeCodeFile = basename(entryId)

  return `
    import { globalLocales } from '../index.js';
    import { default as locale } from './${localeCodeFile}.js';
    globalLocales.push(locale);
  `
}
