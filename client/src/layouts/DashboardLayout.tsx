import { ArrowUpRight, Bell, Grid, HelpCircle, Home, LayoutDashboard, MessageCircle, Package, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getNotifications } from '../api/admin.api'
import type { Notification } from '../types/index'

const navItems = [
  { label: 'Home', to: '/catalog', icon: Home },
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Orders', to: '/dashboard/orders', icon: Package },
  { label: 'Profile', to: '/dashboard/profile', icon: User },
]

const mobileItems = [
  { label: 'Home', to: '/catalog', icon: Home },
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Orders', to: '/dashboard/orders', icon: Package },
  { label: 'Profile', to: '/dashboard/profile', icon: User },
]

const DashboardLayout = () => {
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
    <div className="bg-gray-100 dark:bg-background text-gray-900 dark:text-foreground">
      {/* Mobile top navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-200 dark:border-border bg-white dark:bg-surface lg:hidden">
        <div className="flex h-full items-center justify-between px-4">
          <Link to="/" className="text-2xl font-black text-primary">ROVIKS</Link>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard/contact"
              className="rounded-lg p-2 text-gray-900 dark:text-foreground transition hover:bg-gray-100 dark:hover:bg-surface-secondary"
              aria-label="Contact"
            >
              <HelpCircle className="h-5 w-5" />
            </Link>
            <Link
              to="/dashboard/notifications"
              className="rounded-lg p-2 text-gray-900 dark:text-foreground transition hover:bg-gray-100 dark:hover:bg-surface-secondary"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Desktop top navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 hidden h-16 border-b border-gray-200 dark:border-border bg-white dark:bg-surface lg:flex">
        <div className="flex h-full w-full items-center justify-between px-6">
          <Link to="/" className="text-2xl font-black text-primary">ROVIKS</Link>
          <div className="flex items-center gap-3 ml-auto">
            <Link
              to="/dashboard/contact"
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
              aria-label="Contact"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </Link>
            <Link
              to="/dashboard/notifications"
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-foreground">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <aside className="fixed left-0 top-0 hidden h-screen w-56 flex-col bg-white dark:bg-surface lg:flex lg:pt-16">
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              className={() =>
                `mx-2 flex items-center gap-3 rounded-lg px-4 py-2.5 transition ${
                  isActiveLink(to)
                    ? 'bg-gray-100 dark:bg-[#1f1f1f] text-primary'
                    : 'text-gray-600 dark:text-foreground-muted hover:bg-gray-100 dark:hover:bg-surface-secondary hover:text-gray-900 dark:hover:text-foreground'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{label}</span>
              {label === 'Notifications' && unreadCount > 0 ? (
                <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-foreground">
                  {unreadCount}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => navigate('/catalog')}
          className="mx-2 mb-4 flex items-center justify-between rounded-xl border border-primary/30 bg-orange-50 dark:bg-primary/10 p-3 text-left text-orange-600 dark:text-primary transition hover:border-primary/60 hover:bg-orange-100 dark:hover:bg-primary/20"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Grid className="h-4 w-4" />
            Browse Catalog
          </span>
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </aside>

      <main className="min-h-screen bg-gray-100 dark:bg-background p-4 pt-20 pb-20 lg:pt-20 lg:pb-8 lg:ml-56 lg:p-8">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-border bg-white dark:bg-surface py-2 lg:hidden">
        <div className="flex items-center justify-around">
          {mobileItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              end={label === 'Dashboard'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs ${
                  isActive ? 'text-primary' : 'text-gray-600 dark:text-foreground-muted'
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
