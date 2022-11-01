
export interface GhostFileConfig {
  generator?: (
    readOrig: () => Promise<string>,
    monorepoDir: string,
    subdir: string,
  ) => Promise<void | string>
}

export type GhostFilesConfigMap = { [path: string]: GhostFileConfig }

const defaultExport: GhostFilesConfigMap

export { defaultExport as default }
