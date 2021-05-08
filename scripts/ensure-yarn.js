// https://stackoverflow.com/a/41233367/96342
if (!/yarn\.js$/.test(process.env.npm_execpath)) {
  throw new Error('Please ensure you are using Yarn (not NPM)')
}
