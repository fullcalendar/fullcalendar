
require('./globals')
require('./hacks')

var context = require.context(
  '.',
  true, // recursive?
  /\.(js|ts)$/
)

context.keys().forEach(context)
