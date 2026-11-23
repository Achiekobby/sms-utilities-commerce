import { Check, MessageSquare, PauseCircle, Pencil, PlayCircle, Smartphone, Trash2, X } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { IPhoneMockup } from 'react-device-mockup'
import { Drawer } from '../../../../components/Drawer'
import { TypeBadge } from '../../../../components/TypeBadge'
import { displayTypeForBadge } from '../../../../features/templates/templateModel'
import { sampleMessage } from '../../campaigns/model'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const tabs = [
  { id: 'message', label: 'Message', icon: MessageSquare },
  { id: 'device', label: 'Device', icon: Smartphone },
]

function MessagePanel({ template }) {
  return (
    <div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-ink/50">Type</dt>
          <dd className="mt-1">
            <TypeBadge type={displayTypeForBadge(template.type)} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink/50">Category</dt>
          <dd className="mt-0.5 font-medium text-navy">{template.category || '—'}</dd>
        </div>
      </dl>

      {template.intro ? (
        <div className="mt-5 rounded-xl border border-ink/10 px-4 py-4">
          <p className="text-xs font-semibold tracking-wide text-ink/45">INTRO</p>
          <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-ink">{template.intro}</p>
        </div>
      ) : null}

      <div className="mt-5 rounded-xl bg-canvas px-4 py-4">
        <p className="text-xs font-semibold tracking-wide text-ink/45">MESSAGE</p>
        <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-ink">{template.body}</p>
      </div>

      {template.cta ? (
        <div className="mt-3 rounded-xl border border-ink/10 px-4 py-4">
          <p className="text-xs font-semibold tracking-wide text-ink/45">CTA</p>
          <p className="mt-2 text-sm font-semibold text-navy">
            {template.cta.label || template.cta.type}
          </p>
          <p className="mt-1 text-sm text-ink/70">{template.cta.url || template.cta.value || '—'}</p>
        </div>
      ) : null}

      {template.questions?.length ? (
        <div className="mt-3 rounded-xl border border-ink/10 px-4 py-4">
          <p className="text-xs font-semibold tracking-wide text-ink/45">
            QUESTIONS · {template.questions.length}
          </p>
          <ul className="mt-2 space-y-2">
            {template.questions.map((question, index) => (
              <li key={`${question.position}-${index}`} className="text-sm text-ink/75">
                <span className="font-semibold text-navy">Q{index + 1}.</span> {question.prompt}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-3 rounded-xl border border-ink/10 px-4 py-4">
        <p className="text-xs font-semibold tracking-wide text-ink/45">SAMPLE FOR AMA MENSAH</p>
        <p className="mt-1 text-sm leading-6 text-ink">{sampleMessage(template.body)}</p>
      </div>
    </div>
  )
}

function FitPhone({ children }) {
  const slotRef = useRef(null)
  const frameRef = useRef(null)
  const [box, setBox] = useState({ scale: 1, height: 0 })

  useLayoutEffect(() => {
    const slot = slotRef.current
    const frame = frameRef.current
    const scroller = slot?.closest('[data-preview-scroll]')
    if (!slot || !frame || !scroller) return

    function fit() {
      const phone = frame.firstElementChild
      const availableH = scroller.clientHeight - 48
      const availableW = scroller.clientWidth
      const naturalH = phone?.offsetHeight ?? 0
      const naturalW = phone?.offsetWidth ?? 0
      if (!naturalH || !naturalW || availableH < 40) return
      const scale = Math.min(1, availableH / naturalH, availableW / naturalW)
      const height = naturalH * scale
      setBox((current) => {
        if (Math.abs(current.scale - scale) < 0.01 && Math.abs(current.height - height) < 1) return current
        return { scale, height }
      })
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={slotRef} className="overflow-hidden" style={{ height: box.height || undefined }}>
      <div ref={frameRef} className="mx-auto w-max" style={{ transform: `scale(${box.scale})`, transformOrigin: 'top center' }}>
        {children}
      </div>
    </div>
  )
}

function DevicePanel({ template }) {
  return (
    <div>
      <FitPhone>
        <IPhoneMockup screenWidth={220} screenType="island" frameColor="#1c1c1e" statusbarColor="#ffffff" hideNavBar>
          <div className="flex h-full flex-col bg-[#f2f4f7] text-left">
            <div className="border-b border-black/5 bg-white px-4 py-3">
              <p className="text-[11px] font-medium text-ink/45">Messages</p>
              <p className="truncate text-sm font-bold text-navy">{template.name}</p>
            </div>
            <div className="flex-1 px-3 py-4">
              <p className="mb-2 text-center text-[10px] font-medium text-ink/40">Today</p>
              <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-white px-3 py-2 shadow-[0_1px_2px_rgba(16,33,61,0.08)]">
                <p className="text-[13px] leading-5 text-ink">{sampleMessage(template.body)}</p>
                <p className="mt-1 text-right text-[10px] text-ink/40">Now</p>
              </div>
            </div>
          </div>
        </IPhoneMockup>
      </FitPhone>
      <p className="mt-3 text-center text-xs leading-5 text-ink/55">Shown as Ama would read it on a phone.</p>
    </div>
  )
}

export function TemplatePreview({
  template,
  onUse,
  useHint,
  onEdit,
  onToggleStatus,
  onDelete,
  onClose,
}) {
  const [tab, setTab] = useState('message')

  function moveTab(event) {
    const index = tabs.findIndex((item) => item.id === tab)
    if (event.key === 'ArrowRight') setTab(tabs[(index + 1) % tabs.length].id)
    if (event.key === 'ArrowLeft') setTab(tabs[(index - 1 + tabs.length) % tabs.length].id)
  }

  return (
    <Drawer label={`Preview ${template.name}`} onClose={onClose} widthClass="w-[min(32rem,calc(100vw-1.5rem))]">
      <div className="flex h-full flex-col bg-white">
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-ink/45">Preview</p>
            <h2 className="mt-1 text-base font-bold text-navy">{template.name}</h2>
            <p className="mt-0.5 text-[13px] text-ink/60">{template.description || template.category}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`-mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-ink/55 transition-colors hover:bg-canvas hover:text-navy ${focusClass}`}
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </header>

        <div className="px-5 pt-4">
          <div role="tablist" aria-label="Preview style" onKeyDown={moveTab} className="flex gap-1 rounded-lg bg-canvas p-1">
            {tabs.map((item) => {
              const selected = tab === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`preview-tab-${item.id}`}
                  aria-controls={`preview-panel-${item.id}`}
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  data-autofocus={item.id === 'message' ? true : undefined}
                  onClick={() => setTab(item.id)}
                  className={`inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md text-sm font-semibold transition-colors ${focusClass} ${
                    selected ? 'bg-white text-navy shadow-[0_1px_2px_rgba(16,33,61,0.08)]' : 'text-ink/55 hover:text-navy'
                  }`}
                >
                  <Icon size={15} strokeWidth={2.2} aria-hidden="true" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <div data-preview-scroll className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {tab === 'message' ? (
            <div role="tabpanel" id="preview-panel-message" aria-labelledby="preview-tab-message">
              <MessagePanel template={template} />
            </div>
          ) : (
            <div role="tabpanel" id="preview-panel-device" aria-labelledby="preview-tab-device">
              <DevicePanel template={template} />
            </div>
          )}
        </div>

        <footer className="border-t border-ink/10 px-5 py-4">
          <div className="flex flex-col gap-2">
            {onUse ? (
              <button
                type="button"
                onClick={() => onUse(template)}
                className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] ${focusClass}`}
              >
                <Check size={16} strokeWidth={2.4} aria-hidden="true" />
                Use this template
              </button>
            ) : null}
            {onEdit || onToggleStatus || onDelete ? (
              <div className="flex flex-wrap gap-2">
                {onEdit ? (
                  <button
                    type="button"
                    onClick={onEdit}
                    className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
                  >
                    <Pencil size={15} strokeWidth={2.2} aria-hidden="true" />
                    Edit
                  </button>
                ) : null}
                {onToggleStatus ? (
                  <button
                    type="button"
                    onClick={onToggleStatus}
                    className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
                  >
                    {template.status === 'active' ? (
                      <>
                        <PauseCircle size={15} strokeWidth={2.2} aria-hidden="true" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <PlayCircle size={15} strokeWidth={2.2} aria-hidden="true" />
                        Activate
                      </>
                    )}
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    onClick={onDelete}
                    className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#C21F2D]/25 bg-white px-3 text-sm font-semibold text-[#C21F2D] hover:bg-[#FDECEE] ${focusClass}`}
                  >
                    <Trash2 size={15} strokeWidth={2.2} aria-hidden="true" />
                    Delete
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          {onUse ? (
            <p className="mt-2 text-center text-xs leading-5 text-ink/55">
              {useHint || 'You can change the name, sender, and message before it sends.'}
            </p>
          ) : null}
        </footer>
      </div>
    </Drawer>
  )
}
