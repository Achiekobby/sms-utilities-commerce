import { Plus, Wallet } from 'lucide-react'
import { Link } from 'react-router'
import { formatWalletAmount } from '../../features/wallet/walletRecord'
import { paths } from '../../routes/paths'
import { useGetWalletQuery } from '../../services/api/wallet/walletApi'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function WalletBalance() {
  const wallet = useGetWalletQuery()
  const account = wallet.data
  const amount = account ? formatWalletAmount(account.balance, account.currency) : '—'
  const label = account?.status ? `${amount}, ${account.status}` : 'Wallet balance'

  return (
    <div className="flex shrink-0 items-center gap-1">
      <Link
        to={paths.wallet}
        aria-label={label}
        className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-ink/10 bg-canvas pr-2.5 pl-1 transition-colors hover:border-blue/30 hover:bg-white ${focusClass}`}
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-mint/20 text-green">
          <Wallet size={13} strokeWidth={2.2} aria-hidden="true" />
        </span>
        {wallet.isLoading ? (
          <span className="skeleton block h-3.5 w-16 rounded" />
        ) : (
          <span className="text-[13px] leading-none font-bold text-navy tabular-nums">{amount}</span>
        )}
      </Link>
      <Link
        to={paths.walletTopUp}
        aria-label="Top up wallet"
        className={`inline-flex h-8 items-center gap-1 rounded-full bg-green px-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#006B46] lg:px-2.5 ${focusClass}`}
      >
        <Plus size={14} strokeWidth={2.4} aria-hidden="true" />
        <span className="hidden lg:inline">Top up</span>
      </Link>
    </div>
  )
}
