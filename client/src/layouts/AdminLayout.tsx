import { LayoutDashboard, Megaphone, Package, ShoppingBag, Users, LogOut } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const mobileItems = [
  { label: 'Home', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Alerts', to: '/admin/announcements', icon: Megaphone },
]

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Dropshippers', to: '/admin/dropshippers', icon: Users },
  { label: 'Announcements', to: '/admin/announcements', icon: Megaphone },
]

const AdminLayout = () => {
  const { user, logout } = useAuth()

  return (
    <div className="bg-background text-foreground">
      <aside className="fixed left-0 top-0 hidden h-screen w-56 flex-col bg-surface lg:flex">
        <div className="px-6 pb-4 pt-6 text-2xl font-black text-primary">ROVIKS</div>
        <div className="px-6 pb-8">
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-foreground">ADMIN</span>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {navItems.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `mx-2 flex items-center gap-3 rounded-lg px-4 py-2.5 transition ${
                  isActive
                    ? 'bg-[#1f1f1f] text-primary'
                    : 'text-foreground-muted hover:bg-surface-secondary hover:text-foreground'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border px-4 py-4">
          <p className="truncate text-sm text-foreground">{user?.fullName ?? 'Admin'}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex items-center gap-2 text-sm text-foreground-muted transition hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-h-screen bg-background p-4 pb-24 lg:ml-56 lg:p-8 lg:pb-8">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface py-2 lg:hidden">
        <div className="flex items-center justify-around">
          {mobileItems.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs ${isActive ? 'text-primary' : 'text-foreground-muted'}`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={logout}
            className="flex flex-col items-center gap-1 text-xs text-foreground-muted transition hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default AdminLayout
