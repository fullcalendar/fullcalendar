import { Store } from './Store.js'

export type CustomRenderingGenerator<RenderProps> = (renderProps: RenderProps) => any
export type CustomRenderingHandler<RenderProps> = (customRender: CustomRendering<RenderProps>) => void

export interface CustomRendering<RenderProps> {
  id: string
  isActive: boolean
  containerEl: HTMLElement
  className: string
  optionName: string
  optionValue: CustomRenderingGenerator<RenderProps>
  renderProps: RenderProps
}

/*
Subscribers will get a LIST of CustomRenderings
*/
export class CustomRenderingStore<RenderProps> extends Store<Iterable<CustomRendering<RenderProps>>> {
  private map = new Map<string, CustomRendering<RenderProps>>()

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
      this.set(map.values())
    }
  }
}
