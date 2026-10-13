import { useEffect, useState } from 'react'
import {
  Users,
  CalendarDays,
  Percent,
  ScrollText,
  Pause,
  Play,
  ScanLine,
  Layers,
  Network,
  ScanSearch,
  ArrowUpRight,
  FileStack,
  Check,
  RotateCcw,
} from 'lucide-react'
import ExtractionScene, { type FieldId } from './components/ExtractionScene'
import PortfolioScene from './PortfolioScene'
import { cn } from './utils/cn'

type FieldMeta = {
  id: FieldId
  index: string
  label: string
  detail: string
  value: string
  confidence: number
  icon: typeof Users
}

const FIELDS: FieldMeta[] = [
  { id: 'parties', index: '01', label: 'Parties', detail: 'Borrower & counterparties', value: '2 entities resolved', confidence: 98, icon: Users },
  { id: 'date', index: '02', label: 'Effective Date', detail: 'Execution & maturity', value: 'Term anchored', confidence: 96, icon: CalendarDays },
  { id: 'rate', index: '03', label: 'Interest Rate', detail: 'Fixed / floating spread', value: 'Rate + spread linked', confidence: 99, icon: Percent },
  { id: 'terms', index: '04', label: 'Financial Terms', detail: 'Notional & covenants', value: 'Clauses grouped', confidence: 94, icon: ScrollText },
]

function Toggle({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof Network
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-wide transition-all duration-200 backdrop-blur-md',
        active
          ? 'border-[#68765a]/50 bg-[#68765a] text-[#fffef8] shadow-[0_4px_14px_rgba(85,100,72,0.28)]'
          : 'border-[#d9d0b8] bg-white/55 text-[#6b6656] hover:border-[#b9bfa9] hover:bg-white/80'
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
      {label}
    </button>
  )
}

export default function App() {
  if (new URLSearchParams(window.location.search).has('embed')) return <PortfolioScene />

  const [activeField, setActiveField] = useState<FieldId>('rate')
  const [separation, setSeparation] = useState(0.65)
  const [showAgents, setShowAgents] = useState(true)
  const [showOCR, setShowOCR] = useState(true)
  const [motion, setMotion] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [cycle, setCycle] = useState(false)

  const active = FIELDS.find((f) => f.id === activeField)!

  // auto-cycle fields like a quiet product demo
  useEffect(() => {
    if (!cycle) return
    const order: FieldId[] = ['parties', 'date', 'rate', 'terms']
    const id = setInterval(() => {
      setActiveField((cur) => order[(order.indexOf(cur) + 1) % order.length])
    }, 2600)
    return () => clearInterval(id)
  }, [cycle])

  const runScan = () => {
    setScanning(true)
    setShowOCR(true)
    window.setTimeout(() => setScanning(false), 4200)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4efe3] text-[#2e2b25]">
      {/* ambient page washes */}
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-[#e6e2cf] opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20%] left-[-8%] h-[460px] w-[460px] rounded-full bg-[#dfe5d3] opacity-50 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(104,118,90,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(104,118,90,0.05) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 75%)',
        }}
      />

      <div className="relative mx-auto max-w-[1180px] px-5 pb-10 pt-6 sm:px-8">
        {/* ------------------------------- header ------------------------------- */}
        <header className="animate-fade-up flex items-center justify-between border-b border-[#ddd5c0]/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#68765a] shadow-[0_6px_16px_rgba(85,100,72,0.3)]">
              <FileStack className="h-4.5 w-4.5 text-[#fffef8]" strokeWidth={1.6} />
            </div>
            <div className="leading-tight">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#8a8270]">Atelier — Selected Work</p>
              <p className="font-serif text-[15px] font-medium">Document Intelligence</p>
            </div>
          </div>
          <div className="hidden items-center gap-8 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a8270] sm:flex">
            <span>Index 04</span>
            <span className="hidden md:inline">Finance · AI Systems</span>
            <span className="inline-flex items-center gap-2 text-[#68765a]">
              <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-[#68765a]" />
              Live Study
            </span>
          </div>
        </header>

        {/* -------------------------------- hero -------------------------------- */}
        <section className="animate-fade-up pt-10 sm:pt-14" style={{ animationDelay: '80ms' }}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[640px]">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d9d0b8] bg-white/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#7a7260] backdrop-blur">
                <ScanSearch className="h-3 w-3 text-[#68765a]" />
                Intelligent Extraction — Nº 04
              </p>
              <h1 className="font-serif text-[42px] font-medium leading-[1.02] tracking-[-0.01em] sm:text-[58px]">
                Documents, understood
                <br />
                <span className="italic text-[#68765a]">at a glance.</span>
              </h1>
            </div>
            <p className="max-w-[320px] text-[13.5px] leading-relaxed text-[#6f695c]">
              A quiet system that reads financial contracts the way an analyst would — locating parties,
              dates, rates and terms, then lifting them into structured, verifiable data.
            </p>
          </div>
        </section>

        {/* ----------------------------- main grid ------------------------------ */}
        <main className="mt-10 grid gap-6 lg:grid-cols-12">
          {/* left: field index + controls */}
          <aside className="animate-fade-up order-2 flex flex-col gap-5 lg:order-1 lg:col-span-4" style={{ animationDelay: '160ms' }}>
            <div className="rounded-[22px] border border-[#e0d8c3] bg-[#fbf8ef]/80 p-5 shadow-[0_18px_40px_-24px_rgba(90,80,55,0.35)] backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8a8270]">Extracted Fields</p>
                <button
                  onClick={() => setCycle((v) => !v)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] transition-all',
                    cycle
                      ? 'border-[#68765a] bg-[#68765a] text-white'
                      : 'border-[#ddd5c0] bg-white/60 text-[#7a7260] hover:border-[#b9bfa9]'
                  )}
                >
                  {cycle ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  Auto-tour
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {FIELDS.map((f) => {
                  const Icon = f.icon
                  const isActive = f.id === activeField
                  return (
                    <button
                      key={f.id}
                      onClick={() => setActiveField(f.id)}
                      className={cn(
                        'group flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-300',
                        isActive
                          ? 'border-[#68765a]/40 bg-[#eef0e6] shadow-[0_10px_24px_-14px_rgba(85,100,72,0.5)]'
                          : 'border-transparent bg-transparent hover:border-[#e0d8c3] hover:bg-white/60'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                          isActive ? 'bg-[#68765a] text-[#fffef8]' : 'bg-[#efe9d8] text-[#7d7663] group-hover:bg-[#e6dfc9]'
                        )}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.7} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="font-mono text-[9px] text-[#a39a83]">{f.index}</span>
                          <span className={cn('text-[13.5px] font-semibold', isActive ? 'text-[#37402f]' : 'text-[#3d392f]')}>
                            {f.label}
                          </span>
                        </span>
                        <span className="block truncate text-[11.5px] text-[#8a8270]">{f.detail}</span>
                      </span>
                      <span className="text-right">
                        <span className={cn('block font-mono text-[11px] font-medium', isActive ? 'text-[#556448]' : 'text-[#a39a83]')}>
                          {f.confidence}%
                        </span>
                        <span className="block text-[9px] uppercase tracking-wider text-[#b3ab95]">conf.</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* active field readout */}
              <div key={active.id} className="animate-fade-up mt-4 rounded-2xl bg-[#2e3328] px-4 py-3.5 text-[#f2efe2]">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#aeb89f]">Now highlighting</p>
                  <Check className="h-3.5 w-3.5 text-[#aeb89f]" />
                </div>
                <p className="mt-1.5 font-serif text-[17px] leading-snug">{active.value}</p>
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-[#c8d2bd] transition-all duration-700"
                    style={{ width: `${active.confidence}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-[#c9cdbc]">
                  Located on the agreement face — watch its card lift from the page.
                </p>
              </div>
            </div>

            {/* controls */}
            <div className="rounded-[22px] border border-[#e0d8c3] bg-[#fbf8ef]/80 p-5 backdrop-blur">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#8a8270]">Scene Controls</p>

              <div className="mb-1.5 flex items-center justify-between text-[12px]">
                <span className="inline-flex items-center gap-1.5 font-medium text-[#4c473c]">
                  <Layers className="h-3.5 w-3.5 text-[#68765a]" /> Layer separation
                </span>
                <span className="font-mono text-[11px] text-[#8a8270]">{Math.round(separation * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(separation * 100)}
                onChange={(e) => setSeparation(Number(e.target.value) / 100)}
                className="w-full"
                style={{ ['--fill' as string]: `${separation * 100}%` }}
                aria-label="Layer separation"
              />
              <div className="mt-1 flex justify-between text-[10px] text-[#a39a83]">
                <span>Stacked</span>
                <span>Exploded</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <Toggle active={showOCR} onClick={() => setShowOCR((v) => !v)} icon={ScanSearch} label="OCR boxes" />
                <Toggle active={showAgents} onClick={() => setShowAgents((v) => !v)} icon={Network} label="Agents" />
                <Toggle active={motion} onClick={() => setMotion((v) => !v)} icon={motion ? Pause : Play} label={motion ? 'Motion on' : 'Motion off'} />
              </div>

              <button
                onClick={runScan}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#68765a] px-4 py-2.5 text-[12.5px] font-medium text-[#fffef8] shadow-[0_10px_22px_-8px_rgba(85,100,72,0.6)] transition-all hover:bg-[#556448] active:scale-[0.99]"
              >
                <ScanLine className="h-4 w-4" strokeWidth={1.8} />
                {scanning ? 'Scanning document…' : 'Run extraction scan'}
              </button>
              <button
                onClick={() => {
                  setActiveField('rate')
                  setSeparation(0.65)
                  setShowAgents(true)
                  setShowOCR(true)
                  setMotion(true)
                  setCycle(false)
                }}
                className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-medium text-[#8a8270] transition-colors hover:text-[#556448]"
              >
                <RotateCcw className="h-3 w-3" /> Reset view
              </button>
            </div>
          </aside>

          {/* right: the portfolio card with 3D scene */}
          <section className="animate-fade-up order-1 lg:order-2 lg:col-span-8" style={{ animationDelay: '120ms' }}>
            <div className="grain relative overflow-hidden rounded-[28px] border border-[#ddd3ba] bg-[radial-gradient(120%_120%_at_30%_10%,#fdfbf4_0%,#f6f1e2_48%,#ece4cf_100%)] shadow-[0_40px_80px_-32px_rgba(95,82,52,0.45),0_18px_36px_-20px_rgba(95,82,52,0.3)]">
              {/* card header overlay */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5 sm:p-6">
                <div>
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-[#98907a]">Portfolio — Project 04</p>
                  <h2 className="mt-1 font-serif text-[22px] font-medium leading-tight text-[#33302a] sm:text-[26px]">
                    Ledger Lens <span className="italic text-[#68765a]">/ Extraction</span>
                  </h2>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {['OCR', 'Multi-agent', 'Finance'].map((t) => (
                      <span key={t} className="rounded-full border border-[#d9d0b8] bg-white/55 px-2.5 py-0.5 text-[10px] font-medium text-[#7a7260] backdrop-blur">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="inline-flex items-center gap-1.5 rounded-full border border-[#cfd8c2] bg-[#eef0e6]/80 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#556448] backdrop-blur">
                    <span className={cn('h-1.5 w-1.5 rounded-full bg-[#68765a]', scanning && 'animate-pulse-dot')} />
                    {scanning ? 'Scanning' : 'Extracted'}
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-[#98907a]"> move cursor · click cards</p>
                </div>
              </div>

              {/* 3D canvas */}
              <div className="relative h-[480px] w-full cursor-grab active:cursor-grabbing sm:h-[560px] lg:h-[600px]">
                <ExtractionScene
                  activeField={activeField}
                  onSelectField={setActiveField}
                  separation={separation}
                  showAgents={showAgents}
                  showOCR={showOCR}
                  motion={motion}
                  scanning={scanning}
                />
                {/* soft vignette */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_80%_at_50%_45%,transparent_55%,rgba(120,105,70,0.10)_100%)]" />
              </div>

              {/* card footer overlay */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-end justify-between gap-3 p-5 sm:p-6">
                <div className="pointer-events-auto flex flex-wrap gap-1.5">
                  {FIELDS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveField(f.id)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-[11px] font-medium backdrop-blur-md transition-all duration-200',
                        activeField === f.id
                          ? 'border-[#68765a] bg-[#68765a] text-[#fffef8] shadow-[0_6px_16px_rgba(85,100,72,0.35)]'
                          : 'border-[#d9d0b8] bg-white/60 text-[#6b6656] hover:bg-white/85'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="pointer-events-none hidden items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#98907a] md:flex">
                  <span>5 agents</span>
                  <span className="h-1 w-1 rounded-full bg-[#c3b99e]" />
                  <span>4 fields</span>
                  <span className="h-1 w-1 rounded-full bg-[#c3b99e]" />
                  <span>3 pages</span>
                </div>
              </div>
            </div>

            {/* caption under card */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <p className="max-w-[520px] text-[12.5px] leading-relaxed text-[#7a7260]">
                Ivory agreement pages float in a layered stack. Olive bounding boxes locate each clause;
                translucent cards carry the extracted values away, while five agents cross-check the result.
              </p>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="group inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#556448]"
              >
                View case study
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>

            {/* stats strip */}
            <div className="mt-6 grid grid-cols-3 divide-x divide-[#ddd5c0] rounded-[22px] border border-[#e0d8c3] bg-[#fbf8ef]/70 backdrop-blur">
              {[
                { k: '05', v: 'Specialist agents', s: 'locate · read · verify' },
                { k: '04', v: 'Fields per agreement', s: 'parties · dates · rates · terms' },
                { k: '97%', v: 'Mean confidence', s: 'flagged below threshold' },
              ].map((stat) => (
                <div key={stat.v} className="px-4 py-4 sm:px-5">
                  <p className="font-serif text-[22px] font-medium leading-none text-[#37402f] sm:text-[26px]">{stat.k}</p>
                  <p className="mt-1.5 text-[11.5px] font-medium text-[#4c473c]">{stat.v}</p>
                  <p className="hidden text-[10.5px] text-[#98907a] sm:block">{stat.s}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* footer */}
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#ddd5c0]/80 pt-5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#a39a83]">
          <span>Rendered in real time — WebGL</span>
          <span className="hidden sm:inline">Ivory · Olive · Sage — Abstract rendering only</span>
          <span>MMXXVI</span>
        </footer>
      </div>
    </div>
  )
}
