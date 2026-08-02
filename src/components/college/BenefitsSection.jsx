import React, { useEffect, useState, useRef } from 'react'

function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true)
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.1, ...options })

    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [options])

  return [ref, isIntersecting]
}

function CountdownTimer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!expiresAt) return

    const calculateTimeLeft = () => {
      const now = new Date()
      const expiration = new Date(expiresAt)
      const difference = expiration.getTime() - now.getTime()

      if (difference <= 0) {
        return 'Expired'
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      
      const parts = []
      if (days > 0) parts.push(`${days}d`)
      if (hours > 0 || days > 0) parts.push(`${hours}h`)
      parts.push(`${minutes}m`)

      return `Expires in ${parts.join(' ')}`
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [expiresAt])

  if (!expiresAt) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 transition-opacity duration-500">
        <span className="material-symbols-outlined text-sm">schedule</span>
        Available for this intake
      </div>
    )
  }

  const isExpired = timeLeft === 'Expired'

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-opacity duration-500 ${isExpired ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
      <span className="material-symbols-outlined text-sm">
        {isExpired ? 'event_busy' : 'timer'}
      </span>
      {timeLeft}
    </div>
  )
}

export default function BenefitsSection({ details, discountPrice, currencySymbol }) {
  const benefits = details?.benefits

  if (!benefits || !benefits.enabled) {
    return null
  }

  const theme = details.theme || {}
  const primaryTextColor = theme.primaryColor ? { color: theme.primaryColor } : {}
  const accentColor = theme.accentColor || '#f59e0b'

  const [sectionRef, isVisible] = useIntersectionObserver()

  return (
    <section className="bg-surface py-12" id="exclusive-benefits">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          ref={sectionRef}
          className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-700 sm:p-10 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 motion-reduce:opacity-100 motion-reduce:translate-y-0'}`}
        >
          <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-slate-700">
                <span className="material-symbols-outlined text-lg" style={{ fontFeatureSettings: "'liga'" }}>workspace_premium</span>
                Academic Curator Partner
              </div>
              <h2 className="font-headline mb-4 text-3xl font-extrabold md:text-4xl" style={primaryTextColor}>
                Exclusive Admission Benefits
              </h2>
              <p className="font-body text-lg text-slate-600 mb-4 leading-relaxed">
                {benefits.description || 'Receive exclusive benefits when you apply through The Academic Curator.'}
              </p>
              <CountdownTimer expiresAt={benefits.expires_at} />
            </div>
            
            {discountPrice !== undefined && discountPrice !== null && (
              <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-sm md:items-end">
                <span className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-500">Admission Benefit Value</span>
                <span className="font-headline text-5xl font-extrabold tracking-tight" style={{ color: accentColor }}>
                  {currencySymbol}{discountPrice}
                </span>
              </div>
            )}
          </div>

          {benefits.items && benefits.items.length > 0 && (
            <div className="relative z-10 mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.items.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-6 transition-all duration-500 hover:border-slate-300 hover:shadow-sm ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 motion-reduce:opacity-100 motion-reduce:translate-y-0'}`}
                  style={{ transitionDelay: `${100 + idx * 100}ms` }}
                >
                  <div 
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm"
                  >
                    <span className="material-symbols-outlined" style={{ fontFeatureSettings: "'liga'" }}>{item.icon || 'star'}</span>
                  </div>
                  <div>
                    <h3 className="font-headline mb-2 font-bold text-slate-900">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="font-body text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
