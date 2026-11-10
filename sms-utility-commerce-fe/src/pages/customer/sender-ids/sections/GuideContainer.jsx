import { Check, Info, X } from "lucide-react";

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";

export default function GuideContainer({ guideData = [], setShowGuide }) {
  return (
    <aside
      className="mt-3 overflow-hidden rounded-xl border border-[#F0D7A8] bg-[linear-gradient(180deg,#FFF9EF_0%,#FFFDF8_100%)] shadow-[0_1px_2px_rgba(180,95,6,0.06)]"
      aria-labelledby="sender-guide-title"
    >
      <header className="flex flex-col gap-3 border-b border-[#F0D7A8]/80 px-3.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-4">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#FFE8C2] text-[#B45F06]">
            <Info size={16} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wide text-[#B45F06] uppercase">
              Validation tips
            </p>
            <h2
              id="sender-guide-title"
              className="mt-0.5 text-sm font-bold leading-5 text-navy sm:text-[15px]"
            >
              Sender ID guide
            </h2>
            <p className="mt-1 text-[12px] leading-4 text-ink/60 sm:text-[13px] sm:leading-5">
              Follow these rules so your request is more likely to be approved.
            </p>
          </div>
        </div>

        {typeof setShowGuide === "function" ? (
          <button
            type="button"
            onClick={() => setShowGuide(false)}
            className={`inline-flex h-8 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#E8C98A] bg-white px-2.5 text-[12px] font-semibold text-[#945008] transition-colors hover:bg-[#FFF4E0] sm:w-auto ${focusClass}`}
          >
            <X size={14} strokeWidth={2.2} aria-hidden="true" />
            Hide guide
          </button>
        ) : null}
      </header>

      <ul className="divide-y divide-[#F0D7A8]/60 px-3.5 py-1 sm:px-4">
        {guideData.map((item, index) => (
          <li key={`${item.guide}-${index}`} className="flex gap-2.5 py-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FFE8C2] text-[#B45F06]">
              <Check size={11} strokeWidth={2.8} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium leading-5 text-navy">
                {item.guide}
              </p>
              {item.example || item.failureExample ? (
                <dl className="mt-1.5 flex flex-col gap-1 text-[12px] leading-4 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
                  {item.example ? (
                    <div className="min-w-0">
                      <dt className="inline text-ink/45">Example: </dt>
                      <dd className="inline font-mono font-semibold text-green break-all">
                        {item.example}
                      </dd>
                    </div>
                  ) : null}
                  {item.failureExample ? (
                    <div className="min-w-0">
                      <dt className="inline text-ink/45">Avoid: </dt>
                      <dd className="inline font-mono font-semibold text-[#9F1C26] break-all">
                        {item.failureExample}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
