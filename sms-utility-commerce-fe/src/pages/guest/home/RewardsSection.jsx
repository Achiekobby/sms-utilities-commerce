import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { selectIsVerified } from '../../../features/auth/authSlice'
import { paths } from '../../../routes/paths'
import Images from '../../../utils/Images'
import { GiftIcon } from './icons'
import { ease, stepVariants } from './motion'

const rewardCapabilities = [
  'Launch custom surveys',
  'Collect responses in real time',
  'Reward successful submissions',
  'Run promotions and birthday offers',
]

const rewardTypes = ['Data', 'Airtime', 'Money']

const rewardSteps = [
  {
    index: '01',
    title: 'Launch a survey',
    text: 'Send it to a contact group by SMS and let people answer from their phones.',
  },
  {
    index: '02',
    title: 'Collect responses',
    text: 'Watch answers come in live, with delivery status and response counts as they happen.',
  },
  {
    index: '03',
    title: 'Reward participation',
    text: 'Successful submissions earn data, airtime, or money, paid from the wallet.',
  },
]

function RewardsVisual({ reduce }) {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <span aria-hidden="true" className="absolute inset-[6%] rounded-full bg-green/[0.07]" />
      <motion.img
        src={Images.customer_rewards}
        alt=""
        className="relative mx-auto w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: reduce ? 0 : 0.8, ease }}
      />
    </div>
  )
}

export function RewardsSection() {
  const isVerified = useSelector(selectIsVerified)
  const reduce = useReducedMotion()
  const surveyPath = isVerified ? paths.app : paths.signup

  return (
    <section id="rewards" className="scroll-mt-16 border-t border-ink/10 bg-white">
      <div className="mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green text-white">
                <GiftIcon size={24} />
              </span>
              <p className="text-xs font-semibold tracking-[0.16em] text-ink/45">
                REWARDS & SURVEYS
              </p>
            </div>
            <h2 className="mt-5 max-w-xl text-4xl leading-[1.12] font-bold tracking-tight text-balance text-navy sm:text-5xl lg:text-6xl">
              Engage. Earn. Grow.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink/65 lg:text-lg lg:leading-8">
              Create surveys, run promotions, and reward your customers for taking part.
            </p>
            <motion.ul
              className="mt-7 max-w-xl space-y-3 border-t border-ink/10 pt-6"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.5 }}
              variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.08 } } }}
            >
              {rewardCapabilities.map((item) => (
                <motion.li
                  key={item}
                  variants={stepVariants}
                  className="flex items-center gap-3 text-sm font-medium text-navy sm:text-base"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green text-white">
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                  </span>
                  {item}
                </motion.li>
              ))}
            </motion.ul>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm text-ink/55">Rewards paid in</span>
              {rewardTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-md bg-green/10 px-2.5 py-1 text-sm font-semibold text-green"
                >
                  {type}
                </span>
              ))}
            </div>
            <Link
              to={surveyPath}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue px-6 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              Create Survey
              <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
            </Link>
          </div>
          <RewardsVisual reduce={reduce} />
        </div>

        <div className="relative mt-14 lg:mt-16">
          <p className="text-xs font-semibold tracking-[0.16em] text-ink/45">HOW A SURVEY RUNS</p>
          <div className="relative mt-6">
            <motion.span
              aria-hidden="true"
              className="absolute top-0 right-0 left-0 hidden h-px origin-left bg-green/30 lg:block"
              initial={{ scaleX: reduce ? 1 : 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: reduce ? 0 : 0.9, ease }}
            />
            <motion.ol
              className="grid gap-8 sm:grid-cols-3 lg:gap-10 lg:pt-6"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.1 } } }}
            >
              {rewardSteps.map((step) => (
                <motion.li key={step.index} variants={stepVariants}>
                  <p className="text-sm font-semibold tracking-wide text-green">{step.index}</p>
                  <p className="mt-2 text-base font-semibold text-navy">{step.title}</p>
                  <p className="mt-1.5 text-sm leading-6 text-ink/65">{step.text}</p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </div>
      </div>
    </section>
  )
}
