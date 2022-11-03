import { createElement, VNode, ComponentChildren, isValidElement, PreactDOMAttributes } from '../preact.js'
import { CustomContentGenerator, ObjCustomContent } from '../common/render-hook.js'
import { BaseComponent } from '../vdom-util.js'
import { guid } from '../util/misc.js'
import { isArraysEqual } from '../util/array.js'
import { removeElement } from '../util/dom-manip.js'

export interface ContentInjectorProps<RenderProps> {
  tagName?: string
  className?: string
  optionName?: string
  optionValue?: CustomContentGenerator<RenderProps>
  renderProps: RenderProps
  children?: ((renderProps: RenderProps) => VNode) | ComponentChildren // the default
}

export class ContentInjector<RenderProps> extends BaseComponent<ContentInjectorProps<RenderProps>> {
  private id = guid()
  private queuedDomNodes: Node[] | NodeList | undefined

  render() {
    const { props, context } = this
    const attrs = { className: props.className }
    let innerContent: ComponentChildren | undefined

    if (!context.options.handleCustomRendering) {
      const contentGenerator: CustomContentGenerator<RenderProps> = props.optionValue
      const customContent = typeof contentGenerator === 'function' ?
        contentGenerator(props.renderProps) :
        contentGenerator

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
      }
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
      handleCustomRendering({
        id: this.id,
        isActive,
        containerEl: this.base as HTMLElement,
        className: props.className || '',
        optionName: props.optionName,
        optionValue: customRenderingGenerators[props.optionName],
        renderProps: props.renderProps,
      })
    }
  }

  private applyQueueudDomNodes() {
    const { queuedDomNodes } = this

    if (queuedDomNodes) {
      const el = this.base
      const currentNodes: Node[] = Array.prototype.slice.call(el.childNodes)
      const newNodes: Node[] = Array.prototype.slice.call(queuedDomNodes)

      if (!isArraysEqual(currentNodes, newNodes)) {
        for (let newNode of newNodes) {
          el.appendChild(newNode)
        }
        currentNodes.forEach(removeElement)
      }

      this.queuedDomNodes = undefined
    }
  }
}
