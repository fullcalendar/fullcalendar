Package.describe({
  name: 'fullcalendar:fullcalendar',
  version: '2.6.1',
  summary: 'Full-sized drag & drop event calendar',
  git: 'https://github.com/fullcalendar/fullcalendar.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.addFiles([
    "dist/fullcalendar.js",
    "dist/fullcalendar.css"
  ], 'client');
});
