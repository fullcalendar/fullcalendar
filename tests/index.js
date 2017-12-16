
require('./globals')
require('./hacks')

var context = require.context(
  '.',
  true, // recursive?
  /[^/]+\/[^/]+\.(js|ts)$/ // inside subdirectory
)

context.keys().forEach(context)
