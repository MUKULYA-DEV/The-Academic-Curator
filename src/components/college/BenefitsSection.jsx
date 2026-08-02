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
  const [timeLeft, setTimeLeft] = useState(null)
  
  useEffect(() => {
    if (!expiresAt) return

    const calculateTimeLeft = () => {
      const now = new Date()
      const expiration = new Date(expiresAt)
      const difference = expiration.getTime() - now.getTime()

      if (difference <= 0) {
        return null
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
        minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
        seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0'),
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000) // Update every second

    return () => clearInterval(timer)
  }, [expiresAt])

  if (!expiresAt) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600">
        <span className="material-symbols-outlined text-sm normal-case" style={{ fontFamily: '"Material Symbols Outlined"' }}>schedule</span>
        Available for this intake
      </div>
    )
  }

  if (!timeLeft) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold tracking-wide text-red-600">
        <span className="material-symbols-outlined text-sm normal-case" style={{ fontFamily: '"Material Symbols Outlined"' }}>event_busy</span>
        Offer Expired
      </div>
    )
  }

  const expirationDate = new Date(expiresAt)
  const formattedDate = expirationDate.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', 
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="mt-2 w-full max-w-sm rounded-xl border-2 border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/5 to-transparent p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        <span className="material-symbols-outlined text-sm normal-case text-[#D4AF37]" style={{ fontFamily: '"Material Symbols Outlined"' }}>schedule</span>
        Time Remaining
      </div>
      
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center">
          <span className="font-headline text-3xl font-extrabold text-[#D4AF37] leading-none">{timeLeft.days}</span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Days</span>
        </div>
        <span className="text-xl font-bold text-slate-300 mt-1">:</span>
        
        <div className="flex flex-col items-center">
          <span className="font-headline text-3xl font-extrabold text-[#D4AF37] leading-none">{timeLeft.hours}</span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Hrs</span>
        </div>
        <span className="text-xl font-bold text-slate-300 mt-1">:</span>
        
        <div className="flex flex-col items-center">
          <span className="font-headline text-3xl font-extrabold text-[#D4AF37] leading-none">{timeLeft.minutes}</span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Min</span>
        </div>
        <span className="text-xl font-bold text-slate-300 mt-1">:</span>
        
        <div className="flex flex-col items-center">
          <span className="font-headline text-3xl font-extrabold text-[#D4AF37] leading-none">{timeLeft.seconds}</span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Sec</span>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs font-medium text-slate-500">
        Expires {formattedDate}
      </div>
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
    <section className="bg-surface py-8" id="exclusive-benefits">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          ref={sectionRef}
          className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-700 sm:p-8 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 motion-reduce:opacity-100 motion-reduce:translate-y-0'}`}
        >
          <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-xl">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                <span className="material-symbols-outlined text-base normal-case" style={{ fontFamily: '"Material Symbols Outlined"' }}>workspace_premium</span>
                Academic Curator Partner
              </div>
              <h2 className="font-headline mb-3 text-2xl font-extrabold md:text-3xl tracking-tight" style={primaryTextColor}>
                Exclusive Admission Benefits
              </h2>
              <p className="font-body text-base text-slate-600 mb-4 leading-relaxed max-w-lg">
                {benefits.description || 'Receive exclusive benefits when you apply through The Academic Curator.'}
              </p>
              <CountdownTimer expiresAt={benefits.expires_at} />
            </div>
            
            {discountPrice !== undefined && discountPrice !== null && (
              <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 px-6 py-4 shadow-sm md:items-end">
                <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Admission Benefit Value</span>
                <span className="font-headline text-4xl font-extrabold tracking-tight" style={{ color: accentColor }}>
                  {currencySymbol}{discountPrice}
                </span>
              </div>
            )}
          </div>

          {benefits.items && benefits.items.length > 0 && (
            <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.items.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col gap-3 rounded-xl border-2 border-slate-200 bg-white p-5 transition-all duration-500 hover:border-slate-300 hover:shadow-sm ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 motion-reduce:opacity-100 motion-reduce:translate-y-0'}`}
                  style={{ transitionDelay: `${100 + idx * 100}ms` }}
                >
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg normal-case" style={{ fontFamily: '"Material Symbols Outlined"' }}>{item.icon || 'star'}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-headline mb-1.5 text-base font-bold text-slate-900 break-words leading-tight">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="font-body text-xs leading-relaxed text-slate-600 break-words">
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
