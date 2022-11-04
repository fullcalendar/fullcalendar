import { createElement, JSX, Ref, VNode, FunctionalComponent } from '../preact.js'
import { ClassNamesGenerator, CustomContentGenerator } from '../common/render-hook.js'
import { BaseComponent } from '../vdom-util.js'
import { ContentInjector, ContentInjectorProps, defaultTagName } from './ContentInjector.js'

export type InnerContainerComponent = FunctionalComponent<NestedContentInjectorProps>

export interface ContentContainerProps<RenderProps> extends ContentInjectorProps<RenderProps> {
  classNames?: string[]
  classNameGenerator: ClassNamesGenerator<RenderProps> | undefined
  didMount: ((renderProps: RenderProps & { el: HTMLElement }) => void) | undefined
  willUnmount: ((renderProps: RenderProps & { el: HTMLElement }) => void) | undefined
  children?: (InnerContainer: InnerContainerComponent, renderProps: RenderProps) => VNode
}

export class ContentContainer<RenderProps> extends BaseComponent<ContentContainerProps<RenderProps>> {
  render() {
    const { props } = this
    const classNames = resolveClassNames(props.classNameGenerator, props.renderProps)
      .concat(props.classNames || [])
      .concat(props.className ? [props.className] : [])
    const className = classNames.join(' ')

    if (props.children) {
      return createElement(
        (props.tagName || defaultTagName) as any,
        { ...props, className, ref: props.elRef },
        props.children(NestedContentInjector.bind(undefined, props), props.renderProps),
      )
    } else {
      return createElement(
        ContentInjector<RenderProps>,
        { ...props, className }, // send elRef as-is
      )
    }
  }

  componentDidMount(): void {
    this.props.didMount?.({
      ...this.props.renderProps,
      el: this.base as HTMLElement,
    })
  }

  componentWillUnmount(): void {
    this.props.willUnmount?.({
      ...this.props.renderProps,
      el: this.base as HTMLElement,
    })
  }
}

// Nested

interface NestedContentInjectorProps extends JSX.HTMLAttributes {
  tagName?: string
  elRef?: Ref<HTMLElement>
  classNames?: string[]
}

function NestedContentInjector<RenderProps>(
  parentProps: ContentContainerProps<RenderProps>,
  props: NestedContentInjectorProps,
) {
  return createElement(ContentInjector<RenderProps>, {
    ...parentProps,
    tagName: props.tagName,
    elRef: props.elRef,
    className: (props.classNames || [])
      .concat(props.className ? [props.className] : [])
      .join(' '),
  })
}

// For specific usecases of a ContentContainer

export interface SpecificContentContainerProps<RenderProps> extends JSX.HTMLAttributes {
  tagName?: string
  elRef?: Ref<HTMLElement>
  classNames?: string[]
  defaultGenerator: CustomContentGenerator<RenderProps> | undefined
  children?: (InnerContainer: InnerContainerComponent, renderProps: RenderProps) => VNode
}

// Utils

function resolveClassNames<RenderProps>(
  classNameGenerator: ClassNamesGenerator<RenderProps> | undefined,
  renderProps: RenderProps,
): string[] {
  const classNames = typeof classNameGenerator === 'function' ?
    classNameGenerator(renderProps) :
    classNameGenerator || []

  return typeof classNames === 'string' ? [classNames] : classNames
}
