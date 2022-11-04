import { createElement, ComponentChildren, isValidElement, JSX, Ref} from '../preact.js'
import { CustomContent, CustomContentGenerator, ObjCustomContent } from '../common/render-hook.js'
import { BaseComponent } from '../vdom-util.js'
import { guid } from '../util/misc.js'
import { isArraysEqual } from '../util/array.js'
import { removeElement } from '../util/dom-manip.js'

export interface ContentInjectorProps<RenderProps> extends JSX.HTMLAttributes {
  tagName?: string
  elRef?: Ref<HTMLElement>
  renderProps: RenderProps
  generatorName: string
  generator: CustomContentGenerator<RenderProps> | undefined
}

export const defaultTagName = 'div'

export class ContentInjector<RenderProps> extends BaseComponent<ContentInjectorProps<RenderProps>> {
  private id = guid()
  private queuedDomNodes: Node[] | NodeList | undefined

  render() {
    const { props, context } = this
    const { options } = context

    const { tagName, generator, renderProps } = props
    const attrs: JSX.HTMLAttributes = { ...props, ref: props.elRef, children: undefined }
    let innerContent: ComponentChildren | undefined

    if (
      !options.handleCustomRendering ||
      !options.customRenderingGenerators?.[props.generatorName]
    ) {
      const customContent: CustomContent = typeof generator === 'function' ?
        generator(renderProps, createElement) :
        generator

      if (
        typeof customContent === 'string' ||
        isValidElement(customContent) ||
        Array.isArray(customContent)
      ) {
        innerContent = customContent
      } else if (typeof customContent === 'object') {
        if ('html' in customContent) {
          attrs.dangerouslySetInnerHTML = { __html: customContent.html }
        } else if ('domNodes' in customContent) {
          this.queuedDomNodes = (customContent as ObjCustomContent).domNodes
        }
      }
    }

    return createElement((tagName || defaultTagName) as any, attrs, innerContent)
  }

  componentDidMount(): void {
    this.triggerCustomRendering(true)
    this.applyQueueudDomNodes()
  }

  componentDidUpdate(): void {
    this.triggerCustomRendering(true)
    this.applyQueueudDomNodes()
  }

  componentWillUnmount(): void {
    this.triggerCustomRendering(false)
  }

  private triggerCustomRendering(isActive: boolean) {
    const { props, context } = this
    const { handleCustomRendering, customRenderingGenerators } = context.options

    if (handleCustomRendering) {
      const customRenderingGenerator = customRenderingGenerators?.[props.generatorName]

      if (customRenderingGenerator) {
        handleCustomRendering({
          id: this.id,
          isActive,
          containerEl: this.base as HTMLElement,
          generatorName: props.generatorName,
          generator: customRenderingGenerator,
          renderProps: props.renderProps,
        })
      }
    }
  }

  private applyQueueudDomNodes() {
    if (this.queuedDomNodes) {
      const el = this.base
      const currentNodes: Node[] = Array.prototype.slice.call(el.childNodes)
      const newNodes: Node[] = Array.prototype.slice.call(this.queuedDomNodes)

      if (!isArraysEqual(currentNodes, newNodes)) {
        for (let newNode of newNodes) {
          el.appendChild(newNode)
        }

        // TODO: won't this potentially remove elements that were readded?
        currentNodes.forEach(removeElement)
      }

      this.queuedDomNodes = undefined
    }
  }
}
