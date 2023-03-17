/* eslint max-classes-per-file: off */

import { ComponentChildren } from '../preact.js'
import { ClassNamesInput } from '../util/html.js'

export type MountArg<ContentArg> = ContentArg & { el: HTMLElement }
export type DidMountHandler<TheMountArg extends { el: HTMLElement }> = (mountArg: TheMountArg) => void
export type WillUnmountHandler<TheMountArg extends { el: HTMLElement }> = (mountArg: TheMountArg) => void

export interface ObjCustomContent {
  html: string
  domNodes: any[]
}

export type CustomContent = ComponentChildren | ObjCustomContent
export type CustomContentGenerator<RenderProps> = CustomContent | ((renderProps: RenderProps, createElement: any) => (CustomContent | true))
export type ClassNamesGenerator<RenderProps> = ClassNamesInput | ((renderProps: RenderProps) => ClassNamesInput)
