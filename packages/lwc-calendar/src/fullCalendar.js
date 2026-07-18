import { LightningElement, api } from 'lwc'
import { loadScript, loadStyle } from 'lightning/platformResourceLoader'
import fullCalendarLib from '@salesforce/resourceUrl/fullCalendarLib'

const DEFAULT_THEME = 'classic'
const DEFAULT_LOCALE = 'en'

// Palette used when the themePalette setting is not specified.
// The classic theme has a single palette file and ignores themePalette entirely.
const THEME_DEFAULT_PALETTES = {
  breezy: 'indigo',
  forma: 'blue',
  monarch: 'purple',
  pulse: 'red',
}

const REDISPATCHED_CALLBACKS = [
  'eventClick',
  'dateClick',
  'select',
  'eventDrop',
  'eventResize',
  'eventChange',
  'eventAdd',
  'eventRemove',
]

export default class FullCalendar extends LightningElement {
  _calendar = null
  _initialized = false
  _initializationPromise = null
  _options = {}
  _theme = null
  _themePalette = null
  _themePlugin = null
  _locale = null
  _pluginUrls = []
  _additionalPlugins = []
  _redispatchedCallbacks = REDISPATCHED_CALLBACKS
  _settingChangePromise = null

  renderedCallback() {
    if (this._initialized || this._initializationPromise) {
      return
    }

    this._settingChangePromise = null

    const initializationPromise = this._initializationPromise = this.initializeCalendar()
    initializationPromise.catch((error) => {
      if (this._initializationPromise === initializationPromise) {
        this._initializationPromise = null
      }

      console.error(error)
    })
  }

  disconnectedCallback() {
    const initializationPromise = this._initializationPromise

    if (initializationPromise) {
      const finishDisconnection = () => {
        const currentPromise = this._initializationPromise

        // A null promise means the failure handler already cleared this same
        // initialization (a new one can't start while disconnected). Only a
        // *different* pending promise indicates a newer cycle owns the calendar.
        if (!this.isConnected && (currentPromise === initializationPromise || currentPromise === null)) {
          this.destroyCalendar()
          this._initializationPromise = null
        }
      }

      initializationPromise.then(finishDisconnection, finishDisconnection)
    } else {
      this.destroyCalendar()
    }
  }

  destroyCalendar() {
    this._settingChangePromise = null

    if (this._calendar) {
      this._calendar.destroy()
      this._calendar = null
    }

    this._initialized = false
  }

  @api
  get options() {
    return this._options
  }

  set options(value) {
    const nextOptions = value && typeof value === 'object' ? value : {}

    this._options = nextOptions

    if (this._calendar) {
      const appliedLocale = this._calendar.getOption('locale')
      this._calendar.resetOptions(this.buildCalendarOptions(nextOptions, appliedLocale))
    }
  }

  @api
  get theme() {
    return this._theme
  }

  set theme(value) {
    if (this._theme === value) {
      return
    }

    this._theme = value
    this.queueThemeChange(value || DEFAULT_THEME)
  }

  @api
  get themePalette() {
    return this._themePalette
  }

  set themePalette(value) {
    this.setStaticConfigProp('_themePalette', value, 'themePalette')
  }

  @api
  get pluginUrls() {
    return this._pluginUrls
  }

  set pluginUrls(value) {
    const nextUrls = value || []

    if (areArraysEqual(this._pluginUrls, nextUrls)) {
      return
    }

    this.setStaticConfigProp('_pluginUrls', nextUrls, 'pluginUrls')
  }

  @api
  get locale() {
    return this._locale
  }

  set locale(value) {
    if (this._locale === value) {
      return
    }

    this._locale = value
    this.queueLocaleChange(normalizeLocale(value))
  }

  @api
  getCalendar() {
    return this._calendar
  }

  async initializeCalendar() {
    const theme = this._theme || DEFAULT_THEME
    const locale = normalizeLocale(this._locale)

    const { fullCalendarGlobal, themePlugin, additionalPlugins } = await loadFullCalendarAssets(
      this,
      theme,
      this._themePalette,
      locale,
      this._pluginUrls,
    )

    this._themePlugin = themePlugin
    this._additionalPlugins = additionalPlugins
    this._redispatchedCallbacks = buildRedispatchedCallbacks([themePlugin, ...additionalPlugins])

    if (!this.isConnected) {
      return
    }

    const calendar = new fullCalendarGlobal.Calendar(
      this.refs.container,
      this.buildCalendarOptions(this._options, locale),
    )

    try {
      calendar.render()
    } catch (error) {
      // render() can attach DOM and window listeners before throwing, so tear
      // down the instance or a retry would stack a second calendar on top of it.
      calendar.destroy()
      throw error
    }

    this._calendar = calendar
    this._initialized = true
  }

  buildCalendarOptions(options, locale) {
    const mergedOptions = {
      ...(options || {}),
      ...this.buildCallbackOptions(),
      plugins: [
        ...(options?.plugins || []),
        ...this._additionalPlugins,
        this._themePlugin,
      ],
    }

    delete mergedOptions.locale

    if (locale) {
      mergedOptions.locale = locale
    }

    return mergedOptions
  }

  buildCallbackOptions() {
    const callbackOptions = {}

    for (const callbackName of this._redispatchedCallbacks) {
      callbackOptions[callbackName] = (info) => {
        const consumerCallback = this._options?.[callbackName]

        // The global bundle runs through window, so preserve that callback receiver for parity.
        if (typeof consumerCallback === 'function') {
          consumerCallback.call(window, info)
        }

        // Synthetic shadow retargets DOM events, so forward FullCalendar payloads as plain detail data.
        this.dispatchEvent(new CustomEvent(callbackName.toLowerCase(), {
          detail: info,
          bubbles: false,
          composed: false,
        }))
      }
    }

    return callbackOptions
  }

  queueThemeChange(theme) {
    this.queueSettingChange(async (calendar) => {
      const themePlugin = await loadThemeAssets(this, theme, this._themePalette)

      if (this._calendar === calendar) {
        this._themePlugin = themePlugin
        this._redispatchedCallbacks = buildRedispatchedCallbacks([themePlugin, ...this._additionalPlugins])

        const appliedLocale = calendar.getOption('locale')
        calendar.resetOptions(this.buildCalendarOptions(this._options, appliedLocale))
      }
    })
  }

  queueLocaleChange(locale) {
    this.queueSettingChange(async (calendar) => {
      if (locale) {
        await loadLocaleGlobal(this, locale)
      }

      if (this._calendar === calendar) {
        calendar.setOption('locale', locale || '')
      }
    })
  }

  queueSettingChange(applyChange) {
    const initializationPromise = this._initializationPromise

    if (!this._calendar && !initializationPromise) {
      return
    }

    const previousPromise = this._settingChangePromise || initializationPromise || Promise.resolve()
    const settingChangePromise = previousPromise
      .catch(() => undefined)
      .then(async () => {
        const calendar = this._calendar

        if (!calendar) {
          return
        }

        await applyChange(calendar)
      })

    this._settingChangePromise = settingChangePromise
    settingChangePromise.catch((error) => {
      console.error(error)
    })
  }

  setStaticConfigProp(fieldName, value, publicName) {
    if ((this._initialized || this._initializationPromise) && this[fieldName] !== value) {
      this.warnStaticSettingChange(publicName)
      return
    }

    this[fieldName] = value
  }

  warnStaticSettingChange(settingName) {
    console.warn(
      `[fullCalendar] ${settingName} is only applied during initial render. Recreate the component to change it.`,
    )
  }
}

function normalizeLocale(locale) {
  return locale === DEFAULT_LOCALE ? '' : locale
}

function areArraysEqual(left, right) {
  return left.length === right.length && left.every((item, index) => item === right[index])
}

/*
Computes which FullCalendar callbacks get redispatched as lowercase DOM
CustomEvents (`onresourceadd` etc.): the curated base list plus callbacks
declared by loaded plugins, which this component can't know statically. The
derivation reads plugin *internals*, not public API: each plugin object's
`listenerRefiners` keys are its callback names, recursing through `deps`
because listeners may live on a nested dep (e.g. premium's `common` plugin).
Brittle if those internals change; plugin-system-struct.ts marks the reliance.
*/
function buildRedispatchedCallbacks(plugins) {
  const callbackNames = new Set(REDISPATCHED_CALLBACKS)
  const visitedPlugins = new Set()

  const visitPlugin = (plugin) => {
    if (!plugin || visitedPlugins.has(plugin)) {
      return
    }

    visitedPlugins.add(plugin)

    for (const listenerName of Object.keys(plugin.listenerRefiners || {})) {
      if (!listenerName.startsWith('_')) {
        callbackNames.add(listenerName)
      }
    }

    for (const dep of plugin.deps || []) {
      visitPlugin(dep)
    }
  }

  for (const plugin of plugins) {
    visitPlugin(plugin)
  }

  return Array.from(callbackNames)
}

/*
Identical copies of this component may be deployed by multiple force-apps.
Copies in the same namespace share one LWS sandbox (one `window`), so all
asset loading coordinates through this window-level registry instead of
per-copy module state, which would let the copies race each other.

- `promises`: Map of asset URL -> Promise. loadScript/loadStyle only *execute*
  a URL once per page, so the first requester's promise carries the one-time
  side effects to all copies: the core bundle resolves to the captured
  window.FullCalendar global; plugin/theme scripts resolve to the plugins they
  registered (spliced out of globalPlugins so other calendars don't
  auto-inherit them); locales and styles resolve to undefined. Rejected
  entries remove themselves so retries are possible.
- `scriptQueue`: serializes first-time script executions so plugin captures
  (globalPlugins.length before, splice after) are exact. Styles and cache
  hits skip it; rejections are absorbed so a failed load can't stall it.

The registry's shape is a contract between component copies of potentially
different versions. Never change it.
*/
function getSharedRegistry() {
  if (!window.__fullCalendarLwcRegistry) {
    window.__fullCalendarLwcRegistry = {
      promises: new Map(),
      scriptQueue: Promise.resolve(),
    }
  }

  return window.__fullCalendarLwcRegistry
}

function getSharedPromise(url, createPromise) {
  const registry = getSharedRegistry()
  let promise = registry.promises.get(url)

  if (!promise) {
    promise = createPromise()
    registry.promises.set(url, promise)
    promise.catch(() => {
      if (registry.promises.get(url) === promise) {
        registry.promises.delete(url)
      }
    })
  }

  return promise
}

function loadSharedStyle(component, url) {
  return getSharedPromise(url, () => loadStyle(component, url))
}

/*
`capture` (optional) is invoked just before the script executes and returns a
function invoked just after; that function's result becomes the shared promise's
value, available to every component copy even though the script itself only
executes once page-wide.
*/
function loadSharedScript(component, url, capture) {
  return getSharedPromise(url, () => {
    const registry = getSharedRegistry()
    const loadPromise = registry.scriptQueue.then(async () => {
      const finishCapture = capture ? capture() : null

      await loadScript(component, url)

      return finishCapture ? finishCapture() : undefined
    })

    registry.scriptQueue = loadPromise.then(() => undefined, () => undefined)

    return loadPromise
  })
}

function captureFullCalendarGlobal() {
  return () => {
    const fullCalendarGlobal = window.FullCalendar

    if (!fullCalendarGlobal || !fullCalendarGlobal.Calendar) {
      throw new Error('FullCalendar global bundle did not expose window.FullCalendar.Calendar')
    }

    return fullCalendarGlobal
  }
}

function captureGlobalPlugins() {
  const globalPlugins = window.FullCalendar?.globalPlugins

  if (!Array.isArray(globalPlugins)) {
    throw new Error('FullCalendar global bundle did not expose its global plugins array')
  }

  const startIndex = globalPlugins.length

  return () => globalPlugins.splice(startIndex)
}

async function loadFullCalendarAssets(component, theme, palette, locale, pluginUrls) {
  const [fullCalendarGlobal] = await Promise.all([
    loadSharedScript(component, `${fullCalendarLib}/all/global.js`, captureFullCalendarGlobal),
    loadSharedStyle(component, `${fullCalendarLib}/skeleton.css`),
  ])

  const additionalPluginLists = await Promise.all(
    pluginUrls.map((pluginUrl) => loadSharedScript(component, pluginUrl, captureGlobalPlugins)),
  )
  const additionalPlugins = additionalPluginLists.flat()

  if (locale) {
    await loadLocaleGlobal(component, locale)
  }

  const themePlugin = await loadThemeAssets(component, theme, palette)

  return { fullCalendarGlobal, themePlugin, additionalPlugins }
}

async function loadThemeAssets(component, theme, palette) {
  const themePlugin = await loadThemePlugin(component, theme)

  await loadSharedStyle(component, `${fullCalendarLib}/themes/${theme}/theme.css`)
  await loadSharedStyle(component, `${fullCalendarLib}/${resolvePalettePath(theme, palette)}`)

  return themePlugin
}

function resolvePalettePath(theme, palette) {
  if (theme === 'classic') {
    return 'themes/classic/palette.css'
  }

  return `themes/${theme}/palettes/${palette || THEME_DEFAULT_PALETTES[theme]}.css`
}

function loadLocaleGlobal(component, locale) {
  return loadSharedScript(component, `${fullCalendarLib}/locales/${locale}/global.js`)
}

async function loadThemePlugin(component, theme) {
  const themePlugins = await loadSharedScript(
    component,
    `${fullCalendarLib}/themes/${theme}/global.js`,
    captureGlobalPlugins,
  )

  if (themePlugins.length !== 1 || themePlugins[0]?.name !== `theme-${theme}`) {
    throw new Error(`FullCalendar theme ${theme} did not register its expected plugin`)
  }

  return themePlugins[0]
}
