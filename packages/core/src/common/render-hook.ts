import { Component, Ref, createRef, ComponentChildren } from '../vdom'
import { ComponentContextType } from '../component/ComponentContext'
import { setRef } from '../vdom-util'


export interface RenderHookProps<MountProps, DynamicProps> {
  name: string
  mountProps: MountProps
  dynamicProps: DynamicProps
  defaultInnerContent?: (dynamicProps: DynamicProps) => ComponentChildren
  children: (
    rootElRef: Ref<any>,
    classNames: string[],
    innerElRef: Ref<any>,
    innerContent: ComponentChildren // if falsy, means it wasn't specified
  ) => ComponentChildren
  elRef?: Ref<any>
}


export class RenderHook<MountProps, DynamicProps> extends Component<RenderHookProps<MountProps, DynamicProps>> {

  static contextType = ComponentContextType

  private rootEl: HTMLElement
  private innerElRef = createRef()
  private customContentHandler: ContentHandler<any>


  render(props: RenderHookProps<MountProps, DynamicProps>) {
    return props.children(
      this.handleRootEl,
      this.buildClassNames(),
      this.innerElRef,
      this.renderInnerContent()
    )
  }


  componentDidMount() {
    this.triggerMountHandler('DidMount')
    this.updateCustomContent()
  }


  componentDidUpdate() {
    this.updateCustomContent()
  }


  componentWillUnmount() {
    this.triggerMountHandler('WillUnmount')
  }


  private buildClassNames(): string[] {
    let { props } = this
    let classNames = this.context.options[props.name + 'ClassNames']

    if (typeof classNames === 'function') {
      return classNames(props.dynamicProps)

    } else if (Array.isArray(classNames)) {
      return classNames

    } else if (typeof classNames === 'string') {
      return classNames.split(' ')

    } else {
      return []
    }
  }


  private renderInnerContent() {
    let { props } = this
    let innerContent: ComponentChildren = null
    let innerContentRaw = normalizeContent(this.context.options[props.name + 'Content'], props.dynamicProps)

    if (innerContentRaw === undefined) {
      innerContentRaw = normalizeContent(props.defaultInnerContent, props.dynamicProps)
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


  private handleRootEl = (rootEl: HTMLElement) => {
    this.rootEl = rootEl

    if (this.props.elRef) {
      setRef(this.props.elRef, rootEl)
    }
  }


  private triggerMountHandler(postfix: string) {
    let handler = this.context.options[this.props.name + postfix]

    if (handler) {
      handler({ // TODO: make a better type for this
        ...this.props.mountProps,
        el: this.rootEl
      })
    }
  }


  private updateCustomContent() {
    if (this.customContentHandler) {
      this.customContentHandler.updateEl(this.innerElRef.current || this.rootEl)
    }
  }

}


function normalizeContent(input, dynamicProps) {
  if (typeof input === 'function') {
    return input(dynamicProps)
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
