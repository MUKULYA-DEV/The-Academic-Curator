export default function TermsOfService() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-20 md:py-32">
      <h1 className="font-headline mb-8 text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
        Terms of Service
      </h1>
      <div className="prose prose-slate max-w-none text-secondary">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p className="mt-6">
          Welcome to The Academic Curator. By accessing our website, you agree to be bound by these Terms of Service.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-primary">1. Services Provided</h2>
        <p className="mt-4">
          The Academic Curator provides a platform to discover and book campus tours led by student ambassadors. We act as an intermediary to facilitate these bookings.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-primary">2. User Accounts</h2>
        <p className="mt-4">
          You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
        </p>
        <p className="mt-8 italic text-sm">This is a placeholder page for The Academic Curator project.</p>
      </div>
    </div>
  )
}
