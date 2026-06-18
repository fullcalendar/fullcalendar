import { ViewSpec } from '../structs/view-spec'
import type { ReactNode } from 'react'
import { BaseComponent } from '../vdom-util'
import { ViewApi } from '../api/ViewApi'
import { ContentContainer, generateClassName } from '../content-inject/ContentContainer'
import { ElProps } from '../content-inject/ContentInjector'
import { memoizeObjArg } from '../util/memoize'
import { computeViewBorderless } from '../util/misc'
import { getIsHeightAuto } from '../scrollgrid/util'
import type { ToolbarInput } from '../toolbar-struct'
import { joinClassNames } from '../public-api'

export interface ViewContainerProps extends Partial<ElProps> {
  viewSpec: ViewSpec
  attrs?: any // TODO
  children?: ReactNode
}

export interface ViewDisplayInfo {
  view: ViewApi
  borderlessX: boolean
  borderlessTop: boolean
  borderlessBottom: boolean
  options: {
    headerToolbar: ToolbarInput | false | undefined
    footerToolbar: ToolbarInput | false | undefined
  }
  isHeightAuto: boolean
}

export class ViewContainer extends BaseComponent<ViewContainerProps> {
  private refineRenderProps = memoizeObjArg(refineRenderProps)

  render() {
    const { props, context } = this
    const { options, viewSpec } = context
    const renderProps: ViewDisplayInfo = this.refineRenderProps({
      ...computeViewBorderless(options),
      options: { headerToolbar: options.headerToolbar, footerToolbar: options.footerToolbar },
      isHeightAuto: getIsHeightAuto(options),
      viewApi: context.viewApi,
    })

    return (
      <ContentContainer
        elRef={props.elRef}
        tag={props.tag || 'div'}
        attrs={props.attrs}
        style={props.style}
        className={joinClassNames(
          props.className,
          generateClassName((options as any).viewClass, renderProps),
          // WORKAROUND for way calendar's className would get merged into view's className
          generateClassName(viewSpec.optionDefaults.class, renderProps),
          generateClassName(viewSpec.optionDefaults.className, renderProps),
          generateClassName(viewSpec.optionOverrides.class, renderProps),
          generateClassName(viewSpec.optionOverrides.className, renderProps),
        )}
        renderProps={renderProps}
        generatorName={undefined}
        didMount={options.didMount || (options as any).viewDidMount} // TODO: should call both
        willUnmount={options.willUnmount || (options as any).viewWillUnmount} // TODO: should call both
      >
        {() => props.children}
      </ContentContainer>
    )
  }
}

interface ViewRenderPropsInput {
  viewApi: ViewApi
  borderlessX: boolean
  borderlessTop: boolean
  borderlessBottom: boolean
  options: {
    headerToolbar: ToolbarInput | false | undefined
    footerToolbar: ToolbarInput | false | undefined
  }
  isHeightAuto: boolean
}

function refineRenderProps(raw: ViewRenderPropsInput): ViewDisplayInfo {
  return {
    view: raw.viewApi,
    borderlessX: raw.borderlessX,
    borderlessTop: raw.borderlessTop,
    borderlessBottom: raw.borderlessBottom,
    options: raw.options,
    isHeightAuto: raw.isHeightAuto,
  }
}
