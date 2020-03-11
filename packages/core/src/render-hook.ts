import { Component, VNode, Ref, createRef } from './vdom'
import ComponentContext, { ComponentContextType } from './component/ComponentContext'


export interface MountHookProps<HandlerProps> {
  name: string // TODO: rename to entity or something
  handlerProps: HandlerProps // TODO: these props should not be very dynamic!
  content: (rootElRef: Ref<any>) => VNode
}


export class MountHook<HandlerProps> extends Component<MountHookProps<HandlerProps>> {

  static contextType = ComponentContextType

  private rootElRef = createRef()


  render(props: MountHookProps<HandlerProps>) {
    return props.content(this.rootElRef)
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
  content: (classNames: string[]) => VNode
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

    return props.content(classNames)
  }

}


export interface InnerContentHookProps<InnerProps> {
  name: string
  innerProps: InnerProps
  defaultInnerContent?: (innerProps: InnerProps) => VNode
  outerContent: (innerContentParentRef: Ref<any>, innerContent: VNode, anySpecified: boolean) => VNode
}


export class InnerContentHook<InnerProps> extends Component<InnerContentHookProps<InnerProps>> {

  static contextType = ComponentContextType

  private customContentHandler: ContentHandler<any>


  render(props: InnerContentHookProps<InnerProps>, state: {}, context: ComponentContext) {
    let { options } = context
    let renderInner = options[props.name + 'InnerContent'] || props.defaultInnerContent
    let innerContentVNode: VNode

    if (renderInner) {
      let innerContentRaw = renderInner(props.innerProps)

      if ((innerContentRaw as VNode).type) {
        innerContentVNode = (innerContentRaw as VNode)

      } else if (this.customContentHandler) {
        this.customContentHandler.handleProps(innerContentRaw)

      } else if (typeof innerContentRaw === 'string') {
        this.customContentHandler = new HtmlContentHandler(innerContentRaw)

      } else if (
        innerContentRaw instanceof HTMLElement ||
        typeof (innerContentRaw as NodeList | HTMLElement[]).length === 'number'
      ) {
        this.customContentHandler = new DomContentHandler(innerContentRaw as DomMeta)
      }
    }

    return props.outerContent(this.handleInnerContentParent, innerContentVNode, Boolean(renderInner))
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


class HtmlContentHandler extends ContentHandler<string> {

  render(el: HTMLElement, meta: string) {
    el.innerHTML = meta
  }

}


type DomMeta = HTMLElement | HTMLElement[] | NodeList

class DomContentHandler extends ContentHandler<DomMeta> {

  render(el: HTMLElement, meta: DomMeta) {
    removeAllChildren(el)

    let length = (meta as HTMLElement[] | NodeList).length

    if (length != undefined) {
      for (let i = 0; i < length; i++) {
        el.appendChild(meta[i])
      }

    } else if (meta) {
      el.appendChild(meta as HTMLElement)
    }
  }

}


function removeAllChildren(parentEl: HTMLElement) { // TODO: move to util file
  let { childNodes } = parentEl

  while (childNodes.length) {
    parentEl.removeChild(childNodes[0])
  }
}
