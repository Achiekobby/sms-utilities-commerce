import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/client'
import { formatWalletAmount } from '../../../features/wallet/walletRecord'
import { paths } from '../../../routes/paths'
import { useGetWalletQuery } from '../../../services/api/wallet/walletApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { TopUpForm } from './sections/TopUpForm'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function TopUpPage() {
  useDocumentTitle('Top up')
  const wallet = useGetWalletQuery()
  const account = wallet.data

  return (
    <div className="w-full">
      <Link to={paths.wallet} className={`inline-flex items-center gap-1.5 text-sm font-semibold text-blue hover:text-blue/80 ${focusClass}`}>
        <ArrowLeft size={16} strokeWidth={2.3} aria-hidden="true" />
        Wallet
      </Link>
      <header className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Top up</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-ink/60">
            Choose how much to add. The payment page collects the card or mobile money.
          </p>
        </div>
        <p className="text-sm text-ink/60">
          Balance{' '}
          <span className="font-semibold text-navy tabular-nums">
            {wallet.isLoading ? '…' : account ? formatWalletAmount(account.balance, account.currency) : '—'}
          </span>
        </p>
      </header>
      {wallet.isError && wallet.error?.status !== 'FETCH_ERROR' ? (
        <p role="alert" className="mt-4 text-sm text-[#9F1C26]">
          {apiErrorMessage(wallet.error)}
        </p>
      ) : null}
      <div className="mt-6 rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6">
        <TopUpForm currency={account?.currency} />
      </div>
    </div>
  )
}
