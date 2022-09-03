import { cli } from 'cleye'

export default async function(rawArgs: string[]) {
  const argv = cli({
    name: 'whatever',
    parameters: [
      '<yaaay>'
    ]
  }, undefined, rawArgs)

  console.log('whatever argv', argv)
}
