import { type MonorepoStruct } from './monorepo-struct.ts'

export function refineFilterArgs(args: string[], monorepoStruct: MonorepoStruct): string[] {
  const isAllIndex = args.indexOf('--all')
  const isAll = isAllIndex !== -1

  if (isAll) {
    args = args.slice()
    args.splice(isAllIndex, 1)
  } else {
    const monorepoConfig = monorepoStruct.monorepoPkgJson.monorepoConfig || {}
    const filterSubtrees: string[] = monorepoConfig.filterSubtrees || ['.']

    args = args.concat(filterSubtrees.map((subdir) => `--filter=${subdir}/**`))
  }

  return args
}
