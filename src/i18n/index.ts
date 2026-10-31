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

function detect(): Locale {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (isLocale(fromUrl)) return fromUrl
  const fromBrowser = navigator.language?.slice(0, 2)
  return isLocale(fromBrowser) ? fromBrowser : 'en'
}

export const useLocaleStore = create<{ locale: Locale; setLocale: (l: Locale) => void }>()(
  persist((set) => ({ locale: detect(), setLocale: (locale) => set({ locale }) }), {
    name: 'osviz-locale',
    // A ?lang= link wins over the saved choice.
    merge: (persisted, current) => {
      const fromUrl = new URLSearchParams(window.location.search).get('lang')
      const saved = (persisted as { locale?: unknown } | undefined)?.locale
      return { ...current, locale: isLocale(fromUrl) ? fromUrl : isLocale(saved) ? saved : current.locale }
    },
  }),
)

export const useLocale = () => useLocaleStore((s) => s.locale)

export function pick<T>(text: Localized<T>, locale: Locale): T {
  return text[locale] ?? text.en
}

export function useText<T>(text: Localized<T>): T {
  return pick(text, useLocale())
}

export function dirOf(locale: Locale) {
  return locales.find((l) => l.id === locale)!.dir
}

export function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = locale
  document.documentElement.dir = dirOf(locale)
}
