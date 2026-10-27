import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { selectIsVerified } from '../../../features/auth/authSlice'
import { paths } from '../../../routes/paths'
import Images from '../../../utils/Images'
import { ease, stepVariants } from './motion'

const paymentSteps = [
  {
    index: '01',
    title: 'Fund the wallet',
    text: 'Add money securely. The balance pays for campaigns, airtime, and utility purchases.',
  },
  {
    index: '02',
    title: 'Pay directly',
    text: 'Collect MoMo, mobile money, or card when the payment should not sit in the wallet first.',
  },
  {
    index: '03',
    title: 'Cover the purchase',
    text: 'The same payment settles messages, data, TV, power, water, and rewards.',
  },
]

export function PaymentsSection() {
  const isVerified = useSelector(selectIsVerified)
  const reduce = useReducedMotion()
  const paymentPath = isVerified ? paths.app : paths.signup

  return (
    <section id="wallet" className="scroll-mt-16 border-t border-ink/10 bg-white">
      <div className="mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-6">
          <img
            src={Images.payment_and_wallets}
            alt=""
            className="order-2 mx-auto w-full max-w-xl lg:order-1 lg:max-w-none"
          />
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M4 6.5A2.5 2.5 0 0 1 6.5 4H17v2.5H6.5a.5.5 0 0 0 0 1H19a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6.5z"
                  />
                  <circle cx="16.5" cy="13.5" r="1.4" fill="#008859" />
                </svg>
              </span>
              <p className="text-xs font-semibold tracking-[0.16em] text-ink/45">WALLET & PAYMENTS</p>
            </div>
            <h2 className="mt-5 max-w-md text-4xl leading-[1.12] font-bold tracking-tight text-balance text-navy sm:text-5xl">
              Simple, Secure Payments.
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-ink/65">
              Fund and make payments by MoMo, card, or mobile money. Fund the wallet, or pay
              directly and keep the purchase moving.
            </p>
            <Link
              to={paymentPath}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              Fund Wallet
              <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="relative mt-14 lg:mt-16">
          <p className="text-xs font-semibold tracking-[0.16em] text-ink/45">HOW A PAYMENT RUNS</p>
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
              {paymentSteps.map((step) => (
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
