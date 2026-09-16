import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAppSelector } from '@/app/hooks'

export function ProtectedRoute() {
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const location = useLocation()

  if (!accessToken) {
    const redirect = `${location.pathname}${location.search}`
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />
  }

  return <Outlet />
}
