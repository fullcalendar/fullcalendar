import {
  NativeDateFormatter,
  NativeDateFormatterOptions,
  CmdDateFormatter,
  FuncDateFormatter,
  FuncDateFormatterFunc,
  DateFormatter,
} from '@full-ui/headless-calendar'

export type FormatterInput = NativeDateFormatterOptions | string | FuncDateFormatterFunc

export function createFormatter(input: FormatterInput): DateFormatter {
  if (typeof input === 'object' && input) { // non-null object
    return new NativeDateFormatter(input)
  }

  if (typeof input === 'string') {
    return new CmdDateFormatter(input)
  }

  if (typeof input === 'function') {
    return new FuncDateFormatter(input as FuncDateFormatterFunc)
  }

  return null
}
