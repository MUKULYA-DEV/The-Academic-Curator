import React from 'react'

export default function BenefitsSection({ details, discountPrice, currencySymbol }) {
  const benefits = details?.benefits

  if (!benefits || !benefits.enabled || !discountPrice || discountPrice <= 0) {
    return null
  }

  const theme = details.theme || {}
  const primaryBgColor = theme.primaryColor ? { backgroundColor: theme.primaryColor } : {}
  const primaryTextColor = theme.primaryColor ? { color: theme.primaryColor } : {}
  const accentColor = theme.accentColor || '#f59e0b'

  return (
    <section className="bg-surface-container-lowest py-16" id="exclusive-benefits">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          className="relative overflow-hidden rounded-3xl border p-8 shadow-sm sm:p-12"
          style={{ borderColor: `${theme.primaryColor}30`, backgroundColor: `${theme.primaryColor}08` }}
        >
          {/* Background Decorative Gradient */}
          <div 
            className="absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: theme.primaryColor }}
          />

          <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold uppercase tracking-wider"
                style={{ borderColor: `${theme.primaryColor}40`, color: theme.primaryColor, backgroundColor: `${theme.primaryColor}10` }}
              >
                <span className="material-symbols-rounded text-lg">workspace_premium</span>
                Academic Curator Partner
              </div>
              <h2 className="font-headline mb-4 text-3xl font-extrabold md:text-4xl" style={primaryTextColor}>
                Exclusive Admission Benefits
              </h2>
              <p className="font-body text-lg text-on-surface-variant">
                {benefits.description || 'Receive exclusive benefits when you apply through The Academic Curator.'}
              </p>
            </div>
            
            <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-md md:items-end">
              <span className="mb-1 text-sm font-bold text-secondary uppercase tracking-wider">Estimated Student Savings</span>
              <span className="font-headline text-5xl font-extrabold tracking-tight" style={{ color: accentColor }}>
                {currencySymbol}{discountPrice}
              </span>
            </div>
          </div>

          {benefits.items && benefits.items.length > 0 && (
            <div className="relative z-10 mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.items.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-4 rounded-2xl bg-white/60 p-6 backdrop-blur-sm transition-all hover:bg-white hover:shadow-md">
                  <div 
                    className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-sm"
                    style={primaryBgColor}
                  >
                    <span className="material-symbols-rounded">{item.icon || 'star'}</span>
                  </div>
                  <div>
                    <h3 className="font-headline mb-2 font-bold text-on-surface" style={primaryTextColor}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="font-body text-sm text-on-surface-variant">
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
