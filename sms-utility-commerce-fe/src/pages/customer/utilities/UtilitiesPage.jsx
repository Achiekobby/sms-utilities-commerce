import { MotionConfig, motion } from 'framer-motion'
import { ArrowRight, RefreshCw, ShieldCheck, Wifi } from 'lucide-react'
import { Link } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/client'
import { groupServices, openServiceCount } from '../../../features/utilities/utilityModel'
import { paths } from '../../../routes/paths'
import { useGetUtilityCatalogQuery } from '../../../services/api/utilities/utilitiesApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { ServiceArtwork } from './ServiceLogo'

const ease = [0.22, 1, 0.36, 1]
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const cardMotion = {
  hidden: { opacity: 0, y: 16 },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease, delay: 0.04 + index * 0.045 },
  }),
}

function StatusPill({ open }) {
  if (open) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-green shadow-sm ring-1 ring-black/[0.06] backdrop-blur-sm">
        <span className="size-1.5 rounded-full bg-green" aria-hidden="true" />
        Live
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-ink/55 shadow-sm ring-1 ring-black/[0.06] backdrop-blur-sm">
      Offline
    </span>
  )
}

function ServiceCard({ service, index }) {
  const shell =
    'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E3ECF7] bg-white shadow-[0_1px_2px_rgba(16,33,61,0.04),0_16px_36px_-22px_rgba(11,31,91,0.4)] transition-[transform,box-shadow] duration-300'

  const body = (
    <>
      <span className="relative block">
        <ServiceArtwork service={service} />
        <span className="absolute top-2.5 right-2.5">
          <StatusPill open={service.open} />
        </span>
      </span>
      <span className="flex min-h-0 flex-1 flex-col px-4 pt-3.5 pb-4">
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block text-[15px] font-bold tracking-tight text-navy">{service.title}</span>
            <span className="mt-1 block text-[13px] leading-5 text-ink/60">{service.blurb}</span>
          </span>
        </span>
        <span className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[12px] font-medium text-ink/45">
            {service.open ? 'Pay from wallet' : service.reason || 'Temporarily offline'}
          </span>
          <span
            className={`inline-flex size-8 items-center justify-center rounded-full transition-transform duration-200 ${
              service.open ? 'bg-navy text-white motion-safe:group-hover:translate-x-0.5' : 'bg-ink/[0.06] text-ink/35'
            }`}
          >
            <ArrowRight size={15} strokeWidth={2.2} aria-hidden="true" />
          </span>
        </span>
      </span>
    </>
  )

  if (!service.open) {
    return (
      <motion.article variants={cardMotion} custom={index} aria-disabled="true" className={`${shell} cursor-not-allowed`}>
        {body}
      </motion.article>
    )
  }

  return (
    <motion.article variants={cardMotion} custom={index} className="h-full">
      <Link
        to={paths.utility(service.key)}
        className={`${shell} cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_28px_-16px_var(--service-glow),0_22px_44px_-24px_rgba(11,31,91,0.35)] ${focusClass}`}
        style={{ '--service-glow': service.glow }}
      >
        {body}
      </Link>
    </motion.article>
  )
}

function GroupRule({ id, kicker, title }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <span className="h-px min-w-6 flex-1 bg-gradient-to-r from-transparent to-[#C5D6EE]" aria-hidden="true" />
      <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#D8E7FA] bg-white px-3 py-1.5 shadow-[0_1px_2px_rgba(20,115,230,0.06)] sm:px-3.5">
        <span className="text-[10px] font-semibold tracking-[0.16em] text-green uppercase">{kicker}</span>
        <span className="h-3 w-px shrink-0 bg-ink/15" aria-hidden="true" />
        <span id={id} className="text-[13px] font-semibold text-navy">
          {title}
        </span>
      </p>
      <span className="h-px min-w-6 flex-1 bg-gradient-to-l from-transparent to-[#C5D6EE]" aria-hidden="true" />
    </div>
  )
}

function CatalogSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
          <span className="skeleton block aspect-[16/10] sm:aspect-[16/9]" />
          <span className="block px-4 py-4">
            <span className="skeleton block h-4 w-28 rounded" />
            <span className="skeleton mt-2 block h-3 w-full rounded" />
            <span className="skeleton mt-4 block h-8 w-24 rounded-full" />
          </span>
        </div>
      ))}
    </div>
  )
}

export function UtilitiesPage() {
  useDocumentTitle('Utilities')
  const catalog = useGetUtilityCatalogQuery()
  const data = catalog.data
  const services = data?.services ?? []
  const groups = groupServices(services)
  const openCount = openServiceCount(data)

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Utilities</h1>
            <p className="mt-1.5 text-sm leading-6 text-ink/60">
              Airtime, data, TV, electricity, and exam checkers — paid from your wallet.
            </p>
          </div>
          <dl className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D8E7FA] bg-white px-3 py-1.5 text-[12px] font-semibold text-navy shadow-[0_1px_2px_rgba(20,115,230,0.05)]">
              <ShieldCheck size={14} strokeWidth={2.2} className="text-green" aria-hidden="true" />
              {catalog.isLoading ? 'Loading services' : `${openCount} live`}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D8E7FA] bg-white px-3 py-1.5 text-[12px] font-semibold text-navy shadow-[0_1px_2px_rgba(20,115,230,0.05)]">
              <Wifi
                size={14}
                strokeWidth={2.2}
                className={data?.providerReachable === false ? 'text-[#C21F2D]' : 'text-green'}
                aria-hidden="true"
              />
              {catalog.isLoading ? 'Checking provider' : data?.providerReachable === false ? 'Provider offline' : 'Provider online'}
            </div>
            <div className="inline-flex items-center rounded-full border border-[#D8E7FA] bg-white px-3 py-1.5 text-[12px] font-semibold text-navy shadow-[0_1px_2px_rgba(20,115,230,0.05)]">
              {data?.currency || 'GHS'}
            </div>
          </dl>
        </header>

        {catalog.isLoading ? <CatalogSkeleton /> : null}

        {catalog.isError ? (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(catalog.error)}</p>
            <button
              type="button"
              onClick={catalog.refetch}
              className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-3.5 text-sm font-semibold text-navy ${focusClass}`}
            >
              <RefreshCw size={15} strokeWidth={2.2} aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : null}

        {!catalog.isLoading && !catalog.isError && !services.length ? (
          <div className="mt-6 rounded-2xl border border-dashed border-ink/15 bg-white px-5 py-10 text-center">
            <p className="text-sm font-semibold text-navy">No utility services yet</p>
            <p className="mt-1 text-sm text-ink/55">Check back soon — the catalog is empty right now.</p>
          </div>
        ) : null}

        {!catalog.isLoading && services.length ? (
          <div className="mt-6 space-y-7">
            {groups.map((group, groupIndex) => (
              <section key={group.id} aria-labelledby={`utilities-${group.id}`}>
                <GroupRule id={`utilities-${group.id}`} kicker={group.kicker} title={group.title} />
                <motion.div
                  initial="hidden"
                  animate="show"
                  className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {group.services.map((service, index) => (
                    <ServiceCard key={service.key} service={service} index={groupIndex * 3 + index} />
                  ))}
                </motion.div>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </MotionConfig>
  )
}
