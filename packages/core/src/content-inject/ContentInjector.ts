import { createElement, ComponentChild, isValidElement, JSX, Ref } from '../preact.js'
import { CustomContent, CustomContentGenerator, ObjCustomContent } from '../common/render-hook.js'
import { BaseComponent, setRef } from '../vdom-util.js'
import { guid } from '../util/misc.js'
import { isArraysEqual } from '../util/array.js'
import { removeElement } from '../util/dom-manip.js'
import { ViewOptions } from '../options.js'
import { isNonHandlerPropsEqual, isPropsEqual } from '../util/object.js'

export type ElRef = Ref<HTMLElement>
export type ElAttrs = JSX.HTMLAttributes & JSX.SVGAttributes & { ref?: ElRef } & Record<string, any>

export interface ElAttrsProps {
  elRef?: ElRef
  elClasses?: string[]
  elStyle?: JSX.CSSProperties
  elAttrs?: ElAttrs
}

export interface ElProps extends ElAttrsProps {
  elTag: string
}

export interface ContentGeneratorProps<RenderProps> {
  renderProps: RenderProps
  generatorName: string | undefined
  generator: CustomContentGenerator<RenderProps> | undefined
}

export type ContentInjectorProps<RenderProps> =
  ElProps &
  ContentGeneratorProps<RenderProps> &
  { renderId: number }

export class ContentInjector<RenderProps> extends BaseComponent<ContentInjectorProps<RenderProps>> {
  private id = guid()
  private currentDomNodes: Node[] = []
  private queuedDomNodes: Node[] = []

  render() {
    const { props, context } = this
    const { options } = context
    const { generator, renderProps } = props
    const attrs = buildElAttrs(props)
    let innerContent: ComponentChild | undefined
    let queuedDomNodes: Node[] = []

    if (hasCustomRenderingHandler(props.generatorName, options)) {
      if (options.customRenderingReplacesEl) {
        delete attrs.elRef // because handleEl will be used
      }
    } else {
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
          queuedDomNodes = Array.prototype.slice.call(
            (customContent as ObjCustomContent).domNodes,
          )
        }
      }
    }

    this.queuedDomNodes = queuedDomNodes

    return createElement(props.elTag, attrs, innerContent)
  }

  componentDidMount(): void {
    this.applyQueueudDomNodes()
    this.triggerCustomRendering(true)
  }

  componentDidUpdate(): void {
    this.applyQueueudDomNodes()
    this.triggerCustomRendering(true)
  }

  componentWillUnmount(): void {
    this.triggerCustomRendering(false) // TODO: different API for removal?
  }

  private triggerCustomRendering(isActive: boolean) {
    const { props, context } = this
    const { handleCustomRendering, customRenderingMetaMap } = context.options

    if (handleCustomRendering) {
      const customRenderingMeta = customRenderingMetaMap?.[props.generatorName]

      if (customRenderingMeta) {
        handleCustomRendering({
          id: this.id,
          isActive,
          containerEl: this.base as HTMLElement,
          reportNewContainerEl: this.handleEl, // for customRenderingReplacesEl
          generatorMeta: customRenderingMeta,
          ...props,
        })
      }
    }
  }

  private handleEl = (el: HTMLElement | null) => {
    if (this.props.elRef) {
      setRef(this.props.elRef, el)
    }
  }

  private applyQueueudDomNodes() {
    const { queuedDomNodes, currentDomNodes } = this
    const el = this.base

    if (!isArraysEqual(queuedDomNodes, currentDomNodes)) {
      currentDomNodes.forEach(removeElement)

      for (let newNode of queuedDomNodes) {
        el.appendChild(newNode)
      }

      this.currentDomNodes = queuedDomNodes
    }
  }
}

ContentInjector.addPropsEquality({
  elClasses: isArraysEqual,
  elStyle: isPropsEqual,
  elAttrs: isNonHandlerPropsEqual,
  renderProps: isPropsEqual,
})

// Util

export function hasCustomRenderingHandler(
  generatorName: string | undefined,
  options: ViewOptions,
): boolean {
  return Boolean(
    options.handleCustomRendering &&
    generatorName &&
    options.customRenderingMetaMap?.[generatorName],
  )
}

export function buildElAttrs(props: ElAttrsProps, extraClassNames?: string[]): ElAttrs {
  const attrs: ElAttrs = {
    ...props.elAttrs,
    ref: props.elRef as any,
  }

  if (props.elClasses || extraClassNames) {
    attrs.className = (props.elClasses || [])
      .concat(extraClassNames || [])
      .concat((attrs.className as (string | undefined)) || [])
      .filter(Boolean)
      .join(' ')
  }

  if (props.elStyle) {
    attrs.style = props.elStyle
  }

  return attrs
}
