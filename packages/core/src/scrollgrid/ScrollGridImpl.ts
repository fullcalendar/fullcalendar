import { SectionConfig, ChunkConfig, ColProps, CssDimValue } from './util.js'
import { Component, Ref } from '../preact.js'
import { ViewContext } from '../ViewContext.js'

export interface ScrollGridProps {
  elRef?: Ref<any>
  colGroups?: ColGroupConfig[]
  sections: ScrollGridSectionConfig[]
  liquid: boolean // liquid *height*
  forPrint: boolean
  collapsibleWidth: boolean // can ALL sections be fully collapsed in width?
}

export interface ScrollGridSectionConfig extends SectionConfig {
  key: string
  chunks?: ScrollGridChunkConfig[] // TODO: make this mandatory, somehow also accomodate outerContent
}

export interface ScrollGridChunkConfig extends ChunkConfig {
  key: string
}

export interface ColGroupConfig {
  width?: CssDimValue
  cols: ColProps[]
}

export type ScrollGridImpl = {
  new(props: ScrollGridProps, context: ViewContext): Component<ScrollGridProps>
}
