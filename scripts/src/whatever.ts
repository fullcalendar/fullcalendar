import { cli } from 'cleye'

export function outputStuff(stuff: any) {
  console.log('output', stuff)
}

export default async function(rawArgs: string[]) {
  const argv = cli({
    name: 'whatever',
    parameters: [
      '<yaaay>'
    ]
  }, undefined, rawArgs)

  outputStuff(argv)
}
