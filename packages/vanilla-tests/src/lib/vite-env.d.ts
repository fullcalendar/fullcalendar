/*
Vite's import query suffixes. (vite/client's declarations, minus the rest of vite/client)
*/

declare module '*?raw' {
  const content: string
  export default content
}

declare module '*?inline' {
  const content: string
  export default content
}

declare module '*?url' {
  const url: string
  export default url
}
