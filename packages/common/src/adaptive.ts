import { createPlugin } from './plugin-system'

export const adaptivePlugin = createPlugin({
  calendarApiInit(calendarApi) {

    window.addEventListener('beforeprint', handleBeforePrint)
    window.addEventListener('afterprint', handleAfterPrint)

    calendarApi.on('_unmount', () => {
      window.removeEventListener('beforeprint', handleBeforePrint)
      window.removeEventListener('afterprint', handleAfterPrint)
    })

    function handleBeforePrint() {
      calendarApi.trigger('_beforeprint')
    }

    function handleAfterPrint() {
      calendarApi.trigger('_afterprint')
    }

  }
})
