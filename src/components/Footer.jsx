import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-slate-200/90 bg-[#F8FAFF]">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-6 px-12 py-10 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <Link
            to="/"
            className="font-manrope text-lg font-bold text-[#002045]"
          >
            The Academic Curator
          </Link>
          <p className="font-inter text-sm leading-relaxed text-[#5c6578]">
            © {currentYear} The Academic Curator. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link
            className="font-inter text-sm text-[#5c6578] transition-colors hover:text-[#002045]"
            to="/coming-soon"
          >
            University Partners
          </Link>
          <Link
            className="font-inter text-sm text-[#5c6578] transition-colors hover:text-[#002045]"
            to="/coming-soon"
          >
            Admissions Office
          </Link>
          <Link
            className="font-inter text-sm text-[#5c6578] transition-colors hover:text-[#002045]"
            to="/privacy"
          >
            Privacy Policy
          </Link>
          <Link
            className="font-inter text-sm text-[#5c6578] transition-colors hover:text-[#002045]"
            to="/terms"
          >
            Terms of Service
          </Link>
          <Link
            className="font-inter text-sm text-[#5c6578] transition-colors hover:text-[#002045]"
            to="/accessibility"
          >
            Accessibility
          </Link>
          <Link
            to="/contact"
            className="font-inter text-sm text-[#5c6578] transition-colors hover:text-[#002045]"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </footer>
  )
}
