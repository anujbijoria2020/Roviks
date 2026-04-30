import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number | string
  color?: 'orange'
}

const StatCard = ({ icon: Icon, label, value, color = 'orange' }: StatCardProps) => {
  const iconClasses = color === 'orange' ? 'bg-orange-500/10 text-orange-500' : 'bg-zinc-700 text-white'

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
      <div className={`inline-flex rounded-lg p-2 ${iconClasses}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-zinc-400">{label}</p>
    </div>
  )
}

export default StatCard
