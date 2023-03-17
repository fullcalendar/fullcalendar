import { Store } from './Store.js'
import { ElProps } from './ContentInjector.js'

export type CustomRenderingHandler<RenderProps> = (customRender: CustomRendering<RenderProps>) => void

export interface CustomRendering<RenderProps> extends ElProps {
  id: string // TODO: need this? Map can be responsible for storing key?
  isActive: boolean
  containerEl: HTMLElement
  reportNewContainerEl: (el: HTMLElement | null) => void
  generatorName: string
  generatorMeta: any // could be as simple as boolean
  renderProps: RenderProps
}

/*
Subscribers will get a LIST of CustomRenderings
*/
export class CustomRenderingStore<RenderProps> extends Store<Map<string, CustomRendering<RenderProps>>> {
  private map = new Map<string, CustomRendering<RenderProps>>()
  // for consistent order

  handle(customRendering: CustomRendering<RenderProps>): void {
    const { map } = this
    let updated = false

    if (customRendering.isActive) {
      map.set(customRendering.id, customRendering as CustomRendering<RenderProps>)
      updated = true
    } else if (map.has(customRendering.id)) {
      map.delete(customRendering.id)
      updated = true
    }

    if (updated) {
      this.set(map)
    }
  }
}
