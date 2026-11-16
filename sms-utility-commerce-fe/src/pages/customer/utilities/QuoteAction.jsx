import { Smartphone, Tv, UserRound, Wallet, X, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Drawer } from '../../../components/Drawer'
import { apiErrorMessage } from '../../../features/auth/client'
import { useNotify } from '../../../features/notifications/useNotify'
import { localPhone } from '../../../features/contacts/contact'
import { lookupPayload, purchasePayload } from '../../../features/utilities/utilityModel'
import { formatWalletAmount } from '../../../features/wallet/walletRecord'
import { linkRecipient, OrderRecipients, recipientPhones } from './OrderRecipients'
import { useGetContactGroupsQuery } from '../../../services/api/contacts/contactsApi'
import {
  useLookupUtilityAccountMutation,
  usePurchaseUtilityMutation,
  useQuoteUtilityMutation,
} from '../../../services/api/utilities/utilitiesApi'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function label(value) {
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function rowsOf(quote) {
  return [
    ['Service', quote.orderType ? label(quote.orderType) : quote.service ? label(quote.service) : null],
    ['Network', quote.network],
    ['Size', quote.size],
    ['Package', quote.packageId],
    ['Bill type', quote.billType],
    ['Checker', quote.checkerType],
    ['Quantity', quote.quantity],
    ['Beneficiary', quote.beneficiary],
  ].filter(([, value]) => value != null && value !== '')
}

function digits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

function lineTotal(amount, count) {
  const value = Number(amount)
  if (!Number.isFinite(value) || count < 1) return null
  return ((Math.round(value * 100) * count) / 100).toFixed(2)
}

function FieldLabel({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-semibold text-navy">
      <Icon size={15} strokeWidth={2.2} className="text-ink/45" aria-hidden="true" />
      {children}
    </span>
  )
}

function FieldHint({ children }) {
  return <span className="mt-1 block text-[12px] leading-5 text-ink/45">{children}</span>
}

export function QuoteAction({ canSubmit, payload, signature, image, imageAlt, direct = false, preview = null }) {
  const notify = useNotify()
  const [request, state] = useQuoteUtilityMutation()
  const [lookup, lookupState] = useLookupUtilityAccountMutation()
  const [purchase, purchaseState] = usePurchaseUtilityMutation()
  const resetRef = useRef(state.reset)
  const lookupResetRef = useRef(lookupState.reset)
  const requestId = useRef(0)
  const [quote, setQuote] = useState(null)
  const [account, setAccount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [momoPhone, setMomoPhone] = useState('')
  const [sameAsMomo, setSameAsMomo] = useState(false)
  const [audience, setAudience] = useState('numbers')
  const [numbers, setNumbers] = useState([''])
  const [groupIds, setGroupIds] = useState([])
  const groupsQuery = useGetContactGroupsQuery(undefined, { skip: !direct || audience !== 'groups' })
  const linkedRef = useRef('')
  const [method, setMethod] = useState('wallet')
  const [verified, setVerified] = useState(null)
  const [payError, setPayError] = useState('')
  const [phase, setPhase] = useState('closed')
  resetRef.current = state.reset
  lookupResetRef.current = lookupState.reset

  const service = String(payload?.service ?? '')
  const needsAccount = service === 'ecg' || service === 'tv'
  const accountLabel = service === 'tv' ? 'Smartcard number' : 'Meter number'

  useEffect(() => {
    requestId.current += 1
    setQuote(null)
    setAccount('')
    setRecipient('')
    setCustomerPhone('')
    setMomoPhone('')
    setSameAsMomo(false)
    setAudience('numbers')
    setNumbers([''])
    setGroupIds([])
    linkedRef.current = ''
    setMethod('wallet')
    setVerified(null)
    setPayError('')
    resetRef.current()
    lookupResetRef.current()
    setPhase('closed')
  }, [signature])

  useEffect(() => {
    if (phase !== 'closing') return
    const timer = window.setTimeout(() => setPhase('closed'), 320)
    return () => window.clearTimeout(timer)
  }, [phase])

  function requestClose() {
    setPhase((current) => {
      if (current !== 'open') return current
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      return reduce ? 'closed' : 'closing'
    })
  }

  function updateNumbers(next) {
    const rows = next.length ? next : ['']
    setNumbers(rows)
    const phone = localPhone(momoPhone)
    if (phone && !rows.some((row) => localPhone(row) === phone)) setSameAsMomo(false)
  }

  function toggleSameNumber() {
    const phone = localPhone(momoPhone)
    if (!phone) return
    if (sameAsMomo) {
      setSameAsMomo(false)
      linkedRef.current = ''
      setNumbers((current) => linkRecipient(current, phone, ''))
      return
    }
    setSameAsMomo(true)
    linkedRef.current = phone
    setNumbers((current) => linkRecipient(current, '', phone))
  }

  async function submit() {
    if (!canSubmit || (!direct && state.isLoading)) return
    if (direct) {
      setPayError('')
      setPhase('open')
      return
    }
    const id = requestId.current
    setQuote(null)
    setVerified(null)
    setPhase('open')
    try {
      const next = await request(payload).unwrap()
      if (id !== requestId.current) return
      setQuote(next)
    } catch {
      if (id !== requestId.current) return
      setQuote(null)
    }
  }

  function onAccount(event) {
    setAccount(event.target.value.replace(/\D/g, ''))
    setVerified(null)
  }

  async function verifyAccount() {
    const beneficiary = account.trim()
    if (!beneficiary || lookupState.isLoading) return
    try {
      const next = await lookup(
        lookupPayload({ service, beneficiary, billType: payload?.bill_type }),
      ).unwrap()
      setVerified({ ...next, beneficiary: next.beneficiary || beneficiary })
    } catch {
      setVerified(null)
    }
  }

  async function pay() {
    if (!canPay || purchaseState.isLoading) return
    setPayError('')
    const face = needsAccount ? verified?.validatedAmount : quote?.amount
    try {
      const result = await purchase(
        purchasePayload({
          service,
          packageId: payload?.package_id,
          network: payload?.network,
          amount: direct ? payload?.amount : face,
          billType: payload?.bill_type,
          checkerType: payload?.checker_type,
          quantity: payload?.quantity,
          method,
          phoneNumber: momoPhone,
          beneficiary: direct ? undefined : needsAccount ? account : recipient,
          beneficiaries: direct && audience === 'numbers' ? recipientPhones(numbers) : undefined,
          contactGroupIds: direct && audience === 'groups' ? groupIds : undefined,
          customerPhone,
          accountName: verified?.customerName,
        }),
      ).unwrap()
      if (result.nextUrl) {
        window.location.assign(result.nextUrl)
        return
      }
      notify.success(result.message || 'Payment completed.')
    } catch (error) {
      setPayError(apiErrorMessage(error))
    }
  }

  const details = quote ? rowsOf(quote) : []
  const drawerOpen = phase === 'open' || phase === 'closing'
  const selectedGroups = (groupsQuery.data ?? []).filter((group) => groupIds.includes(group.id))
  const phones = recipientPhones(numbers)
  const pendingNumber = numbers.some((row) => String(row).replace(/\D/g, '') && !localPhone(row))
  const recipientCount = audience === 'groups'
    ? selectedGroups.reduce((sum, group) => sum + (Number(group.count) || 0), 0)
    : phones.length
  const estimated = direct ? lineTotal(preview?.unitAmount, recipientCount) : null
  const accountMatches = verified?.beneficiary === account.trim()
  const payAmount = direct ? estimated : needsAccount ? (accountMatches ? verified?.validatedAmount : null) : quote?.amount
  const recipientReady = direct
    ? audience === 'groups'
      ? groupIds.length > 0 && recipientCount > 0
      : phones.length > 0 && !pendingNumber
    : needsAccount
      ? accountMatches
      : digits(recipient).length >= 9
  const canPay = (direct || Boolean(quote)) && payAmount != null && recipientReady && !purchaseState.isLoading
  const payCurrency = direct ? preview?.currency : quote?.currency
  const previewRows = direct
    ? [
        ['Network', preview?.network],
        [
          'Recipients',
          audience === 'groups'
            ? selectedGroups.length
              ? `${recipientCount} ${recipientCount === 1 ? 'contact' : 'contacts'}`
              : null
            : phones.length
              ? `${phones.length} ${phones.length === 1 ? 'number' : 'numbers'}`
              : null,
        ],
        ['Price each', preview?.unitAmount == null ? null : formatWalletAmount(preview.unitAmount, preview?.currency || '')],
        ['Estimated total', estimated == null ? null : formatWalletAmount(estimated, preview?.currency || '')],
      ].filter(([, value]) => value != null && value !== '' && value !== '—')
    : []

  return (
    <div className="mt-5">
      <button
        type="button"
        disabled={!canSubmit || (!direct && state.isLoading)}
        onClick={submit}
        className={`inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-navy text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
      >
        {direct ? 'Review order' : state.isLoading ? 'Getting quote…' : 'Get quote'}
      </button>

      {drawerOpen ? (
        <Drawer
          label={direct ? 'Order preview' : 'Quote'}
          closing={phase === 'closing'}
          onClose={requestClose}
          onExited={() => setPhase('closed')}
          widthClass="w-[min(32rem,calc(100vw-1.5rem))]"
        >
          <div className="flex h-full flex-col bg-white">
            <header className="flex items-start justify-between gap-3 border-b border-[#E3ECF7] px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-16 w-28 shrink-0 items-center justify-center rounded-xl bg-white px-2 ring-1 ring-black/[0.06]">
                  {image ? (
                    <img src={image} alt={imageAlt || ''} className="max-h-12 w-full object-contain" />
                  ) : (
                    <span className="text-[11px] font-bold text-navy">{imageAlt || 'Utility'}</span>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-ink/45 uppercase">Checkout</p>
                  <h2 className="truncate text-base font-semibold text-navy">{imageAlt || 'Quote'}</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={requestClose}
                aria-label="Close"
                className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink/55 hover:bg-canvas hover:text-navy ${focusClass}`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {!direct && state.isLoading ? (
                <div className="quote-in" aria-busy="true" aria-live="polite">
                  <p className="text-sm font-semibold text-navy">Preparing your quote</p>
                  <span className="skeleton mt-4 block h-4 w-40 rounded" />
                  <span className="skeleton mt-2 block h-4 w-56 rounded" />
                  <span className="skeleton mt-2 block h-4 w-32 rounded" />
                  <span className="skeleton mt-6 block h-10 w-36 rounded" />
                </div>
              ) : null}

              {!direct && state.isError ? (
                <p className="quote-in text-sm text-[#9F1C26]" role="alert">
                  {apiErrorMessage(state.error)}
                </p>
              ) : null}

              {direct || quote ? (
                <div className="quote-in">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-green uppercase">
                    {direct ? 'Order preview' : quote.message}
                  </p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-navy">{direct ? preview?.title || imageAlt : quote.name}</h3>
                  {direct && previewRows.length ? (
                    <dl className="mt-4 divide-y divide-[#E3ECF7] border-y border-[#E3ECF7]">
                      {previewRows.map(([name, value]) => (
                        <div key={name} className="flex items-baseline justify-between gap-4 py-3">
                          <dt className="text-[12px] font-medium text-ink/45">{name}</dt>
                          <dd className="text-right text-sm font-semibold text-navy">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {!direct && details.length ? (
                    <dl className="mt-4 divide-y divide-[#E3ECF7] border-y border-[#E3ECF7]">
                      {details.map(([name, value]) => (
                        <div key={name} className="flex items-baseline justify-between gap-4 py-3">
                          <dt className="text-[12px] font-medium text-ink/45">{name}</dt>
                          <dd className="text-right text-sm font-semibold text-navy">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  <div className="mt-5">
                    <FieldLabel icon={Wallet}>Pay with</FieldLabel>
                    <FieldHint>Wallet uses your balance. Mobile money opens a checkout for the number you enter.</FieldHint>
                    <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Payment method">
                      {[
                        ['wallet', 'Wallet', Wallet],
                        ['momo', 'Mobile money', Smartphone],
                      ].map(([id, name, Icon]) => {
                        const selected = method === id
                        return (
                          <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => {
                              setMethod(id)
                              if (id !== 'momo') setSameAsMomo(false)
                            }}
                            className={`inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold ${focusClass} ${
                              selected ? 'border-navy bg-navy text-white' : 'border-[#E3ECF7] bg-white text-navy'
                            }`}
                          >
                            <Icon size={15} strokeWidth={2.2} aria-hidden="true" />
                            {name}
                          </button>
                        )
                      })}
                    </div>
                    {method === 'momo' ? (
                      <label className="mt-3 block">
                        <FieldLabel icon={Smartphone}>Mobile money number</FieldLabel>
                        <FieldHint>10 digits, for example 0240000000. Leave blank to charge the number on your profile.</FieldHint>
                        <span className="mt-1.5 flex h-12 items-center rounded-xl border border-ink/10 bg-canvas px-3 focus-within:border-navy">
                          <input
                            inputMode="numeric"
                            value={momoPhone}
                            onChange={(event) => {
                              const next = digits(event.target.value)
                              setMomoPhone(next)
                              if (!direct && sameAsMomo) setRecipient(next)
                              if (direct && sameAsMomo) {
                                const phone = localPhone(next)
                                if (phone) {
                                  setNumbers((current) => linkRecipient(current, linkedRef.current, phone))
                                  linkedRef.current = phone
                                } else if (!next) {
                                  setNumbers((current) => linkRecipient(current, linkedRef.current, ''))
                                  linkedRef.current = ''
                                  setSameAsMomo(false)
                                }
                              }
                            }}
                            placeholder="0240000000"
                            className={`h-full w-full bg-transparent text-sm font-semibold text-navy outline-none placeholder:font-medium placeholder:text-ink/35 ${focusClass}`}
                          />
                        </span>
                      </label>
                    ) : null}
                  </div>

                  {direct ? (
                    <OrderRecipients
                      audience={audience}
                      onAudience={setAudience}
                      numbers={numbers}
                      onNumbers={updateNumbers}
                      groupIds={groupIds}
                      onGroupIds={setGroupIds}
                      verifiedContacts={Boolean(preview?.verifiedContacts)}
                      sameAsMomo={sameAsMomo}
                      momoPhone={momoPhone}
                      showSame={method === 'momo'}
                      onSameAsMomo={toggleSameNumber}
                    />
                  ) : needsAccount ? null : (
                    <div className="mt-4">
                      <label className="block">
                        <FieldLabel icon={Smartphone}>Recipient phone number</FieldLabel>
                        <FieldHint>The number that receives this purchase. Use 10 digits, starting with 0.</FieldHint>
                        <span className="mt-1.5 flex h-12 items-center rounded-xl border border-ink/10 bg-canvas px-3 focus-within:border-navy">
                          <input
                            inputMode="numeric"
                            value={recipient}
                            readOnly={sameAsMomo}
                            onChange={(event) => {
                              setSameAsMomo(false)
                              setRecipient(digits(event.target.value))
                            }}
                            placeholder="0240000000"
                            className={`h-full w-full bg-transparent text-sm font-semibold text-navy outline-none placeholder:font-medium placeholder:text-ink/35 read-only:text-ink/70 ${focusClass}`}
                          />
                        </span>
                      </label>
                      {method === 'momo' ? (
                        <button
                          type="button"
                          disabled={!momoPhone}
                          aria-pressed={sameAsMomo}
                          onClick={() => {
                            const next = !sameAsMomo
                            setSameAsMomo(next)
                            if (next) setRecipient(momoPhone)
                          }}
                          className={`mt-2 inline-flex cursor-pointer items-center gap-2 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${focusClass} ${
                            sameAsMomo ? 'text-green' : 'text-navy'
                          }`}
                        >
                          <span
                            className={`flex size-4 items-center justify-center rounded border ${
                              sameAsMomo ? 'border-green bg-green text-white' : 'border-[#D5E0EE] bg-white'
                            }`}
                            aria-hidden="true"
                          >
                            {sameAsMomo ? <span className="size-1.5 rounded-full bg-white" /> : null}
                          </span>
                          Buy for the same number
                        </button>
                      ) : null}
                      {method === 'momo' ? (
                        <FieldHint>
                          {momoPhone
                            ? 'Fills the recipient with the mobile money number above.'
                            : 'Enter a mobile money number first, then you can reuse it here.'}
                        </FieldHint>
                      ) : null}
                    </div>
                  )}

                  {!direct && needsAccount ? (
                    <div className="mt-5">
                      <label className="block">
                        <FieldLabel icon={service === 'tv' ? Tv : Zap}>{accountLabel}</FieldLabel>
                        <FieldHint>
                          {service === 'tv'
                            ? 'The smartcard number on the decoder. Digits only, then check the account.'
                            : 'The prepaid meter number on the ECG meter. Digits only, then check the account.'}
                        </FieldHint>
                        <span className="mt-1.5 flex h-12 items-center rounded-xl border border-ink/10 bg-canvas px-3 focus-within:border-navy">
                          <input
                            inputMode="numeric"
                            value={account}
                            onChange={onAccount}
                            placeholder={service === 'tv' ? 'Smartcard number' : 'Meter number'}
                            className={`h-full w-full bg-transparent text-sm font-semibold text-navy outline-none placeholder:font-medium placeholder:text-ink/35 ${focusClass}`}
                          />
                        </span>
                      </label>
                      <button
                        type="button"
                        disabled={!account.trim() || lookupState.isLoading}
                        onClick={verifyAccount}
                        className={`mt-3 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-[#E3ECF7] bg-white text-sm font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
                      >
                        {lookupState.isLoading ? 'Checking account…' : 'Check account'}
                      </button>
                      {lookupState.isError ? (
                        <p className="mt-2 text-sm text-[#9F1C26]" role="alert">
                          {apiErrorMessage(lookupState.error)}
                        </p>
                      ) : null}
                      {accountMatches ? (
                        <div className="mt-3 rounded-xl bg-[#E7F8F0] px-3.5 py-3">
                          <p className="text-[11px] font-semibold tracking-[0.14em] text-green uppercase">{verified.message}</p>
                          <p className="mt-1 text-sm font-semibold text-navy">{verified.customerName}</p>
                        </div>
                      ) : null}
                      {service === 'ecg' ? (
                        <label className="mt-3 block">
                          <FieldLabel icon={UserRound}>Customer mobile</FieldLabel>
                          <FieldHint>Optional. A mobile number for the person who owns the meter.</FieldHint>
                          <span className="mt-1.5 flex h-12 items-center rounded-xl border border-ink/10 bg-canvas px-3 focus-within:border-navy">
                            <input
                              inputMode="numeric"
                              value={customerPhone}
                              onChange={(event) => setCustomerPhone(digits(event.target.value))}
                              placeholder="Customer mobile number"
                              className={`h-full w-full bg-transparent text-sm font-semibold text-navy outline-none placeholder:font-medium placeholder:text-ink/35 ${focusClass}`}
                            />
                          </span>
                        </label>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {direct || quote ? (
              <footer className="border-t border-[#E3ECF7] bg-[#F7FAFD] px-5 py-4">
                <button
                  type="button"
                  disabled={!canPay}
                  onClick={pay}
                  className={`inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-navy text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
                >
                  {purchaseState.isLoading
                    ? 'Opening payment…'
                    : payAmount == null
                      ? 'Pay'
                      : `Pay ${formatWalletAmount(payAmount, payCurrency || '')}`}
                </button>
                {payError ? (
                  <p className="mt-2 text-sm text-[#9F1C26]" role="alert">
                    {payError}
                  </p>
                ) : null}
              </footer>
            ) : null}
          </div>
        </Drawer>
      ) : null}
    </div>
  )
}
