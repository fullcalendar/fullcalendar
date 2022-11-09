
export function cjsInterop<DefaultExport>(namespace: { default: DefaultExport }): DefaultExport {
  return namespace.default || (namespace as DefaultExport)
}
