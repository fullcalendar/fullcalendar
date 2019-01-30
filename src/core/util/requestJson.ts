
export default function requestJson(method: string, url: string, params: object, successCallback, failureCallback) {
  method = method.toUpperCase()

  let body = null

  if (method === 'GET') {
    url = injectQueryStringParams(url, params)
  } else {
    body = encodeParams(params)
  }

  let xhr = new XMLHttpRequest()
  xhr.open(method, url, true)

  if (method !== 'GET') {
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  }

  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 400) {
      try {
        let res = JSON.parse(xhr.responseText)
        successCallback(res, xhr)
      } catch (err) {
        failureCallback('Failure parsing JSON', xhr)
      }
    } else {
      failureCallback('Request failed', xhr)
    }
  }

  xhr.onerror = function() {
    failureCallback('Request failed', xhr)
  }

  xhr.send(body)
}

function injectQueryStringParams(url: string, params) {
  return url +
    (url.indexOf('?') === -1 ? '?' : '&') +
    encodeParams(params)
}

function encodeParams(params) {
  let parts = []

  for (let key in params) {
    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
  }

  return parts.join('&')
}
