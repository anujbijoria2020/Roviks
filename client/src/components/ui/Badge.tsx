interface BadgeProps {
  status: string
}

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  confirmed: 'bg-blue-500/10 text-blue-500',
  shipped: 'bg-purple-500/10 text-purple-500',
  delivered: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-red-500/10 text-red-500',
  in_stock: 'bg-green-500/10 text-green-500',
  low_stock: 'bg-yellow-500/10 text-yellow-500',
  out_of_stock: 'bg-red-500/10 text-red-500',
}

const Badge = ({ status }: BadgeProps) => {
  const style = statusStyles[status] ?? 'bg-primary/10 text-primary'
  const label = status.replaceAll('_', ' ')

  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style}`}>{label}</span>
}

export default Badge
