import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { selectIsVerified } from '../../../features/auth/authSlice'
import { paths } from '../../../routes/paths'
import { AirtimeIcon, DropIcon, PowerIcon, TvIcon, WifiIcon } from './icons'
import { ease, rise } from './motion'

const utilityItems = [
  { title: 'Airtime', text: 'Top up instantly', icon: AirtimeIcon, color: '#0A5CE5', tint: '#D3E3FF' },
  { title: 'Data', text: 'Stay connected', icon: WifiIcon, color: '#0A8AE0', tint: '#CDEBFF' },
  { title: 'TV Subscriptions', text: 'Pay with ease', icon: TvIcon, color: '#E0232E', tint: '#FFD6D8' },
  { title: 'Electricity', text: 'Keep the lights on', icon: PowerIcon, color: '#F08000', tint: '#FFE3BC' },
  { title: 'Water', text: 'Pay your bills', icon: DropIcon, color: '#0B6FE8', tint: '#D0E2FF' },
]

const utilityTile = {
  hidden: { opacity: 0, y: 26, scale: 0.94 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease, delay: 0.15 + i * 0.09 },
  }),
}

function UtilityTile({ item, index }) {
  const Icon = item.icon

  return (
    <motion.li
      variants={utilityTile}
      custom={index}
      className="group flex flex-col items-center rounded-2xl bg-white/55 px-3 py-7 text-center shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(255,255,255,0.6),0_2px_4px_rgba(16,33,61,0.04),0_12px_28px_-6px_rgba(16,33,61,0.14),0_28px_48px_-16px_rgba(16,33,61,0.12)] ring-1 ring-white/80 backdrop-blur-xl backdrop-saturate-150 transition-shadow duration-300 hover:shadow-[0_4px_8px_rgba(16,33,61,0.05),0_20px_40px_-8px_var(--glow),0_36px_60px_-20px_rgba(16,33,61,0.18)] hover:ring-[var(--glow)]"
      style={{ '--glow': `${item.color}59` }}
    >
      <span
        className="flex size-20 items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{ color: item.color }}
      >
        <Icon size={64} />
      </span>
      <p className="mt-3 text-base font-semibold text-navy">{item.title}</p>
      <p className="mt-1 text-xs text-ink/60">{item.text}</p>
      <span
        aria-hidden="true"
        className="mt-3 h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-8"
        style={{ backgroundColor: item.color }}
      />
    </motion.li>
  )
}

function UtilityChip({ children, className, delay }) {
  return (
    <motion.span
      className={`absolute z-10 flex size-14 items-center justify-center rounded-full shadow-[0_8px_20px_rgba(20,115,230,0.3)] ${className}`}
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 220, damping: 16, delay }}
    >
      {children}
    </motion.span>
  )
}

function UtilityVisual({ reduce }) {
  return (
    <div className="relative mx-auto h-60 w-72" aria-hidden="true">
      <svg viewBox="0 0 288 240" className="absolute inset-0 h-full w-full overflow-visible">
        <motion.circle
          cx="144"
          cy="120"
          r="104"
          fill="none"
          stroke="#1473E6"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="5 7"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease }}
        />
      </svg>

      {reduce ? null : (
        <motion.span
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          <span className="absolute top-[16px] left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-blue ring-4 ring-blue/15" />
        </motion.span>
      )}

      <UtilityChip className="top-2 left-4 bg-[#0A5CE5] text-white" delay={0.5}>
        <AirtimeIcon size={30} />
      </UtilityChip>
      <UtilityChip className="top-4 right-6 bg-[#E0232E] text-white" delay={0.65}>
        <TvIcon size={30} />
      </UtilityChip>
      <UtilityChip className="bottom-12 left-0 bg-white text-[#0A8AE0]" delay={0.8}>
        <WifiIcon size={30} />
      </UtilityChip>
      <UtilityChip className="right-1 bottom-10 bg-white text-[#0B6FE8]" delay={0.95}>
        <DropIcon size={30} />
      </UtilityChip>

      <motion.div
        className="absolute top-1/2 left-1/2 mt-2 w-32 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white px-4 pt-7 pb-5 shadow-[0_18px_40px_rgba(16,33,61,0.14)] ring-1 ring-ink/5"
        initial={{ opacity: 0, y: 30, rotate: -3 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease, delay: 0.2 }}
      >
        <span className="absolute -top-5 left-1/2 flex size-10 -translate-x-1/2 items-center justify-center">
          {reduce ? null : (
            <motion.span
              className="absolute inset-0 rounded-full bg-[#F5A000]"
              animate={{ scale: [1, 1.9], opacity: [0.45, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
          <span className="relative flex size-10 items-center justify-center rounded-full bg-[#F5A000] text-white">
            <PowerIcon size={20} />
          </span>
        </span>
        {[100, 78, 60].map((width, i) => (
          <span key={width} className="mt-2.5 block h-2 rounded-full bg-blue/10 first:mt-0">
            <motion.span
              className="block h-full origin-left rounded-full bg-blue/50"
              style={{ width: `${width}%` }}
              initial={{ scaleX: 0 }}
              animate={reduce ? { scaleX: 1 } : { scaleX: [0, 1, 1, 0] }}
              transition={
                reduce
                  ? undefined
                  : { duration: 4, repeat: Infinity, ease, times: [0, 0.3, 0.85, 1], delay: 0.8 + i * 0.35 }
              }
            />
          </span>
        ))}
      </motion.div>
    </div>
  )
}

const dotGrid = {
  backgroundImage: 'radial-gradient(rgba(20, 115, 230, 0.28) 1.3px, transparent 1.3px)',
  backgroundSize: '24px 24px',
  maskImage: 'radial-gradient(ellipse 65% 60% at 50% 55%, #000 25%, transparent 78%)',
  WebkitMaskImage: 'radial-gradient(ellipse 65% 60% at 50% 55%, #000 25%, transparent 78%)',
}

// Soft color behind each tile so the glass has something to blur.
const utilityGlow = [
  { left: '14%', color: '#0A5CE5' },
  { left: '30%', color: '#0A8AE0' },
  { left: '64%', color: '#E0232E' },
  { left: '79%', color: '#F08000' },
  { left: '93%', color: '#0B6FE8' },
]

function UtilityBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0" style={dotGrid} />
      {utilityGlow.map((glow) => (
        <span
          key={glow.left}
          className="absolute top-[56%] hidden size-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl lg:block"
          style={{ left: glow.left, backgroundColor: glow.color, opacity: 0.4 }}
        />
      ))}
      <div className="absolute top-[55%] left-1/2 hidden size-[46rem] -translate-x-1/2 -translate-y-1/2 sm:block">
        <span className="absolute inset-[22%] rounded-full border border-blue/15" />
        <span className="absolute inset-[8%] rounded-full border border-blue/10" />
      </div>
    </div>
  )
}

export function UtilitiesSection() {
  const isVerified = useSelector(selectIsVerified)
  const reduce = useReducedMotion()
  const utilityPath = isVerified ? paths.app : paths.signup
  const left = utilityItems.slice(0, 2)
  const right = utilityItems.slice(2)

  return (
    <section
      id="utilities"
      className="relative scroll-mt-16 overflow-hidden border-t border-ink/10 bg-canvas"
    >
      <UtilityBackdrop />
      <div className="relative mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:py-20">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={rise} className="flex items-center justify-center gap-3">
            <span className="relative flex size-10 items-center justify-center rounded-full bg-[#F5A000] text-white">
              <PowerIcon size={20} />
            </span>
            <p className="text-xs font-semibold tracking-[0.16em] text-ink/45">UTILITIES</p>
          </motion.div>
          <motion.h2
            variants={rise}
            className="mt-5 text-4xl leading-[1.12] font-bold tracking-tight text-balance text-navy sm:text-5xl"
          >
            Pay for Everyday Essentials.
          </motion.h2>
          <motion.p variants={rise} className="mt-4 text-base leading-7 text-ink/65">
            Purchase airtime, data, TV subscriptions, electricity, water and more, all in one place.
          </motion.p>
        </motion.div>

        <div className="relative mt-12 lg:mt-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-px bg-blue/20 lg:block"
          >
            {reduce
              ? null
              : [0, 2.6].map((delay) => (
                  <motion.span
                    key={delay}
                    className="absolute top-0 size-2.5 rounded-full bg-blue ring-4 ring-blue/15"
                    style={{ y: '-50%' }}
                    initial={{ left: '0%', opacity: 0 }}
                    animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                    transition={{
                      duration: 5.2,
                      repeat: Infinity,
                      ease: 'linear',
                      times: [0, 0.08, 0.92, 1],
                      delay,
                    }}
                  />
                ))}
          </div>
          <motion.ul
            className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_18rem_1fr_1fr_1fr] lg:items-center lg:gap-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            {left.map((item, i) => (
              <UtilityTile key={item.title} item={item} index={i} />
            ))}
            <li className="order-first col-span-2 sm:col-span-3 lg:order-none lg:col-span-1">
              <UtilityVisual reduce={reduce} />
            </li>
            {right.map((item, i) => (
              <UtilityTile key={item.title} item={item} index={i + 3} />
            ))}
          </motion.ul>
        </div>

        <motion.div
          className="mt-10 flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.3 }}
        >
          <Link
            to={utilityPath}
            className="inline-flex items-center gap-2 rounded-lg bg-blue px-6 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            Purchase Utility
            <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
          </Link>
          <p className="text-center text-sm text-ink/55">
            Paid from your wallet, or directly by MoMo or card.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
