import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { ArrowRight, Check, Minus, Plus, Sparkles } from 'lucide-react'
import { useId, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { selectIsVerified } from '../../features/auth/authSlice'
import { paths } from '../../routes/paths'
import Images from '../../utils/Images'

const ease = [0.22, 1, 0.36, 1]
const yearlyDiscount = 20

// Illustrative figures until real rate cards are signed off.
const plans = [
  {
    id: 'free',
    name: 'Free',
    audience: 'Try the platform with no commitment.',
    monthly: 0,
    yearly: 0,
    rate: 'GH₵0.070',
    cta: 'Start for free',
    intro: 'What you get',
    accent: '#008859',
    perks: [
      '50 SMS credits on signup',
      '100 contacts in 1 group',
      'Shared sender ID',
      'Delivery status for every message',
      'Fund your wallet by MoMo or card',
      'Help center support',
    ],
    standout: {
      title: 'No card. No expiry.',
      text: 'Stay on Free as long as you like. Nothing to enter at signup.',
    },
  },
  {
    id: 'individual',
    name: 'Individual',
    audience: 'For one person messaging their own circle.',
    monthly: 29,
    yearly: 23,
    rate: 'GH₵0.055',
    cta: 'Choose Individual',
    intro: 'Everything in Free, plus',
    accent: '#0B63F6',
    perks: [
      '300 SMS credits every month',
      '2,000 contacts in 10 groups',
      'Scheduled SMS',
      'Personalization and birthday messages',
      'Airtime, data, TV, ECG and water',
      'Email support',
    ],
    standout: {
      title: 'Your own sender ID',
      text: 'Messages arrive under your name instead of a shared one.',
    },
  },
  {
    id: 'business',
    name: 'Business',
    audience: 'For teams running campaigns every week.',
    monthly: 129,
    yearly: 103,
    rate: 'GH₵0.045',
    cta: 'Choose Business',
    intro: 'Everything in Individual, plus',
    accent: '#8EC1FF',
    featured: true,
    perks: [
      '3,000 SMS credits every month',
      '25,000 contacts, unlimited groups',
      'Up to 5 sender IDs',
      'Real-time analytics and reports',
      '5 team seats with roles',
      'Bulk airtime and data discounts',
      'Priority chat support',
    ],
    standout: {
      title: 'Surveys that pay out',
      text: 'Reward respondents with airtime, data, or money the moment they submit.',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    audience: 'For organizations with volume and compliance needs.',
    custom: true,
    from: 899,
    rate: 'From GH₵0.035',
    cta: 'Talk to sales',
    intro: 'Everything in Business, plus',
    accent: '#0B1F5B',
    perks: [
      'Custom SMS volume and wholesale rates',
      'Unlimited contacts and sender IDs',
      'Unlimited seats, SSO and audit log',
      'Onboarding and staff training',
      '99.9% uptime SLA',
    ],
    standout: {
      title: 'Utilities API and a named manager',
      text: 'Sell airtime, data and bills from your own systems, with one person who knows your account.',
    },
  },
]

const comparison = [
  { label: 'Monthly SMS credits', values: ['50 once', '300', '3,000', 'Custom'] },
  { label: 'Rate per SMS after credits', values: ['GH₵0.070', 'GH₵0.055', 'GH₵0.045', 'From GH₵0.035'] },
  { label: 'Contacts', values: ['100', '2,000', '25,000', 'Unlimited'] },
  { label: 'Contact groups', values: ['1', '10', 'Unlimited', 'Unlimited'] },
  { label: 'Sender IDs', values: ['Shared', '1', '5', 'Unlimited'] },
  { label: 'Scheduled SMS', values: [false, true, true, true] },
  { label: 'Personalization and birthdays', values: [false, true, true, true] },
  { label: 'Airtime, data and bill payments', values: [true, true, true, true] },
  { label: 'Bulk utility discounts', values: [false, false, true, true] },
  { label: 'Survey responses per month', values: [false, '100', 'Unlimited', 'Unlimited'] },
  { label: 'Automatic survey rewards', values: [false, false, true, true] },
  { label: 'Analytics', values: ['Basic', 'Basic', 'Real time', 'Custom exports'] },
  { label: 'Team seats', values: ['1', '1', '5', 'Unlimited'] },
  { label: 'API and webhooks', values: [false, false, false, true] },
  { label: 'Support', values: ['Help center', 'Email', 'Priority chat', 'Dedicated manager'] },
  { label: 'Uptime SLA', values: [false, false, false, '99.9%'] },
]

const faqs = [
  {
    q: 'Do I need a card to start?',
    a: 'No. The Free plan needs no payment details. You can fund your wallet by MoMo or card whenever you are ready to send more.',
  },
  {
    q: 'How do SMS and utility purchases get paid for?',
    a: 'From your wallet. Plans give you monthly credits and features, and anything beyond your credits, plus airtime, data and bills, is paid from the wallet at the rate for your plan.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes. Upgrades apply immediately. Downgrades take effect at the end of your billing period so you keep what you paid for.',
  },
  {
    q: 'Do unused SMS credits roll over?',
    a: 'Monthly plan credits reset each billing cycle. Your wallet balance never expires.',
  },
  {
    q: 'Do the prices include VAT?',
    a: 'Prices are shown before VAT and applicable levies, which are added at checkout.',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: 0.1 + i * 0.09 } }),
}

function BillingToggle({ yearly, onChange }) {
  const group = useId()
  const options = [
    { id: false, label: 'Monthly' },
    { id: true, label: 'Yearly' },
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div
        role="radiogroup"
        aria-label="Billing period"
        className="relative inline-grid grid-cols-2 rounded-xl bg-ink/[0.06] p-1"
      >
        {options.map((option) => {
          const active = option.id === yearly

          return (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.id)}
              className="relative min-w-28 rounded-lg px-5 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              {active ? (
                <motion.span
                  layoutId={`${group}-pill`}
                  className="absolute inset-0 rounded-lg bg-white shadow-[0_1px_2px_rgba(16,33,61,0.12),0_4px_10px_-2px_rgba(16,33,61,0.12)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span
                className={`relative transition-colors duration-200 ${
                  active ? 'text-navy' : 'text-ink/55 hover:text-ink'
                }`}
              >
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
      <span className="rounded-md bg-green/10 px-2.5 py-1 text-xs font-semibold text-green">
        Save {yearlyDiscount}% yearly
      </span>
    </div>
  )
}

function Price({ plan, yearly }) {
  if (plan.custom) {
    return (
      <div>
        <p className="text-4xl font-bold tracking-tight">Custom</p>
        <p className="mt-1 text-sm opacity-65">From GH₵{plan.from} per month</p>
      </div>
    )
  }

  const value = yearly ? plan.yearly : plan.monthly

  return (
    <div>
      <p className="flex items-baseline gap-1">
        <span className="text-lg font-semibold opacity-70">GH₵</span>
        <span className="relative inline-flex h-12 overflow-hidden text-5xl leading-[3rem] font-bold tracking-tight">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -28, opacity: 0 }}
              transition={{ duration: 0.3, ease }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="text-sm opacity-65">/ month</span>
      </p>
      <p className="mt-1 min-h-5 text-sm opacity-65">
        {plan.monthly === 0
          ? 'Free forever'
          : yearly
            ? `GH₵${plan.yearly * 12} billed yearly`
            : 'Billed monthly'}
      </p>
    </div>
  )
}

function PlanCard({ plan, index, yearly, ctaTo }) {
  const dark = Boolean(plan.featured)

  return (
    <motion.article
      variants={cardVariants}
      custom={index}
      className={`relative flex flex-col rounded-2xl p-6 transition-shadow duration-300 sm:p-7 ${
        dark
          ? 'bg-navy text-white shadow-[0_28px_60px_-20px_rgba(11,31,91,0.65)] lg:-my-3 lg:py-10'
          : 'bg-white text-ink shadow-[0_2px_4px_rgba(16,33,61,0.04),0_14px_30px_-10px_rgba(16,33,61,0.14)] ring-1 ring-ink/8 hover:shadow-[0_2px_4px_rgba(16,33,61,0.04),0_22px_44px_-12px_rgba(16,33,61,0.22)]'
      }`}
    >
      {dark ? (
        <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-green px-3 py-1 text-xs font-semibold text-white">
          <Sparkles size={12} strokeWidth={2.3} aria-hidden="true" />
          Most popular
        </span>
      ) : null}

      <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-navy'}`}>{plan.name}</h2>
      <p className={`mt-1 min-h-10 text-sm leading-5 ${dark ? 'text-white/70' : 'text-ink/60'}`}>
        {plan.audience}
      </p>

      <div className={`mt-6 ${dark ? 'text-white' : 'text-navy'}`}>
        <Price plan={plan} yearly={yearly} />
      </div>
      <p className={`mt-3 text-xs font-medium ${dark ? 'text-white/60' : 'text-ink/50'}`}>
        SMS from {plan.rate.replace('From ', '')} each
      </p>

      <Link
        to={ctaTo}
        className={`group mt-6 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue ${
          dark
            ? 'bg-white text-navy hover:bg-white/90'
            : plan.id === 'free'
              ? 'bg-green text-white hover:bg-[#006B46]'
              : 'bg-navy/[0.06] text-navy hover:bg-navy/10'
        }`}
      >
        {plan.cta}
        <ArrowRight
          size={16}
          strokeWidth={2.4}
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </Link>

      <p
        className={`mt-7 border-t pt-5 text-xs font-semibold tracking-[0.12em] uppercase ${
          dark ? 'border-white/15 text-white/60' : 'border-ink/10 text-ink/45'
        }`}
      >
        {plan.intro}
      </p>
      <ul className="mt-4 space-y-3">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-3 text-sm leading-5">
            <span
              className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${
                dark ? 'bg-white text-navy' : 'bg-green text-white'
              }`}
            >
              <Check size={10} strokeWidth={3.5} aria-hidden="true" />
            </span>
            <span className={dark ? 'text-white/90' : 'text-ink/80'}>{perk}</span>
          </li>
        ))}
      </ul>

      <div
        className={`mt-auto rounded-xl p-4 pt-4 ${dark ? 'bg-white/10' : ''}`}
        style={dark ? undefined : { backgroundColor: `${plan.accent}12` }}
      >
        <p
          className="text-[11px] font-semibold tracking-[0.14em] uppercase"
          style={{ color: plan.accent }}
        >
          Standout perk
        </p>
        <p className={`mt-1.5 text-sm font-semibold ${dark ? 'text-white' : 'text-navy'}`}>
          {plan.standout.title}
        </p>
        <p className={`mt-1 text-sm leading-5 ${dark ? 'text-white/70' : 'text-ink/65'}`}>
          {plan.standout.text}
        </p>
      </div>
    </motion.article>
  )
}

function Cell({ value, featured }) {
  if (value === true) {
    return (
      <span className="inline-flex size-5 items-center justify-center rounded-full bg-green text-white">
        <Check size={12} strokeWidth={3.5} aria-label="Included" />
      </span>
    )
  }

  if (value === false) {
    return <Minus size={16} className="mx-auto text-ink/25" aria-label="Not included" />
  }

  return (
    <span className={`text-sm ${featured ? 'font-semibold text-navy' : 'text-ink/75'}`}>{value}</span>
  )
}

function Comparison() {
  return (
    <section aria-labelledby="compare-heading" className="mt-24">
      <h2 id="compare-heading" className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
        Compare every detail
      </h2>
      <p className="mt-3 max-w-xl text-base leading-7 text-ink/65">
        The same wallet powers every plan. What changes is volume, control, and support.
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-[0_2px_4px_rgba(16,33,61,0.04),0_14px_30px_-10px_rgba(16,33,61,0.12)] ring-1 ring-ink/8">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <caption className="sr-only">Plan comparison</caption>
          <thead>
            <tr className="border-b border-ink/10">
              <th scope="col" className="w-[28%] px-5 py-4 text-xs font-semibold tracking-[0.12em] text-ink/45 uppercase">
                Feature
              </th>
              {plans.map((plan) => (
                <th
                  key={plan.id}
                  scope="col"
                  className={`px-4 py-4 text-center text-sm font-bold ${
                    plan.featured ? 'bg-blue/[0.07] text-blue' : 'text-navy'
                  }`}
                >
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr key={row.label} className="border-b border-ink/6 last:border-0">
                <th scope="row" className="px-5 py-3.5 text-sm font-medium text-navy">
                  {row.label}
                </th>
                {row.values.map((value, index) => (
                  <td
                    key={plans[index].id}
                    className={`px-4 py-3.5 text-center ${plans[index].featured ? 'bg-blue/[0.04]' : ''}`}
                  >
                    <Cell value={value} featured={plans[index].featured} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function FaqItem({ item, open, onToggle }) {
  const panelId = useId()

  return (
    <div className="border-b border-ink/10">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-6 py-5 text-left text-base font-semibold text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          {item.q}
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.25, ease }}
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue"
          >
            <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-6 text-ink/70">{item.a}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export function PricingPage() {
  const isVerified = useSelector(selectIsVerified)
  const [yearly, setYearly] = useState(true)
  const [openFaq, setOpenFaq] = useState(0)
  const startPath = isVerified ? paths.app : paths.signup

  return (
    <MotionConfig reducedMotion="user">
      <main>
        <section className="relative overflow-hidden">
          <img
            src={Images.hero_background}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="relative mx-auto max-w-8xl px-4 pt-14 pb-24 sm:px-6 lg:pt-20">
            <motion.div
              className="mx-auto max-w-3xl text-center"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
            >
              <p className="text-xs font-semibold tracking-[0.16em] text-ink/45">PRICING</p>
              <h1 className="mt-4 text-4xl leading-[1.1] font-bold tracking-tight text-balance text-navy sm:text-5xl lg:text-6xl">
                Plans that grow with <span className="text-blue">your audience</span>.
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-ink/65 lg:text-lg">
                Prices in Ghana cedis. Start free, pay from your wallet by MoMo or card, and move up
                when you need more reach.
              </p>
              <div className="mt-8">
                <BillingToggle yearly={yearly} onChange={setYearly} />
              </div>
            </motion.div>

            <motion.div
              className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:items-stretch lg:gap-5"
              initial="hidden"
              animate="show"
            >
              {plans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  index={index}
                  yearly={yearly}
                  ctaTo={plan.custom ? paths.help : startPath}
                />
              ))}
            </motion.div>

            <p className="mt-8 text-center text-sm text-ink/55">
              Prices are before VAT and applicable levies. SMS and utility usage is paid from your
              wallet.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-8xl px-4 pb-24 sm:px-6">
          <Comparison />

          <section aria-labelledby="faq-heading" className="mt-24 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <h2 id="faq-heading" className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                Questions, answered
              </h2>
              <p className="mt-3 max-w-sm text-base leading-7 text-ink/65">
                Not sure which plan fits? Tell us what you send and to whom, and we will point you to
                the right one.
              </p>
              <Link
                to={paths.help}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
              >
                Talk to us
                <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
              </Link>
            </div>
            <div className="border-t border-ink/10">
              {faqs.map((item, index) => (
                <FaqItem
                  key={item.q}
                  item={item}
                  open={openFaq === index}
                  onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </MotionConfig>
  )
}
