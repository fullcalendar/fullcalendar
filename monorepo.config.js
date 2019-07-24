
module.exports = {
  packages: [
    { path: 'packages/*', distDir: 'dist' },
    { path: 'packages-premium/*', distDir: 'dist' },
    { path: 'packages-contrib/react', distDir: 'dist' },
    { path: 'packages-contrib/vue', distDir: 'dist' },
    { path: 'packages-contrib/angular', distDir: 'dist/fullcalendar' },
    'example-projects/*'
  ]
}
