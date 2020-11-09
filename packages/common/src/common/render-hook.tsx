import { Ref, createRef, ComponentChildren, createElement, RefObject, createContext, Context } from '../vdom'
import { setRef, BaseComponent } from '../vdom-util'
import { isPropsEqual } from '../util/object'
import { parseClassNames, ClassNamesInput } from '../util/html'

export interface RenderHookProps<ContentArg> {
  hookProps: ContentArg
  classNames: ClassNamesGenerator<ContentArg>
  content: CustomContentGenerator<ContentArg>
  defaultContent?: DefaultContentGenerator<ContentArg>
  didMount: DidMountHandler<MountArg<ContentArg>>
  willUnmount: WillUnmountHandler<MountArg<ContentArg>>
  children: RenderHookPropsChildren
  elRef?: Ref<any>
}

export type RenderHookPropsChildren = (
  rootElRef: Ref<any>,
  classNames: string[],
  innerElRef: Ref<any>,
  innerContent: ComponentChildren // if falsy, means it wasn't specified
) => ComponentChildren

export interface ContentTypeHandlers {
  [contentKey: string]: () => (el: HTMLElement, contentVal: any) => void
}

// NOTE: in JSX, you should always use this class with <HookProps> arg. otherwise, will default to any???
export class RenderHook<HookProps> extends BaseComponent<RenderHookProps<HookProps>> {
  private rootElRef = createRef()

  render() {
    let { props } = this
    let { hookProps } = props

    return (
      <MountHook hookProps={hookProps} didMount={props.didMount} willUnmount={props.willUnmount} elRef={this.handleRootEl}>
        {(rootElRef) => (
          <ContentHook hookProps={hookProps} content={props.content} defaultContent={props.defaultContent} backupElRef={this.rootElRef}>
            {(innerElRef, innerContent) => props.children(
              rootElRef,
              normalizeClassNames(props.classNames, hookProps),
              innerElRef,
              innerContent,
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

export interface ObjCustomContent {
  html: string
  domNodes: any[]
  [custom: string]: any // TODO: expose hook for plugins to add!
}

export type CustomContent = ComponentChildren | ObjCustomContent
export type CustomContentGenerator<HookProps> = CustomContent | ((hookProps: HookProps) => CustomContent)
export type DefaultContentGenerator<HookProps> = (hookProps: HookProps) => ComponentChildren // TODO: rename to be about function, not default. use in above type

// for forcing rerender of components that use the ContentHook
export const CustomContentRenderContext: Context<number> = createContext<number>(0)

export interface ContentHookProps<HookProps> {
  hookProps: HookProps
  content: CustomContentGenerator<HookProps>
  defaultContent?: DefaultContentGenerator<HookProps>
  children: (
    innerElRef: Ref<any>,
    innerContent: ComponentChildren // if falsy, means it wasn't specified
  ) => ComponentChildren
  backupElRef?: RefObject<any>
}

interface ContentHookInnerProps<HookProps> extends ContentHookProps<HookProps> {
  renderId: number
}

export function ContentHook<HookProps>(props: ContentHookProps<HookProps>) { // TODO: rename to CustomContentHook?
  return (
    <CustomContentRenderContext.Consumer>
      {(renderId) => (
        <ContentHookInner renderId={renderId} {...props} />
      )}
    </CustomContentRenderContext.Consumer>
  )
}

class ContentHookInner<HookProps> extends BaseComponent<ContentHookInnerProps<HookProps>> {
  private innerElRef = createRef()

  private customContentInfo: {
    contentKey: string
    contentVal: any
    handler: (el: HTMLElement, contentVal: any) => void
  }

  render() {
    return this.props.children(this.innerElRef, this.renderInnerContent())
  }

  componentDidMount() {
    this.updateCustomContent()
  }

  componentDidUpdate() {
    this.updateCustomContent()
  }

  private renderInnerContent() {
    let { contentTypeHandlers } = this.context.pluginHooks
    let { props, customContentInfo } = this
    let rawVal = props.content
    let innerContent = normalizeContent(rawVal, props.hookProps)
    let innerContentVDom: ComponentChildren = null

    if (innerContent === undefined) { // use the default
      innerContent = normalizeContent(props.defaultContent, props.hookProps)
    }

    if (innerContent !== undefined) { // we allow custom content handlers to return nothing
      if (customContentInfo) {
        customContentInfo.contentVal = innerContent[customContentInfo.contentKey]
      } else if (typeof innerContent === 'object') {
        // look for a prop that would indicate a custom content handler is needed
        for (let contentKey in contentTypeHandlers) {
          if (innerContent[contentKey] !== undefined) {
            customContentInfo = this.customContentInfo = {
              contentKey,
              contentVal: innerContent[contentKey],
              handler: contentTypeHandlers[contentKey](),
            }
            break
          }
        }
      }

      if (customContentInfo) {
        innerContentVDom = [] // signal that something was specified
      } else {
        innerContentVDom = innerContent // assume a [p]react vdom node. use it
      }
    }

    return innerContentVDom
  }

  private updateCustomContent() {
    if (this.customContentInfo) {
      this.customContentInfo.handler(
        this.innerElRef.current || this.props.backupElRef.current, // the element to render into
        this.customContentInfo.contentVal,
      )
    }
  }
}

export type MountArg<ContentArg> = ContentArg & { el: HTMLElement }
export type DidMountHandler<MountArg extends { el: HTMLElement }> = (mountArg: MountArg) => void
export type WillUnmountHandler<MountArg extends { el: HTMLElement }> = (mountArg: MountArg) => void

export interface MountHookProps<ContentArg> {
  hookProps: ContentArg
  didMount: DidMountHandler<MountArg<ContentArg>>
  willUnmount: WillUnmountHandler<MountArg<ContentArg>>
  children: (rootElRef: Ref<any>) => ComponentChildren
  elRef?: Ref<any> // maybe get rid of once we have better API for caller to combine refs
}

export class MountHook<ContentArg> extends BaseComponent<MountHookProps<ContentArg>> {
  rootEl: HTMLElement

  render() {
    return this.props.children(this.handleRootEl)
  }

  componentDidMount() {
    let callback = this.props.didMount
    callback && callback({ ...this.props.hookProps, el: this.rootEl })
  }

  componentWillUnmount() {
    let callback = this.props.willUnmount
    callback && callback({ ...this.props.hookProps, el: this.rootEl })
  }

  private handleRootEl = (rootEl: HTMLElement) => {
    this.rootEl = rootEl

    if (this.props.elRef) {
      setRef(this.props.elRef, rootEl)
    }
  }
}

export function buildClassNameNormalizer<HookProps>() { // TODO: general deep-memoizer?
  let currentGenerator: ClassNamesGenerator<HookProps>
  let currentHookProps: HookProps
  let currentClassNames: string[] = []

  return function (generator: ClassNamesGenerator<HookProps>, hookProps: HookProps) {
    if (!currentHookProps || !isPropsEqual(currentHookProps, hookProps) || generator !== currentGenerator) {
      currentGenerator = generator
      currentHookProps = hookProps
      currentClassNames = normalizeClassNames(generator, hookProps)
    }

    return currentClassNames
  }
}

export type ClassNamesGenerator<HookProps> = ClassNamesInput | ((hookProps: HookProps) => ClassNamesInput)

function normalizeClassNames<HookProps>(classNames: ClassNamesGenerator<HookProps>, hookProps: HookProps): string[] {
  if (typeof classNames === 'function') {
    classNames = classNames(hookProps)
  }

  return parseClassNames(classNames)
}

function normalizeContent(input, hookProps) {
  if (typeof input === 'function') {
    return input(hookProps, createElement) // give the function the vdom-creation func
  }
  return input
}
