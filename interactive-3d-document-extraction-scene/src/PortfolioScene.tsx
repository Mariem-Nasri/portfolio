import { useState } from 'react'
import ExtractionScene, { type FieldId } from './components/ExtractionScene'

const fields: { id: FieldId; label: string }[] = [
  { id: 'parties', label: 'Parties' },
  { id: 'date', label: 'Date' },
  { id: 'rate', label: 'Rate' },
  { id: 'terms', label: 'Terms' },
]

export default function PortfolioScene() {
  const [active, setActive] = useState<FieldId>('rate')
  const [ocr, setOcr] = useState(true)
  const [agents, setAgents] = useState(true)
  const [scanning, setScanning] = useState(false)

  const runScan = () => {
    setScanning(true)
    setOcr(true)
    window.setTimeout(() => setScanning(false), 4200)
  }

  return (
    <main className="portfolio-scene" aria-label="Interactive 3D document extraction visualization">
      <div className="scene-heading"><span>DOCUMENT INTELLIGENCE</span><span>{scanning ? 'SCANNING' : 'LIVE EXTRACTION'} <i /></span></div>
      <div className="scene-canvas"><ExtractionScene activeField={active} onSelectField={setActive} separation={0.65} showAgents={agents} showOCR={ocr} motion={!window.matchMedia('(prefers-reduced-motion: reduce)').matches} scanning={scanning} /></div>
      <div className="scene-controls">
        <div className="field-buttons" aria-label="Select extracted field">
          {fields.map((field) => <button key={field.id} className={active === field.id ? 'selected' : ''} onClick={() => setActive(field.id)}>{field.label}</button>)}
        </div>
        <div className="scene-actions">
          <button aria-pressed={ocr} onClick={() => setOcr((value) => !value)}>OCR {ocr ? 'on' : 'off'}</button>
          <button aria-pressed={agents} onClick={() => setAgents((value) => !value)}>Agents {agents ? 'on' : 'off'}</button>
          <button className="scan-button" onClick={runScan}>{scanning ? 'Scanning…' : 'Run scan ↗'}</button>
        </div>
      </div>
      <p className="scene-hint">Move to explore · select a field to inspect</p>
    </main>
  )
}
