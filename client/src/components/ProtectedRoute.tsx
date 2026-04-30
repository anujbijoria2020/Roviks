import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  allowedRoles: string[]
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-[#f97316]" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  if (user.role === 'dropshipper' && !user.isApproved) {
    return <Navigate to="/pending" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
