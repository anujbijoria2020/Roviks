interface LoadingSkeletonProps {
  className?: string
}

const LoadingSkeleton = ({ className = '' }: LoadingSkeletonProps) => {
  return <div className={`animate-pulse rounded-lg bg-zinc-800 ${className}`.trim()} />
}

export default LoadingSkeleton
