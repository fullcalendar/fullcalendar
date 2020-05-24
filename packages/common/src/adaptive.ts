import { createPlugin } from './plugin-system'

export const adaptivePlugin = createPlugin({
  contextInit(context) {

    window.addEventListener('beforeprint', handleBeforePrint)
    window.addEventListener('afterprint', handleAfterPrint)

    context.calendarApi.on('_unmount', () => {
      window.removeEventListener('beforeprint', handleBeforePrint)
      window.removeEventListener('afterprint', handleAfterPrint)
    })

    function handleBeforePrint() {
      context.emitter.trigger('_beforeprint')
    }

    function handleAfterPrint() {
      context.emitter.trigger('_afterprint')
    }

    // // for testing
    // let forPrint = false
    // document.addEventListener('keypress', (ev) => {
    //   if (ev.key === 'p') {
    //     forPrint = !forPrint
    //     if (forPrint) {
    //       handleBeforePrint()
    //     } else {
    //       handleAfterPrint()
    //     }
    //     window.removeEventListener('afterprint', handleAfterPrint) // kill real trigger
    //   }
    // })

  }
})
