export default function Accessibility() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-20 md:py-32">
      <h1 className="font-headline mb-8 text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
        Accessibility Statement
      </h1>
      <div className="prose prose-slate max-w-none text-secondary">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p className="mt-6">
          The Academic Curator is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-primary">Measures to Support Accessibility</h2>
        <p className="mt-4">
          The Academic Curator takes the following measures to ensure accessibility:
        </p>
        <ul className="mt-4 list-disc pl-6">
          <li>Include accessibility as part of our mission statement.</li>
          <li>Include accessibility throughout our internal policies.</li>
          <li>Employ formal accessibility quality assurance methods.</li>
        </ul>
        <p className="mt-8 italic text-sm">This is a placeholder page for The Academic Curator project.</p>
      </div>
    </div>
  )
}
