import { LayoutDashboard, Megaphone, Package, ShoppingBag, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

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
  return (
    <div className="bg-[#0d0d0d] text-white">
      <aside className="fixed left-0 top-0 hidden h-screen w-56 flex-col bg-[#111111] lg:flex">
        <div className="px-6 pb-4 pt-6 text-2xl font-black text-orange-500">ROVIKS</div>
        <div className="px-6 pb-8">
          <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">ADMIN</span>
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
                    ? 'bg-[#1f1f1f] text-orange-500'
                    : 'text-zinc-400 hover:bg-[#1a1a1a] hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="min-h-screen bg-[#0d0d0d] p-4 pb-24 lg:ml-56 lg:p-8 lg:pb-8">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-[#111111] py-2 lg:hidden">
        <div className="flex items-center justify-around">
          {mobileItems.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs ${isActive ? 'text-orange-500' : 'text-zinc-400'}`
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

export default AdminLayout
