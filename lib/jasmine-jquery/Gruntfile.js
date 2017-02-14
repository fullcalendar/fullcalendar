/* jshint node: true */

module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json')
    , jshint: {
        all: [
            "Gruntfile.js"
          , "lib/**/*.js"
          , "spec/**/*.js"
        ]
      , options: {
          jshintrc: '.jshintrc'
        },
      }
    , jasmine: {
        src: "lib/**/*.js"
      , options: {
          specs: "spec/**/*.js"
        , vendor: "vendor/**/*.js"
        , version: '2.0.0'
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-jasmine')

  grunt.registerTask('syncversion', "Sync the versions between files.", function () {
    var json = require('./package.json')
    var fs = require('fs')
    var file = './lib/jasmine-jquery.js'

    fs.readFile(file, 'utf8', function (err, data) {
      if (err) return console.log(err)

      var res = data.replace(/^Version .*$/m, 'Version ' + json.version)

      fs.writeFile(file, res, 'utf8', function (err) {
        if (err) return console.log(err)
      })
    })
  })

  grunt.registerTask('test', ['jshint', 'jasmine'])
  grunt.registerTask('default', ['syncversion', 'test'])
};
