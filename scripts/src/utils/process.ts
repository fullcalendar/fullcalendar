
export function untilSigInt(): Promise<void> {
  return new Promise<void>((resolve) => {
    process.once('SIGINT', () => {
      resolve()
    })
  })
}
