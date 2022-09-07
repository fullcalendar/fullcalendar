/* eslint max-classes-per-file: off */

import { Ref, createRef, ComponentChildren, createElement, RefObject, createContext, Context } from '../preact'
import { setRef, BaseComponent } from '../vdom-util'
import { isPropsEqual } from '../util/object'
import { parseClassNames, ClassNamesInput } from '../util/html'

export type MountArg<ContentArg> = ContentArg & { el: HTMLElement }
export type DidMountHandler<TheMountArg extends { el: HTMLElement }> = (mountArg: TheMountArg) => void
export type WillUnmountHandler<TheMountArg extends { el: HTMLElement }> = (mountArg: TheMountArg) => void

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
  [contentKey: string]: () => ({
    render: (el: HTMLElement, contentVal: any) => void
    destroy?: () => void
  })
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

export type DefaultContentGenerator<HookProps> = (hookProps: HookProps) => ComponentChildren
// TODO: rename to be about function, not default. use in above type

// for forcing rerender of components that use the ContentHook
export const CustomContentRenderContext: Context<number> = createContext<number>(0)

export interface ContentHookProps<HookProps> {
  hookProps: HookProps // produced by FullCalendar internally, for rendering an entity/whatever
  content: CustomContentGenerator<HookProps> // the value of a user-hook, like `eventContent`
  defaultContent?: DefaultContentGenerator<HookProps> // if content not specified (TODO: just use content?)
  children: ( // for producing a wrapper around the content
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
    render: (el: HTMLElement, contentVal: any) => void
    destroy?: () => void
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

  componentWillUnmount() {
    if (this.customContentInfo && this.customContentInfo.destroy) {
      this.customContentInfo.destroy()
    }
  }

  private renderInnerContent() {
    let { customContentInfo } = this // only populated if using non-[p]react node(s)
    let innerContent = this.getInnerContent()
    let meta = this.getContentMeta(innerContent)

    // initial run, or content-type changing? (from vue -> react for example)
    if (!customContentInfo || customContentInfo.contentKey !== meta.contentKey) {
      // clearing old value
      if (customContentInfo) {
        if (customContentInfo.destroy) {
          customContentInfo.destroy()
        }
        customContentInfo = this.customContentInfo = null
      }
      // assigning new value
      if (meta.contentKey) {
        customContentInfo = this.customContentInfo = { // for non-[p]react
          contentKey: meta.contentKey,
          contentVal: innerContent[meta.contentKey],
          ...meta.buildLifecycleFuncs(),
        }
      }
    // updating
    } else if (customContentInfo) {
      customContentInfo.contentVal = innerContent[meta.contentKey]
    }

    return customContentInfo
      ? [] // signal that something was specified
      : innerContent // assume a [p]react vdom node. use it
  }

  private getInnerContent() {
    let { props } = this
    let innerContent = normalizeContent(props.content, props.hookProps)

    if (innerContent === undefined) { // use the default
      innerContent = normalizeContent(props.defaultContent, props.hookProps)
    }

    return innerContent == null ? null : innerContent // convert undefined to null (better for React)
  }

  private getContentMeta(innerContent: any) {
    let { contentTypeHandlers } = this.context.pluginHooks
    let contentKey = ''
    let buildLifecycleFuncs = null

    if (innerContent) { // allowed to be null, for convenience to caller
      for (let searchKey in contentTypeHandlers) {
        if (innerContent[searchKey] !== undefined) {
          contentKey = searchKey
          buildLifecycleFuncs = contentTypeHandlers[searchKey]
          break
        }
      }
    }

    return { contentKey, buildLifecycleFuncs }
  }

  private updateCustomContent() {
    if (this.customContentInfo) { // for non-[p]react
      this.customContentInfo.render(
        this.innerElRef.current || this.props.backupElRef.current, // the element to render into
        this.customContentInfo.contentVal,
      )
    }
  }
}

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

    if (callback) {
      callback({ ...this.props.hookProps, el: this.rootEl })
    }
  }

  componentWillUnmount() {
    let callback = this.props.willUnmount

    if (callback) {
      callback({ ...this.props.hookProps, el: this.rootEl })
    }
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

  return (generator: ClassNamesGenerator<HookProps>, hookProps: HookProps) => {
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
