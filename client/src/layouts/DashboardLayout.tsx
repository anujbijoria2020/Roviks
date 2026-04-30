import { ArrowUpRight, Bell, Grid, LayoutDashboard, LogOut, Package, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getNotifications } from '../api/admin.api'
import { useAuth } from '../context/AuthContext'
import type { Notification } from '../types/index'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Orders', to: '/dashboard/orders', icon: Package },
  { label: 'Notifications', to: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', to: '/dashboard/profile', icon: User },
]

const mobileItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Orders', to: '/dashboard/orders', icon: Package },
  { label: 'Alerts', to: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', to: '/dashboard/profile', icon: User },
]

const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotifications()
        const list = (response.data?.notifications ?? response.data ?? []) as Notification[]
        setNotifications(Array.isArray(list) ? list : [])
      } catch {
        setNotifications([])
      }
    }

    void fetchNotifications()
    const timer = setInterval(() => {
      void fetchNotifications()
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications])

  const isActiveLink = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <div className="bg-[#0d0d0d] text-white">
      <aside className="fixed left-0 top-0 hidden h-screen w-56 flex-col bg-[#111111] lg:flex">
        <div className="px-6 pb-8 pt-6 text-2xl font-black text-orange-500">ROVIKS</div>

        <nav className="flex-1 space-y-1 px-2">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              className={() =>
                `mx-2 flex items-center gap-3 rounded-lg px-4 py-2.5 transition ${
                  isActiveLink(to)
                    ? 'bg-[#1f1f1f] text-orange-500'
                    : 'text-zinc-400 hover:bg-[#1a1a1a] hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{label}</span>
              {label === 'Notifications' && unreadCount > 0 ? (
                <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => navigate('/catalog')}
          className="mx-2 mb-4 flex items-center justify-between rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-left text-orange-500 transition hover:border-orange-500/60 hover:bg-orange-500/20"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Grid className="h-4 w-4" />
            Browse Catalog
          </span>
          <ArrowUpRight className="h-4 w-4" />
        </button>

        <div className="border-t border-zinc-800 px-4 py-4">
          <p className="truncate text-sm text-white">{user?.fullName ?? 'User'}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-h-screen bg-[#0d0d0d] p-4 pb-24 lg:ml-56 lg:p-8 lg:pb-8">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-[#111111] py-2 lg:hidden">
        <div className="flex items-center justify-around">
          {mobileItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              end={label === 'Dashboard'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs ${
                  isActive ? 'text-orange-500' : 'text-zinc-400'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default DashboardLayout
