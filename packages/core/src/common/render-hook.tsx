import { Component, Ref, createRef, ComponentChildren, h, RefObject } from '../vdom'
import ComponentContext, { ComponentContextType } from '../component/ComponentContext'
import { setRef } from '../vdom-util'
import { isPropsEqual } from '../util/object'


export interface RenderHookProps<HookProps> {
  name: string
  hookProps: HookProps
  defaultContent?: (hookProps: HookProps) => ComponentChildren
  options?: object // for using another root object for the options. RENAME
  children: RenderHookPropsChildren
  elRef?: Ref<any>
}

export type RenderHookPropsChildren = (
  rootElRef: Ref<any>,
  classNames: string[],
  innerElRef: Ref<any>,
  innerContent: ComponentChildren // if falsy, means it wasn't specified
) => ComponentChildren


export class RenderHook<HookProps> extends Component<RenderHookProps<HookProps>> {

  static contextType = ComponentContextType

  private rootElRef = createRef()


  render(props: RenderHookProps<HookProps>, state: {}, context: ComponentContext) {
    return (
      <MountHook name={props.name} hookProps={props.hookProps} options={props.options} elRef={this.handleRootEl}>
        {(rootElRef) => (
          <ContentHook name={props.name} hookProps={props.hookProps} options={props.options} defaultContent={props.defaultContent} backupElRef={this.rootElRef}>
            {(innerElRef, innerContent) => props.children(
              rootElRef,
              normalizeClassNames(
                (props.options || context.options)[props.name + 'ClassNames'],
                props.hookProps
              ),
              innerElRef,
              innerContent
            )}
          </ContentHook>
        )}
      </MountHook>
    )
  }


  handleRootEl = (el: HTMLElement | null) => {
    setRef(this.rootElRef, el)

    if (this.props.elRef) {
      setRef(this.props.elRef, el)
    }
  }

}


export interface ContentHookProps<HookProps> {
  name: string
  hookProps: HookProps
  options?: object // will use instead of context. RENAME
  backupElRef?: RefObject<any>
  defaultContent?: (hookProps: HookProps) => ComponentChildren
  children: (
    innerElRef: Ref<any>,
    innerContent: ComponentChildren // if falsy, means it wasn't specified
  ) => ComponentChildren
}

export class ContentHook<HookProps> extends Component<ContentHookProps<HookProps>> {

  static contextType = ComponentContextType

  private innerElRef = createRef()
  private customContentHandler: ContentHandler<any>


  render(props: ContentHookProps<HookProps>) {
    return props.children(this.innerElRef, this.renderInnerContent())
  }


  componentDidMount() {
    this.updateCustomContent()
  }


  componentDidUpdate() {
    this.updateCustomContent()
  }


  private renderInnerContent() {
    let { props } = this
    let innerContent: ComponentChildren = null
    let rawVal = (this.props.options || this.context.options)[props.name + 'Content']
    let innerContentRaw = normalizeContent(rawVal, props.hookProps)

    if (innerContentRaw === undefined) {
      innerContentRaw = normalizeContent(props.defaultContent, props.hookProps)
    }

    if (innerContentRaw !== undefined) {

      if (isComponentChildren(innerContentRaw)) {
        innerContent = innerContentRaw

      } else {
        innerContent = [] // signal that something was specified

        if (this.customContentHandler) {
          this.customContentHandler.meta = innerContentRaw

        // after this point, we know innerContentRaw is not null nor undefined
        // would have been caught by isComponentChildren
        } else if ('html' in innerContentRaw) {
          this.customContentHandler = new HtmlContentHandler(innerContentRaw)

        } else if ('domNodes' in innerContentRaw) {
          this.customContentHandler = new DomContentHandler(innerContentRaw)
        }
      }
    }

    return innerContent
  }


  private updateCustomContent() {
    if (this.customContentHandler) {
      this.customContentHandler.updateEl(this.innerElRef.current || this.props.backupElRef.current)
    }
  }

}


export interface MountHookProps<HookProps> {
  name: string
  elRef?: Ref<any> // maybe get rid of once we have better API for caller to combine refs
  hookProps: HookProps
  options?: object // will use instead of context
  children: (rootElRef: Ref<any>) => ComponentChildren
}

export class MountHook<HookProps> extends Component<MountHookProps<HookProps>> {

  static contextType = ComponentContextType

  rootEl: HTMLElement


  render(props: MountHookProps<HookProps>) {
    return props.children(this.handleRootEl)
  }


  componentDidMount() {
    this.triggerMountHandler('DidMount')
  }


  componentWillUnmount() {
    this.triggerMountHandler('WillUnmount')
  }


  private handleRootEl = (rootEl: HTMLElement) => {
    this.rootEl = rootEl

    if (this.props.elRef) {
      setRef(this.props.elRef, rootEl)
    }
  }


  private triggerMountHandler(postfix: string) {
    let handler = (this.props.options || this.context.options)[this.props.name + postfix]

    if (handler) {
      handler({ // TODO: make a better type for this
        ...this.props.hookProps,
        el: this.rootEl
      })
    }
  }

}


export function buildHookClassNameGenerator<HookProps>(hookName: string) {
  let currentRawGenerator
  let currentContext: object
  let currentCacheBuster
  let currentClassNames: string[]

  return function(hookProps: HookProps, context: ComponentContext, optionsOverride?: object, cacheBusterOverride?: object) {
    let rawGenerator = (optionsOverride || context.options)[hookName + 'ClassNames']
    let cacheBuster = cacheBusterOverride || hookProps

    if (
      currentRawGenerator !== rawGenerator ||
      currentContext !== context ||
      (!currentCacheBuster || !isPropsEqual(currentCacheBuster, cacheBuster))
    ) {
      currentClassNames = normalizeClassNames(rawGenerator, hookProps)
      currentRawGenerator = rawGenerator
      currentContext = context
      currentCacheBuster = cacheBuster
    }

    return currentClassNames
  }
}


function normalizeClassNames(classNames, hookProps) {

  if (typeof classNames === 'function') {
    classNames = classNames(hookProps)
  }

  if (Array.isArray(classNames)) {
    return classNames

  } else if (typeof classNames === 'string') {
    return classNames.split(' ')

  } else {
    return []
  }
}


function normalizeContent(input, hookProps) {
  if (typeof input === 'function') {
    return input(hookProps)
  } else {
    return input
  }
}


function isComponentChildren(input) { // TODO: make this a general util
  let type = typeof input

  return (type === 'object')
    ? (
      !input || // null
      Array.isArray(input) || // DOM node list
      input.type // a virtual DOM node
    )
    : type.match(/^(undefined|string|number|boolean)$/)
}


abstract class ContentHandler<RenderMeta> {

  private el: HTMLElement

  constructor(public meta: RenderMeta) {
  }

  updateEl(el: HTMLElement) {
    this.render(el, this.meta, this.el !== el)
    this.el = el
  }

  abstract render(el: HTMLElement, meta: RenderMeta, isInitial: boolean)

}


type HtmlMeta = { html: string }

class HtmlContentHandler extends ContentHandler<HtmlMeta> {

  render(el: HTMLElement, meta: HtmlMeta) {
    el.innerHTML = meta.html
  }

}


type DomMeta = { domNodes: Node[] | NodeList }

class DomContentHandler extends ContentHandler<DomMeta> {

  render(el: HTMLElement, meta: DomMeta) {
    removeAllChildren(el)

    let { domNodes } = meta

    for (let i = 0; i < domNodes.length; i++) {
      el.appendChild(domNodes[i])
    }
  }

}


function removeAllChildren(parentEl: HTMLElement) { // TODO: move to util file
  let { childNodes } = parentEl

  while (childNodes.length) {
    parentEl.removeChild(childNodes[0])
  }
}
