import { createElement, ComponentChild, JSX, Ref, isValidElement } from '../preact.js'
import { CustomContentGenerator } from '../common/render-hook.js'
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
  generatorName: string | undefined // for informing UI-framework if `customGenerator` is undefined
  customGenerator?: CustomContentGenerator<RenderProps>
  defaultGenerator?: (renderProps: RenderProps) => ComponentChild
}

export type ContentInjectorProps<RenderProps> =
  ElProps &
  ContentGeneratorProps<RenderProps> &
  { renderId: number }

export class ContentInjector<RenderProps> extends BaseComponent<ContentInjectorProps<RenderProps>> {
  private id = guid()
  private queuedDomNodes: Node[] = []
  private currentDomNodes: Node[] = []
  private currentGeneratorMeta: any

  render() {
    const { props, context } = this
    const { options } = context
    const { customGenerator, defaultGenerator, renderProps } = props
    const attrs = buildElAttrs(props, [], this.handleEl)
    let useDefault = false
    let innerContent: ComponentChild | undefined
    let queuedDomNodes: Node[] = []
    let currentGeneratorMeta: any

    if (customGenerator != null) {
      const customGeneratorRes = typeof customGenerator === 'function' ?
        customGenerator(renderProps, createElement) :
        customGenerator

      if (customGeneratorRes === true) {
        useDefault = true
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
          innerContent = customGeneratorRes
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
      const generatorMeta =
        this.currentGeneratorMeta ??
        customRenderingMetaMap?.[props.generatorName]

      if (generatorMeta) {
        handleCustomRendering({
          id: this.id,
          isActive,
          containerEl: this.base as HTMLElement,
          reportNewContainerEl: this.updateElRef, // front-end framework tells us about new container els
          generatorMeta,
          ...props,
          elClasses: (props.elClasses || []).filter(isTruthy),
        })
      }
    }
  }

  private handleEl = (el: HTMLElement | null) => {
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
  extraClassNames?: string[],
  elRef?: ElRef,
): ElAttrs {
  const attrs: ElAttrs = { ...props.elAttrs, ref: elRef as any }

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

function isTruthy(val: any): boolean {
  return Boolean(val)
}
