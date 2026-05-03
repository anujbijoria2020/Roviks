import { useNavigate } from 'react-router-dom'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen animate-[fadeIn_0.2s_ease] flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-9xl font-black text-primary">404</h1>
      <p className="mt-4 text-2xl text-foreground">Page not found</p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-8 rounded-xl bg-primary px-6 py-3 font-semibold text-foreground transition hover:opacity-90"
      >
        Go back home
      </button>
    </div>
  )
}

export default NotFoundPage
