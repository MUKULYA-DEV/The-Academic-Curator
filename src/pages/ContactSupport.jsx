import { Link } from 'react-router-dom'
import React, { useState, useRef, useEffect } from 'react'
import SEO from '../components/SEO.jsx'

export default function ContactSupport() {
  const [subject, setSubject] = useState('Tour Availability Inquiry')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const options = [
    'Tour Availability Inquiry',
    'Ambassador Application',
    'Technical Support',
    'Institutional Partnership',
    'Other'
  ]

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      <SEO title="Contact Support" description="Get in touch with The Academic Curator team for any questions or support." />
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
                    Email
                  </label>
                  <input
                    className="focus:ring-primary/20 w-full rounded-xl border-none bg-surface-container-high px-5 py-4 transition-all duration-300 focus:bg-surface-container-lowest focus:ring-1 focus:outline-none"
                    placeholder="julian@example.com"
                    type="email"
                    name="email"
                  />
                </div>
              </div>
              <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="font-label text-xs font-bold tracking-widest text-on-secondary-container uppercase">
                  Subject
                </label>
                <div 
                  className="focus:ring-primary/20 flex w-full cursor-pointer items-center justify-between rounded-xl border-none bg-surface-container-high px-5 py-4 transition-all duration-300 hover:bg-surface-container-highest"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="text-on-surface">{subject}</span>
                  <span className="material-symbols-outlined text-secondary transition-transform duration-200" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                </div>
                <input type="hidden" name="subject" value={subject} />

                {isDropdownOpen && (
                  <div className="absolute left-0 top-full z-10 mt-2 w-full overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-[fade-in_0.15s_ease-out]">
                    {options.map((opt) => (
                      <div
                        key={opt}
                        className={`cursor-pointer px-5 py-3.5 transition-colors hover:bg-primary/5 ${
                          subject === opt ? 'bg-primary/10 font-bold text-primary' : 'text-on-surface'
                        }`}
                        onClick={() => {
                          setSubject(opt)
                          setIsDropdownOpen(false)
                        }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
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
                <div className="flex items-start gap-4">
                  <div className="bg-primary-fixed flex h-12 w-12 items-center justify-center rounded-full text-primary">
                    <span className="material-symbols-outlined">chat</span>
                  </div>
                  <div>
                    <p className="font-label text-xs font-bold tracking-widest text-secondary uppercase">
                      Chat With Us
                    </p>
                    <p className="font-headline font-semibold text-primary">WhatsApp</p>
                    <p className="text-sm text-secondary">+91 9355226993</p>
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

      
    </div>
  )
}
