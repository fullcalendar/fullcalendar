root = global

grunt = require('grunt')

specPath = "spec-e2e/tmp/example-spec.coffee"

root.createSpec = (specSource) ->
  grunt.file.write(specPath, specSource)

root.readSpec = ->
  grunt.file.read(specPath, encoding: "UTF-8")

root.runSpec = (done, callback) ->
  grunt.util.spawn
    cmd: "node_modules/.bin/testem",
    args: ["ci", "-f", "spec-e2e/support/jasmine#{process.env.MAJOR_JASMINE_VERSION || 1}-testem-config.json"]
  , (error, result, code) ->
    callback.call jasmine.getEnv().currentSpec,
      error: error
      stdout: result.stdout
      stderr: result.stderr
      code: code
    done?()

