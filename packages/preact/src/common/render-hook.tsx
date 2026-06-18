/* eslint max-classes-per-file: off */

import type { ReactNode } from 'react'
import { warn } from '../util/warn'

export type MountInfo<DisplayInfo> = DisplayInfo & { el: HTMLElement }
export type DidMountHandler<DisplayInfo> = (mountData: MountInfo<DisplayInfo>) => void
export type WillUnmountHandler<DisplayInfo> = (mountData: MountInfo<DisplayInfo>) => void

export interface ObjCustomContent {
  html?: string
  domNodes?: any[]
}

export type CustomContent = ReactNode | ObjCustomContent
export type ContentGenerator<RenderProps> = CustomContent | ((renderProps: RenderProps) => (CustomContent | true | void | undefined))
export type ClassNameInput = string | undefined | null | false | 0
export type ClassNameGenerator<RenderProps> = ClassNameInput | ((renderProps: RenderProps) => ClassNameInput)

const warnedClassNameOptions: { [optionName: string]: true } = {}

export function refineClassName(input: unknown, optionName: string): ClassNameInput {
  if (!input || typeof input === 'string') {
    return input as ClassNameInput
  }

  warnInvalidClassName(optionName)
  return ''
}

export function refineClassNameGenerator<RenderProps>(
  input: ClassNameGenerator<RenderProps>,
  optionName: string,
): ClassNameGenerator<RenderProps> {
  if (typeof input === 'function') {
    return (renderProps: RenderProps) => refineClassName(input(renderProps), optionName)
  }

  return refineClassName(input, optionName)
}

function warnInvalidClassName(optionName: string): void {
  if (!warnedClassNameOptions[optionName]) {
    warn(`Invalid option \`${optionName}\`: expected a className string or a falsy value.`)
    warnedClassNameOptions[optionName] = true
  }
}
