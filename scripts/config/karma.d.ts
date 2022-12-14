import karma from 'karma'

declare function buildKarmaConfig(
  pkgFilePaths: string[],
  isDev: boolean,
  cliArgs: string[],
): karma.ConfigOptions

export { buildKarmaConfig as default }
