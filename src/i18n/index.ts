import { Children, cloneElement, isValidElement, type ReactElement } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'en' | 'he' | 'ar' | 'es'

export const locales: { id: Locale; name: string; dir: 'ltr' | 'rtl' }[] = [
  { id: 'en', name: 'English', dir: 'ltr' },
  { id: 'he', name: 'עברית', dir: 'rtl' },
  { id: 'ar', name: 'العربية', dir: 'rtl' },
  { id: 'es', name: 'Español', dir: 'ltr' },
]

/** Text in every language. Languages that are missing fall back to English. */
export type Localized<T> = { en: T } & Partial<Record<Exclude<Locale, 'en'>, T>>

const isLocale = (x: unknown): x is Locale => locales.some((l) => l.id === x)

const urlLocale = () => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('lang'))

function detect(): Locale {
  const fromUrl = urlLocale()
  if (isLocale(fromUrl)) return fromUrl
  const fromBrowser = typeof navigator === 'undefined' ? undefined : navigator.language?.slice(0, 2)
  return isLocale(fromBrowser) ? fromBrowser : 'en'
}

export const useLocaleStore = create<{ locale: Locale; setLocale: (l: Locale) => void }>()(
  persist((set) => ({ locale: detect(), setLocale: (locale) => set({ locale }) }), {
    name: 'osviz-locale',
    // A ?lang= link wins over the saved choice.
    merge: (persisted, current) => {
      const fromUrl = urlLocale()
      const saved = (persisted as { locale?: unknown } | undefined)?.locale
      return { ...current, locale: isLocale(fromUrl) ? fromUrl : isLocale(saved) ? saved : current.locale }
    },
  }),
)

export const useLocale = () => useLocaleStore((s) => s.locale)

export function dirOf(locale: Locale) {
  return locales.find((l) => l.id === locale)!.dir
}

const rtlChar = /[\u0590-\u08FF]/
const LRM = '\u200E'

/**
 * In right-to-left text, brackets around English such as "fork()" or "(PID 1)" get placed on the wrong
 * side. Left-to-right marks around them keep the brackets with the English they belong to.
 */
export function bidi(s: string) {
  return s.replace(/\(([^()]*)\)/g, (m, inner: string) => (rtlChar.test(inner) ? m : `${LRM}(${inner})${LRM}`))
}

function bidiDeep(v: unknown): unknown {
  if (typeof v === 'string') return bidi(v)
  if (typeof v === 'function') return (...args: unknown[]) => bidiDeep(v(...args))
  if (isValidElement(v)) {
    const el = v as ReactElement<{ children?: unknown }>
    if (el.props.children === undefined) return el
    return cloneElement(el, {}, ...(Children.toArray(el.props.children as never) as unknown[]).map(bidiDeep) as never[])
  }
  if (Array.isArray(v)) return v.map(bidiDeep)
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'scenario' ? x : bidiDeep(x)]))
  return v
}

const bidiCache = new WeakMap<object, unknown>()

/** Applies `bidi` to every string in a value when the language is right to left. Code scenarios are left alone. */
export function forDirection<T>(value: T, locale: Locale): T {
  if (dirOf(locale) !== 'rtl') return value
  if (typeof value !== 'object' || value === null) return bidiDeep(value) as T
  let fixed = bidiCache.get(value)
  if (!fixed) bidiCache.set(value, (fixed = bidiDeep(value)))
  return fixed as T
}

export function pick<T>(text: Localized<T>, locale: Locale): T {
  return forDirection(text[locale] ?? text.en, locale)
}

export function useText<T>(text: Localized<T>): T {
  return pick(text, useLocale())
}

/** `bidi` for text built in code, such as button labels, when the current language is right to left. */
export function useBidi(): (s: string) => string {
  return dirOf(useLocale()) === 'rtl' ? bidi : (s) => s
}

/** Keeps numbers and formulas such as "1 -> 2 -> 4" or "-1" in left-to-right order inside right-to-left text. */
export const ltr = (s: string) => `\u2066${s}\u2069`

export function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = locale
  document.documentElement.dir = dirOf(locale)
}
