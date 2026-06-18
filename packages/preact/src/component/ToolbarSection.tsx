import { createElement, type ReactNode, type ReactElement } from 'react'
import { BaseComponent } from '../vdom-util'
import { ToolbarWidget, ButtonInfo, ButtonGroupInfo } from '../toolbar-struct'
import { joinClassNames } from '../util/html'
import { ContentContainer, generateClassName } from '../content-inject/ContentContainer'
import { ButtonIcon } from './ButtonIcon'
import classNames from '../styles.module.css'

export interface ToolbarContent {
  title: string
  navUnit: string
  selectedButton: string
  isTodayEnabled: boolean
  isPrevEnabled: boolean
  isNextEnabled: boolean
}

export interface ToolbarSectionProps extends ToolbarContent {
  name: string
  widgetGroups: ToolbarWidget[][]
  titleId?: string
}

export class ToolbarSection extends BaseComponent<ToolbarSectionProps> {
  render(): any {
    let { props } = this
    let { options } = this.context
    let children = props.widgetGroups.map((widgetGroup) => this.renderWidgetGroup(widgetGroup))

    return createElement(
      'div', {
        className: generateClassName(options.toolbarSectionClass, { name: props.name }),
      },
      ...children, // spread, so no React key errors
    )
  }

  renderWidgetGroup(widgetGroup: ToolbarWidget[]): any {
    let { props, context } = this
    let { options } = context
    let children: ReactElement[] = []

    let isOnlyButtons = true
    let isOnlyView = true

    for (const widget of widgetGroup) {
      const { name, isView } = widget

      if (name === 'title') {
        isOnlyButtons = false
      } else if (!isView) {
        isOnlyView = false
      }
    }

    for (let widget of widgetGroup) {
      let { name, customElement, buttonHint } = widget

      if (name === 'title') {
        children.push(
          <div
            role='heading'
            aria-level={options.headingLevel}
            id={props.titleId}
            className={joinClassNames(options.toolbarTitleClass)}
          >{props.title}</div>,
        )
      } else if (customElement) {
        children.push(
          <ContentContainer
            tag='span'
            style={{ display: 'contents' }}
            renderProps={{}}
            generatorName={undefined}
            customGenerator={customElement}
          />
        )
      } else {
        let isSelected = name === props.selectedButton
        let isDisabled =
          (!props.isTodayEnabled && name === 'today') ||
          (!props.isPrevEnabled && name === 'prev') ||
          (!props.isNextEnabled && name === 'next')

        let buttonDisplay = widget.buttonDisplay ?? options.buttonDisplay
        if (buttonDisplay === 'auto') {
          buttonDisplay = (widget.buttonIconContent || widget.buttonIconClass)
            ? 'icon'
            : 'text'
        }

        let iconNode: ReactNode
        if (buttonDisplay !== 'text') {
          iconNode = (
            <ButtonIcon
              className={widget.buttonIconClass}
              contentGenerator={widget.buttonIconContent}
            />
          )
        }

        let inGroup = widgetGroup.length > 1 && isOnlyButtons
        let buttonGroup: ButtonGroupInfo | null = inGroup ? { hasSelection: isOnlyView } : null
        let renderProps: ButtonInfo = {
          name,
          text: widget.buttonText,
          isPrimary: widget.buttonIsPrimary,
          isSelected,
          isDisabled,
          isIconOnly: buttonDisplay === 'icon',
          buttonGroup,
        }

        children.push(
          <ContentContainer<ButtonInfo>
            tag='button'
            attrs={{
              type: 'button',
              disabled: isDisabled,
              ...(
                (isOnlyButtons && isOnlyView)
                  ? { 'role': 'tab', 'aria-selected': isSelected }
                  : { 'aria-pressed': isSelected }
              ),
              'aria-label': typeof buttonHint === 'function'
                ? buttonHint(props.navUnit)
                : buttonHint,
              onClick: widget.buttonClick,
            }}
            className={joinClassNames(
              generateClassName(options.buttonClass, renderProps),
              !isDisabled && classNames.cursorPointer,
              inGroup && joinClassNames(
                isSelected ? classNames.z1 : classNames.z0,
                classNames.focusZ2, // to ensure focus-ring is raised
              ),
            )}
            renderProps={renderProps}
            generatorName={undefined}
            classNameGenerator={widget.buttonClass}
            didMount={widget.buttonDidMount}
            willUnmount={widget.buttonWillUnmount}
          >{() => (
            buttonDisplay === 'text'
              ? widget.buttonText
              : buttonDisplay === 'icon'
                ? iconNode
                : buttonDisplay === 'icon-text'
                  ? (<>{iconNode}{widget.buttonText}</>)
                  : (<>{widget.buttonText}{iconNode}</>) // text-icon
          )}</ContentContainer>
        )
      }
    }

    if (children.length > 1) {
      return createElement('div', {
        role: (isOnlyButtons && isOnlyView) ? 'tablist' : undefined,
        'aria-label': (isOnlyButtons && isOnlyView) ? options.viewChangeHint : undefined,
        className: joinClassNames(
          generateClassName(options.buttonGroupClass, { hasSelection: isOnlyView }),
          classNames.isolate,
        ),
      }, ...children)
    }

    return children[0]
  }
}
