import { LogIn, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const centerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Start Selling', to: '/start-selling' },
  { label: 'Catalog', to: '/catalog' },
]

const PublicNavbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleContactClick = () => {
    setIsMenuOpen(false)

    if (location.pathname === '/') {
      const footer = document.getElementById('footer')
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' })
      }
      return
    }

    navigate('/contact')
  }

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const getPrimaryButton = () => {
    if (!user) {
      return (
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 rounded-lg bg-[#F5A623] px-5 py-2 text-sm font-bold text-black transition hover:opacity-90"
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </button>
      )
    }

    if (user.role === 'admin') {
      return (
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="rounded-lg bg-[#F5A623] px-5 py-2 text-sm font-bold text-black transition hover:opacity-90"
        >
          Admin Panel
        </button>
      )
    }

    return (
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="rounded-lg bg-[#F5A623] px-5 py-2 text-sm font-bold text-black transition hover:opacity-90"
      >
        Dashboard
      </button>
    )
  }

  return (
    <header className="fixed top-0 z-50 h-16 w-full border-b border-zinc-800 bg-[#111111] text-white">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-2xl font-black tracking-tight text-[#F5A623]"
        >
          ROVIKS
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {centerLinks.map((item) => (
            <button
              key={item.to}
              type="button"
              onClick={() => navigate(item.to)}
              className={`text-sm transition hover:text-white ${
                isLinkActive(item.to) ? 'font-medium text-[#F5A623]' : 'text-zinc-300'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleContactClick}
            className={`text-sm font-medium transition hover:text-white ${
              location.pathname === '/contact' ? 'text-[#F5A623]' : 'text-zinc-300'
            }`}
          >
            Contact Us
          </button>
        </nav>

        <div className="hidden md:block">{getPrimaryButton()}</div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="rounded-lg p-2 text-white transition hover:bg-zinc-800 md:hidden"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="absolute left-0 right-0 top-16 z-50 border-b border-zinc-800 bg-[#111111] px-4 py-4 md:hidden">
          <div className="flex flex-col space-y-1">
            {centerLinks.map((item) => (
              <button
                key={item.to}
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  navigate(item.to)
                }}
                className={`block rounded-lg px-4 py-3 text-left text-sm transition hover:bg-[#1a1a1a] hover:text-white ${
                  isLinkActive(item.to) ? 'font-medium text-[#F5A623]' : 'text-zinc-300'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleContactClick}
              className={`block rounded-lg px-4 py-3 text-left text-sm transition hover:bg-[#1a1a1a] hover:text-white ${
                location.pathname === '/contact' ? 'font-medium text-[#F5A623]' : 'text-zinc-300'
              }`}
            >
              Contact Us
            </button>
            <div className="mt-2">
              <div className="w-full [&>*]:w-full [&>*]:justify-center [&>*]:rounded-xl [&>*]:py-3 [&>*]:text-center">
                {getPrimaryButton()}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default PublicNavbar
