const warnedMessages = new Set<string>()

// Warns once per message about v6 problems that v7 addresses.
export function warnOnce(message: string): void {
  if (!warnedMessages.has(message)) {
    warnedMessages.add(message)
    console.warn(message + ' Consider upgrading to FullCalendar v7: https://fullcalendar.io/docs/upgrading-from-v6')
  }
}

// set on every v6 plugin (createPlugin). FullCalendar v7 throws it at runtime, and its PluginInput
// type only accepts `undefined` here, so TypeScript prints it too. Keep under ~300 chars: TypeScript
// truncates longer types in errors.
export const MAJOR_VERSION_ERROR = 'This plugin is from FullCalendar v6, but your calendar is v7 (the current version). Fix: import plugins from your v7 package, e.g. import dayGridPlugin from \'@fullcalendar/react/daygrid\', then uninstall @fullcalendar/core, @fullcalendar/daygrid and the other v6 packages. Don\'t downgrade to v6.'
