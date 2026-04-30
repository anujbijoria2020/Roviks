import { useEffect } from 'react'
import PublicFooter from '../components/PublicFooter'
import PublicNavbar from '../components/PublicNavbar'
import StartSellingSection from '../components/StartSellingSection'

const StartSellingPage = () => {
  useEffect(() => {
    document.title = 'Start Selling - ROVIKS'
  }, [])

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <PublicNavbar />
      <main className="pt-16">
        <StartSellingSection withTopPadding />
      </main>
      <PublicFooter />
    </div>
  )
}

export default StartSellingPage
