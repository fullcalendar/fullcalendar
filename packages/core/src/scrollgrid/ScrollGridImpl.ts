import { SectionConfig, ChunkConfig, ColProps, CssDimValue } from './util'
import { Component } from '../vdom'
import ComponentContext from '../component/ComponentContext'


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


export type ScrollGridImpl = {
  new(props: ScrollGridProps, context: ComponentContext): Component<ScrollGridProps>
}
