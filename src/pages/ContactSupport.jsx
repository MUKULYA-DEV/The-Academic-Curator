import { Link } from 'react-router-dom'
import React, { useState } from 'react'
import SEO from '../components/SEO.jsx'
import CustomSelect from '../components/CustomSelect.jsx'

export default function ContactSupport() {
  const [subject, setSubject] = useState('Tour Availability Inquiry')

  const options = [
    'Tour Availability Inquiry',
    'Ambassador Application',
    'Technical Support',
    'Institutional Partnership',
    'Other'
  ]

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
              <div className="space-y-2">
                <label className="font-label text-xs font-bold tracking-widest text-on-secondary-container uppercase">
                  Subject
                </label>
                <CustomSelect
                  name="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  options={options}
                  className="focus:ring-primary/20 w-full rounded-xl border-none bg-surface-container-high px-5 py-4 transition-all duration-300 hover:bg-surface-container-highest"
                />
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
                  <div className="bg-primary-fixed flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-primary">
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
                  <div className="bg-primary-fixed flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-primary">
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
                <a 
                  href="https://wa.me/919355226993" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start gap-4 transition-opacity hover:opacity-80"
                >
                  <div className="bg-[#25D366]/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-label text-xs font-bold tracking-widest text-secondary uppercase">
                      Chat With Us
                    </p>
                    <p className="font-headline font-semibold text-primary">WhatsApp</p>
                    <p className="text-sm text-secondary">+91 9355226993</p>
                  </div>
                </a>
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
