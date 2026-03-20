import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App, ConfigProvider } from 'antd'
import { createRoot } from 'react-dom/client'

import './main.scss'
import { BrowserRouter } from 'react-router-dom'

import { Router } from './router'
import { antdTheme } from './styles/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds
      gcTime: 5 * 60_000, // 5 minutes
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
          <Router />
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  </BrowserRouter>
)
