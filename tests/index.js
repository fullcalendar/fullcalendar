
require('./globals')
require('./jasmine-ext')

var context = require.context(
  '.',
  true, // recursive?
  /[^\/]+\/[^\/]+\.(js|ts)$/ // inside subdirectory
)

context.keys().forEach(context)
