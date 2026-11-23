import { ArrowLeft, CircleCheck, CircleOff, FileText, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/session'
import { useNotify } from '../../../features/notifications/useNotify'
import {
  formatTemplateWhen,
  labelize,
  templateStatusTone,
  templateTypeLabel,
} from '../../../features/templates/templateModel'
import { paths } from '../../../routes/paths'
import {
  useDeleteTemplateMutation,
  useGetTemplateQuery,
  useSetTemplateStatusMutation,
} from '../../../services/api/templates/templatesApi'
import { ConfirmDialog } from '../profile/settings/ConfirmDialog'
import { cardClass, focusClass } from './ui'

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    good: 'bg-[#E7F8F0] text-green',
    wait: 'bg-[#FFF4DF] text-[#9A5B00]',
    bad: 'bg-[#FDECEE] text-[#9F1C26]',
    neutral: 'bg-[#F3F6FB] text-navy',
  }
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  )
}

function Row({ label, children }) {
  if (children == null || children === '') return null
  return (
    <div className="grid gap-1 border-b border-ink/[0.06] py-3 last:border-b-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-[12px] font-semibold tracking-wide text-ink/45 uppercase">{label}</dt>
      <dd className="min-w-0 text-sm text-ink/80">{children}</dd>
    </div>
  )
}

export function TemplateDetailPage() {
  const { templateId } = useParams()
  const id = templateId ? String(templateId) : ''
  const navigate = useNavigate()
  const notify = useNotify()
  const { data: template, isLoading, isFetching, isError, error, refetch } = useGetTemplateQuery(id, {
    skip: !id,
  })
  const [setTemplateStatus, statusState] = useSetTemplateStatusMutation()
  const [deleteTemplate, deleteState] = useDeleteTemplateMutation()
  const [pendingStatus, setPendingStatus] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)
  const [actionError, setActionError] = useState('')

  const waiting = !template && (isLoading || isFetching) && !isError
  const active = String(template?.status ?? '').toLowerCase() === 'active'
  const nextStatus = active ? 'inactive' : 'active'
  const placeholders = Array.isArray(template?.placeholders) ? template.placeholders : []
  const questions = Array.isArray(template?.questions) ? template.questions : []
  const cta = template?.cta && typeof template.cta === 'object' ? template.cta : null
  const actionBusy = statusState.isLoading || deleteState.isLoading

  async function confirmStatus() {
    if (!template || statusState.isLoading) return
    setActionError('')
    try {
      const result = await setTemplateStatus({ id: template.id, status: nextStatus }).unwrap()
      notify.success(
        result?.message || (nextStatus === 'active' ? 'Template activated.' : 'Template deactivated.'),
      )
      setPendingStatus(false)
    } catch (failure) {
      setActionError(apiErrorMessage(failure))
    }
  }

  async function confirmDelete() {
    if (!template || deleteState.isLoading) return
    setActionError('')
    try {
      const result = await deleteTemplate(template.id).unwrap()
      notify.success(result?.message || 'Template deleted.')
      setPendingDelete(false)
      navigate(paths.templates)
    } catch (failure) {
      setActionError(apiErrorMessage(failure))
    }
  }

  if (waiting) {
    return (
      <div role="status" className="space-y-3">
        <span className="sr-only">Loading template</span>
        <span className="skeleton block h-8 w-48 rounded-lg" />
        <span className="skeleton block h-64 rounded-xl" />
      </div>
    )
  }

  if (isError || !template) {
    return (
      <div role="alert" className="rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-4">
        <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error) || 'This template could not be loaded.'}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refetch}
            className={`inline-flex h-9 cursor-pointer items-center rounded-lg bg-navy px-3 text-sm font-semibold text-white ${focusClass}`}
          >
            Try again
          </button>
          <Link
            to={paths.templates}
            className={`inline-flex h-9 items-center rounded-lg border border-ink/15 px-3 text-sm font-semibold text-navy ${focusClass}`}
          >
            Back to templates
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 max-w-4xl space-y-5 pb-10">
      <div>
        <Link
          to={paths.templates}
          className={`inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy/70 hover:text-navy ${focusClass}`}
        >
          <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
          All Templates
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F0FF] text-blue ring-1 ring-blue/15">
              <FileText size={22} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[1.75rem] leading-none font-bold tracking-tight text-navy">
                  {template.name || 'Untitled'}
                </h1>
                <Badge tone={templateStatusTone(template.status)}>{labelize(template.status) || 'Unknown'}</Badge>
              </div>
              <p className="mt-2 text-sm text-ink/55">
                {templateTypeLabel(template.type)}
                {template.category ? ` · ${labelize(template.category)}` : ''}
                {template.scope ? ` · ${labelize(template.scope)}` : template.is_system ? ' · System' : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={paths.editTemplate(template.id)}
              className={`inline-flex h-10 items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-3.5 text-sm font-semibold text-navy hover:border-blue/40 ${focusClass}`}
            >
              <Pencil size={15} strokeWidth={1.8} aria-hidden="true" />
              Edit
            </Link>
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => {
                setActionError('')
                setPendingStatus(true)
              }}
              className={`inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-3.5 text-sm font-semibold hover:border-blue/40 disabled:opacity-60 ${focusClass} ${
                active ? 'text-[#9F1C26]' : 'text-green'
              }`}
            >
              {active ? (
                <CircleOff size={15} strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <CircleCheck size={15} strokeWidth={1.8} aria-hidden="true" />
              )}
              {active ? 'Deactivate' : 'Activate'}
            </button>
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => {
                setActionError('')
                setPendingDelete(true)
              }}
              className={`inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-[#C21F2D]/25 bg-white px-3.5 text-sm font-semibold text-[#C21F2D] hover:bg-[#FDECEE] disabled:opacity-60 ${focusClass}`}
            >
              <Trash2 size={15} strokeWidth={1.8} aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <section className={cardClass}>
        <h2 className="text-sm font-bold text-navy">Details</h2>
        <dl className="mt-1">
          <Row label="Type">{templateTypeLabel(template.type)}</Row>
          <Row label="Category">{labelize(template.category) || '—'}</Row>
          <Row label="Occasion">{template.occasion_type ? labelize(template.occasion_type) : null}</Row>
          <Row label="Scope">{template.scope ? labelize(template.scope) : template.is_system ? 'System' : null}</Row>
          <Row label="Description">{template.description || null}</Row>
          <Row label="Updated">{formatTemplateWhen(template.updated_at || template.created_at)}</Row>
          <Row label="Created">{formatTemplateWhen(template.created_at)}</Row>
        </dl>
      </section>

      <section className={cardClass}>
        <h2 className="text-sm font-bold text-navy">Message</h2>
        <dl className="mt-1">
          {template.intro ? (
            <Row label="Intro">
              <p className="whitespace-pre-wrap break-words">{template.intro}</p>
            </Row>
          ) : null}
          <Row label="Body">
            <p className="whitespace-pre-wrap break-words">{template.body || '—'}</p>
          </Row>
          {cta ? (
            <Row label="CTA">
              <p className="font-semibold text-navy">{cta.label || labelize(cta.type) || 'CTA'}</p>
              <p className="mt-0.5 text-ink/70">{cta.url || cta.value || '—'}</p>
            </Row>
          ) : null}
          {placeholders.length ? (
            <Row label="Placeholders">
              <div className="flex flex-wrap gap-1.5">
                {placeholders.map((item) => (
                  <span key={item} className="rounded-md bg-[#F3F6FB] px-1.5 py-0.5 font-mono text-[11px] text-navy">
                    {`{${item}}`}
                  </span>
                ))}
              </div>
            </Row>
          ) : null}
        </dl>
      </section>

      {questions.length ? (
        <section className={cardClass}>
          <h2 className="text-sm font-bold text-navy">Survey questions · {questions.length}</h2>
          <ol className="mt-3 space-y-3">
            {questions.map((question, index) => (
              <li key={`${question.prompt}-${index}`} className="rounded-xl border border-ink/[0.08] bg-[#F8FAFC] px-3.5 py-3">
                <p className="text-[11px] font-semibold tracking-wide text-ink/45 uppercase">
                  Q{index + 1} · {labelize(question.type)}
                  {question.required === false ? '' : ' · Required'}
                </p>
                <p className="mt-1 text-sm text-ink/80">{question.prompt || '—'}</p>
                {Array.isArray(question.options) && question.options.length ? (
                  <p className="mt-1 text-xs text-ink/50">{question.options.join(' · ')}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {pendingStatus ? (
        <ConfirmDialog
          title={active ? `Deactivate ${template.name}?` : `Activate ${template.name}?`}
          description={
            active
              ? 'It stays in the library but won’t be used for new sends until activated again.'
              : 'This template will be available for campaigns and SMS again.'
          }
          confirmLabel={active ? 'Deactivate template' : 'Activate template'}
          tone={active ? 'warning' : 'caution'}
          error={actionError}
          busy={statusState.isLoading}
          onConfirm={confirmStatus}
          onClose={() => {
            if (statusState.isLoading) return
            setPendingStatus(false)
            setActionError('')
          }}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title={`Delete ${template.name}?`}
          description="This permanently removes the template from the platform."
          confirmLabel="Delete template"
          tone="danger"
          error={actionError}
          busy={deleteState.isLoading}
          onConfirm={confirmDelete}
          onClose={() => {
            if (deleteState.isLoading) return
            setPendingDelete(false)
            setActionError('')
          }}
        />
      ) : null}
    </div>
  )
}
