const PageLoader = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-3xl font-black uppercase tracking-wide text-primary">ROVIKS</h1>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="loader-dot" />
          <span className="loader-dot" />
          <span className="loader-dot" />
        </div>
      </div>
    </div>
  )
}

export default PageLoader
