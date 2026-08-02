import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <span
        className="material-symbols-outlined mb-6 text-6xl text-tertiary"
        style={{ fontVariationSettings: "'wght' 300" }}
      >
        search_off
      </span>
      <h1 className="font-headline mb-4 text-6xl font-extrabold tracking-tight text-primary">
        404
      </h1>
      <h2 className="font-headline mb-6 text-2xl font-bold text-primary">
        Page Not Found
      </h2>
      <p className="mb-8 max-w-md text-lg text-secondary">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link
          to="/"
          className="rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-primary-container active:scale-95"
        >
          Return Home
        </Link>
        <Link
          to="/explore"
          className="rounded-full border border-primary/20 bg-transparent px-8 py-3.5 text-sm font-bold text-primary transition-all hover:bg-primary/5 active:scale-95"
        >
          Explore Tours
        </Link>
      </div>
    </div>
  )
}
