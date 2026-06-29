import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

export default function ContactSupport() {
  function handleSubmit(e) {
    e.preventDefault()
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-24 md:px-12">
        <section className="mb-16 text-center">
          <h1 className="font-headline mb-4 text-5xl font-extrabold tracking-tight text-primary md:text-6xl">
            Support &amp; Guidance
          </h1>
          <p className="text-secondary mx-auto max-w-2xl text-lg">
            Our scholarly concierge is here to assist your academic journey. Whether you have questions
            about tours or need technical assistance, we are at your service.
          </p>
        </section>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
          <div className="ghost-shadow rounded-xl bg-surface-container-lowest p-8 md:col-span-2 md:p-12">
            <div className="mb-8">
              <h2 className="font-headline mb-2 text-3xl font-bold text-primary-container">
                Get in Touch
              </h2>
              <p className="text-secondary">
                Please fill out the form below and an ambassador will respond within 24 hours.
              </p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-label text-xs font-bold tracking-widest text-on-secondary-container uppercase">
                    Full Name
                  </label>
                  <input
                    className="focus:ring-primary/20 w-full rounded-xl border-none bg-surface-container-high px-5 py-4 transition-all duration-300 focus:bg-surface-container-lowest focus:ring-1 focus:outline-none"
                    placeholder="Julian Sterling"
                    type="text"
                    name="fullName"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label text-xs font-bold tracking-widest text-on-secondary-container uppercase">
                    Academic Email
                  </label>
                  <input
                    className="focus:ring-primary/20 w-full rounded-xl border-none bg-surface-container-high px-5 py-4 transition-all duration-300 focus:bg-surface-container-lowest focus:ring-1 focus:outline-none"
                    placeholder="julian@university.edu"
                    type="email"
                    name="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-label text-xs font-bold tracking-widest text-on-secondary-container uppercase">
                  Subject
                </label>
                <select
                  className="focus:ring-primary/20 w-full appearance-none rounded-xl border-none bg-surface-container-high px-5 py-4 transition-all duration-300 focus:bg-surface-container-lowest focus:ring-1 focus:outline-none"
                  name="subject"
                  defaultValue="Tour Availability Inquiry"
                >
                  <option>Tour Availability Inquiry</option>
                  <option>Ambassador Application</option>
                  <option>Technical Support</option>
                  <option>Institutional Partnership</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="font-label text-xs font-bold tracking-widest text-on-secondary-container uppercase">
                  Message
                </label>
                <textarea
                  className="focus:ring-primary/20 w-full rounded-xl border-none bg-surface-container-high px-5 py-4 transition-all duration-300 focus:bg-surface-container-lowest focus:ring-1 focus:outline-none"
                  placeholder="How can we assist your scholarly pursuits today?"
                  rows={5}
                  name="message"
                />
              </div>
              <button
                className="font-headline hover:bg-primary-container w-full rounded-lg bg-primary px-10 py-4 font-bold text-on-primary shadow-lg transition-all duration-300 active:scale-95 md:w-auto"
                type="submit"
              >
                Submit Inquiry
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="border-outline-variant/15 rounded-xl border bg-surface-container-low p-8">
              <h3 className="font-headline mb-6 text-xl font-bold text-primary">Direct Support</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-fixed flex h-12 w-12 items-center justify-center rounded-full text-primary">
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div>
                    <p className="font-label text-xs font-bold tracking-widest text-secondary uppercase">
                      Call Us
                    </p>
                    <p className="font-headline font-semibold text-primary">+91 9355226993</p>
                    <p className="text-sm text-secondary">Mon-Fri, 9am - 5pm EST</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary-fixed flex h-12 w-12 items-center justify-center rounded-full text-primary">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <p className="font-label text-xs font-bold tracking-widest text-secondary uppercase">
                      Email Support
                    </p>
                    <p className="font-headline font-semibold text-primary">
                      concierge@academiccurator.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto mt-24 max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="font-headline mb-2 text-3xl font-bold text-primary">Common Inquiries</h2>
            <p className="text-secondary">Answers to frequently asked scholarly questions.</p>
          </div>
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl bg-surface-container-low">
              <div className="hover:bg-surface-container-high flex w-full items-center justify-between px-8 py-6 text-left transition-colors">
                <span className="font-headline font-bold text-primary-container">
                  How do I verify an ambassador&apos;s credentials?
                </span>
                <span className="material-symbols-outlined text-primary">expand_more</span>
              </div>
              <div className="text-on-surface-variant px-8 pb-6 leading-relaxed">
                Every ambassador on our platform undergoes a rigorous institutional verification
                process. You can view their verified major, graduation year, and academic achievements
                directly on their profile page marked with the &quot;Scholarly Seal.&quot;
              </div>
            </div>
            <div className="overflow-hidden rounded-xl bg-surface-container-low">
              <div className="hover:bg-surface-container-high flex w-full items-center justify-between px-8 py-6 text-left transition-colors">
                <span className="font-headline font-bold text-primary-container">
                  Can I request a custom department-focused tour?
                </span>
                <span className="material-symbols-outlined text-primary">expand_more</span>
              </div>
              <div className="text-on-surface-variant px-8 pb-6 leading-relaxed">
                Absolutely. When booking, you can select specific academic interests (e.g., Theoretical
                Physics or Art History) and we will match you with an ambassador from that specific
                department for a tailored experience.
              </div>
            </div>
            <div className="overflow-hidden rounded-xl bg-surface-container-low">
              <div className="hover:bg-surface-container-high flex w-full items-center justify-between px-8 py-6 text-left transition-colors">
                <span className="font-headline font-bold text-primary-container">
                  What is the cancellation policy for private tours?
                </span>
                <span className="material-symbols-outlined text-primary">expand_more</span>
              </div>
              <div className="text-on-surface-variant px-8 pb-6 leading-relaxed">
                Cancellations made 48 hours in advance receive a full refund. As our ambassadors are
                current students balancing rigorous academic schedules, last-minute cancellations help us
                ensure they are fairly compensated for their reserved time.
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full px-6 pt-6 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="bg-primary-container flex flex-col items-center rounded-[3rem] px-8 py-12 text-center md:px-16">
            <div className="mb-8">
              <span className="font-headline text-2xl font-extrabold tracking-tighter text-white italic">
                The Academic Curator
              </span>
            </div>
            <nav className="mb-10 flex flex-wrap justify-center gap-x-8 gap-y-4">
              <Link
                to="/explore"
                className="text-sm font-medium text-blue-100/80 transition-colors hover:text-white"
              >
                Browse Tours
              </Link>
              <a
                className="text-sm font-medium text-blue-100/80 transition-colors hover:text-white"
                href="#"
              >
                Become an Ambassador
              </a>
              <a
                className="text-sm font-medium text-blue-100/80 transition-colors hover:text-white"
                href="#"
              >
                Institutional Access
              </a>
              <a
                className="text-sm font-medium text-blue-100/80 transition-colors hover:text-white"
                href="#"
              >
                Privacy Policy
              </a>
              <a
                className="text-sm font-medium text-blue-100/80 transition-colors hover:text-white"
                href="#"
              >
                Terms
              </a>
            </nav>
            <div className="flex w-full flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
              <p className="font-headline text-sm italic text-blue-200/60">
                Preserving the sanctity of higher education through personalized exploration.
              </p>
              <div className="flex items-center gap-6">
                <a className="text-white transition-colors hover:text-blue-300" href="#" aria-label="Share">
                  <span className="material-symbols-outlined text-xl">share</span>
                </a>
                <a className="text-white transition-colors hover:text-blue-300" href="#" aria-label="Web">
                  <span className="material-symbols-outlined text-xl">public</span>
                </a>
              </div>
              <p className="text-xs font-medium text-blue-200/40">
                © 2024 The Academic Curator. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
