import { LoadingScreen } from '@components'
import { Suspense } from 'react'
import { type RouteObject, Outlet, useRoutes } from 'react-router-dom'

import App from '../App'

import { paths } from './paths'

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
          path: paths.root,
          element: <App />
        }
      ]
    }
  ]

  return useRoutes(routes)
}
