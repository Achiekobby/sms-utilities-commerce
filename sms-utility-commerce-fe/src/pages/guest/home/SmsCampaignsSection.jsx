import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { selectIsVerified } from '../../../features/auth/authSlice'
import { paths } from '../../../routes/paths'
import Images from '../../../utils/Images'
import { ease, stepVariants } from './motion'

const campaignSteps = [
  {
    index: '01',
    title: 'Build the list',
    text: 'Create a contact group, upload numbers, and keep birthdays on each record.',
  },
  {
    index: '02',
    title: 'Choose the sender',
    text: 'Send from an ID people already know. There is no limit on sender IDs.',
  },
  {
    index: '03',
    title: 'Send it',
    text: 'Blast the list now or schedule it. Personalize each message, including birthday promotions.',
  },
  {
    index: '04',
    title: 'Track delivery',
    text: 'Follow delivery status, responses, and how the campaign performed.',
  },
]

const smsCapabilities = [
  'Bulk SMS',
  'Scheduled SMS',
  'Personalization',
  'Delivery tracking',
  'Multiple sender IDs',
  'Birthday messages',
]

export function SmsCampaignsSection() {
  const isVerified = useSelector(selectIsVerified)
  const reduce = useReducedMotion()
  const campaignPath = isVerified ? paths.app : paths.signup

  return (
    <section id="sms-campaigns" className="scroll-mt-16 border-t border-ink/10 bg-canvas">
      <div className="mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M5 3h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-7l-5 4v-4H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z"
                  />
                  <rect x="6" y="7.6" width="10" height="1.7" rx="0.85" fill="#D6E6FF" />
                  <rect x="6" y="11" width="6.5" height="1.7" rx="0.85" fill="#00C078" />
                </svg>
              </span>
              <p className="text-xs font-semibold tracking-[0.16em] text-ink/45">SMS CAMPAIGNS</p>
            </div>
            <h2 className="mt-5 max-w-xl text-4xl leading-[1.12] font-bold tracking-tight text-balance text-navy sm:text-5xl lg:text-6xl">
              Reach More People with SMS Campaigns.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink/65 lg:text-lg lg:leading-8">
              High-volume messaging you can send in bulk, schedule, and personalize, then follow
              through to delivery.
            </p>
            <motion.ul
              className="mt-7 grid max-w-xl gap-x-6 gap-y-3 border-t border-ink/10 pt-6 sm:grid-cols-2"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.5 }}
              variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.07 } } }}
            >
              {smsCapabilities.map((item) => (
                <motion.li
                  key={item}
                  variants={stepVariants}
                  className="flex items-center gap-2.5 text-sm font-medium text-navy"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green text-white">
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                  </span>
                  {item}
                </motion.li>
              ))}
            </motion.ul>
            <Link
              to={campaignPath}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-green px-6 py-3 text-sm font-semibold text-white hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              Create Campaign
              <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
            </Link>
          </div>
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <span
              aria-hidden="true"
              className="absolute inset-[6%] rounded-full bg-blue/[0.07]"
            />
            <img src={Images.sms_campaign} alt="" className="relative mx-auto w-full" />
          </div>
        </div>

        <div className="relative mt-14 lg:mt-16">
          <p className="text-xs font-semibold tracking-[0.16em] text-ink/45">HOW A CAMPAIGN RUNS</p>
          <div className="relative mt-6">
            <motion.span
              aria-hidden="true"
              className="absolute top-0 right-0 left-0 hidden h-px origin-left bg-blue/25 lg:block"
              initial={{ scaleX: reduce ? 1 : 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: reduce ? 0 : 0.9, ease }}
            />
            <motion.ol
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 lg:pt-6"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.1 } } }}
            >
              {campaignSteps.map((step) => (
                <motion.li key={step.index} variants={stepVariants}>
                  <p className="text-sm font-semibold tracking-wide text-blue">{step.index}</p>
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
