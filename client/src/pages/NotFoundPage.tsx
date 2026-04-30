import { useNavigate } from 'react-router-dom'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen animate-[fadeIn_0.2s_ease] flex-col items-center justify-center bg-[#0D0D0D] px-4 text-center">
      <h1 className="text-9xl font-black text-orange-500">404</h1>
      <p className="mt-4 text-2xl text-white">Page not found</p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-8 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:opacity-90"
      >
        Go back home
      </button>
    </div>
  )
}

export default NotFoundPage
