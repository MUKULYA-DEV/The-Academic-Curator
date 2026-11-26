import { motion, MotionConfig } from 'motion/react'

const MotionDiv = motion.div

// Drifting glows: [position and colour classes, x path, y path, seconds per loop]
const ORBS = [
  ['-top-44 -right-28 h-[32rem] w-[32rem] bg-surface-tint opacity-50', [0, -70, 30, 0], [0, 50, 90, 0], 20],
  ['-bottom-52 -left-32 h-[28rem] w-[28rem] bg-tertiary-container opacity-20', [0, 80, 20, 0], [0, -60, -20, 0], 24],
  ['top-1/3 left-1/2 h-72 w-72 bg-[#3d6fd6] opacity-25', [0, -120, 60, 0], [0, 40, -50, 0], 28],
]

// Requirement tags floating in the side margins. Shown only where there is room (xl and up).
const TAGS = [
  { icon: 'school', text: 'B.Tech CSE', pos: 'left-[4%] top-[20%]', delay: 0, drift: 16 },
  { icon: 'currency_rupee', text: 'Under ₹2 lakh', pos: 'left-[6%] top-[50%]', delay: 1.2, drift: 22 },
  { icon: 'bed', text: 'With hostel', pos: 'left-[3%] top-[76%]', delay: 0.6, drift: 14 },
  { icon: 'location_on', text: 'Dehradun', pos: 'right-[5%] top-[24%]', delay: 0.9, drift: 20 },
  { icon: 'work', text: 'MBA', pos: 'right-[11%] top-[52%]', delay: 0.3, drift: 15 },
  { icon: 'location_city', text: 'Delhi NCR', pos: 'right-[4%] top-[74%]', delay: 1.5, drift: 18 },
]

/** Moving background for the Find College hero. Decorative only; transforms and opacity, nothing that repaints. */
export default function FindHeroBackdrop() {
  return (
    <MotionConfig reducedMotion="user">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="find-grid-mask absolute inset-0">
          <div className="find-grid absolute -inset-8" />
        </div>

        {ORBS.map(([classes, x, y, duration]) => (
          <MotionDiv
            key={classes}
            className={`absolute rounded-full blur-3xl will-change-transform ${classes}`}
            animate={{ x, y, scale: [1, 1.12, 0.94, 1] }}
            transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {TAGS.map((tag) => (
          <MotionDiv
            key={tag.text}
            className={`absolute hidden xl:block ${tag.pos}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 + tag.delay, ease: [0.22, 1, 0.36, 1] }}
          >
            <MotionDiv
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-white/70 shadow-lg shadow-black/10"
              animate={{ y: [0, -tag.drift, 0], rotate: [0, tag.drift % 2 ? 2 : -2, 0] }}
              transition={{ duration: 5 + tag.delay * 2, repeat: Infinity, ease: 'easeInOut', delay: tag.delay }}
            >
              <span className="material-symbols-outlined text-base text-tertiary-fixed-dim">{tag.icon}</span>
              {tag.text}
            </MotionDiv>
          </MotionDiv>
        ))}
      </div>
    </MotionConfig>
  )
}
