import { SectionConfig, ChunkConfig, ColProps, CssDimValue } from './util'
import { Component, Ref } from '../vdom'
import { ComponentContext } from '../component/ComponentContext'


export interface ScrollGridProps {
  colGroups?: ColGroupConfig[]
  sections: ScrollGridSectionConfig[]
  liquid?: boolean
  forPrint?: boolean
  elRef?: Ref<any>
}

export interface ScrollGridSectionConfig extends SectionConfig {
  key?: string
  chunks?: ChunkConfig[] // TODO: make this mandatory, somehow also accomodate outerContent
}

export interface ColGroupConfig {
  width?: CssDimValue
  cols: ColProps[]
}


export type ScrollGridImpl = {
  new(props: ScrollGridProps, context: ComponentContext): Component<ScrollGridProps>
}
