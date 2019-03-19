
exports.mapHashVals = function(hash, func) {
  let vals = []

  for (let key in hash) {
    vals.push(
      func(hash[key], key)
    )
  }

  return vals
}


// Process template tags like <%= my.var.name %>

exports.renderSimpleTemplate = function(content, vars) {
  return content.replace(
    /<%=\s*([\w.]+)\s*%>/g,
    function(wholeMatch, varName) {
      return querySubProperty(vars, varName) || ''
    }
  )
}

function querySubProperty(obj, propStr) {
  let remainingParts = propStr.split('.')
  let retVal = obj

  while (remainingParts.length && retVal) {
    retVal = retVal[remainingParts.shift()]
  }

  return retVal
}
