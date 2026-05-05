import { AuthProvider } from '@context/AuthContext'
import { BulkSelectionProvider } from '@context/BulkSelectionContext'
import { ConfirmationPreferenceProvider } from '@context/ConfirmationPreferenceContext'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App, ConfigProvider, notification } from 'antd'
import { createRoot } from 'react-dom/client'

import './main.scss'
import { BrowserRouter } from 'react-router-dom'

import { Router } from './router'
import { antdTheme } from './styles/theme'
import { showApiErrors } from './utils'

// Surface query failures (network down, 5xx, etc.) globally. Mutations already
// route through showApiErrors via their own onError; queries previously failed
// silently, leaving the UI stuck on skeletons.
//
// When the backend is unreachable, several queries error out at once — dedupe
// identical messages within a short window so the user sees one toast, not ten.
const recentlyShown = new Map<string, number>()
const DEDUPE_WINDOW_MS = 4000

const notifyDeduped = (message: string) => {
  const now = Date.now()
  const last = recentlyShown.get(message) ?? 0
  if (now - last < DEDUPE_WINDOW_MS) return
  recentlyShown.set(message, now)
  notification.error({ message })
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => showApiErrors(error, notifyDeduped)
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    },
    mutations: {
      retry: 1
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme}>
        <App>
          <AuthProvider>
            <ConfirmationPreferenceProvider>
              <BulkSelectionProvider>
                <Router />
              </BulkSelectionProvider>
            </ConfirmationPreferenceProvider>
          </AuthProvider>
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  </BrowserRouter>
)
