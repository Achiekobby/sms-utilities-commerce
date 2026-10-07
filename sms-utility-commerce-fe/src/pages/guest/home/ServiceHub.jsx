import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { BarsIcon, ChatIcon, GiftIcon, PhoneIcon, TvIcon, WalletIcon } from './icons'
import { ease, rise } from './motion'

const hubVariants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 150, damping: 15, delay: 0.05 },
  },
}

const cardFromLeft = {
  hidden: { opacity: 0, x: -48 },
  show: (i) => ({ opacity: 1, x: 0, transition: { duration: 0.65, ease, delay: 0.55 + i * 0.12 } }),
}

const cardFromRight = {
  hidden: { opacity: 0, x: 48 },
  show: (i) => ({ opacity: 1, x: 0, transition: { duration: 0.65, ease, delay: 0.55 + i * 0.12 } }),
}

const lineDraw = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.75, ease, delay: 0.3 + i * 0.12 },
      opacity: { duration: 0.01, delay: 0.3 + i * 0.12 },
    },
  }),
}

const ringAtHub = {
  hidden: { opacity: 0, scale: 0 },
  show: (i) => ({ opacity: 1, scale: 1, transition: { duration: 0.3, ease, delay: 0.25 + i * 0.12 } }),
}

const ringAtCard = {
  hidden: { opacity: 0, scale: 0 },
  show: (i) => ({ opacity: 1, scale: 1, transition: { duration: 0.3, ease, delay: 0.95 + i * 0.12 } }),
}

const packetGroup = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { delay: 1.9, duration: 0.5 } },
}

const leftServices = [
  {
    title: 'SMS Campaigns',
    text: 'Send bulk messages',
    icon: ChatIcon,
    color: '#0E6AD6',
    tint: '#D7E8FF',
    sectionId: 'sms-campaigns',
  },
  {
    title: 'Wallet & Payments',
    text: 'Fund wallet & pay',
    icon: WalletIcon,
    color: '#0E9A42',
    tint: '#D4F0DE',
    sectionId: 'wallet',
  },
  {
    title: 'Analytics & Reports',
    text: 'Track usage & results',
    icon: BarsIcon,
    color: '#6840E0',
    tint: '#E4D9FF',
  },
]

const rightServices = [
  {
    title: 'Airtime & Data',
    text: 'Buy airtime & data',
    icon: PhoneIcon,
    color: '#E86A00',
    tint: '#FFE4C4',
    sectionId: 'utilities',
  },
  {
    title: 'TV & Utility Bills',
    text: 'Pay TV, electricity & more',
    icon: TvIcon,
    color: '#E0232E',
    tint: '#FFD8D6',
    sectionId: 'utilities',
  },
  {
    title: 'Rewards & Surveys',
    text: 'Earn rewards easily',
    icon: GiftIcon,
    color: '#0C8F3C',
    tint: '#D4F0DE',
    sectionId: 'rewards',
  },
]

const rowStart = ['row-start-1', 'row-start-2', 'row-start-3']

// Diagram geometry, in px at a 16px root. Three rows of 104px (6.5rem).
// Card centers sit at 52 / 156 / 260. The 224px hub (14rem) is centered, so its top is 44.
// The hub's connection points sit at 23% / 45% / 78% of its height.
const cardY = [52, 156, 260]
const hubY = [96, 145, 219]
const gapWidth = 112
const diagramHeight = 312

const viewport = { once: true, amount: 0.2 }

function ServiceCard({ service }) {
  const Icon = service.icon
  const reduce = useReducedMotion()
  const Card = service.sectionId ? motion.a : motion.article

  return (
    <Card
      href={service.sectionId ? `#${service.sectionId}` : undefined}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="group relative block cursor-pointer rounded-2xl no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[2px] rounded-[18px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={
          reduce
            ? { backgroundColor: service.color }
            : {
                background: `conic-gradient(from var(--border-angle), transparent 45%, ${service.color} 72%, #ffffff 84%, ${service.color} 94%, transparent)`,
                animation: 'border-spin 1.8s linear infinite',
              }
        }
      />
      <div className="relative flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-[0_12px_32px_rgba(16,33,61,0.08)] transition-shadow duration-300 group-hover:shadow-[0_18px_40px_rgba(16,33,61,0.14)]">
      <span
        className="flex size-16 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: service.tint, color: service.color }}
      >
        <Icon size={36} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-lg leading-6 font-semibold text-navy">{service.title}</span>
        <span className="mt-1 block text-sm leading-5 text-ink/60">{service.text}</span>
      </span>
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: service.tint, color: service.color }}
      >
        <ArrowRight
          size={18}
          strokeWidth={2.2}
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </span>
      </div>
    </Card>
  )
}

const ringStyle = { transformBox: 'fill-box', transformOrigin: 'center' }

function Connectors({ services, flip = false }) {
  const reduce = useReducedMotion()

  return (
    <svg
      viewBox={`0 0 ${gapWidth} ${diagramHeight}`}
      className={`relative z-20 overflow-visible ${flip ? '-scale-x-100' : ''}`}
      style={{ width: '7rem', height: '19.5rem' }}
      aria-hidden="true"
    >
      {services.map((service, index) => {
        const from = cardY[index]
        const to = hubY[index]
        const mid = gapWidth / 2
        // Drawn from the hub outward so the lines grow toward the cards.
        const d = `M ${gapWidth} ${to} C ${mid} ${to}, ${mid} ${from}, 0 ${from}`
        const begin = `${index * 0.6}s`

        return (
          <g key={service.title}>
            <motion.path
              d={d}
              variants={lineDraw}
              custom={index}
              stroke={service.color}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            {reduce ? null : (
              <motion.g variants={packetGroup}>
                <circle r="4" fill={service.color} stroke="#fff" strokeWidth="1.5">
                  <animateMotion
                    dur="3s"
                    begin={begin}
                    repeatCount="indefinite"
                    path={d}
                    keyPoints={flip ? '0;1' : '1;0'}
                    keyTimes="0;1"
                    calcMode="linear"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.12;0.88;1"
                    dur="3s"
                    begin={begin}
                    repeatCount="indefinite"
                  />
                </circle>
              </motion.g>
            )}
            <motion.circle
              cx="0"
              cy={from}
              r="5.5"
              fill="#fff"
              stroke={service.color}
              strokeWidth="3"
              variants={ringAtCard}
              custom={index}
              style={ringStyle}
            />
            <motion.circle
              cx={gapWidth}
              cy={to}
              r="5.5"
              fill="#fff"
              stroke={service.color}
              strokeWidth="3"
              variants={ringAtHub}
              custom={index}
              style={ringStyle}
            />
          </g>
        )
      })}
    </svg>
  )
}

function Hub() {
  const reduce = useReducedMotion()

  return (
    <motion.div variants={hubVariants} className="relative z-10 mx-auto aspect-square w-52 lg:w-56">
      <motion.div
        className="absolute -inset-4 rounded-[2.6rem] bg-[#3D9BFF]/45 blur-2xl"
        initial={false}
        animate={reduce ? undefined : { opacity: [0.55, 1, 0.55], scale: [1, 1.07, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />
      <div className="relative flex h-full w-full flex-col items-center justify-center rounded-[1.9rem] bg-gradient-to-b from-[#8ECAFF] via-[#3D9BFF] to-[#1A7AFF] px-5 text-center text-white shadow-[0_0_0_1px_rgba(255,255,255,0.5),0_0_36px_rgba(61,155,255,0.55),inset_0_1px_0_rgba(255,255,255,0.9)]">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.9rem]"
          aria-hidden="true"
        >
          <div className="absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-white/40 via-white/10 to-transparent" />
          {reduce ? null : (
            <motion.div
              className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
              initial={{ x: '-150%' }}
              animate={{ x: '450%' }}
              transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 5, delay: 2.2 }}
            />
          )}
        </div>
        <svg viewBox="0 0 48 42" className="relative h-14 w-16" aria-hidden="true">
          <path
            fill="#fff"
            d="M8 2h32a7 7 0 0 1 7 7v13a7 7 0 0 1-7 7H28l-4 8-4-8H8a7 7 0 0 1-7-7V9a7 7 0 0 1 7-7z"
          />
          {[17, 24, 31].map((cx, i) => (
            <motion.circle
              key={cx}
              cx={cx}
              cy="16"
              r="2.5"
              fill="#2B8CFF"
              initial={false}
              animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
            />
          ))}
        </svg>
        <p className="relative mt-3 text-[1.75rem] leading-[1.1] font-bold tracking-tight">
          All-in-One
          <br />
          Services
        </p>
        <p className="relative mt-3.5 text-[11.5px] leading-[1.4] font-medium tracking-[0.12em] text-white/85">
          MESSAGING · PAYMENTS
          <br />
          UTILITIES · REWARDS
        </p>
      </div>
    </motion.div>
  )
}

export function ServiceHub() {
  return (
    <>
      <motion.div
        className="mx-auto mt-6 hidden max-w-7xl lg:grid lg:grid-cols-[minmax(0,1fr)_7rem_14rem_7rem_minmax(0,1fr)] lg:grid-rows-[repeat(3,6.5rem)]"
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        {leftServices.map((service, index) => (
          <motion.div
            key={service.title}
            className={`col-start-1 self-center ${rowStart[index]}`}
            variants={cardFromLeft}
            custom={index}
          >
            <ServiceCard service={service} />
          </motion.div>
        ))}
        <div className="col-start-2 row-span-3 row-start-1">
          <Connectors services={leftServices} />
        </div>
        <div className="col-start-3 row-span-3 row-start-1 self-center">
          <Hub />
        </div>
        <div className="col-start-4 row-span-3 row-start-1">
          <Connectors services={rightServices} flip />
        </div>
        {rightServices.map((service, index) => (
          <motion.div
            key={service.title}
            className={`col-start-5 self-center ${rowStart[index]}`}
            variants={cardFromRight}
            custom={index}
          >
            <ServiceCard service={service} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mx-auto mt-8 flex max-w-md flex-col items-stretch gap-3 lg:hidden"
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <Hub />
        {[...leftServices, ...rightServices].map((service, index) => (
          <motion.div key={service.title} variants={rise} custom={index + 1}>
            <ServiceCard service={service} />
          </motion.div>
        ))}
      </motion.div>
    </>
  )
}
