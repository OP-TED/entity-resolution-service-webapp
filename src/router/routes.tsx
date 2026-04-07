import { LoadingScreen } from '@components'
import { useAuth } from '@context/useAuth'
import { HistoryPage } from '@pages/HistoryPage'
import { LoginPage } from '@pages/LoginPage'
import { Suspense } from 'react'
import { type RouteObject, Navigate, Outlet, useRoutes } from 'react-router-dom'

import App from '../App'

import { paths } from './paths'

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />
  if (!user) return <Navigate to={paths.login} replace />
  return <Outlet />
}

const GuestRoute = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />
  if (user) return <Navigate to={paths.root} replace />
  return <Outlet />
}

export const Router = () => {
  const routes: RouteObject[] = [
    {
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
      ),
      children: [
        {
          element: <ProtectedRoute />,
          children: [
            {
              path: paths.root,
              element: <App />
            },
            {
              path: paths.history,
              element: <HistoryPage />
            }
          ]
        },
        {
          element: <GuestRoute />,
          children: [
            {
              path: paths.login,
              element: <LoginPage />
            }
          ]
        }
      ]
    }
  ]

  return useRoutes(routes)
}
