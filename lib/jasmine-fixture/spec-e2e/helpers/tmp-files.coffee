grunt = require('grunt')
_ = grunt.util._

grunt.file.mkdir("spec-e2e/tmp")

afterEach ->
  _(grunt.file.expand("spec-e2e/tmp/**/*")).each (f) ->
    grunt.file.delete(f)
