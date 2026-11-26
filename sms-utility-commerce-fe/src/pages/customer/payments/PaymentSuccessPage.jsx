import { Check, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useSearchParams } from 'react-router'
import { serviceMeta, UTILITY_ORDER } from '../../../features/utilities/utilityModel'
import { formatWalletAmount } from '../../../features/wallet/walletRecord'
import { paths } from '../../../routes/paths'
import { walletApi } from '../../../services/api/wallet/walletApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const primary = `inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] ${focusClass}`
const secondary = `inline-flex h-11 items-center justify-center rounded-lg border border-[#D8E7FA] bg-white px-4 text-sm font-semibold text-navy hover:bg-[#F7FBFF] ${focusClass}`

const walletPurposes = new Set(['wallet_top_up', 'wallet', 'top_up', 'topup', 'top-up'])

function firstParam(params, names) {
  for (const name of names) {
    const value = String(params.get(name) ?? '').trim()
    if (value) return value
  }
  return ''
}

function readReturn(params) {
  const purpose = firstParam(params, ['purpose', 'type']).toLowerCase()
  const service = firstParam(params, ['service']).toLowerCase()
  const serviceKey = UTILITY_ORDER.includes(service) ? service : UTILITY_ORDER.includes(purpose) ? purpose : ''
  const isWallet = walletPurposes.has(purpose) && !serviceKey
  const isUtility = Boolean(serviceKey) || purpose === 'utility' || purpose === 'utilities'

  return {
    isWallet,
    isUtility,
    serviceKey,
    reference: firstParam(params, ['reference', 'reference_id', 'trxref']),
    amount: firstParam(params, ['amount', 'total_amount']),
    currency: firstParam(params, ['currency']) || 'GHS',
    paymentId: firstParam(params, ['payment_id', 'payment']),
    orderId: firstParam(params, ['order_id', 'order']),
  }
}

function Fact({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-3 last:border-b-0">
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm font-medium text-navy">{value}</dd>
    </div>
  )
}

export function PaymentSuccessPage() {
  const dispatch = useDispatch()
  const [params] = useSearchParams()
  const result = readReturn(params)
  const utility = result.serviceKey ? serviceMeta(result.serviceKey) : null
  const amount = formatWalletAmount(result.amount, result.currency)
  const showAmount = amount !== '—'

  const title = result.isWallet
    ? 'Wallet topped up'
    : utility
      ? `${utility.title} paid`
      : 'Payment received'

  useDocumentTitle(title)

  useEffect(() => {
    dispatch(walletApi.util.invalidateTags(['Wallet', { type: 'Payment', id: 'LIST' }, { type: 'Order', id: 'LIST' }]))
  }, [dispatch])

  const detail = result.isWallet
    ? 'The charge succeeded. Your balance includes this top-up.'
    : utility
      ? `The charge succeeded. Your ${utility.title} purchase is being completed.`
      : result.isUtility
        ? 'The charge succeeded. Your utility purchase is being completed.'
        : 'The charge succeeded. The receipt is in your payments.'

  const primaryTo = result.isWallet
    ? paths.wallet
    : result.serviceKey
      ? paths.utility(result.serviceKey)
      : result.isUtility
        ? paths.utilities
        : paths.payments
  const primaryLabel = result.isWallet
    ? 'Go to wallet'
    : result.serviceKey
      ? `Back to ${utility.title}`
      : result.isUtility
        ? 'Back to utilities'
        : 'View payments'

  const secondaryTo = result.isWallet || result.isUtility ? paths.payments : paths.wallet
  const secondaryLabel = result.isWallet || result.isUtility ? 'View payments' : 'Go to wallet'

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg items-center py-8">
      <section className="w-full rounded-2xl border border-[#D8E7FA] bg-white px-5 py-8 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_18px_40px_-24px_rgba(11,31,91,0.45)] sm:px-8">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#E5F6EC] text-green">
          <Check size={28} strokeWidth={2.4} aria-hidden="true" />
        </div>
        <p className="mt-5 text-center text-[11px] font-semibold tracking-[0.16em] text-green uppercase">Paid</p>
        <h1 className="mt-2 text-center text-2xl font-bold tracking-tight text-navy">{title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-ink/65">{detail}</p>

        {showAmount || result.reference || result.orderId ? (
          <dl className="mt-6 rounded-xl bg-[#F7FBFF] px-4">
            {showAmount ? <Fact label="Amount" value={amount} /> : null}
            {result.reference ? <Fact label="Reference" value={result.reference} /> : null}
            {result.orderId ? <Fact label="Order" value={result.orderId} /> : null}
          </dl>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link to={primaryTo} className={`flex-1 ${primary}`}>
            {primaryLabel}
            <ArrowRight size={16} strokeWidth={2.3} aria-hidden="true" />
          </Link>
          <Link to={secondaryTo} className={`flex-1 ${secondary}`}>
            {secondaryLabel}
          </Link>
        </div>

        {result.paymentId ? (
          <p className="mt-4 text-center text-sm">
            <Link to={paths.payment(result.paymentId)} className={`font-semibold text-blue hover:underline ${focusClass}`}>
              Open this payment
            </Link>
          </p>
        ) : null}
      </section>
    </div>
  )
}
