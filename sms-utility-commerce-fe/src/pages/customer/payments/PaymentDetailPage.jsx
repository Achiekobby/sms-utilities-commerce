import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/client'
import { formatStamp } from '../../../features/contacts/contactImport'
import { statusLabel } from '../../../features/payments/paymentRecord'
import { formatWalletAmount } from '../../../features/wallet/walletRecord'
import { paths } from '../../../routes/paths'
import { useGetClientPaymentQuery } from '../../../services/api/payments/paymentsApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const card =
  'rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6'

function StatusBadge({ status }) {
  const key = String(status ?? '').toLowerCase()
  const paid = key === 'paid' || key === 'success' || key === 'completed'
  const pending = key === 'pending' || key === 'processing'
  const failed = key === 'failed' || key === 'cancelled' || key === 'canceled'
  const tone = paid
    ? 'bg-[#E5F6EC] text-green'
    : pending
      ? 'bg-[#FFF4DF] text-[#B45F06]'
      : failed
        ? 'bg-[#FDECEE] text-[#9F1C26]'
        : 'bg-[#F3F6FB] text-navy'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {statusLabel(status)}
    </span>
  )
}

function Fact({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-3 last:border-b-0">
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="text-right text-sm font-medium text-navy">{value ?? '—'}</dd>
    </div>
  )
}

export function PaymentDetailPage() {
  const { paymentId } = useParams()
  const query = useGetClientPaymentQuery(paymentId, { skip: !paymentId })
  const payment = query.data
  useDocumentTitle(payment?.referenceId ? `Payment ${payment.referenceId}` : 'Payment')

  if (query.isLoading) {
    return (
      <div className="w-full">
        <span className="skeleton block h-4 w-28 rounded" />
        <span className="skeleton mt-4 block h-9 w-56 rounded" />
        <span className="skeleton mt-6 block h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (query.isError || !payment) {
    return (
      <div className="mx-auto max-w-lg py-16">
        <h1 className="text-2xl font-semibold text-navy">Payment not found</h1>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          {query.isError
            ? apiErrorMessage(query.error) || 'That payment could not be loaded.'
            : 'That payment is not in this workspace.'}
        </p>
        <Link
          to={paths.payments}
          className={`mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-blue ${focusClass}`}
        >
          <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
          Back to payments
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">
              {payment.referenceId || `Payment #${payment.id}`}
            </h1>
            {payment.status ? <StatusBadge status={payment.status} /> : null}
          </div>
          <p className="mt-1.5 text-sm text-ink/55">
            {payment.purposeLabel}
            {payment.createdAt ? ` · Created ${formatStamp(payment.createdAt)}` : ''}
          </p>
        </div>
        <Link
          to={paths.payments}
          className={`inline-flex h-10 shrink-0 items-center gap-2 self-end rounded-xl border border-[#D8E7FA] bg-white px-3.5 text-sm font-semibold text-navy shadow-[0_1px_2px_rgba(20,115,230,0.06)] transition-colors hover:border-blue/30 hover:bg-[#F7FAFD] sm:self-start ${focusClass}`}
        >
          <span className="flex size-6 items-center justify-center rounded-md bg-[#E8F1FF] text-blue">
            <ArrowLeft size={14} strokeWidth={2.4} aria-hidden="true" />
          </span>
          Back to payments
        </Link>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className={card}>
          <h2 className="text-base font-bold text-navy">Amount</h2>
          <p className="mt-3 text-3xl font-bold tracking-tight text-navy tabular-nums">
            {formatWalletAmount(payment.totalAmount || payment.amount, payment.currency)}
          </p>
          <dl className="mt-4">
            <Fact label="Amount" value={formatWalletAmount(payment.amount, payment.currency)} />
            <Fact label="Charge" value={formatWalletAmount(payment.charge || '0', payment.currency)} />
            <Fact
              label="Total"
              value={formatWalletAmount(payment.totalAmount || payment.amount, payment.currency)}
            />
            <Fact label="Currency" value={payment.currency || '—'} />
          </dl>
        </section>

        <section className={card}>
          <h2 className="text-base font-bold text-navy">Payment details</h2>
          <dl className="mt-2">
            <Fact label="Purpose" value={payment.purposeLabel} />
            <Fact label="Method" value={payment.methodLabel} />
            <Fact label="Network" value={payment.networkLabel} />
            <Fact label="MSISDN" value={payment.msisdn || '—'} />
            <Fact label="Reference" value={payment.referenceId || '—'} />
            <Fact label="Order ID" value={payment.orderId || '—'} />
            <Fact label="Created" value={formatStamp(payment.createdAt) || '—'} />
            <Fact label="Paid at" value={formatStamp(payment.paidAt) || '—'} />
          </dl>
        </section>
      </div>

      {payment.failureReason ? (
        <section className={`${card} mt-4`} role="alert">
          <h2 className="text-base font-bold text-navy">Failure reason</h2>
          <p className="mt-2 text-sm leading-6 text-[#9F1C26]">{payment.failureReason}</p>
        </section>
      ) : null}

      {payment.status === 'pending' && payment.paymentLink ? (
        <section className={`${card} mt-4`}>
          <h2 className="text-base font-bold text-navy">Complete payment</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            This payment is still pending. Continue on the checkout page to finish it.
          </p>
          <a
            href={payment.paymentLink}
            className={`mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
          >
            Open checkout
          </a>
        </section>
      ) : null}
    </div>
  )
}
