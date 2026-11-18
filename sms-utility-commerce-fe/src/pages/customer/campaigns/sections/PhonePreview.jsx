import { IPhoneMockup } from 'react-device-mockup'
import { ctaInsertText, formatCtaValue } from '../cta'
import { sampleMessage } from '../model'

const screenWidth = 260

function previewCta(cta) {
  if (!cta || cta.placement === 'none' || cta.placement === 'message' || cta.enabled === false) return null
  const value = String(cta.value || cta.url || '').trim()
  if (!value) return null
  return {
    enabled: true,
    placement: 'field',
    type: cta.type || 'link',
    value,
    label: cta.label || '',
  }
}

function previewText(body, cta) {
  const text = sampleMessage(body, []).trim()
  const source = previewCta(cta)
  if (!source) return text
  const suffix = ctaInsertText(source)
  const url = formatCtaValue(source)
  if (!suffix || text.includes(suffix) || (url && url !== '—' && text.includes(url))) return text
  return text ? `${text} ${suffix}` : suffix
}

export function PhonePreview({ sender, body, cta }) {
  const preview = previewText(body, cta)

  return (
    <aside className="flex w-full flex-col items-center">
      <div className="mx-auto w-max max-w-full">
        <IPhoneMockup
          screenWidth={screenWidth}
          screenType="island"
          frameColor="#1c1c1e"
          statusbarColor="#f2f4f7"
          hideNavBar
        >
          <div
            className="bg-[#f2f4f7] text-left"
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 auto',
              alignSelf: 'stretch',
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              height: '100%',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <div className="shrink-0 border-b border-black/5 bg-white px-4 pt-2 pb-3">
              <p className="text-center text-[11px] font-medium text-ink/40">Messages</p>
              <p className="mt-1 truncate text-center text-sm font-bold text-navy">{sender || 'Sender'}</p>
            </div>
            <div className="min-h-0 w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4">
              <p className="mb-3 text-center text-[10px] font-medium text-ink/40">Today</p>
              <div className="w-[92%] max-w-full rounded-2xl rounded-tl-md bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(16,33,61,0.08)]">
                <p className="text-[13px] leading-5 break-words whitespace-pre-wrap text-ink [overflow-wrap:anywhere]">
                  {preview.trim() || 'Your message preview will appear here.'}
                </p>
                <p className="mt-1.5 text-right text-[10px] text-ink/40">Now</p>
              </div>
            </div>
          </div>
        </IPhoneMockup>
      </div>
      <p className="mt-4 max-w-[16rem] text-center text-xs leading-5 text-ink/55">
        Sample as a contact would read it, with personalization filled in.
      </p>
    </aside>
  )
}
