import { createElement, VNode, ComponentChildren, isValidElement, PreactDOMAttributes } from '../preact.js'
import { CustomContent, CustomContentGenerator, ObjCustomContent } from '../common/render-hook.js'
import { BaseComponent } from '../vdom-util.js'
import { guid } from '../util/misc.js'
import { isArraysEqual } from '../util/array.js'
import { removeElement } from '../util/dom-manip.js'
import { ViewOptionsRefined } from '../options.js'

export interface ContentInjectorProps<RenderProps> {
  tagName?: string
  className?: string
  optionName: keyof ViewOptionsRefined // TODO: discriminate for CustomContentGenerator
  renderProps: RenderProps
  children?: (renderProps: RenderProps) => VNode // the default
}

export class ContentInjector<RenderProps> extends BaseComponent<ContentInjectorProps<RenderProps>> {
  private id = guid()
  private queuedDomNodes: Node[] | NodeList | undefined

  render() {
    const { props, context } = this
    const attrs = { className: props.className }
    let innerContent: ComponentChildren | undefined
    let needsDefault = false

    if (context.options.handleCustomRendering) {
      needsDefault = !context.options.customRenderingGenerators?.[props.optionName]
    } else {
      const customContentGenerator = context.options[props.optionName] as CustomContentGenerator<RenderProps> | undefined
      const customContent: CustomContent = typeof customContentGenerator === 'function' ?
        customContentGenerator(props.renderProps, createElement) :
        customContentGenerator

      if (
        typeof customContent === 'string' ||
        isValidElement(customContent) ||
        Array.isArray(customContent)
      ) {
        innerContent = customContent
      } else if (typeof customContent === 'object') {
        if ('html' in customContent) {
          (attrs as PreactDOMAttributes).dangerouslySetInnerHTML = { __html: customContent.html }
        } else if ('domNodes' in customContent) {
          this.queuedDomNodes = (customContent as ObjCustomContent).domNodes
        }
      } else {
        needsDefault = true
      }
    }

    if (needsDefault && props.children) {
      innerContent = props.children(props.renderProps)
    }

    return createElement(props.tagName || 'div', attrs, innerContent)
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
      const customRenderingGenerator = customRenderingGenerators?.[props.optionName]

      if (customRenderingGenerator) {
        handleCustomRendering({
          id: this.id,
          isActive,
          containerEl: this.base as HTMLElement,
          className: props.className || '',
          generatorName: props.optionName as string,
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
