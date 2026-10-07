import { motion, useReducedMotion } from 'framer-motion'
import { ease, stepVariants } from './motion'

const journeySteps = [
  {
    title: 'Contacts',
    detail: 'Group, upload, birthdays',
    ring: 'ring-navy',
  },
  {
    title: 'Fund',
    detail: 'Wallet or pay directly',
    ring: 'ring-green',
  },
  {
    title: 'Run',
    detail: 'From one platform',
    ring: 'ring-blue',
    channels: true,
  },
  {
    title: 'Track',
    detail: 'Delivery and results',
    ring: 'ring-navy',
  },
]

const journeyChannels = [
  { label: 'SMS', className: 'text-blue' },
  { label: 'Utilities', className: 'text-green' },
  { label: 'Rewards', className: 'text-green' },
]

function JourneyChannels({ reduce }) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-[11px] font-semibold sm:justify-center">
      {journeyChannels.map((channel, index) => (
        <span key={channel.label} className="inline-flex items-center gap-x-1.5">
          <motion.span
            className={channel.className}
            animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }}
            transition={
              reduce
                ? undefined
                : { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }
            }
          >
            {channel.label}
          </motion.span>
          {index < journeyChannels.length - 1 ? (
            <span className="text-ink/30" aria-hidden="true">
              ·
            </span>
          ) : null}
        </span>
      ))}
    </p>
  )
}

export function Journey() {
  const reduce = useReducedMotion()

  return (
    <div className="relative mx-auto mt-10 max-w-4xl sm:mt-12">
      <div
        className="pointer-events-none absolute top-[5px] right-[12.5%] left-[12.5%] hidden h-px bg-ink/15 sm:block"
        aria-hidden="true"
      >
        <motion.span
          className="absolute inset-0 origin-left bg-blue"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease }}
        />
        {reduce ? null : (
          <motion.span
            className="absolute top-0 size-2 rounded-full bg-blue ring-2 ring-white"
            initial={{ left: '0%' }}
            animate={{ left: ['0%', '100%'], x: '-50%', y: '-50%' }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'linear', delay: 0.9 }}
          />
        )}
      </div>
      <motion.ol
        aria-label="How the platform connects"
        className="space-y-5 border-l border-ink/15 pl-5 sm:grid sm:grid-cols-4 sm:space-y-0 sm:border-0 sm:pl-0"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
      >
        {journeySteps.map((step) => (
          <motion.li key={step.title} variants={stepVariants} className="relative sm:text-center">
            <span
              className={`absolute top-1 left-[-1.55rem] size-2.5 rounded-full bg-white ring-2 sm:static sm:mx-auto sm:block ${step.ring}`}
            />
            <p className="text-sm font-semibold text-navy sm:mt-3">{step.title}</p>
            <p className="mt-1 text-xs leading-4 text-ink/60">{step.detail}</p>
            {step.channels ? <JourneyChannels reduce={reduce} /> : null}
          </motion.li>
        ))}
      </motion.ol>
    </div>
  )
}
