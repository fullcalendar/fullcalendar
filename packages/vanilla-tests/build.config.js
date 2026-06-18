export default {
  globalConfig: {
  },
  exports: {
    ".": {
      format: "global",
      primary: true,
      generator: "./scripts/generate-index.js"
    }
  },
  importRemaps: process.env.FORCE_REACT ? {
    'fullcalendar': 'fullcalendar-w-react',
    'fullcalendar/preact': 'fullcalendar-w-react/react',
    'fullcalendar/*': 'fullcalendar-w-react/*',
  } : undefined,
}
