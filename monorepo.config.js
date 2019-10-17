
module.exports = {
  // npmClientArgs: [ '--registry', 'http://localhost:4873' ], // verdaccio
  packages: [
    { path: 'packages?(-premium)/*', distDir: ourPkgDist },
    { path: 'packages-contrib/react', distDir: 'dist' },
    { path: 'packages-contrib/vue', distDir: 'dist' },
    { path: 'packages-contrib/angular', distDir: 'dist/fullcalendar' },
    'example-projects/*'
  ]
}

function ourPkgDist(relPath) {
  return relPath.match(/__tests__/) ? '' : 'dist'
}
