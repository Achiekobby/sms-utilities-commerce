import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { ArrowRight, Check, Minus, Plus, Star } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { selectIsVerified } from '../../features/auth/authSlice'
import { apiErrorMessage } from '../../features/auth/client'
import { paths } from '../../routes/paths'
import { useGetClientPlansQuery } from '../../services/api/plans/plansApi'
import Images from '../../utils/Images'
import { formatCount } from '../customer/dashboard/format'
import {
  billingPeriodsFromPlans,
  comparisonSections,
  durationLabel,
  isNonExpiryPeriod,
  mapClientPlans,
  maxSavingsPercent,
  planPerks,
  planPrice,
  planStandout,
} from './pricingModel'

const ease = [0.22, 1, 0.36, 1]

const faqs = [
  {
    q: 'Do I need a card to start?',
    a: 'No. You can explore Cellogent first, then subscribe or fund your wallet by MoMo or card when you are ready to send.',
  },
  {
    q: 'How do SMS purchases get paid for?',
    a: 'Plan subscriptions are paid at checkout (for example Paystack). Your wallet is separate and covers other sends and utilities beyond your package units.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes. Move up when you need more units, or switch duration when a longer package saves you more.',
  },
  {
    q: 'Do unused SMS units expire?',
    a: 'Timed packages follow their billing period. Non-expiry packages keep their SMS units until you use them. Your wallet balance never expires.',
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

function BillingToggle({ periods, value, onChange, savings }) {
  const group = useId()
  const savingsLabel = isNonExpiryPeriod(value)
    ? `Save up to ${savings}% vs monthly rates`
    : `Save up to ${savings}% on longer plans`

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="radiogroup"
        aria-label="Billing period"
        className="relative flex max-w-full flex-wrap justify-center gap-1 rounded-xl bg-ink/[0.06] p-1"
      >
        {periods.map((option) => {
          const active = option === value

          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option)}
              className="relative min-w-[5.5rem] rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue sm:min-w-28 sm:px-5"
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
                {durationLabel(option)}
              </span>
            </button>
          )
        })}
      </div>
      {savings > 0 ? (
        <span className="rounded-md bg-green/10 px-2.5 py-1 text-xs font-semibold text-green">
          {savingsLabel}
        </span>
      ) : isNonExpiryPeriod(value) ? (
        <span className="rounded-md bg-blue/10 px-2.5 py-1 text-xs font-semibold text-blue">
          Units never expire
        </span>
      ) : null}
    </div>
  )
}

function Price({ plan, period }) {
  const selected = planPrice(plan, period)
  const monthly = selected.months > 0 ? selected.price / selected.months : selected.price

  return (
    <div>
      <p className="flex items-baseline gap-1">
        <span className="text-sm font-semibold opacity-70">GH₵</span>
        <span className="relative inline-flex h-9 overflow-hidden text-3xl leading-9 font-bold tracking-tight">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={`${selected.price}-${selected.months}-${selected.nonExpiry}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease }}
            >
              {formatCount(selected.price)}
            </motion.span>
          </AnimatePresence>
        </span>
      </p>
      <p className="mt-1 min-h-4 text-[12px] leading-4 opacity-65">
        {selected.nonExpiry
          ? 'One-time purchase · never expires'
          : selected.months === 1
            ? 'Billed monthly'
            : `GH₵${monthly % 1 === 0 ? formatCount(monthly) : monthly.toFixed(2)} / month equivalent`}
      </p>
    </div>
  )
}

function PlanCard({ plan, index, period, ctaTo }) {
  const dark = Boolean(plan.featured)
  const selected = planPrice(plan, period)
  const perks = planPerks(plan, period)
  const standout = planStandout(plan, period)

  return (
    <motion.article
      variants={cardVariants}
      custom={index}
      className={`relative flex flex-col rounded-2xl p-4 transition-shadow duration-300 sm:p-5 ${
        dark
          ? 'bg-navy text-white shadow-[0_28px_60px_-20px_rgba(11,31,91,0.65)] lg:-my-1 lg:py-6'
          : 'bg-white text-ink shadow-[0_2px_4px_rgba(16,33,61,0.04),0_14px_30px_-10px_rgba(16,33,61,0.14)] ring-1 ring-ink/8 hover:shadow-[0_2px_4px_rgba(16,33,61,0.04),0_22px_44px_-12px_rgba(16,33,61,0.22)]'
      }`}
    >
      {dark ? (
        <span className="absolute -top-2.5 left-5 inline-flex items-center gap-1 rounded-full bg-green px-2.5 py-0.5 text-[11px] font-semibold text-white">
          <Star size={11} strokeWidth={2.3} aria-hidden="true" fill="currentColor" />
          Most popular
        </span>
      ) : null}

      <h2 className={`text-base font-bold sm:text-lg ${dark ? 'text-white' : 'text-navy'}`}>{plan.name}</h2>
      <p className={`mt-1 min-h-8 text-[13px] leading-4 ${dark ? 'text-white/70' : 'text-ink/60'}`}>
        {plan.audience}
      </p>

      <div className={`mt-4 ${dark ? 'text-white' : 'text-navy'}`}>
        <Price plan={plan} period={period} />
      </div>
      <p className={`mt-2 text-[11px] font-medium ${dark ? 'text-white/60' : 'text-ink/50'}`}>
        {formatCount(selected.units)} SMS units
        {selected.nonExpiry ? ' · never expire' : ` · from ${plan.rate} each`}
      </p>

      <Link
        to={ctaTo}
        className={`group mt-4 flex h-10 items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue ${
          dark ? 'bg-white text-navy hover:bg-white/90' : 'bg-navy/[0.06] text-navy hover:bg-navy/10'
        }`}
      >
        {plan.cta}
        <ArrowRight
          size={15}
          strokeWidth={2.4}
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </Link>

      <p
        className={`mt-5 border-t pt-4 text-[11px] font-semibold tracking-[0.1em] uppercase ${
          dark ? 'border-white/15 text-white/60' : 'border-ink/10 text-ink/45'
        }`}
      >
        {plan.intro}
      </p>
      <ul className="mt-3 space-y-2">
        {perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-[13px] leading-4">
            <span
              className={`mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full ${
                dark ? 'bg-white text-navy' : 'bg-green text-white'
              }`}
            >
              <Check size={9} strokeWidth={3.5} aria-hidden="true" />
            </span>
            <span className={dark ? 'text-white/90' : 'text-ink/80'}>{perk}</span>
          </li>
        ))}
      </ul>

      <div
        className={`mt-auto rounded-xl p-3 ${dark ? 'bg-white/10' : ''}`}
        style={dark ? undefined : { backgroundColor: `${plan.accent}12` }}
      >
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: plan.accent }}>
          Standout perk
        </p>
        <p className={`mt-1 text-[13px] font-semibold ${dark ? 'text-white' : 'text-navy'}`}>{standout.title}</p>
        <p className={`mt-1 text-[12px] leading-4 ${dark ? 'text-white/70' : 'text-ink/65'}`}>{standout.text}</p>
      </div>
    </motion.article>
  )
}

function Cell({ value, featured }) {
  const text = typeof value === 'object' && value != null ? value.text : value
  const best = typeof value === 'object' && value != null ? Boolean(value.best) : false

  if (text === true) {
    return (
      <span className="inline-flex size-5 items-center justify-center rounded-full bg-green text-white">
        <Check size={12} strokeWidth={3.5} aria-label="Included" />
      </span>
    )
  }

  if (text === false) {
    return <Minus size={16} className="mx-auto text-ink/25" aria-label="Not included" />
  }

  return (
    <span
      className={`inline-flex flex-col items-center gap-1 text-sm ${
        best
          ? 'font-bold text-green'
          : featured
            ? 'font-semibold text-navy'
            : 'font-medium text-ink/75'
      }`}
    >
      <span>{text}</span>
      {best ? (
        <span className="rounded-full bg-green/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-green uppercase">
          Best
        </span>
      ) : null}
    </span>
  )
}

function Comparison({ plans, period, ctaTo }) {
  const sections = comparisonSections(plans, period)

  return (
    <section aria-labelledby="compare-heading" className="mt-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.16em] text-ink/45 uppercase">Side by side</p>
          <h2 id="compare-heading" className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Compare every detail
          </h2>
          <p className="mt-3 text-base leading-7 text-ink/65">
            Switch the billing period above, then compare units, pricing, and flexibility for that
            package. Packages are paid at checkout; wallet top-ups cover other usage.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-ink/10 bg-white px-3.5 py-2 text-sm font-semibold text-navy shadow-[0_1px_2px_rgba(16,33,61,0.04)] sm:self-auto">
          Viewing {durationLabel(period)}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="mt-8 grid gap-4 md:hidden">
        {plans.map((plan) => {
          const selected = planPrice(plan, period)
          return (
            <article
              key={plan.id}
              className={`rounded-2xl bg-white p-5 shadow-[0_2px_4px_rgba(16,33,61,0.04),0_14px_30px_-10px_rgba(16,33,61,0.12)] ring-1 ${
                plan.featured ? 'ring-blue/30' : 'ring-ink/8'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-navy">{plan.name}</h3>
                    {plan.featured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green px-2.5 py-0.5 text-[11px] font-semibold text-white">
                        <Star size={11} fill="currentColor" aria-hidden="true" />
                        Popular
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-ink/60">{plan.audience}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-navy">GH₵{formatCount(selected.price)}</p>
                  <p className="text-[12px] text-ink/50">
                    {selected.nonExpiry ? 'Never expires' : durationLabel(period)}
                  </p>
                </div>
              </div>

              <dl className="mt-4 space-y-2.5 border-t border-ink/8 pt-4">
                {sections.flatMap((section) =>
                  section.rows.map((row) => {
                    const value = row.values[plans.findIndex((item) => item.id === plan.id)]
                    const text = typeof value === 'object' ? value.text : value
                    return (
                      <div key={`${plan.id}-${row.id}`} className="flex items-start justify-between gap-3">
                        <dt className="text-[13px] text-ink/55">{row.label}</dt>
                        <dd className="text-right text-sm font-semibold text-navy">
                          {text === true ? 'Included' : text === false ? '—' : text}
                        </dd>
                      </div>
                    )
                  }),
                )}
              </dl>

              <Link
                to={ctaTo}
                className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-navy/[0.06] text-sm font-semibold text-navy hover:bg-navy/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                {plan.cta}
                <ArrowRight size={15} strokeWidth={2.4} aria-hidden="true" />
              </Link>
            </article>
          )
        })}
      </div>

      {/* Desktop / tablet table */}
      <div className="mt-8 hidden overflow-hidden rounded-2xl bg-white shadow-[0_2px_4px_rgba(16,33,61,0.04),0_14px_30px_-10px_rgba(16,33,61,0.12)] ring-1 ring-ink/8 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <caption className="sr-only">Plan comparison for {durationLabel(period)}</caption>
            <thead>
              <tr className="border-b border-ink/10">
                <th
                  scope="col"
                  className="sticky left-0 z-[1] w-[24%] bg-[#F7FAFD] px-5 py-5 text-xs font-semibold tracking-[0.12em] text-ink/45 uppercase"
                >
                  Feature
                </th>
                {plans.map((plan) => {
                  const selected = planPrice(plan, period)
                  return (
                    <th
                      key={plan.id}
                      scope="col"
                      className={`min-w-[10rem] px-4 py-5 text-center ${
                        plan.featured ? 'bg-blue/[0.07]' : 'bg-[#F7FAFD]'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        {plan.featured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green px-2.5 py-0.5 text-[10px] font-semibold text-white">
                            <Star size={10} fill="currentColor" aria-hidden="true" />
                            Most popular
                          </span>
                        ) : (
                          <span className="h-5" aria-hidden="true" />
                        )}
                        <span className={`text-base font-bold ${plan.featured ? 'text-blue' : 'text-navy'}`}>
                          {plan.name}
                        </span>
                        <span className="text-lg font-bold tracking-tight text-navy">
                          GH₵{formatCount(selected.price)}
                        </span>
                        <span className="text-[12px] font-medium text-ink/50">
                          {formatCount(selected.units)} units
                          {selected.nonExpiry ? ' · no expiry' : ''}
                        </span>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <FragmentSection key={section.id} section={section} plans={plans} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function FragmentSection({ section, plans }) {
  return (
    <>
      <tr className="border-b border-ink/8 bg-[#F3F7FD]/70">
        <th
          colSpan={plans.length + 1}
          scope="colgroup"
          className="sticky left-0 px-5 py-3 text-left"
        >
          <p className="text-[13px] font-bold text-navy">{section.title}</p>
          <p className="mt-0.5 text-[12px] font-medium text-ink/50">{section.description}</p>
        </th>
      </tr>
      {section.rows.map((row) => (
        <tr key={row.id} className="border-b border-ink/6 last:border-0">
          <th
            scope="row"
            className="sticky left-0 z-[1] bg-white px-5 py-4 text-left align-top shadow-[1px_0_0_rgba(16,33,61,0.04)]"
          >
            <span className="block text-sm font-semibold text-navy">{row.label}</span>
            {row.hint ? <span className="mt-1 block text-[12px] font-medium leading-4 text-ink/45">{row.hint}</span> : null}
          </th>
          {row.values.map((value, index) => (
            <td
              key={`${plans[index].id}-${row.id}`}
              className={`px-4 py-4 text-center align-middle ${plans[index].featured ? 'bg-blue/[0.03]' : ''}`}
            >
              <Cell value={value} featured={plans[index].featured} />
            </td>
          ))}
        </tr>
      ))}
    </>
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

function PlansSkeleton() {
  return (
    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[28rem] animate-pulse rounded-2xl bg-white/70 ring-1 ring-ink/8"
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export function PricingPage() {
  const isVerified = useSelector(selectIsVerified)
  const { data, isLoading, isError, error, refetch, isFetching } = useGetClientPlansQuery()
  const plans = useMemo(() => mapClientPlans(data?.data), [data?.data])
  const billingPeriods = useMemo(() => billingPeriodsFromPlans(plans), [plans])
  const [period, setPeriod] = useState(1)
  const selectedPeriod = billingPeriods.includes(period) ? period : (billingPeriods[0] ?? 1)
  const [openFaq, setOpenFaq] = useState(0)
  const startPath = isVerified ? paths.app : paths.signup
  const savings = maxSavingsPercent(plans, selectedPeriod)
  const waiting = isLoading || (isFetching && !plans.length)

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
                Prices in Ghana cedis. Choose a package of SMS units, pay securely at checkout, and
                move up when you need more reach.
              </p>
              {plans.length ? (
                <div className="mt-8">
                  <BillingToggle
                    periods={billingPeriods}
                    value={selectedPeriod}
                    onChange={setPeriod}
                    savings={savings}
                  />
                </div>
              ) : null}
            </motion.div>

            {waiting ? <PlansSkeleton /> : null}

            {isError && !plans.length ? (
              <div className="mx-auto mt-14 max-w-lg rounded-2xl bg-white px-6 py-8 text-center shadow-[0_2px_4px_rgba(16,33,61,0.04),0_14px_30px_-10px_rgba(16,33,61,0.12)] ring-1 ring-ink/8">
                <p className="text-base font-semibold text-navy">Plans could not be loaded</p>
                <p className="mt-2 text-sm leading-6 text-ink/65">
                  {apiErrorMessage(error) || 'Something went wrong while loading pricing.'}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-5 inline-flex h-10 items-center rounded-lg bg-navy px-4 text-sm font-semibold text-white hover:bg-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                >
                  Try again
                </button>
              </div>
            ) : null}

            {!waiting && !isError && !plans.length ? (
              <div className="mx-auto mt-14 max-w-lg rounded-2xl bg-white px-6 py-8 text-center shadow-[0_2px_4px_rgba(16,33,61,0.04),0_14px_30px_-10px_rgba(16,33,61,0.12)] ring-1 ring-ink/8">
                <p className="text-base font-semibold text-navy">No plans available yet</p>
                <p className="mt-2 text-sm leading-6 text-ink/65">
                  Active subscription plans will show up here once they are published.
                </p>
              </div>
            ) : null}

            {plans.length ? (
              <>
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
                      period={selectedPeriod}
                      ctaTo={startPath}
                    />
                  ))}
                </motion.div>

                <p className="mt-8 text-center text-sm text-ink/55">
                  Prices are before VAT and applicable levies. Packages are paid at checkout; your
                  wallet stays separate for other usage.
                  {isNonExpiryPeriod(selectedPeriod)
                    ? ' Non-expiry packages keep unused units until you send.'
                    : ''}
                </p>
              </>
            ) : null}
          </div>
        </section>

        <div className="mx-auto max-w-8xl px-4 pb-24 sm:px-6">
          {plans.length ? <Comparison plans={plans} period={selectedPeriod} ctaTo={startPath} /> : null}

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
