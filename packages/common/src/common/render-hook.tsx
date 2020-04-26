import { Component, Ref, createRef, ComponentChildren, h, RefObject } from '../vdom'
import { ComponentContext, ComponentContextType } from '../component/ComponentContext'
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

export interface ContentTypeHandlers {
  [contentKey: string]: () => (el: HTMLElement, contentVal: any) => void
}

// TODO: use capitalizeFirstLetter util


export class RenderHook<HookProps> extends Component<RenderHookProps<HookProps>> {

  static contextType = ComponentContextType

  private rootElRef = createRef()


  render() {
    let { name, hookProps, options, defaultContent, children } = this.props

    return (
      <MountHook name={name} hookProps={hookProps} options={options} elRef={this.handleRootEl}>
        {(rootElRef) => (
          <ContentHook name={name} hookProps={hookProps} options={options} defaultContent={defaultContent} backupElRef={this.rootElRef}>
            {(innerElRef, innerContent) => children(
              rootElRef,
              normalizeClassNames(
                (options || this.context.options)[name ? name + 'ClassNames' : 'classNames'],
                hookProps
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
  context: ComponentContext

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
    let rawVal = (this.props.options || this.context.options)[props.name ? props.name + 'Content' : 'content']
    let innerContent = normalizeContent(rawVal, props.hookProps)
    let innerContentVDom: ComponentChildren = null

    if (innerContent === undefined) { // use the default
      innerContent = normalizeContent(props.defaultContent, props.hookProps)
    }

    if (innerContent !== undefined) { // we allow custom content handlers to return nothing

      if (customContentInfo) {
        customContentInfo.contentVal = innerContent[customContentInfo.contentKey]

      } else {
        // look for a prop that would indicate a custom content handler is needed
        for (let contentKey in contentTypeHandlers) {

          if (innerContent[contentKey] !== undefined) {
            customContentInfo = this.customContentInfo = {
              contentKey,
              contentVal: innerContent[contentKey],
              handler: contentTypeHandlers[contentKey]()
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
        this.customContentInfo.contentVal
      )
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


  render() {
    return this.props.children(this.handleRootEl)
  }


  componentDidMount() {
    this.triggerMountHandler('DidMount', 'didMount')
  }


  componentWillUnmount() {
    this.triggerMountHandler('WillUnmount', 'willUnmount')
  }


  private handleRootEl = (rootEl: HTMLElement) => {
    this.rootEl = rootEl

    if (this.props.elRef) {
      setRef(this.props.elRef, rootEl)
    }
  }


  private triggerMountHandler(postfix: string, simplePostfix: string) {
    let { name } = this.props
    let handler = (this.props.options || this.context.options)[name ? name + postfix : simplePostfix]

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
    let rawGenerator = (optionsOverride || context.options)[hookName ? hookName + 'ClassNames' : 'classNames']
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
    return input(hookProps, h) // give the function the vdom-creation func
  } else {
    return input
  }
}
