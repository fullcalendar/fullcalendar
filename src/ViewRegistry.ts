import * as exportHooks from './exports';

export const viewHash = {};
(exportHooks as any).views = viewHash;

export function register(viewName, viewConfig) {
	viewHash[viewName] = viewConfig;
}
