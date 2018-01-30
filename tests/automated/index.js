
require('./globals')
require('./hacks')

var context = require.context(
  '.',
  true, // recursive?
  // inside a subdirectory that is not blacklisted
  // paths start with a "./"
  /^\.\/(?!(manual|examples)\/)([^\/]+)\/(.*)\.(js|ts)$/
)

context.keys().forEach(context)
