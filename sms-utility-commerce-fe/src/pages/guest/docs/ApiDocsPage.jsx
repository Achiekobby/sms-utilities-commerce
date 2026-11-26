import { BookOpen, Check, ChevronDown, ChevronRight, Copy, KeyRound, Layers, Link2, MessageSquareText, Radio, Search, Shield } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { env } from '../../../config/env'
import { paths } from '../../../routes/paths'
import { useAuth } from '../../../utils/hooks/useAuth'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { docGroups } from './apiDocs'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const languages = ['cURL', 'JavaScript', 'Node', 'PHP', 'Laravel', 'Python', 'Java']

const navIcon = {
  'sender-ids': Radio,
  sms: MessageSquareText,
}

export function ApiDocsPage() {
  useDocumentTitle('API documentation')
  const searchRef = useRef(null)
  const navRef = useRef(null)
  const [query, setQuery] = useState('')
  const [closed, setClosed] = useState(() => new Set(docGroups.filter((group) => !group.endpoints.length).map((group) => group.id)))
  const filtered = useMemo(() => filterGroups(docGroups, query), [query])
  const ids = useMemo(() => filtered.flatMap((group) => [group.id, ...group.endpoints.map((endpoint) => endpoint.id)]), [filtered])
  const activeId = useActiveSection(ids)
  const currentId = ids.includes(activeId) ? activeId : (ids[0] ?? '')
  const activeGroup = groupFor(filtered, currentId) ?? filtered[0]
  const endpointCount = docGroups.reduce((total, group) => total + group.endpoints.length, 0)
  const baseUrl = docsBaseUrl()
  const { isAuthenticated, isVerified } = useAuth()
  const shortcut = isMac() ? '⌘ K' : 'Ctrl K'

  useEffect(() => {
    if (isAuthenticated && isVerified) return undefined

    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.scrollIntoView({ block: 'center' })
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isAuthenticated, isVerified])

  useEffect(() => {
    const group = groupFor(filtered, currentId)
    if (!group) return undefined
    setClosed((current) => {
      if (!current.has(group.id)) return current
      const next = new Set(current)
      next.delete(group.id)
      return next
    })
    return undefined
  }, [currentId, filtered])

  useEffect(() => {
    const nav = navRef.current
    if (!nav || !currentId) return undefined
    const link = nav.querySelector(`a[href="#${CSS.escape(currentId)}"]`)
    if (!(link instanceof HTMLElement)) return undefined
    const navBox = nav.getBoundingClientRect()
    const linkBox = link.getBoundingClientRect()
    const hidden = linkBox.top < navBox.top + 8 || linkBox.bottom > navBox.bottom - 8
    if (hidden) nav.scrollTop += linkBox.top - navBox.top - nav.clientHeight / 2 + linkBox.height / 2
    return undefined
  }, [currentId])

  function toggleGroup(id) {
    setClosed((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="bg-[#F4F7FB]">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#062047] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(480px_160px_at_100%_0%,rgba(11,99,246,0.42),transparent_62%)]" />
        <div className="relative mx-auto max-w-8xl px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-8">
            <div className="min-w-0 lg:w-[22rem] lg:shrink-0">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase">API documentation</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">UtiliSMS API</h1>
              <p className="mt-1 text-sm leading-5 text-white/70">Sender IDs, contact groups, and SMS for Ghana.</p>
            </div>
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search the documentation</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/40" size={16} aria-hidden="true" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setQuery('')
                }}
                placeholder="Search endpoints"
                className={`h-10 w-full rounded-lg bg-white pr-16 pl-9 text-sm text-navy shadow-[0_8px_20px_-16px_rgba(0,0,0,0.6)] placeholder:text-ink/40 ${focusClass}`}
              />
              <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md border border-[#E1EAF6] bg-[#F7FAFD] px-1.5 py-0.5 font-sans text-[11px] font-semibold text-ink/55">
                {shortcut}
              </kbd>
            </label>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <a href="#sender-ids" className={`flex min-w-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/10 px-3 py-2 hover:bg-white/15 ${focusClass}`}>
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10">
                <Layers size={15} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold tracking-wide text-white/55 uppercase">Endpoints</span>
                <span className="block truncate text-[13px] font-semibold">{endpointCount} routes</span>
              </span>
            </a>
            <div id="authentication" className="flex scroll-mt-24 items-center gap-2.5 rounded-xl border border-white/10 bg-white/10 px-3 py-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10">
                <Shield size={15} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold tracking-wide text-white/55 uppercase">Authentication</span>
                <span className="block truncate text-[13px] font-semibold">Bearer API key</span>
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/10 px-3 py-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10">
                <Link2 size={15} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold tracking-wide text-white/55 uppercase">Base URL</span>
                <span className="block truncate font-mono text-[12px] text-white/90" title={baseUrl || 'Configured API host'}>{baseUrl || 'Configured API host'}</span>
              </span>
              <CopyButton text={baseUrl || 'Configured API host'} label="Copy base URL" compact tone="dark" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-8xl px-4 py-6 pb-16 sm:px-6 sm:py-8">
        <div className="docs-shell">
          <nav ref={navRef} aria-label="API sections" className={`docs-side rounded-2xl border border-[#E6EDF5] bg-white p-3 shadow-[0_1px_2px_rgba(16,33,61,0.04)] ${isAuthenticated && isVerified ? 'lg:top-14' : 'lg:top-16'}`}>
            <p className="flex items-center gap-2 px-2 py-2 text-sm font-bold text-navy">
              <BookOpen size={16} className="text-blue" aria-hidden="true" />
              UtiliSMS API Docs
            </p>
            <div className="mt-1 space-y-1">
              <a href="#docs-top" className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-ink/70 hover:bg-[#F4F7FB] hover:text-navy ${focusClass}`}>
                Overview
              </a>
              {filtered.map((group) => {
                const Icon = navIcon[group.id] ?? Radio
                const open = !closed.has(group.id)
                const groupCurrent = currentId === group.id || group.endpoints.some((endpoint) => endpoint.id === currentId)
                return (
                  <div key={group.id}>
                    <div className={`flex items-center rounded-lg ${groupCurrent ? 'bg-[#E8F1FF]' : ''}`}>
                      <a
                        href={`#${group.id}`}
                        aria-current={currentId === group.id ? 'true' : undefined}
                        className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold ${groupCurrent ? 'text-blue' : 'text-navy hover:text-blue'} ${focusClass}`}
                      >
                        <Icon size={15} className="shrink-0" aria-hidden="true" />
                        <span className="leading-5">{group.title}</span>
                      </a>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-label={`${open ? 'Collapse' : 'Expand'} ${group.title}`}
                        onClick={() => toggleGroup(group.id)}
                        className={`mr-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-ink/50 hover:bg-white/70 hover:text-navy ${focusClass}`}
                      >
                        <ChevronDown size={15} className={`transition-transform ${open ? '' : '-rotate-90'}`} aria-hidden="true" />
                      </button>
                    </div>
                    {open ? (
                      <ul className="mt-0.5 space-y-0.5 pb-1 pl-4">
                        {group.endpoints.map((endpoint) => {
                          const current = currentId === endpoint.id
                          return (
                            <li key={endpoint.id}>
                              <a
                                href={`#${endpoint.id}`}
                                aria-current={current ? 'true' : undefined}
                                className={`block rounded-lg px-2 py-1.5 text-[13px] ${current ? 'bg-[#E8F1FF] font-semibold text-blue' : 'text-ink/70 hover:bg-[#F4F7FB] hover:text-navy'} ${focusClass}`}
                              >
                                {endpoint.name}
                              </a>
                            </li>
                          )
                        })}
                        {!group.endpoints.length ? <li className="px-2 py-1.5 text-[13px] text-ink/45">Coming next</li> : null}
                      </ul>
                    ) : null}
                  </div>
                )
              })}
              {!filtered.length ? <p className="px-2 py-3 text-sm text-ink/55">No matching sections.</p> : null}
            </div>
          </nav>

          <div id="docs-top" className="docs-main min-w-0 scroll-mt-24 space-y-12">
            {query.trim() ? (
              <p className="text-sm text-ink/60" aria-live="polite">
                {countEndpoints(filtered)} matching {countEndpoints(filtered) === 1 ? 'endpoint' : 'endpoints'}
              </p>
            ) : null}
            {filtered.length ? (
              filtered.map((group) => (
                <section key={group.id} id={group.id} className="scroll-mt-28">
                  <p className="flex items-center gap-1.5 text-[13px] text-ink/50">
                    <a href="#docs-top" className={`hover:text-navy ${focusClass}`}>Docs</a>
                    <ChevronRight size={14} aria-hidden="true" />
                    <span className="font-semibold text-navy">{group.title}</span>
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy">{group.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/70">{group.summary}</p>
                  {group.id === 'sender-ids' ? (
                    <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#E6EDF5] bg-white px-3 py-1 text-sm font-semibold text-navy shadow-[0_1px_2px_rgba(16,33,61,0.04)]">
                      <svg viewBox="0 0 18 12" className="h-3.5 w-5 rounded-[2px]" aria-hidden="true">
                        <rect width="18" height="4" fill="#CE1126" />
                        <rect y="4" width="18" height="4" fill="#FCD116" />
                        <rect y="8" width="18" height="4" fill="#006B3F" />
                        <polygon points="9,4.6 9.55,6.15 11.2,6.15 9.85,7.15 10.35,8.75 9,7.8 7.65,8.75 8.15,7.15 6.8,6.15 8.45,6.15" fill="#000" />
                      </svg>
                      Ghana (GH)
                    </p>
                  ) : null}
                  {group.endpoints.length ? (
                    <div className="mt-6 space-y-5">
                      {group.endpoints.map((endpoint) => (
                        <Endpoint key={endpoint.id} endpoint={endpoint} baseUrl={baseUrl} />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-dashed border-[#C5D4EA] bg-white px-4 py-5">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F3F7FD] text-blue">
                        <MessageSquareText size={18} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-navy">SMS endpoints will be listed here</p>
                        <p className="mt-1 text-sm leading-6 text-ink/70">Send and delivery routes are next. Sender ID routes above are ready to use.</p>
                      </div>
                    </div>
                  )}
                </section>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#C5D4EA] bg-white px-5 py-8 text-center">
                <p className="text-sm font-semibold text-navy">No endpoints match “{query.trim()}”.</p>
                <button type="button" onClick={() => setQuery('')} className={`mt-3 cursor-pointer text-sm font-semibold text-blue hover:underline ${focusClass}`}>
                  Clear search
                </button>
              </div>
            )}
          </div>

          <aside className="docs-rail space-y-4 lg:sticky lg:top-20">
            <div className="rounded-2xl border border-[#E6EDF5] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04)]">
              <p className="text-sm font-bold text-navy">On this page</p>
              <ul className="mt-3 space-y-1">
                {(activeGroup?.endpoints.length ? activeGroup.endpoints : filtered.flatMap((group) => group.endpoints)).map((endpoint) => {
                  const current = currentId === endpoint.id
                  return (
                    <li key={endpoint.id}>
                      <a
                        href={`#${endpoint.id}`}
                        aria-current={current ? 'true' : undefined}
                        className={`block rounded-lg px-2 py-1.5 text-[13px] ${current ? 'bg-[#E8F1FF] font-semibold text-blue' : 'text-ink/70 hover:bg-[#F4F7FB] hover:text-navy'} ${focusClass}`}
                      >
                        {endpoint.name}
                      </a>
                    </li>
                  )
                })}
                {!filtered.some((group) => group.endpoints.length) ? <li className="px-2 py-1.5 text-[13px] text-ink/45">Nothing to list yet.</li> : null}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#E6EDF5] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04)]">
              <p className="text-sm font-bold text-navy">Related</p>
              <ul className="mt-3 space-y-1">
                <li>
                  <a href="#authentication" className={`block rounded-lg px-2 py-1.5 text-[13px] text-ink/70 hover:bg-[#F4F7FB] hover:text-navy ${focusClass}`}>
                    Authentication
                  </a>
                </li>
                <li>
                  <Link to={paths.apiKeys} className={`block rounded-lg px-2 py-1.5 text-[13px] text-ink/70 hover:bg-[#F4F7FB] hover:text-navy ${focusClass}`}>
                    API keys
                  </Link>
                </li>
                <li>
                  <a href="#contact-groups" className={`block rounded-lg px-2 py-1.5 text-[13px] text-ink/70 hover:bg-[#F4F7FB] hover:text-navy ${focusClass}`}>
                    Contact groups
                  </a>
                </li>
                <li>
                  <a href="#sms" className={`block rounded-lg px-2 py-1.5 text-[13px] text-ink/70 hover:bg-[#F4F7FB] hover:text-navy ${focusClass}`}>
                    SMS management
                  </a>
                </li>
                <li>
                  <a href="#create-sender-id" className={`block rounded-lg px-2 py-1.5 text-[13px] text-ink/70 hover:bg-[#F4F7FB] hover:text-navy ${focusClass}`}>
                    Sender ID rules
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#D7E6FA] bg-[#F3F8FF] p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-navy">
                <KeyRound size={15} className="text-blue" aria-hidden="true" />
                Need a Sender ID in Ghana?
              </p>
              <p className="mt-2 text-[13px] leading-5 text-ink/70">
                Sender IDs are reviewed before they can send. The name has to follow the sender ID rules.
              </p>
              <a href="#create-sender-id" className={`mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-blue hover:underline ${focusClass}`}>
                View sender ID rules
                <ChevronRight size={14} aria-hidden="true" />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Endpoint({ endpoint, baseUrl }) {
  const requestFields = endpoint.body ? endpoint.fields : null
  const responseFields = endpoint.body ? null : endpoint.fields

  return (
    <article id={endpoint.id} className="scroll-mt-28 rounded-2xl border border-[#E6EDF5] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <MethodBadge method={endpoint.method} />
          <code className="min-w-0 font-mono text-sm font-semibold break-all text-navy">{endpoint.path}</code>
        </div>
        <CopyButton text={endpointLink(endpoint.id)} label="Copy link" idle="Copy link" copied="Copied" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-navy">{endpoint.name}</h3>
      <p className="mt-1.5 max-w-3xl text-sm leading-6 text-ink/70">{endpoint.description}</p>

      <div className="mt-5 space-y-5">
        {endpoint.params?.length ? <ParamTable title="Path parameter" items={endpoint.params} /> : null}
        {endpoint.query?.length ? <ParamTable title="Parameters" items={endpoint.query} /> : null}
        {requestFields?.length ? <ParamTable title="Request body" items={requestFields} showRequired /> : null}
        {endpoint.rules?.length ? <RuleList rules={endpoint.rules} /> : null}
        {!endpoint.params?.length && !endpoint.query?.length && !requestFields?.length && !endpoint.rules?.length ? (
          <p className="text-sm leading-6 text-ink/60">This route takes no parameters. The sample below is the request.</p>
        ) : null}
        <ExampleRequest endpoint={endpoint} baseUrl={baseUrl} />
      </div>

      {endpoint.responses?.length ? <ResponsePanel responses={endpoint.responses} /> : null}
      {responseFields?.length ? <ResponseFields items={responseFields} /> : null}
    </article>
  )
}

function ParamTable({ title, items, showRequired = false }) {
  const showExample = items.some((item) => item.example)
  return (
    <div>
      {title ? <h4 className="text-sm font-semibold text-navy">{title}</h4> : null}
      <div className={`${title ? 'mt-3' : ''} overflow-x-auto`}>
        <table className="w-full min-w-[18rem] text-left">
          <thead>
            <tr className="border-b border-[#E6EDF5] text-[12px] font-semibold text-ink/45">
              <th className="pr-3 pb-2 font-semibold">{showRequired ? 'Field' : 'Name'}</th>
              <th className="pr-3 pb-2 font-semibold">Type</th>
              {showRequired ? <th className="pr-3 pb-2 font-semibold">Required</th> : null}
              {showExample ? <th className="pr-3 pb-2 font-semibold">Example</th> : null}
              <th className="pb-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.name} className="border-b border-[#F0F4F9] last:border-b-0">
                <td className="py-3 pr-3 align-top font-mono text-[13px] font-semibold text-navy">{item.name}</td>
                <td className="py-3 pr-3 align-top text-[13px] text-ink/50">{item.type ?? 'string'}</td>
                {showRequired ? (
                  <td className={`py-3 pr-3 align-top text-[13px] font-semibold ${item.required ? 'text-navy' : 'text-ink/45'}`}>
                    {item.required ? 'Yes' : 'No'}
                  </td>
                ) : null}
                {showExample ? (
                  <td className="py-3 pr-3 align-top font-mono text-[13px] text-navy">{item.example || '—'}</td>
                ) : null}
                <td className="py-3 align-top text-[13px] leading-5 text-ink/70">{item.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RuleList({ rules }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-navy">Sender ID rules</h4>
      <ul className="mt-3 space-y-2">
        {rules.map((item) => (
          <li key={item.rule} className="text-[13px] leading-5 text-ink/70">
            <span className="font-medium text-navy">{item.rule}</span>
            {item.example || item.avoid ? (
              <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                {item.example ? (
                  <span>
                    Example <span className="font-mono font-semibold text-[#067348]">{item.example}</span>
                  </span>
                ) : null}
                {item.avoid ? (
                  <span>
                    Avoid <span className="font-mono font-semibold text-[#9F1C26]">{item.avoid}</span>
                  </span>
                ) : null}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ExampleRequest({ endpoint, baseUrl }) {
  const [language, setLanguage] = useState(languages[0])
  const [variant, setVariant] = useState(0)
  const variants = endpoint.samples?.length ? endpoint.samples : null
  const active = variants ? variants[variant] ?? variants[0] : null
  const sample = requestSample(
    {
      ...endpoint,
      body: active && Object.hasOwn(active, 'body') ? active.body : endpoint.body,
      query: active?.query ?? endpoint.query,
    },
    baseUrl,
    language,
  )

  return (
    <div className="min-w-0">
      <h4 className="text-sm font-semibold text-navy">Example request</h4>
      {variants ? (
        <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Request example">
          {variants.map((item, index) => {
            const selected = index === variant
            return (
              <button
                key={item.label}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setVariant(index)}
                className={`inline-flex cursor-pointer items-center rounded-lg px-2.5 py-1.5 font-mono text-xs font-semibold ${selected ? 'bg-navy text-white' : 'bg-[#F4F7FB] text-navy hover:bg-[#E7F1FC]'} ${focusClass}`}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      ) : null}
      <CodeBlock
        className="mt-3"
        sample={sample}
        toolbar={(
          <div className="flex min-w-0 gap-1 overflow-x-auto" role="tablist" aria-label="Request language">
            {languages.map((item) => {
              const selected = item === language
              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setLanguage(item)}
                  className={`shrink-0 cursor-pointer rounded-md px-2 py-1 text-xs font-semibold ${selected ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white'} ${focusClass}`}
                >
                  {item}
                </button>
              )
            })}
          </div>
        )}
      />
    </div>
  )
}

function ResponsePanel({ responses }) {
  const initial = Math.max(0, responses.findIndex((item) => String(item.status ?? '200').startsWith('2')))
  const [index, setIndex] = useState(initial)
  const current = responses[index] ?? responses[0]
  const status = String(current?.status ?? '')
  const label = [status, current?.title].filter(Boolean).join(' ')

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-navy">Example response{label ? ` (${label})` : ''}</h4>
        {status ? <span className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold ${statusTone(status, true)}`}>{status}</span> : null}
      </div>
      {responses.length > 1 ? (
        <div className="mt-3 space-y-1.5" role="tablist" aria-label="Response samples">
          {[responses.slice(0, Math.ceil(responses.length / 2)), responses.slice(Math.ceil(responses.length / 2))].map((row) => (
            <div key={row[0]?.status + row[0]?.title} className="flex flex-wrap gap-1.5">
              {row.map((item) => {
                const itemIndex = responses.indexOf(item)
                const selected = itemIndex === index
                return (
                  <button
                    key={`${item.status}-${item.title}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setIndex(itemIndex)}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap ${selected ? statusTone(item.status, true) : 'bg-[#F4F7FB] text-navy hover:bg-[#E7F1FC]'} ${focusClass}`}
                  >
                    <span className="font-mono">{item.status}</span>
                    <span>{item.title}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      ) : null}
      {current?.detail ? <p className="mt-2 text-[13px] leading-5 text-ink/65">{current.detail}</p> : null}
      <CodeBlock className="mt-3" sample={JSON.stringify(current?.body, null, 2)} json />
    </div>
  )
}

function ResponseFields({ items }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-4 rounded-xl border border-[#E6EDF5] bg-[#F8FAFC]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-navy ${focusClass}`}
      >
        Response fields
        <ChevronDown size={16} className={`text-ink/45 transition-transform ${open ? '' : '-rotate-90'}`} aria-hidden="true" />
      </button>
      {open ? <div className="px-4 pb-4"><ParamTable title="" items={items} /></div> : null}
    </div>
  )
}

function CodeBlock({ sample, toolbar, json = false, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-[#0C1B33] shadow-[0_12px_28px_-20px_rgba(6,32,71,0.9)] ${className}`}>
      {toolbar ? (
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
          <div className="min-w-0">{toolbar}</div>
          <CopyButton text={sample} label="Copy sample" compact tone="dark" />
        </div>
      ) : (
        <div className="absolute top-2 right-2 z-10">
          <CopyButton text={sample} label="Copy sample" compact tone="dark" />
        </div>
      )}
      <pre className={`max-h-[22rem] overflow-auto p-4 font-mono text-[12px] leading-5 text-[#D5E2F4] ${toolbar ? '' : 'pt-11'}`}>
        {json ? <JsonText text={sample} /> : <CodeText text={sample} />}
      </pre>
    </div>
  )
}

function CopyButton({ text, label, idle = 'Copy', copied = 'Copied', compact = false, tone = 'light' }) {
  const [done, setDone] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      window.setTimeout(() => setDone(false), 1600)
    } catch {
      setDone(false)
    }
  }

  const toneClass = tone === 'dark'
    ? 'bg-white/10 text-white hover:bg-white/20'
    : 'text-ink/50 hover:bg-[#F4F7FB] hover:text-navy'

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={done ? copied : label}
      className={`inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-xs font-semibold ${toneClass} ${focusClass}`}
    >
      {done ? <Check size={13} strokeWidth={2.4} aria-hidden="true" /> : <Copy size={13} strokeWidth={2.2} aria-hidden="true" />}
      {compact ? null : done ? copied : idle}
    </button>
  )
}

function MethodBadge({ method }) {
  return <span className={`rounded-md px-2 py-1 font-mono text-[11px] font-bold tracking-wide ${methodTone(method)}`}>{method}</span>
}

function methodTone(method) {
  if (method === 'POST') return 'bg-[#E7F1FC] text-blue'
  if (method === 'DELETE') return 'bg-[#FDECEE] text-[#9F1C26]'
  return 'bg-[#E5F6EC] text-[#067348]'
}

function statusTone(status, selected) {
  const code = String(status ?? '')
  if (!selected) return 'bg-[#F4F7FB] text-navy'
  if (code.startsWith('2')) return 'bg-[#067348] text-white'
  if (code.startsWith('4') || code.startsWith('5')) return 'bg-[#9F1C26] text-white'
  return 'bg-navy text-white'
}

function useActiveSection(ids) {
  const [activeId, setActiveId] = useState(ids[0] ?? '')

  useEffect(() => {
    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!nodes.length) return undefined

    let frame = 0
    function update() {
      frame = 0
      const line = 160
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      let current = atBottom ? nodes[nodes.length - 1].id : nodes[0].id
      if (!atBottom) {
        for (const node of nodes) {
          if (node.getBoundingClientRect().top <= line) current = node.id
        }
      }
      setActiveId((prev) => (prev === current ? prev : current))
    }

    function onScroll() {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('hashchange', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('hashchange', onScroll)
    }
  }, [ids])

  return activeId
}

function filterGroups(groups, raw) {
  const words = raw.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length || (words.length === 1 && (words[0] === 'endpoint' || words[0] === 'endpoints'))) return groups

  return groups
    .map((group) => {
      const groupHit = words.every((word) => hasWord(`${group.title} ${group.summary}`.toLowerCase(), word))
      const endpoints = group.endpoints.filter((endpoint) => endpointMatches(endpoint, words))
      if (!groupHit && !endpoints.length) return null
      return { ...group, endpoints: groupHit && !endpoints.length ? group.endpoints : endpoints }
    })
    .filter(Boolean)
}

function endpointMatches(endpoint, words) {
  const haystack = [
    endpoint.name,
    endpoint.method,
    endpoint.path,
    endpoint.description,
    ...(endpoint.query ?? []).flatMap((item) => [item.name, item.detail, item.example]),
    ...(endpoint.params ?? []).flatMap((item) => [item.name, item.detail, item.example]),
    ...(endpoint.fields ?? []).flatMap((item) => [item.name, item.detail]),
    ...(endpoint.rules ?? []).map((item) => item.rule),
    endpoint.body ? JSON.stringify(endpoint.body) : '',
    ...(endpoint.samples ?? []).flatMap((item) => [item.label, JSON.stringify(item.body)]),
  ].join(' ').toLowerCase()
  return words.every((word) => hasWord(haystack, word))
}

function hasWord(haystack, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`).test(haystack)
}

function countEndpoints(groups) {
  return groups.reduce((total, group) => total + group.endpoints.length, 0)
}

function groupFor(groups, id) {
  return groups.find((group) => group.id === id || group.endpoints.some((endpoint) => endpoint.id === id))
}

function docsBaseUrl() {
  return (env.apiBaseUrl ?? '').trim().replace(/\/$/, '')
}

function isMac() {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
}

function endpointLink(id) {
  const url = new URL(window.location.href)
  url.hash = id
  return url.toString()
}

function requestSample(endpoint, baseUrl, language) {
  const url = sampleUrl(endpoint, baseUrl)
  if (language === 'JavaScript') return javaScriptSample(url, endpoint)
  if (language === 'Node') return nodeSample(url, endpoint)
  if (language === 'PHP') return phpSample(url, endpoint)
  if (language === 'Laravel') return laravelSample(url, endpoint)
  if (language === 'Python') return pythonSample(url, endpoint)
  if (language === 'Java') return javaSample(url, endpoint)
  return curlSample(url, endpoint)
}

function sampleUrl(endpoint, baseUrl) {
  const path = endpoint.path.replace(/\{([^}]+)\}/g, (_, name) => {
    const param = (endpoint.params ?? []).find((item) => item.name === name)
    if (param?.example) return String(param.example)
    return name === 'id' ? '2' : `{${name}}`
  })
  if (endpoint.method !== 'GET' || !endpoint.query?.length) return `${baseUrl}${path}`
  const pairs = endpoint.query.flatMap((item) => {
    const value = Object.hasOwn(item, 'example') ? item.example : item.name === 'per_page' ? '15' : '1'
    if (value == null) return []
    return [`${encodeURIComponent(item.name)}=${encodeURIComponent(value)}`]
  })
  return pairs.length ? `${baseUrl}${path}?${pairs.join('&')}` : `${baseUrl}${path}`
}

function curlSample(url, endpoint) {
  const lines = [
    `curl -X ${endpoint.method} ${JSON.stringify(url)} \\`,
    '  -H "Accept: application/json" \\',
    `  -H "Authorization: Bearer YOUR_API_KEY"${endpoint.body ? ' \\' : ''}`,
  ]
  if (endpoint.body) {
    lines.push('  -H "Content-Type: application/json" \\')
    lines.push(`  -d '${JSON.stringify(endpoint.body).replaceAll("'", `'\\''`)}'`)
  }
  return lines.join('\n')
}

function javaScriptSample(url, endpoint) {
  const lines = [
    `const response = await fetch(${JSON.stringify(url)}, {`,
    `  method: ${JSON.stringify(endpoint.method)},`,
    '  headers: {',
    '    Accept: "application/json",',
    '    Authorization: "Bearer YOUR_API_KEY",',
  ]
  if (endpoint.body) lines.push('    "Content-Type": "application/json",')
  lines.push('  },')
  if (endpoint.body) lines.push(`  body: JSON.stringify(${inlineJson(endpoint.body, '  ')}),`)
  lines.push('})', '', 'const data = await response.json()')
  return lines.join('\n')
}

function nodeSample(url, endpoint) {
  const lines = [
    "import axios from 'axios'",
    '',
    'const response = await axios.request({',
    `  method: ${JSON.stringify(endpoint.method)},`,
    `  url: ${JSON.stringify(url)},`,
    '  headers: {',
    '    Accept: "application/json",',
    '    Authorization: "Bearer YOUR_API_KEY",',
    '  },',
  ]
  if (endpoint.body) lines.push(`  data: ${inlineJson(endpoint.body, '  ')},`)
  lines.push('})', '', 'console.log(response.data)')
  return lines.join('\n')
}

function javaSample(url, endpoint) {
  const method = String(endpoint.method ?? 'GET').toUpperCase()
  const publisher = endpoint.body
    ? `HttpRequest.BodyPublishers.ofString(${javaString(JSON.stringify(endpoint.body))})`
    : 'HttpRequest.BodyPublishers.noBody()'
  const verb = javaVerb(method, publisher)

  return [
    'import java.net.URI;',
    'import java.net.http.HttpClient;',
    'import java.net.http.HttpRequest;',
    'import java.net.http.HttpResponse;',
    '',
    'HttpClient client = HttpClient.newHttpClient();',
    '',
    'HttpRequest request = HttpRequest.newBuilder()',
    `    .uri(URI.create(${javaString(url)}))`,
    '    .header("Accept", "application/json")',
    '    .header("Authorization", "Bearer YOUR_API_KEY")',
    ...(endpoint.body ? ['    .header("Content-Type", "application/json")'] : []),
    `    ${verb}`,
    '    .build();',
    '',
    'HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());',
    'System.out.println(response.body());',
  ].join('\n')
}

function javaVerb(method, publisher) {
  if (method === 'GET') return '.GET()'
  if (method === 'DELETE' && publisher.endsWith('noBody()')) return '.DELETE()'
  if (method === 'POST') return `.POST(${publisher})`
  if (method === 'PUT') return `.PUT(${publisher})`
  return `.method(${javaString(method)}, ${publisher})`
}

function javaString(value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('\n', '\\n').replaceAll('\r', '\\r')}"`
}

function phpSample(url, endpoint) {
  const headers = [
    '        "Accept: application/json",',
    '        "Authorization: Bearer YOUR_API_KEY",',
  ]
  if (endpoint.body) headers.push('        "Content-Type: application/json",')
  const lines = [
    '<?php',
    '',
    `$ch = curl_init(${JSON.stringify(url)});`,
    'curl_setopt_array($ch, [',
    `    CURLOPT_CUSTOMREQUEST => ${JSON.stringify(endpoint.method)},`,
    '    CURLOPT_RETURNTRANSFER => true,',
    '    CURLOPT_HTTPHEADER => [',
    ...headers,
    '    ],',
  ]
  if (endpoint.body) lines.push(`    CURLOPT_POSTFIELDS => '${JSON.stringify(endpoint.body).replaceAll("'", `'\\''`)}',`)
  lines.push(']);', '', '$response = curl_exec($ch);', '$data = json_decode($response, true);')
  return lines.join('\n')
}

function laravelSample(url, endpoint) {
  const method = String(endpoint.method ?? 'GET').toLowerCase()
  const call = endpoint.body
    ? `    ->${method}(${phpString(url)}, ${phpValue(endpoint.body, 4)});`
    : `    ->${method}(${phpString(url)});`

  return [
    'use Illuminate\\Support\\Facades\\Http;',
    '',
    "$response = Http::withToken('YOUR_API_KEY')",
    '    ->acceptJson()',
    call,
    '',
    '$data = $response->json();',
  ].join('\n')
}

function phpString(value) {
  return `'${String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`
}

function phpValue(value, indent) {
  const pad = ' '.repeat(indent)
  const inner = ' '.repeat(indent + 4)
  if (value == null) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return phpString(value)
  if (Array.isArray(value)) {
    if (!value.length) return '[]'
    const items = value.map((item) => `${inner}${phpValue(item, indent + 4)},`)
    return `[\n${items.join('\n')}\n${pad}]`
  }
  const entries = Object.entries(value)
  if (!entries.length) return '[]'
  const items = entries.map(([key, item]) => `${inner}${phpString(key)} => ${phpValue(item, indent + 4)},`)
  return `[\n${items.join('\n')}\n${pad}]`
}

function pythonSample(url, endpoint) {
  const lines = [
    'import requests',
    '',
    'response = requests.request(',
    `    ${JSON.stringify(endpoint.method)},`,
    `    ${JSON.stringify(url)},`,
    '    headers={',
    '        "Accept": "application/json",',
    '        "Authorization": "Bearer YOUR_API_KEY",',
    '    },',
  ]
  if (endpoint.body) lines.push(`    json=${pythonBody(endpoint.body)},`)
  lines.push(')', 'print(response.json())')
  return lines.join('\n')
}

function inlineJson(value, pad) {
  const [first, ...rest] = JSON.stringify(value, null, 2).split('\n')
  return [first, ...rest.map((line) => pad + line)].join('\n')
}

function pythonBody(value) {
  const literal = JSON.stringify(value, null, 2)
    .replaceAll(/\btrue\b/g, 'True')
    .replaceAll(/\bfalse\b/g, 'False')
    .replaceAll(/\bnull\b/g, 'None')
  const [first, ...rest] = literal.split('\n')
  return [first, ...rest.map((line) => `    ${line}`)].join('\n')
}

function CodeText({ text }) {
  const parts = text.split(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g)
  return parts.map((part, index) => (
    part.startsWith('"') || part.startsWith("'")
      ? <span key={index} className="text-[#8EE4B8]">{part}</span>
      : <span key={index}>{part}</span>
  ))
}

function JsonText({ text }) {
  return tokenizeJson(text).map((token) => (
    <span key={token.key} className={tokenClass[token.type]}>
      {token.value}
    </span>
  ))
}

const tokenClass = {
  plain: '',
  key: 'text-[#9CC4FF]',
  string: 'text-[#8EE4B8]',
  number: 'text-[#F6C56B]',
  literal: 'text-[#F0B4C8]',
}

function tokenizeJson(text) {
  const pattern = /("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*")(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g
  const tokens = []
  let last = 0
  let key = 0
  let match = pattern.exec(text)

  while (match) {
    if (match.index > last) tokens.push({ type: 'plain', value: text.slice(last, match.index), key: key++ })
    if (match[1]) {
      tokens.push({ type: match[2] ? 'key' : 'string', value: match[1], key: key++ })
      if (match[2]) tokens.push({ type: 'plain', value: match[2], key: key++ })
    } else if (match[0] === 'true' || match[0] === 'false' || match[0] === 'null') {
      tokens.push({ type: 'literal', value: match[0], key: key++ })
    } else {
      tokens.push({ type: 'number', value: match[0], key: key++ })
    }
    last = pattern.lastIndex
    match = pattern.exec(text)
  }

  if (last < text.length) tokens.push({ type: 'plain', value: text.slice(last), key: key++ })
  return tokens
}
