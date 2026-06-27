import { basename } from 'path'
import { watch } from 'chokidar'
import { rollup, watch as rollupWatch, type RollupOptions, type OutputOptions, type RollupWatchOptions } from 'rollup'
import { buildPkgBundleStruct, type PkgBundleStruct } from './utils/bundle-struct.ts'
import { analyzePkg } from '../utils/pkg-analysis.ts'
import { buildModuleOptions, buildGlobalOptions, buildDtsOptions } from './utils/rollup-presets.ts'
import { arrayify, continuousAsync } from '../utils/lang.ts'
import { type ScriptContext } from '../utils/script-runner.ts'
import { untilSigInt } from '../utils/process.ts'
import { pkgLog } from '../utils/log.ts'

export default async function(this: ScriptContext, ...args: string[]) {
  const { monorepoStruct } = this
  const pkgDir = this.cwd
  const pkgJson = monorepoStruct.pkgDirToJson[pkgDir]

  const isWatch = args.includes('--watch')
  const isDev = args.includes('--dev')

  if (!isWatch) {
    await writeBundles(pkgDir, pkgJson, isDev)
  } else {
    const stopWatch = await watchBundles(pkgDir, pkgJson, isDev)

    await untilSigInt()
    stopWatch()
  }
}

export async function writeBundles(
  pkgDir: string,
  pkgJson: any,
  isDev: boolean,
): Promise<void> {
  const pkgBundleStruct = await buildPkgBundleStruct(pkgDir, pkgJson)
  const { isTests } = analyzePkg(pkgBundleStruct.pkgDir)
  const moduleEnabled = !isTests
  const dtsEnabled = !isDev && !isTests

  const optionsObjs = [
    moduleEnabled &&
      buildModuleOptions(
        pkgBundleStruct,
        isDev,
        /* sourcemaps = */ isDev || isTests || Boolean(process.env.SOURCEMAPS),
      ),
    pkgBundleStruct.globalConfig &&
      await buildGlobalOptions(
        pkgBundleStruct,
        isDev,
        /* sourcemaps = */ isDev || isTests || Boolean(process.env.SOURCEMAPS),
      ),
    dtsEnabled && buildDtsOptions(pkgBundleStruct, isDev)
  ].filter(Boolean) as RollupOptions[]

  await Promise.all(
    optionsObjs.map(async (options) => {
      const bundle = await rollup(options)
      const outputOptionObjs: OutputOptions[] = arrayify(options.output)

      await Promise.all(
        outputOptionObjs.map((outputOptions) => bundle.write(outputOptions)),
      )
    }),
  )
}

export async function watchBundles(
  pkgDir: string,
  pkgJson: any,
  isDev: boolean,
): Promise<() => void> {
  return continuousAsync(async (rerun: any) => {
    const pkgName = pkgJson.name
    const pkgBundleStruct = await buildPkgBundleStruct(pkgDir, pkgJson)
    const { isTests } = analyzePkg(pkgBundleStruct.pkgDir)
    const moduleEnabled = !isTests
    const dtsEnabled = !isDev && !isTests

    const optionsObjs = [
      moduleEnabled &&
        buildModuleOptions(
          pkgBundleStruct,
          isDev,
          /* sourcemaps = */ isDev || isTests,
        ),
      pkgBundleStruct.globalConfig &&
        await buildGlobalOptions(
          pkgBundleStruct,
          isDev,
          /* sourcemaps = */ isDev || isTests,
        ),
      dtsEnabled && buildDtsOptions(pkgBundleStruct, isDev),
    ].filter(Boolean) as RollupWatchOptions[]

    if (!optionsObjs.length) {
      return () => {}
    }

    const rollupWatcher = rollupWatch(optionsObjs)
    await new Promise<void>((resolve) => {
      rollupWatcher.on('event', (ev) => {
        switch (ev.code) {
          case 'ERROR':
            console.error(ev.error)
            break
          case 'BUNDLE_END':
            pkgLog(pkgName, formatWriteMessage(ev.input, ev.output as string[]))
            break
          case 'END':
            resolve()
            break
        }
      })
    })

    const fileWatcher = watch(pkgBundleStruct.miscWatchPaths, { ignoreInitial: true })
    fileWatcher.once('all', () => {
      pkgLog(pkgName, 'Misc file change detected. Rebuilding all.')
      rerun()
    })

    return () => {
      rollupWatcher.close()
      fileWatcher.close()
    }
  })
}

function formatWriteMessage(input: any, outputPaths: string[]): string {
  const inputPaths: string[] = typeof input === 'object' ? Object.values(input) : [input]
  const inputNames = inputPaths.map((inputPath) => basename(inputPath))
  const outputNames = outputPaths.map((outputPath) => basename(outputPath))

  return `Wrote ${formatNames(inputNames)} to ${formatNames(outputNames)}`
}

function formatNames(names: string[]) {
  if (names.length <= 2) {
    return names.join(', ')
  } else {
    const otherCnt = names.length - 2

    return names.slice(0, 2).join(', ') + ', and ' +
      otherCnt + ' ' + (otherCnt === 1 ? 'other' : 'others')
  }
}
