import { createElement, type ReactNode, type CSSProperties, type Ref, isValidElement } from 'react'
import { ContentGenerator } from '../common/render-hook'
import { BaseComponent, setRef } from '../vdom-util'
import { guid } from '../util/misc'
import { isArraysEqual } from '../util/array'
import { ViewOptions } from '../options'
import { isPropsEqualShallow } from '../util/object'
import { isNonHandlerPropsEqual } from '../options-manip'
import { joinClassNames } from '../util/html'

export type ElRef = Ref<HTMLElement>

// TODO: would want more specificity, but React and Preact can't agree on HTMLAttributes
export type ElAttrs = { ref?: ElRef } & Record<string, any>

export interface ElAttrsProps {
  attrs?: ElAttrs
  className?: string
  style?: CSSProperties & Record<string, any> // React's types don't allow custom props?
  elRef?: ElRef
}

export interface ElProps extends ElAttrsProps {
  tag: string
}

export interface ContentGeneratorProps<RenderProps> {
  renderProps: RenderProps
  generatorName: string | undefined // for informing UI-framework if `customGenerator` is undefined
  customGenerator?: ContentGenerator<RenderProps>
  defaultGenerator?: (renderProps: RenderProps) => ReactNode
}

export type ContentInjectorProps<RenderProps> =
  ElProps &
  ContentGeneratorProps<RenderProps> &
  { renderId: number }

export class ContentInjector<RenderProps> extends BaseComponent<ContentInjectorProps<RenderProps>> {
  private el: HTMLElement | undefined
  private id = guid()
  private queuedDomNodes: Node[] = []
  private currentDomNodes: Node[] = []
  private currentGeneratorMeta: any

  render() {
    const { props, context } = this
    const { options } = context
    const { customGenerator, defaultGenerator, renderProps } = props
    const attrs = buildElAttrs(props, '', this.handleEl)
    let useDefault = false
    let innerContent: ReactNode | undefined
    let queuedDomNodes: Node[] = []
    let currentGeneratorMeta: any

    if (customGenerator != null) {
      const customGeneratorRes = typeof customGenerator === 'function' ?
        customGenerator(renderProps) :
        customGenerator

      if (customGeneratorRes === true) {
        useDefault = true
        // NOTE: see how mergeContentInjectors also uses `true` to signal useDefault
      } else {
        const isObject = customGeneratorRes && typeof customGeneratorRes === 'object' // non-null

        if (isObject && ('html' in customGeneratorRes)) {
          attrs.dangerouslySetInnerHTML = { __html: customGeneratorRes.html }
        } else if (isObject && ('domNodes' in customGeneratorRes)) {
          queuedDomNodes = Array.prototype.slice.call(customGeneratorRes.domNodes)
        } else if (
          isObject
            ? isValidElement(customGeneratorRes) // vdom node
            : typeof customGeneratorRes !== 'function' // primitive value (like string or number)
        ) {
          // use in vdom
          innerContent = customGeneratorRes as ReactNode
        } else {
          // an exotic object for handleCustomRendering
          currentGeneratorMeta = customGeneratorRes
        }
      }
    } else {
      useDefault = !hasCustomRenderingHandler(props.generatorName, options)
    }

    if (useDefault && defaultGenerator) {
      innerContent = defaultGenerator(renderProps)
    }

    this.queuedDomNodes = queuedDomNodes
    this.currentGeneratorMeta = currentGeneratorMeta

    return createElement(props.tag as any, attrs, innerContent)
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
      const generatorMeta =
        this.currentGeneratorMeta ??
        customRenderingMetaMap?.[props.generatorName]

      if (generatorMeta) {
        handleCustomRendering({
          id: this.id,
          isActive,
          containerEl: this.el,
          reportNewContainerEl: this.updateElRef, // front-end framework tells us about new container els
          generatorMeta,
          ...props,
        })
      }
    }
  }

  private handleEl = (el: HTMLElement | null) => {
    this.el = el

    const { options } = this.context
    const { generatorName } = this.props

    if (!options.customRenderingReplaces || !hasCustomRenderingHandler(generatorName, options)) {
      this.updateElRef(el)
    }
  }

  private updateElRef = (el: HTMLElement | null) => {
    if (this.props.elRef) {
      setRef(this.props.elRef, el)
    }
  }

  private applyQueueudDomNodes() {
    const { queuedDomNodes, currentDomNodes } = this
    const { el } = this

    if (!isArraysEqual(queuedDomNodes, currentDomNodes)) {
      for (const domNode of currentDomNodes) {
        (domNode as Element).remove()
      }

      for (let newNode of queuedDomNodes) {
        el.appendChild(newNode)
      }

      this.currentDomNodes = queuedDomNodes
    }
  }
}

ContentInjector.addPropsEquality({
  renderProps: isPropsEqualShallow,
  attrs: isNonHandlerPropsEqual,
  style: isPropsEqualShallow,
})

// Util

/*
Does UI-framework provide custom way of rendering that does not use Preact VDOM
AND does the calendar's options define custom rendering?
AKA. Should we NOT render the default content?
*/
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

export function buildElAttrs(
  props: ElAttrsProps,
  className?: string,
  elRef?: ElRef,
): ElAttrs {
  const attrs: ElAttrs = { ...props.attrs, ref: elRef as any }

  if (props.className || className) {
    attrs.className = joinClassNames(
      className,
      props.className,
      attrs.className as string, // TODO: solve SignalLike type problem
    )
  }

  if (props.style) {
    attrs.style = props.style
  }

  return attrs
}
