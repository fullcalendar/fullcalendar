import { SectionConfig, ChunkConfig, ColProps, CssDimValue } from './util'
import { Component } from '../vdom'


export interface ScrollGridProps {
  colGroups?: ColGroupConfig[]
  sections: ScrollGridSectionConfig[]
  vGrow?: boolean
  forPrint?: boolean
}

export interface ScrollGridSectionConfig extends SectionConfig {
  key?: string
  chunks: ChunkConfig[]
}

export interface ColGroupConfig {
  width?: CssDimValue
  cols: ColProps[]
}


export type ScrollGridImpl = Component<ScrollGridProps>
