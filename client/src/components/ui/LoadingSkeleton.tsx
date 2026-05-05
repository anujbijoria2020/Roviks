interface LoadingSkeletonProps {
  className?: string
}

const LoadingSkeleton = ({ className = '' }: LoadingSkeletonProps) => {
  return <div className={`animate-pulse rounded-lg bg-surface-secondary ${className}`.trim()} />
}

export default LoadingSkeleton
