import * as exportHooks from './exports'


export const viewHash = {};
(exportHooks as any).views = viewHash


export function defineView(viewName, viewConfig) {
  viewHash[viewName] = viewConfig
}


export function getViewConfig(viewName) {
  return viewHash[viewName]
}
