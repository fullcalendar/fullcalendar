import { dirname } from 'path'
import { readFile, writeFile, mkdir, lstat } from 'fs/promises'

export async function ensureFileDir(path: string): Promise<any> {
  await mkdir(dirname(path), { recursive: true })
}

export async function readJson(path: string): Promise<any> {
  const srcJson = await readFile(path, 'utf8')
  const srcMeta = JSON.parse(srcJson)
  return srcMeta
}

export async function writeJson(path: string, obj: any): Promise<any> {
  await writeFile(path, stringifyJson(obj))
}

export function stringifyJson(obj: any): string {
  return JSON.stringify(obj, undefined, 2) + '\n'
}

export async function writeIfDifferent(path: string, content: string): Promise<boolean> {
  const existingContent = await readFile(path, 'utf8').catch(() => false)

  if (existingContent === false || existingContent !== content) {
    await writeFile(path, content)
    return true
  }

  return false
}

export function fileExists(path: string): Promise<boolean> {
  return lstat(path).then(
    () => true,
    () => false,
  )
}
