
export interface BaseOptions {
}

export interface BaseOptionsRefined {
}

export interface EventSourceOptions {
}

export interface EventSourceOptionsRefined {
}

export interface EventRefiners {
}

export type RawOptionsFromRefiners<Refiners extends GenericRefiners> = {
  [Prop in keyof Refiners]?: // all optional
    Refiners[Prop] extends ((input: infer RawType, optionName: string) => infer RefinedType)
      ? (any extends RawType ? RefinedType : RawType) // if input type `any`, use output (for Boolean/Number/String)
      : never
}

export type RefinedOptionsFromRefiners<Refiners extends GenericRefiners> = {
  [Prop in keyof Refiners]?: // all optional
    Refiners[Prop] extends ((input: any, optionName: string) => infer RefinedType)
      ? RefinedType
      : never
}

type GenericRefiners = {
  [propName: string]: (input: any, propName: string) => any
}

export type Identity<T = any> = (raw: T) => T

export class JsonRequestError extends Error {
  response: Response

  constructor(message: string, response: Response) {
    super(message)
    this.response = response
  }
}

export function requestJson<ParsedResponse>(
  method: string,
  url: string,
  params: Record<string, any>
): Promise<[ParsedResponse, Response]> {
  method = method.toUpperCase()
  const fetchOptions: RequestInit = {
    method,
  }
  if (method === 'GET') {
    url += (url.indexOf('?') === -1 ? '?' : '&') +
      new URLSearchParams(params)
  }
  else {
    fetchOptions.body = new URLSearchParams(params)
    fetchOptions.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  }
  return fetch(url, fetchOptions).then((fetchRes) => {
    if (fetchRes.ok) {
      return fetchRes.json().then((parsedResponse) => {
        return [parsedResponse, fetchRes]
      }, () => {
        throw new JsonRequestError('Failure parsing JSON', fetchRes)
      })
    }
    else {
      throw new JsonRequestError('Request failed', fetchRes)
    }
  })
}

export function identity<T>(raw: T): T {
  return raw
}
