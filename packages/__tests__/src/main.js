
import './lib/global-test-utils'
import './lib/hacks'
import './lib/simulate'
import './lib/date-matchers'
import defaultPlugins from './lib/default-plugins'
import './main.css'

pushOptions({
  timeZone: 'UTC',
  plugins: defaultPlugins
})

// all of the non-lib .js files within subdirectories will be automatically included...
