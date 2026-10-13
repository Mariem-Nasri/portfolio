import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { ContactShadows, Line, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

export type FieldId = 'parties' | 'date' | 'rate' | 'terms'

export const FIELD_ORDER: FieldId[] = ['parties', 'date', 'rate', 'terms']

const OLIVE = '#68765a'
const OLIVE_DARK = '#556448'
const SAGE = '#9ca98f'
const SAGE_LIGHT = '#c8d2bd'
const PAPER = '#fffef8'
const PAPER_2 = '#fbf7ec'
const PAPER_3 = '#f6f0df'

type OcrDef = {
  id: FieldId
  pos: [number, number]
  size: [number, number]
}

const OCR_BOXES: OcrDef[] = [
  { id: 'parties', pos: [-0.48, 1.08], size: [1.52, 0.36] },
  { id: 'date', pos: [0.58, 0.55], size: [0.92, 0.28] },
  { id: 'rate', pos: [-0.42, -0.08], size: [1.34, 0.32] },
  { id: 'terms', pos: [0.18, -0.84], size: [1.64, 0.44] },
]

type CardDef = {
  id: FieldId
  base: [number, number, number]
  rot: [number, number, number]
  accent: string
  bars: number[]
  valueWidth: number
}

const CARDS: CardDef[] = [
  { id: 'parties', base: [2.02, 1.28, 0.55], rot: [-0.04, -0.22, 0.035], accent: '#68765a', bars: [0.62, 0.46], valueWidth: 0.72 },
  { id: 'date', base: [2.28, 0.38, 0.25], rot: [0.02, -0.28, -0.02], accent: '#8a9a7d', bars: [0.54, 0.38], valueWidth: 0.58 },
  { id: 'rate', base: [2.04, -0.62, 0.65], rot: [-0.03, -0.2, -0.045], accent: '#68765a', bars: [0.48, 0.64], valueWidth: 0.8 },
  { id: 'terms', base: [-2.08, -0.92, 0.5], rot: [0.03, 0.24, 0.05], accent: '#a3b195', bars: [0.68, 0.5], valueWidth: 0.66 },
]

const AGENT_POSITIONS: [number, number, number][] = [
  [-2.45, 1.72, -0.55],
  [-1.02, 2.28, -0.85],
  [0.78, 2.34, -0.75],
  [2.42, 1.82, -0.6],
  [2.62, 0.28, -0.95],
]

const AGENT_LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 2],
  [1, 3],
]

function ocrStart(field: FieldId): [number, number, number] {
  const box = OCR_BOXES.find((b) => b.id === field)!
  // main page sits roughly at z 0.28 in the root group
  return [box.pos[0] + box.size[0] / 2, box.pos[1], 0.36]
}

function seededLines(count: number, seed = 1) {
  return Array.from({ length: count }, (_, i) => {
    const v = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
    const frac = v - Math.floor(v)
    return {
      y: 1.34 - i * 0.155,
      w: 0.75 + frac * 1.15,
      x: -0.95 + frac * 0.22,
      tone: i % 5 === 0 ? '#b9b09a' : i % 3 === 0 ? '#ddd6c6' : '#d3ccba',
      h: i % 6 === 0 ? 0.045 : 0.03,
    }
  })
}

/* ---------------------------------- OCR box --------------------------------- */
function OcrBox({
  def,
  active,
  visible,
  index,
}: {
  def: OcrDef
  active: boolean
  visible: boolean
  index: number
}) {
  const group = useRef<THREE.Group>(null!)
  const fill = useRef<THREE.Mesh>(null!)
  const [w, h] = def.size

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.elapsedTime
    const pulse = active ? 1 + Math.sin(t * 2.4) * 0.018 : 1
    group.current.scale.setScalar(pulse)
    const mat = fill.current?.material as THREE.MeshBasicMaterial | undefined
    if (mat) mat.opacity = active ? 0.13 + Math.sin(t * 2.4) * 0.035 : 0.07
  })

  if (!visible) return null
  const c = active ? OLIVE_DARK : OLIVE
  const corner = 0.09
  const thick = active ? 0.022 : 0.016

  const corners: { pos: [number, number]; rot: number }[] = [
    { pos: [-w / 2, h / 2], rot: 0 },
    { pos: [w / 2, h / 2], rot: Math.PI / 2 },
    { pos: [w / 2, -h / 2], rot: Math.PI },
    { pos: [-w / 2, -h / 2], rot: -Math.PI / 2 },
  ]

  return (
    <group ref={group} position={[def.pos[0], def.pos[1], 0.035]} renderOrder={5}>
      {/* translucent fill */}
      <mesh ref={fill} position={[0, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color={OLIVE} transparent opacity={0.08} depthWrite={false} />
      </mesh>
      {/* border */}
      <Line
        points={[
          [-w / 2, -h / 2, 0.002],
          [w / 2, -h / 2, 0.002],
          [w / 2, h / 2, 0.002],
          [-w / 2, h / 2, 0.002],
          [-w / 2, -h / 2, 0.002],
        ]}
        color={c}
        lineWidth={active ? 1.6 : 1}
        transparent
        opacity={active ? 0.95 : 0.55}
      />
      {/* corner ticks */}
      {corners.map((cn, i) => (
        <group key={i} position={[cn.pos[0], cn.pos[1], 0.004]} rotation={[0, 0, cn.rot]}>
          <mesh position={[corner / 2, 0, 0]}>
            <boxGeometry args={[corner, thick, 0.006]} />
            <meshBasicMaterial color={c} />
          </mesh>
          <mesh position={[0, -corner / 2, 0]}>
            <boxGeometry args={[thick, corner, 0.006]} />
            <meshBasicMaterial color={c} />
          </mesh>
        </group>
      ))}
      {/* index dot */}
      <mesh position={[-w / 2, h / 2 + 0.065, 0.004]}>
        <circleGeometry args={[0.032, 24]} />
        <meshBasicMaterial color={active ? OLIVE_DARK : SAGE} />
      </mesh>
      <mesh position={[-w / 2, h / 2 + 0.065, 0.005]}>
        <ringGeometry args={[0.045, 0.052, 24]} />
        <meshBasicMaterial color={c} transparent opacity={active ? 0.8 : 0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[w / 2 + 0.02, -h / 2 - 0.02, 0]} visible={false}>
        <boxGeometry args={[0.01, 0.01, 0.01]} />
        <meshBasicMaterial color={c} />
      </mesh>
      <group position={[0, 0, -index * 0.0001]} />
    </group>
  )
}

/* --------------------------------- Paper page -------------------------------- */
function PaperPage({
  index,
  total,
  separation,
  activeField,
  showOCR,
  main = false,
}: {
  index: number
  total: number
  separation: number
  activeField: FieldId
  showOCR: boolean
  main?: boolean
}) {
  const lines = useMemo(() => seededLines(main ? 13 : 9, index + 2), [index, main])
  const layer = total - 1 - index // 0 = back
  const spread = separation

  const basePos: [number, number, number] = main
    ? [0, 0, 0.28]
    : [
        (index - 1) * (0.16 + spread * 0.34),
        (index - 1) * (-0.08 - spread * 0.1) + layer * 0.03,
        index * 0.12,
      ]
  const baseRot: [number, number, number] = main
    ? [-0.02, -0.06, 0.012]
    : [0.015 * layer, (index - 1) * (0.1 + spread * 0.16), (index - 1) * (0.045 + spread * 0.07)]

  const color = main ? PAPER : index === 1 ? PAPER_2 : PAPER_3

  return (
    <group position={basePos} rotation={baseRot}>
      <RoundedBox args={[2.55, 3.5, 0.022]} radius={0.018} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.92} metalness={0} />
      </RoundedBox>

      {/* top rule + heading bars (abstract, no text) */}
      <mesh position={[-0.72, 1.52, 0.016]}>
        <planeGeometry args={[0.92, 0.075]} />
        <meshStandardMaterial color="#9a917c" roughness={1} />
      </mesh>
      <mesh position={[-1.08, 1.38, 0.016]}>
        <planeGeometry args={[0.4, 0.032]} />
        <meshStandardMaterial color={SAGE} roughness={1} />
      </mesh>
      <mesh position={[0, 1.28, 0.015]}>
        <planeGeometry args={[2.18, 0.008]} />
        <meshStandardMaterial color="#e3dcc9" roughness={1} />
      </mesh>

      {/* abstract text lines */}
      {lines.map((l, i) => (
        <mesh key={i} position={[l.x + l.w / 2 - 0.18, l.y - (main ? 0 : 0.08), 0.016]}>
          <planeGeometry args={[l.w, l.h]} />
          <meshStandardMaterial color={l.tone} roughness={1} />
        </mesh>
      ))}

      {/* small table block near bottom */}
      <group position={[0, -1.18, 0.016]}>
        <mesh>
          <planeGeometry args={[2.12, 0.42]} />
          <meshStandardMaterial color="#f3eddc" roughness={1} />
        </mesh>
        {[0.14, 0, -0.14].map((y, i) => (
          <mesh key={i} position={[0, y, 0.002]}>
            <planeGeometry args={[2.12, 0.008]} />
            <meshStandardMaterial color="#e0d8c3" roughness={1} />
          </mesh>
        ))}
        {[ -0.35, 0.35 ].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.002]}>
            <planeGeometry args={[0.008, 0.42]} />
            <meshStandardMaterial color="#e0d8c3" roughness={1} />
          </mesh>
        ))}
        <mesh position={[-0.72, 0.07, 0.004]}>
          <planeGeometry args={[0.5, 0.04]} />
          <meshStandardMaterial color="#c9c0aa" roughness={1} />
        </mesh>
        <mesh position={[0.68, -0.07, 0.004]}>
          <planeGeometry args={[0.44, 0.04]} />
          <meshStandardMaterial color={SAGE} roughness={1} />
        </mesh>
      </group>

      {/* signature squiggle */}
      <group position={[0.62, -1.52, 0.018]}>
        <Line
          points={Array.from({ length: 24 }, (_, i) => {
            const x = -0.42 + (i / 23) * 0.84
            const y = Math.sin(i * 1.15) * 0.035 * (1 - i / 30)
            return [x, y, 0] as [number, number, number]
          })}
          color="#a89f88"
          lineWidth={1}
          transparent
          opacity={0.8}
        />
        <mesh position={[0, -0.09, 0]}>
          <planeGeometry args={[0.9, 0.008]} />
          <meshStandardMaterial color="#ddd5c1" roughness={1} />
        </mesh>
      </group>

      {/* folded corner hint (main page) */}
      {main && (
        <mesh position={[1.22, -1.7, 0.014]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[0.13, 0.13]} />
          <meshStandardMaterial color="#efe9d8" roughness={1} />
        </mesh>
      )}

      {main &&
        OCR_BOXES.map((def, i) => (
          <OcrBox key={def.id} def={def} index={i} active={activeField === def.id} visible={showOCR} />
        ))}
    </group>
  )
}

/* --------------------------------- Data card --------------------------------- */
function DataCard({
  def,
  active,
  emerged,
  onSelect,
  index,
}: {
  def: CardDef
  active: boolean
  emerged: number
  onSelect: (id: FieldId) => void
  index: number
}) {
  const group = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  const dir = useMemo(() => {
    const v = new THREE.Vector3(def.base[0], def.base[1] * 0.4, 0).normalize()
    return v
  }, [def.base])

  useFrame(({ clock }, delta) => {
    if (!group.current) return
    const t = clock.elapsedTime
    const lift = active ? 0.22 : hovered ? 0.12 : 0
    const target: [number, number, number] = [
      def.base[0] + dir.x * emerged * 0.35 + (active ? dir.x * 0.14 : 0),
      def.base[1] + Math.sin(t * 0.9 + index * 1.7) * 0.045 + lift * 0.4,
      def.base[2] + emerged * 0.18 + (active ? 0.16 : 0),
    ]
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, target[0], 6, delta)
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, target[1], 6, delta)
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, target[2], 6, delta)
    const s = active ? 1.09 : hovered ? 1.045 : 1
    const cs = group.current.scale.x
    group.current.scale.setScalar(THREE.MathUtils.damp(cs, s, 8, delta))
  })

  const handle = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onSelect(def.id)
  }

  return (
    <group
      ref={group}
      position={def.base}
      rotation={def.rot}
      onClick={handle}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      <RoundedBox args={[1.08, 0.64, 0.035]} radius={0.045} smoothness={4} castShadow>
        <meshPhysicalMaterial
          color={active ? '#fffdf4' : '#fdf8ea'}
          roughness={0.38}
          metalness={0}
          transparent
          opacity={active ? 0.98 : 0.92}
          clearcoat={0.5}
          clearcoatRoughness={0.6}
        />
      </RoundedBox>

      {/* active outline */}
      <mesh position={[0, 0, 0.021]}>
        <planeGeometry args={[1.1, 0.66]} />
        <meshBasicMaterial color={OLIVE} transparent opacity={active ? 0.0 : 0} depthWrite={false} />
      </mesh>
      <Line
        points={[
          [-0.55, -0.33, 0.022],
          [0.55, -0.33, 0.022],
          [0.55, 0.33, 0.022],
          [-0.55, 0.33, 0.022],
          [-0.55, -0.33, 0.022],
        ]}
        color={active ? OLIVE_DARK : SAGE}
        lineWidth={active ? 1.5 : 0.7}
        transparent
        opacity={active ? 0.9 : hovered ? 0.5 : 0.22}
      />

      {/* icon puck */}
      <mesh position={[-0.38, 0.13, 0.026]}>
        <circleGeometry args={[0.105, 32]} />
        <meshStandardMaterial color={def.accent} roughness={0.6} />
      </mesh>
      <mesh position={[-0.38, 0.13, 0.03]}>
        <ringGeometry args={[0.045, 0.058, 24]} />
        <meshBasicMaterial color="#fffdf2" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.38, 0.13, 0.031]}>
        <circleGeometry args={[0.018, 16]} />
        <meshBasicMaterial color="#fffdf2" />
      </mesh>

      {/* label bars */}
      <mesh position={[-0.05, 0.19, 0.026]}>
        <planeGeometry args={[0.42, 0.038]} />
        <meshStandardMaterial color="#a79d85" roughness={1} />
      </mesh>
      <mesh position={[-0.13, 0.115, 0.026]}>
        <planeGeometry args={[0.26, 0.026]} />
        <meshStandardMaterial color="#d8d0bc" roughness={1} />
      </mesh>

      {/* value bar (abstract — no readable text) */}
      <mesh position={[-0.46 + def.valueWidth / 2, -0.05, 0.026]}>
        <planeGeometry args={[def.valueWidth, 0.085]} />
        <meshStandardMaterial color={active ? '#4c5a42' : '#6d7660'} roughness={0.8} />
      </mesh>

      {/* small extracted rows */}
      {def.bars.map((w, i) => (
        <mesh key={i} position={[-0.46 + w / 2, -0.17 - i * 0.075, 0.026]}>
          <planeGeometry args={[w, 0.028]} />
          <meshStandardMaterial color={i === 0 ? '#cbc2aa' : '#ddd6c3'} roughness={1} />
        </mesh>
      ))}

      {/* confidence chip */}
      <mesh position={[0.36, -0.2, 0.026]}>
        <planeGeometry args={[0.26, 0.09]} />
        <meshStandardMaterial color={active ? OLIVE : SAGE_LIGHT} roughness={0.7} />
      </mesh>
      <mesh position={[0.28, -0.2, 0.03]}>
        <circleGeometry args={[0.016, 12]} />
        <meshBasicMaterial color="#fffdf2" />
      </mesh>
      <mesh position={[0.39, -0.2, 0.03]}>
        <planeGeometry args={[0.12, 0.022]} />
        <meshBasicMaterial color="#fffdf2" />
      </mesh>
    </group>
  )
}

/* -------------------------------- Agent nodes -------------------------------- */
function AgentNodes({ visible }: { visible: boolean }) {
  const group = useRef<THREE.Group>(null!)
  const pulse = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.elapsedTime
    group.current.children.forEach((child, i) => {
      if ((child as THREE.Group).userData.node) {
        child.position.y = AGENT_POSITIONS[i][1] + Math.sin(t * 0.85 + i * 1.35) * 0.07
      }
    })
    if (pulse.current) {
      const speed = (t * 0.16) % 1
      const a = new THREE.Vector3(...AGENT_POSITIONS[0])
      const b = new THREE.Vector3(...AGENT_POSITIONS[2])
      const pos = a.clone().lerp(b, speed)
      pos.y += Math.sin(speed * Math.PI) * 0.12 + Math.sin(t * 0.85) * 0.03
      pulse.current.position.copy(pos)
      const m = pulse.current.material as THREE.MeshBasicMaterial
      m.opacity = Math.sin(speed * Math.PI) * 0.9
    }
  })

  if (!visible) return null

  return (
    <group>
      {/* fine connecting lines */}
      {AGENT_LINKS.map(([a, b], i) => (
        <Line
          key={i}
          points={[AGENT_POSITIONS[a], AGENT_POSITIONS[b]]}
          color={SAGE}
          lineWidth={0.8}
          transparent
          opacity={0.45}
          dashed
          dashSize={0.09}
          gapSize={0.06}
        />
      ))}
      {/* hub link to document */}
      <Line
        points={[
          [0.1, 1.9, -0.7],
          [0, 0.6, 0.1],
        ]}
        color={SAGE}
        lineWidth={0.7}
        transparent
        opacity={0.3}
        dashed
        dashSize={0.07}
        gapSize={0.07}
      />

      <group ref={group}>
        {AGENT_POSITIONS.map((pos, i) => (
          <group key={i} position={pos} userData={{ node: true }}>
            <mesh castShadow>
              <sphereGeometry args={[i === 2 ? 0.075 : 0.058, 24, 24]} />
              <meshStandardMaterial color={i % 2 === 0 ? OLIVE : '#8a9a7d'} roughness={0.35} metalness={0.08} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.115, 24, 24]} />
              <meshBasicMaterial color={SAGE_LIGHT} transparent opacity={0.28} depthWrite={false} />
            </mesh>
            <mesh rotation={[Math.PI / 2.4, 0.4, 0]}>
              <torusGeometry args={[0.105, 0.006, 8, 40]} />
              <meshBasicMaterial color={OLIVE} transparent opacity={0.45} />
            </mesh>
          </group>
        ))}
      </group>

      {/* travelling pulse */}
      <mesh ref={pulse}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshBasicMaterial color={OLIVE_DARK} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

/* --------------------------------- Scan line --------------------------------- */
function ScanLine({ scanning }: { scanning: boolean }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    if (scanning) {
      const p = (t * 0.22) % 1
      ref.current.position.y = 1.65 - p * 3.3
      ref.current.visible = true
      const fade = Math.sin(p * Math.PI)
      ref.current.children.forEach((ch) => {
        const m = (ch as THREE.Mesh).material as THREE.MeshBasicMaterial
        if (m) m.opacity = (ch.userData.baseOpacity ?? 0.2) * fade
      })
    } else {
      ref.current.visible = false
    }
  })
  return (
    <group ref={ref} position={[0, 1.6, 0.34]}>
      <mesh userData={{ baseOpacity: 0.16 }}>
        <planeGeometry args={[2.62, 0.34]} />
        <meshBasicMaterial color={SAGE} transparent opacity={0.14} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.004]} userData={{ baseOpacity: 0.85 }}>
        <planeGeometry args={[2.62, 0.018]} />
        <meshBasicMaterial color={OLIVE} transparent opacity={0.8} depthWrite={false} />
      </mesh>
    </group>
  )
}

/* -------------------------------- Scene content ------------------------------- */
function SceneContent({
  activeField,
  onSelectField,
  separation,
  showAgents,
  showOCR,
  motion,
  scanning,
}: {
  activeField: FieldId
  onSelectField: (id: FieldId) => void
  separation: number
  showAgents: boolean
  showOCR: boolean
  motion: boolean
  scanning: boolean
}) {
  const root = useRef<THREE.Group>(null!)
  const { pointer, camera, size } = useThree()
  const aspect = size.width / Math.max(size.height, 1)
  const responsiveScale = aspect < 0.75 ? 0.62 : aspect < 0.95 ? 0.76 : aspect < 1.2 ? 0.88 : 1
  const timeOffset = useRef(0)
  const last = useRef(0)

  useFrame(({ clock }, delta) => {
    if (!root.current) return
    const rawT = clock.elapsedTime
    if (motion) timeOffset.current += rawT - last.current
    last.current = rawT
    const t = timeOffset.current

    // gentle float + slow sway
    root.current.position.y = Math.sin(t * 0.55) * 0.07 - 0.08
    const targetRotY = pointer.x * 0.22 + Math.sin(t * 0.16) * 0.09 - 0.04
    const targetRotX = -pointer.y * 0.13 + Math.sin(t * 0.22) * 0.02
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, targetRotY, 3.2, delta)
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, targetRotX, 3.2, delta)
    root.current.rotation.z = THREE.MathUtils.damp(root.current.rotation.z, pointer.x * -0.03, 3, delta)

    // subtle camera parallax for depth
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.35, 2.5, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.55 + pointer.y * 0.22, 2.5, delta)
    camera.lookAt(0, 0.05, 0)
  })

  return (
    <>
      <ambientLight intensity={0.85} color="#fff6e6" />
      <directionalLight
        position={[4.5, 6.5, 4.5]}
        intensity={1.65}
        color="#fff3dd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <directionalLight position={[-5, 3, -3]} intensity={0.35} color="#dfe8d2" />
      <directionalLight position={[0, -2, 5]} intensity={0.18} color="#ffffff" />
      <pointLight position={[3, 1.5, 3.5]} intensity={6} distance={10} color="#f3ead2" />

      <group scale={responsiveScale}>
      <group ref={root} position={[0, -0.08, 0]} rotation={[0, -0.04, 0]}>
        <AgentNodes visible={showAgents} />

        {/* document stack — back to front */}
        <PaperPage index={0} total={3} separation={separation} activeField={activeField} showOCR={showOCR} />
        <PaperPage index={1} total={3} separation={separation} activeField={activeField} showOCR={showOCR} />
        <PaperPage index={2} total={3} separation={separation} activeField={activeField} showOCR={showOCR} main />

        <ScanLine scanning={scanning && motion} />

        {/* connector lines OCR → cards */}
        {showOCR &&
          CARDS.map((card) => {
            const start = ocrStart(card.id)
            const end: [number, number, number] = [card.base[0] - Math.sign(card.base[0]) * 0.56, card.base[1] + 0.05, card.base[2] - 0.05]
            const isActive = activeField === card.id
            return (
              <Line
                key={card.id}
                points={[start, end]}
                color={isActive ? OLIVE_DARK : SAGE}
                lineWidth={isActive ? 1.2 : 0.7}
                transparent
                opacity={isActive ? 0.75 : 0.32}
                dashed
                dashSize={0.06}
                gapSize={0.045}
              />
            )
          })}
        {/* anchor dots on connectors */}
        {showOCR &&
          CARDS.map((card) => {
            const s = ocrStart(card.id)
            return (
              <mesh key={`dot-${card.id}`} position={s}>
                <sphereGeometry args={[0.022, 12, 12]} />
                <meshBasicMaterial color={activeField === card.id ? OLIVE_DARK : SAGE} />
              </mesh>
            )
          })}

        {CARDS.map((def, i) => (
          <DataCard key={def.id} def={def} index={i} active={activeField === def.id} emerged={separation} onSelect={onSelectField} />
        ))}
      </group>
      </group>

      {/* soft ground shadow */}
      <ContactShadows position={[0, -2.18, 0]} opacity={0.42} scale={11} blur={2.6} far={3.2} resolution={512} color="#7d6f52" frames={Infinity} />
      {/* warm backdrop disc */}
      <mesh position={[0, 0.1, -1.9]} receiveShadow>
        <circleGeometry args={[4.6, 48]} />
        <meshStandardMaterial color="#f1ead9" roughness={1} />
      </mesh>
      <mesh position={[0, 0.1, -1.88]}>
        <ringGeometry args={[3.1, 3.115, 64]} />
        <meshBasicMaterial color="#d9d0b8" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

export default function ExtractionScene(props: {
  activeField: FieldId
  onSelectField: (id: FieldId) => void
  separation: number
  showAgents: boolean
  showOCR: boolean
  motion: boolean
  scanning: boolean
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.55, 7.4], fov: 35, near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
      onPointerMissed={() => {}}
    >
      <SceneContent {...props} />
    </Canvas>
  )
}
