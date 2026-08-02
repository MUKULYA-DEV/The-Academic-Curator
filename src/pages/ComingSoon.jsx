import { Link } from 'react-router-dom'

export default function ComingSoon() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <span
        className="material-symbols-outlined mb-6 text-6xl text-tertiary"
        style={{ fontVariationSettings: "'wght' 300" }}
      >
        construction
      </span>
      <h1 className="font-headline mb-4 text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
        Coming Soon
      </h1>
      <p className="mb-8 max-w-md text-lg text-secondary">
        We are actively working on this page. Check back shortly for updates.
      </p>
      <Link
        to="/"
        className="rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-primary-container active:scale-95"
      >
        Return Home
      </Link>
    </div>
  )
}
