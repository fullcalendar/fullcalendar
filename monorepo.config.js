
module.exports = {
  // npmClientArgs: [ '--registry', 'http://localhost:4873' ], // verdaccio
  packages: [
    { path: 'packages?(-premium)/*' },
    { path: 'packages-contrib/react' },
    { path: 'packages-contrib/vue' },
    { path: 'packages-contrib/angular/dist/fullcalendar' },
    'example-projects/*'
  ]
}

