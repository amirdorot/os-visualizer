import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useTheme } from './store/theme.ts'
import { applyDocumentLocale, useLocaleStore } from './i18n'

document.documentElement.classList.toggle('dark', useTheme.getState().theme === 'dark')
applyDocumentLocale(useLocaleStore.getState().locale)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
