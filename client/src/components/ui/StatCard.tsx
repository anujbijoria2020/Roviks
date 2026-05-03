import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number | string
  color?: 'orange'
}

const StatCard = ({ icon: Icon, label, value, color = 'orange' }: StatCardProps) => {
  const iconClasses = color === 'orange' ? 'bg-primary/10 text-primary' : 'bg-zinc-700 text-foreground'

  return (
    <div className="rounded-xl border border-border bg-surface-secondary p-6">
      <div className={`inline-flex rounded-lg p-2 ${iconClasses}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-foreground-muted">{label}</p>
    </div>
  )
}

export default StatCard
