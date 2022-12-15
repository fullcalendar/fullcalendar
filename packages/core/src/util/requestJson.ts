import { Dictionary } from '../options.js'

export class JsonRequestError extends Error {
  constructor(
    message: string,
    public response: Response,
  ) {
    super(message)
  }
}

export function requestJson<ParsedResponse>(
  method: string,
  url: string,
  params: Dictionary,
): Promise<[ParsedResponse, Response]> {
  method = method.toUpperCase()
  const fetchOptions: RequestInit = {
    method,
  }

  if (method === 'GET') {
    url += (url.indexOf('?') === -1 ? '?' : '&') +
      new URLSearchParams(params)
  } else {
    fetchOptions.body = new URLSearchParams(params)
    fetchOptions.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  }

  return fetch(url, fetchOptions).then((fetchRes) => {
    if (fetchRes.ok) {
      return fetchRes.json().then((parsedResponse: ParsedResponse) => {
        return [parsedResponse, fetchRes]
      }, () => {
        throw new JsonRequestError('Failure parsing JSON', fetchRes)
      })
    } else {
      throw new JsonRequestError('Request failed', fetchRes)
    }
  })
}
