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

function timeLeftUntil(expiresAt) {
  if (!expiresAt) return null
  const difference = new Date(expiresAt).getTime() - Date.now()
  if (difference <= 0) return null

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
    minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
    seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0'),
  }
}

function CardTimer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState(() => timeLeftUntil(expiresAt))

  useEffect(() => {
    if (!expiresAt) return undefined
    const timer = setInterval(() => setTimeLeft(timeLeftUntil(expiresAt)), 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  if (!expiresAt) return null
  if (!timeLeft) return null // Hide if expired

  return (
    <div className="mt-6 flex items-center justify-between rounded-xl bg-[#4A545F] p-3 text-white shadow-inner">
      <div className="flex flex-col items-center">
        <span className="font-headline text-lg font-bold leading-none">{timeLeft.days}</span>
        <span className="text-[10px] font-medium text-slate-300 lowercase tracking-wide mt-1">days</span>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="font-headline text-lg font-bold leading-none">{timeLeft.hours}</span>
        <span className="text-[10px] font-medium text-slate-300 lowercase tracking-wide mt-1">hrs</span>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="font-headline text-lg font-bold leading-none">{timeLeft.minutes}</span>
        <span className="text-[10px] font-medium text-slate-300 lowercase tracking-wide mt-1">min</span>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="font-headline text-lg font-bold leading-none">{timeLeft.seconds}</span>
        <span className="text-[10px] font-medium text-slate-300 lowercase tracking-wide mt-1">sec</span>
      </div>
    </div>
  )
}

export default function BenefitsSection({ details, discountPrice, currencySymbol }) {
  const benefits = details?.benefits
  const [sectionRef, isVisible] = useIntersectionObserver()

  if (!benefits || !benefits.enabled) {
    return null
  }

  const theme = details.theme || {}
  const primaryTextColor = theme.primaryColor ? { color: theme.primaryColor } : {}
  const accentColor = theme.accentColor || '#f59e0b'

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
                  className={`group relative flex h-full flex-col overflow-hidden rounded-2xl bg-[#0F284B] p-5 shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 motion-reduce:opacity-100 motion-reduce:translate-y-0'}`}
                  style={{ transitionDelay: `${100 + idx * 100}ms` }}
                >
                  {/* Gold Curve Accent */}
                  <div className="absolute -right-2 -top-2 h-16 w-16 rounded-bl-[40px] bg-[#C19B5E] opacity-90 transition-transform duration-500 group-hover:scale-110" />

                  <div 
                    className="relative z-10 mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C19B5E] text-white shadow-sm"
                  >
                    <span className="material-symbols-outlined text-xl normal-case" style={{ fontFamily: '"Material Symbols Outlined"' }}>{item.icon || 'local_offer'}</span>
                  </div>
                  
                  <div className="relative z-10 flex flex-1 flex-col min-w-0">
                    <h3 className="font-headline mb-2 text-base font-bold text-white break-words leading-tight">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="font-body text-[13px] leading-relaxed text-[#B0BDC9] break-words">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="mt-auto">
                      <CardTimer expiresAt={benefits.expires_at} />
                    </div>
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
