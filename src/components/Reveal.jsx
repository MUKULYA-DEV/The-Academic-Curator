import { motion, MotionConfig } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1]

/**
 * Fades and lifts its children into place the first time they scroll into view.
 * Pass `delay` (seconds) to stagger siblings. Honors prefers-reduced-motion.
 */
export default function Reveal({
  children,
  as = 'div',
  delay = 0,
  y = 28,
  duration = 0.7,
  className,
  ...rest
}) {
  const Tag = motion[as] ?? motion.div

  return (
    <MotionConfig reducedMotion="user">
      <Tag
        className={className}
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -60px 0px' }}
        transition={{ duration, delay, ease: EASE }}
        {...rest}
      >
        {children}
      </Tag>
    </MotionConfig>
  )
}
