import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/client'
import { serviceMeta } from '../../../features/utilities/utilityModel'
import { paths } from '../../../routes/paths'
import { useGetUtilityCatalogQuery } from '../../../services/api/utilities/utilitiesApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { ServiceArtwork } from './ServiceLogo'
import { ServiceProducts } from './ServiceProducts'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function UtilityServicePage() {
  const { service: serviceKey } = useParams()
  const key = String(serviceKey ?? '').toLowerCase()
  const catalog = useGetUtilityCatalogQuery()
  const service = catalog.data?.services?.find((row) => row.key === key) ?? null
  const fallback = serviceMeta(key)
  const shown = service ?? fallback
  const title = shown.title
  const currency = catalog.data?.currency || 'GHS'

  useDocumentTitle(title)

  if (!catalog.isLoading && catalog.data && !service) {
    return <Navigate to={paths.utilities} replace />
  }

  return (
    <div className="w-full">
      <header
        className="overflow-hidden rounded-2xl border border-[#E3ECF7] bg-white shadow-[0_1px_2px_rgba(16,33,61,0.04)]"
        style={{ backgroundImage: `linear-gradient(115deg, ${shown.tint} 0%, #ffffff 42%)` }}
      >
        <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase" style={{ color: shown.accent }}>
            Utilities
          </p>
          <Link
            to={paths.utilities}
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-white/80 bg-white px-3 text-sm font-semibold text-navy shadow-[0_1px_2px_rgba(16,33,61,0.06)] hover:border-green/40 ${focusClass}`}
          >
            <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
            Back
          </Link>
        </div>
        <div className="flex flex-col gap-4 px-4 pt-3 pb-4 sm:flex-row sm:items-center sm:px-5 sm:pb-5">
          {catalog.isLoading ? (
            <div className="flex flex-1 items-center gap-4" aria-hidden="true">
              <span className="skeleton block h-20 w-36 shrink-0 rounded-xl" />
              <span className="min-w-0 flex-1">
                <span className="skeleton block h-7 w-40 rounded" />
                <span className="skeleton mt-2 block h-4 w-64 rounded" />
              </span>
            </div>
          ) : (
            <>
              <span className="w-full max-w-[11rem] shrink-0 overflow-hidden rounded-xl ring-1 ring-black/[0.06] sm:w-44">
                <ServiceArtwork service={shown} />
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">{title}</h1>
                <p className="mt-1 max-w-xl text-sm leading-6 text-ink/60">{shown.blurb}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      service && !service.open ? 'bg-[#FDECEE] text-[#9F1C26]' : 'bg-[#E7F8F0] text-green'
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${service && !service.open ? 'bg-[#9F1C26]' : 'bg-green'}`} aria-hidden="true" />
                    {service && !service.open ? 'Unavailable' : 'Available'}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-navy ring-1 ring-black/[0.05]">
                    Paid from wallet
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-navy ring-1 ring-black/[0.05]">
                    {currency}
                  </span>
                </div>
                {service && !service.open && service.reason ? (
                  <p className="mt-2 text-sm text-[#9F1C26]">{service.reason}</p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </header>

      {!catalog.isLoading && shown.steps?.length ? (
        <ol aria-label="How to buy" className="mt-4 grid gap-2 sm:grid-cols-3">
          {shown.steps.map((step, index) => (
            <li
              key={step}
              className="flex items-start gap-3 rounded-2xl border border-[#E3ECF7] bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(16,33,61,0.03)]"
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: shown.accent }}
              >
                {index + 1}
              </span>
              <p className="text-[13px] leading-5 text-navy">{step}</p>
            </li>
          ))}
        </ol>
      ) : null}

      {catalog.isLoading ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className="skeleton block h-16 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {catalog.isError ? (
        <div role="alert" className="mt-5 rounded-2xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-4">
          <p className="text-sm text-[#9F1C26]">{apiErrorMessage(catalog.error)}</p>
          <button
            type="button"
            onClick={catalog.refetch}
            className={`mt-3 inline-flex h-9 cursor-pointer items-center rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}
          >
            Try again
          </button>
        </div>
      ) : null}

      {service && catalog.data ? (
        <div className="mt-5">
          <ServiceProducts key={key} catalog={catalog.data} serviceKey={key} />
        </div>
      ) : null}
    </div>
  )
}
