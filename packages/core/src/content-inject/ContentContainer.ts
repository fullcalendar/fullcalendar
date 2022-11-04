import { createElement, FunctionalComponent, ComponentChildren } from '../preact.js'
import { ClassNamesGenerator } from '../common/render-hook.js'
import { BaseComponent } from '../vdom-util.js'
import { ContentInjector, ContentInjectorProps, defaultTag, buildElAttrs, ElProps } from './ContentInjector.js'

export interface ContentContainerProps<RenderProps> extends ContentInjectorProps<RenderProps> {
  classNameGenerator: ClassNamesGenerator<RenderProps> | undefined
  didMount: ((renderProps: RenderProps & { el: HTMLElement }) => void) | undefined
  willUnmount: ((renderProps: RenderProps & { el: HTMLElement }) => void) | undefined
  children?: (InnerContainer: InnerContainerComponent, renderProps: RenderProps) => ComponentChildren
}

export class ContentContainer<RenderProps> extends BaseComponent<ContentContainerProps<RenderProps>> {
  render() {
    const { props } = this
    const generatedClassNames = generateClassNames(props.classNameGenerator, props.renderProps)

    if (props.children) {
      return createElement(
        props.elTag || defaultTag,
        buildElAttrs(props, generatedClassNames),
        props.children(InnerContentInjector.bind(undefined, props), props.renderProps),
      )
    } else {
      return createElement(ContentInjector<RenderProps>, {
        ...props,
        elClasses: (props.elClasses || []).concat(generatedClassNames),
      })
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

// Inner

export type InnerContainerComponent = FunctionalComponent<ElProps>
export type InnerContainerFunc<RenderProps> = (
  InnerContainer: InnerContainerComponent,
  renderProps: RenderProps
) => ComponentChildren

function InnerContentInjector<RenderProps>(
  parentProps: ContentContainerProps<RenderProps>,
  props: ElProps,
) {
  return createElement(ContentInjector<RenderProps>, {
    ...parentProps,
    elTag: props.elTag,
    elRef: props.elRef,
    elClasses: props.elClasses,
    elAttrs: props.elAttrs,
  })
}

// Utils

function generateClassNames<RenderProps>(
  classNameGenerator: ClassNamesGenerator<RenderProps> | undefined,
  renderProps: RenderProps,
): string[] {
  const classNames = typeof classNameGenerator === 'function' ?
    classNameGenerator(renderProps) :
    classNameGenerator || []

  return typeof classNames === 'string' ? [classNames] : classNames
}
