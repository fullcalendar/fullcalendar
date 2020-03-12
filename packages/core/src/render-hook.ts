import { Component, VNode, Ref, createRef, ComponentChildren } from './vdom'
import ComponentContext, { ComponentContextType } from './component/ComponentContext'


export interface MountHookProps<HandlerProps> {
  name: string // TODO: rename to entity or something
  handlerProps: HandlerProps // TODO: these props should not be very dynamic!
  children: (rootElRef: Ref<any>) => ComponentChildren
}


export class MountHook<HandlerProps> extends Component<MountHookProps<HandlerProps>> {

  static contextType = ComponentContextType

  private rootElRef = createRef()


  render(props: MountHookProps<HandlerProps>) {
    return props.children(this.rootElRef)
  }


  componentDidMount() {
    this.triggerLifecycle('DidMount')
  }


  componentWillUnmount() {
    this.triggerLifecycle('WillUnmount')
  }


  private triggerLifecycle(baseName: string) {
    let handler = this.context.options[this.props.name + baseName]

    if (handler) {
      handler({ // TODO: make a better type for this
        ...this.props.handlerProps,
        el: this.rootElRef.current
      })
    }
  }

}


export interface ClassNamesHookProps<HandlerProps> {
  name: string
  handlerProps: HandlerProps
  children: (classNames: string[]) => ComponentChildren
}


export class ClassNamesHook<HandlerProps> extends Component<ClassNamesHookProps<HandlerProps>> {

  static contextType = ComponentContextType


  render(props: ClassNamesHookProps<HandlerProps>, state: {}, context: ComponentContext) {
    let { options } = context
    let generateClassNames = options[props.name + 'ClassNames']
    let classNames: string[]

    if (typeof generateClassNames === 'function') {
      classNames = generateClassNames(props.handlerProps)

    } else if (Array.isArray(generateClassNames)) {
      classNames = generateClassNames

    } else {
      classNames = []
    }

    return props.children(classNames)
  }

}


export interface InnerContentHookProps<InnerProps> {
  name: string
  innerProps: InnerProps
  defaultInnerContent?: (innerProps: InnerProps) => ComponentChildren
  children: InnerContentHookOuterContent // the outer content
}

export type InnerContentHookOuterContent = (innerContentParentRef: Ref<any>, innerContent: ComponentChildren, anySpecified: boolean) => ComponentChildren


export class InnerContentHook<InnerProps> extends Component<InnerContentHookProps<InnerProps>> {

  static contextType = ComponentContextType

  private customContentHandler: ContentHandler<any>


  render(props: InnerContentHookProps<InnerProps>, state: {}, context: ComponentContext) {
    let { options } = context
    let renderInner = options[props.name + 'InnerContent'] || props.defaultInnerContent
    let innerContent: ComponentChildren

    if (renderInner) {
      let innerContentRaw = renderInner(props.innerProps)

      if (innerContentRaw) {
        if ( // is ComponentChildren... is there a util for this?
          (innerContentRaw as VNode).type ||
          Array.isArray(innerContentRaw) ||
          typeof innerContentRaw === 'string'
        ) {
          innerContent = innerContentRaw

        } else if (this.customContentHandler) {
          this.customContentHandler.handleProps(innerContentRaw)

        } else if (typeof innerContentRaw === 'object' && innerContentRaw) { // non-null object

          if ('html' in innerContentRaw) {
            this.customContentHandler = new HtmlContentHandler(innerContentRaw)

          } else if ('domNodes' in innerContentRaw) {
            this.customContentHandler = new DomContentHandler(innerContentRaw as DomMeta)
          }
        }
      }
    }

    return props.children(this.handleInnerContentParent, innerContent, Boolean(renderInner))
  }


  handleInnerContentParent = (parentEl: HTMLElement | null) => {
    if (this.customContentHandler) {
      this.customContentHandler.handleEl(parentEl)
    }
  }

}


// TODO: allow for returning a "string" that will be Preact-escaped text???
// look at Preact's ComponentChild interface for what it could be


abstract class ContentHandler<RenderMeta> {

  private el: HTMLElement

  constructor(private meta: RenderMeta) {
  }

  handleProps(meta: RenderMeta) {
    this.meta = meta
  }

  handleEl(el: HTMLElement) {
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
