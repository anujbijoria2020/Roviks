const PageLoader = () => {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-3xl font-black uppercase tracking-wide text-[#F5A623]">ROVIKS</h1>
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
