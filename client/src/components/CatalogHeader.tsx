import { User, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CatalogHeader = () => {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-black text-primary">ROVIKS</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/dashboard/notifications"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary lg:hidden"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </Link>
          <Link
            to="/dashboard/profile"
            className="hidden sm:flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default CatalogHeader
