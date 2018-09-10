import * as exportHooks from './exports'


export const viewHash = {};
(exportHooks as any).views = viewHash


export function defineView(viewType: string, viewConfig) {
  viewHash[viewType] = viewConfig
}


export function getViewConfig(viewType: string) {
  return viewHash[viewType]
}
