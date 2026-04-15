/* eslint-disable react-refresh/only-export-components */

import { ConfirmationPreferenceProvider } from '../src/context/ConfirmationPreferenceContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type RenderHookOptions, type RenderOptions, render, renderHook } from '@testing-library/react'
import { App, ConfigProvider } from 'antd'
import { MemoryRouter } from 'react-router-dom'

import type { ReactNode } from 'react'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false }
    }
  })
}

type ProviderOptions = {
  initialEntries?: string[]
  queryClient?: QueryClient
}

function AllProviders({
  children,
  initialEntries = ['/'],
  queryClient
}: ProviderOptions & { children: ReactNode }) {
  const client = queryClient ?? createTestQueryClient()

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={client}>
        <ConfigProvider>
          <App>
            <ConfirmationPreferenceProvider>
              {children}
            </ConfirmationPreferenceProvider>
          </App>
        </ConfigProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

function customRender(
  ui: React.ReactElement,
  options: RenderOptions & ProviderOptions = {}
) {
  const { initialEntries, queryClient, ...rest } = options

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialEntries={initialEntries} queryClient={queryClient}>
        {children}
      </AllProviders>
    ),
    ...rest
  })
}

function customRenderHook<T>(
  hook: () => T,
  options: RenderHookOptions<unknown> & ProviderOptions = {}
) {
  const { initialEntries, queryClient, ...rest } = options

  return renderHook(hook, {
    wrapper: ({ children }) => (
      <AllProviders initialEntries={initialEntries} queryClient={queryClient}>
        {children}
      </AllProviders>
    ),
    ...rest
  })
}

export {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@testing-library/react'

export { customRender as render, customRenderHook as renderHook }
