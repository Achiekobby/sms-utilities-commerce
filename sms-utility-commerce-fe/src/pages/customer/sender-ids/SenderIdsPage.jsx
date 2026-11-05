import { Eye, Pencil, Search, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ActionMenu } from '../../../components/ActionMenu'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { SelectMenu } from '../../../components/SelectMenu'
import { apiErrorMessage, fieldErrors } from '../../../features/auth/client'
import { useNotify } from '../../../features/notifications/useNotify'
import {
  useCreateSenderIdMutation,
  useDeleteSenderIdMutation,
  useGetSenderIdsQuery,
  useUpdateSenderIdMutation,
} from '../../../services/api/sender-ids/senderIdsApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { useDebouncedValue } from '../../../utils/hooks/useDebouncedValue'
import { PageBar } from '../contacts/sections/PageBar'
import { formatCount } from '../dashboard/format'
import { formatSenderDay } from './model'
import { SenderDetail } from './sections/SenderDetail'
import { SenderFormDrawer } from './sections/SenderFormDrawer'
import { SenderStatus } from './sections/SenderStatus'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const head =
  'sticky top-0 z-[1] border-b border-[#E1EAF6] bg-[#F3F7FD] px-2.5 py-2.5 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap text-navy uppercase first:pl-4 last:pr-4 sm:px-3'
const cell = 'border-b border-[#E7EEF8] px-2.5 py-3.5 align-middle text-sm text-ink/75 first:pl-4 last:pr-4 sm:px-3'

const lengthOptions = [
  { id: '10', label: '10' },
  { id: '15', label: '15' },
  { id: '25', label: '25' },
  { id: '50', label: '50' },
]

const statusFilters = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
]
const actionTrigger = `inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-ink/40 transition-colors duration-150 hover:bg-ink/[0.05] hover:text-navy ${focusClass}`

function createButton(onClick, className = '') {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass} ${className}`}
    >
      Create sender ID
    </button>
  )
}

function RowActions({ sender, onView, onEdit, onDelete }) {
  return (
    <div className="flex justify-end">
      <ActionMenu
        label={`Actions for ${sender.name}`}
        iconOnly
        triggerClassName={actionTrigger}
        items={[
          {
            id: 'view',
            label: 'View details',
            icon: Eye,
            color: '#0B63F6',
            tint: '#E3EFFD',
            onClick: () => onView(sender),
          },
          {
            id: 'edit',
            label: 'Edit',
            icon: Pencil,
            color: '#0B63F6',
            tint: '#E3EFFD',
            onClick: () => onEdit(sender),
          },
          'separator',
          {
            id: 'delete',
            label: 'Delete',
            icon: Trash2,
            color: '#C21F2D',
            tint: '#FDECEE',
            tone: 'danger',
            onClick: () => onDelete(sender),
          },
        ]}
      />
    </div>
  )
}

export function SenderIdsPage() {
  useDocumentTitle('Sender IDs')
  const notify = useNotify()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const debounced = useDebouncedValue(search.trim().toLowerCase())
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(null)
  const [formField, setFormField] = useState('')
  const [formError, setFormError] = useState('')
  const [pendingUpdate, setPendingUpdate] = useState(null)
  const [updateError, setUpdateError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const query = useGetSenderIdsQuery({ page, perPage: pageSize, search: debounced, status })
  const [createSender, createState] = useCreateSenderIdMutation()
  const [updateSender, updateState] = useUpdateSenderIdMutation()
  const [deleteSender, deleteState] = useDeleteSenderIdMutation()
  const rows = useMemo(() => {
    const next = query.data?.rows ?? []
    return next.filter((sender) => {
      if (status !== 'all' && sender.status !== status) return false
      if (!debounced) return true
      return sender.name.toLowerCase().includes(debounced)
    })
  }, [debounced, query.data?.rows, status])
  const total = query.data?.total ?? 0
  const lastPage = query.data?.lastPage ?? 1
  const filteredAway = Boolean(debounced) || status !== 'all'
  const emptyAll = !query.isLoading && !query.isError && total === 0 && !filteredAway
  if (lastPage && page > lastPage) setPage(lastPage)

  function refine(setter) {
    return (value) => {
      setter(value)
      setPage(1)
    }
  }

  function clearFilters() {
    setSearch('')
    setStatus('all')
    setPage(1)
  }

  function openCreate() {
    setFormField('')
    setFormError('')
    setForm({ mode: 'create', name: '' })
  }

  function openEdit(sender) {
    setSelectedId(null)
    setFormField('')
    setFormError('')
    setForm({ mode: 'edit', id: sender.id, name: sender.name })
  }

  function askDelete(sender) {
    setSelectedId(null)
    setDeleteError('')
    setPendingDelete(sender)
  }

  async function submitCreate(name) {
    setFormField('')
    setFormError('')
    try {
      const result = await createSender({ name }).unwrap()
      notify.success(result.message)
      setForm(null)
      setPage(1)
    } catch (error) {
      const fields = fieldErrors(error)
      if (fields.name) setFormField(fields.name)
      else setFormError(apiErrorMessage(error))
    }
  }

  function askUpdate(name) {
    setUpdateError('')
    setPendingUpdate({ id: form.id, name })
  }

  async function confirmUpdate() {
    if (!pendingUpdate || updateState.isLoading) return
    setUpdateError('')
    try {
      const result = await updateSender(pendingUpdate).unwrap()
      notify.success(result.message)
      setPendingUpdate(null)
      setForm(null)
    } catch (error) {
      const fields = fieldErrors(error)
      if (fields.name) {
        setFormField(fields.name)
        setPendingUpdate(null)
        return
      }
      setUpdateError(apiErrorMessage(error))
    }
  }

  async function confirmDelete() {
    if (!pendingDelete || deleteState.isLoading) return
    setDeleteError('')
    try {
      const result = await deleteSender(pendingDelete.id).unwrap()
      notify.success(result.message)
      if (selectedId === pendingDelete.id) setSelectedId(null)
      setPendingDelete(null)
    } catch (error) {
      setDeleteError(apiErrorMessage(error))
    }
  }

  const currentPage = query.data?.page ?? page
  const currentPerPage = query.data?.perPage ?? pageSize
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * currentPerPage + 1
  const rangeEnd = Math.min(currentPage * currentPerPage, total)

  return (
    <div className="w-full">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Sender IDs</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
            Manage the sender names used when sending SMS messages.
          </p>
        </div>
        {createButton(openCreate, 'w-full shrink-0 sm:w-auto')}
      </header>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative min-w-0 flex-1 lg:max-w-md">
          <span className="sr-only">Search sender IDs</span>
          <Search size={15} strokeWidth={2} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/45" />
          <input
            type="search"
            value={search}
            onChange={(event) => refine(setSearch)(event.target.value)}
            placeholder="Search sender IDs"
            className="h-10 w-full rounded-lg border border-ink/15 bg-white pr-9 pl-9 text-[13px] text-navy placeholder:text-ink/45 transition-colors focus-visible:border-blue/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue"
          />
          {search ? (
            <button
              type="button"
              onClick={() => refine(setSearch)('')}
              aria-label="Clear search"
              className={`absolute top-1/2 right-2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-ink/45 hover:bg-canvas hover:text-navy ${focusClass}`}
            >
              <X size={14} strokeWidth={2.2} aria-hidden="true" />
            </button>
          ) : null}
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {statusFilters.map((item) => {
            const selected = status === item.id
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => refine(setStatus)(item.id)}
                className={`inline-flex h-9 cursor-pointer items-center rounded-lg border px-3 text-[13px] font-semibold whitespace-nowrap transition-colors ${focusClass} ${
                  selected ? 'border-blue bg-blue/[0.06] text-navy' : 'border-ink/15 bg-white text-navy hover:border-blue/40 hover:bg-canvas'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-[13px] text-ink/60 tabular-nums" aria-live="polite">
          {formatCount(filteredAway ? rows.length : total)} {(filteredAway ? rows.length : total) === 1 ? 'sender ID' : 'sender IDs'}
          {filteredAway ? ` of ${formatCount(total)}` : ''}
        </p>
        {filteredAway ? (
          <button
            type="button"
            onClick={clearFilters}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-sm text-[13px] font-semibold text-blue hover:text-blue/80 ${focusClass}`}
          >
            <X size={14} strokeWidth={2.2} aria-hidden="true" />
            Clear filters
          </button>
        ) : null}
      </div>

      <section className={query.isFetching && !query.isLoading ? 'opacity-60' : ''} aria-busy={query.isFetching}>
        {query.isLoading ? (
          <div role="status" className="mt-4 space-y-2">
            <span className="sr-only">Loading sender IDs</span>
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index} className="skeleton block h-12 rounded-lg" />
            ))}
          </div>
        ) : null}

        {query.isError ? (
          <div role="alert" className="mt-4 flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(query.error)}</p>
            <button
              type="button"
              onClick={query.refetch}
              className={`h-9 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}
            >
              Try again
            </button>
          </div>
        ) : null}

        {emptyAll ? (
          <div className="mt-4 rounded-xl border border-dashed border-ink/15 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-navy">No sender IDs yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-ink/55">
              Create a sender ID to identify your business when sending SMS messages.
            </p>
            <div className="mt-4">{createButton(openCreate)}</div>
          </div>
        ) : null}

        {!query.isLoading && !query.isError && !emptyAll && rows.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-ink/15 bg-[#F8FBFF] px-4 py-10 text-center">
            <p className="text-sm font-semibold text-navy">No matching sender IDs</p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-ink/55">Try a different search or clear the status filter.</p>
            {filteredAway ? (
              <button
                type="button"
                onClick={clearFilters}
                className={`mt-4 inline-flex h-9 cursor-pointer items-center rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy hover:border-blue/40 hover:bg-canvas ${focusClass}`}
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}

        {rows.length ? (
          <>
            <div className="mt-4 hidden w-full min-w-0 overflow-x-auto rounded-xl border border-[#D8E7FA] bg-white shadow-[0_1px_2px_rgba(20,115,230,0.05),0_12px_28px_-18px_rgba(11,31,91,0.4)] md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th scope="col" className={head}>Sender ID</th>
                    <th scope="col" className={head}>Status</th>
                    <th scope="col" className={head}>Created</th>
                    <th scope="col" className={`${head} text-right`}>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="[&>tr:last-child>*]:border-b-0">
                  {rows.map((sender) => (
                    <tr key={sender.id} className="transition-colors duration-150 hover:bg-canvas">
                      <th scope="row" className={`${cell} text-left text-[15px] font-semibold whitespace-nowrap text-navy`}>
                        {sender.name}
                      </th>
                      <td className={`${cell} whitespace-nowrap`}>
                        <span className="inline-flex items-center gap-2">
                          <SenderStatus status={sender.status} />
                          {sender.status === 'rejected' ? (
                            <button
                              type="button"
                              onClick={() => setSelectedId(sender.id)}
                              className={`text-[12px] font-medium text-ink/55 hover:text-navy ${focusClass}`}
                            >
                              View reason
                            </button>
                          ) : null}
                        </span>
                      </td>
                      <td className={`${cell} whitespace-nowrap text-ink/55`}>{formatSenderDay(sender.createdAt) || '—'}</td>
                      <td className={cell}>
                        <RowActions sender={sender} onView={(item) => setSelectedId(item.id)} onEdit={openEdit} onDelete={askDelete} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-4 divide-y divide-[#E7EEF8] rounded-xl border border-[#D8E7FA] md:hidden">
              {rows.map((sender) => (
                <li key={sender.id} className="px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy">{sender.name}</p>
                      <div className="mt-1.5">
                        <SenderStatus status={sender.status} compact />
                      </div>
                    </div>
                    <RowActions sender={sender} onView={(item) => setSelectedId(item.id)} onEdit={openEdit} onDelete={askDelete} />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-ink/45">Created {formatSenderDay(sender.createdAt) || '—'}</p>
                    {sender.status === 'rejected' ? (
                      <button
                        type="button"
                        onClick={() => setSelectedId(sender.id)}
                        className={`text-[12px] font-medium text-blue hover:text-navy ${focusClass}`}
                      >
                        View reason
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-[13px] text-ink/60 tabular-nums" aria-live="polite">
                  {total === 0 ? 'Showing 0 entries' : `Showing ${formatCount(rangeStart)}–${formatCount(rangeEnd)} of ${formatCount(total)}`}
                </p>
                <label className="inline-flex items-center gap-2 text-[13px] text-ink/60">
                  <span className="whitespace-nowrap">Show</span>
                  <SelectMenu
                    label="Rows per page"
                    value={String(pageSize)}
                    options={lengthOptions}
                    onChange={(id) => {
                      setPageSize(Number(id))
                      setPage(1)
                    }}
                    compact
                    placement="top"
                    align="left"
                    className="w-[4.5rem]"
                    menuClassName="w-24"
                  />
                  <span>per page</span>
                </label>
              </div>
              <PageBar
                page={currentPage}
                lastPage={lastPage}
                total={total}
                perPage={currentPerPage}
                onPage={setPage}
                label="Sender ID pages"
                className=""
                showSummary={false}
              />
            </div>
          </>
        ) : null}
      </section>

      {selectedId ? (
        <SenderDetail id={selectedId} onClose={() => setSelectedId(null)} onEdit={openEdit} onDelete={askDelete} />
      ) : null}

      {form ? (
        <SenderFormDrawer
          mode={form.mode}
          initialName={form.name}
          busy={createState.isLoading}
          serverField={formField}
          serverError={formError}
          onSubmit={form.mode === 'edit' ? askUpdate : submitCreate}
          onClose={() => {
            if (createState.isLoading) return
            setForm(null)
          }}
        />
      ) : null}

      {pendingUpdate ? (
        <ConfirmDialog
          title="Update sender ID?"
          description="Changing this sender ID will submit it for approval again. It may not be available for use until the review is complete."
          confirmLabel="Update sender ID"
          busyLabel="Updating..."
          tone="warning"
          busy={updateState.isLoading}
          error={updateError}
          onConfirm={confirmUpdate}
          onClose={() => {
            if (updateState.isLoading) return
            setPendingUpdate(null)
          }}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title="Delete sender ID?"
          description={`You are about to delete “${pendingDelete.name}”. This action cannot be undone.`}
          confirmLabel="Delete sender ID"
          busyLabel="Deleting..."
          tone="danger"
          busy={deleteState.isLoading}
          error={deleteError}
          onConfirm={confirmDelete}
          onClose={() => {
            if (deleteState.isLoading) return
            setPendingDelete(null)
          }}
        />
      ) : null}
    </div>
  )
}
