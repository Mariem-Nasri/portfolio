import {
  DETECTIONS,
  LOOP,
  clamp01,
  easeOutCubic,
  easeInOut,
  type Detection,
  type DronePose,
} from "./timeline";

/* ---------- detection box ---------- */

export function DetectionBox({ d, t }: { d: Detection; t: number }) {
  const p = clamp01((t - d.start) / 1.3);
  if (p <= 0) return null;

  const { x, y, w, h } = d.box;
  const cx = x + w / 2;
  const cy = y + h / 2;

  const reticle = 1 - clamp01((p - 0.1) / 0.35);
  const grow = easeOutCubic(clamp01((p - 0.12) / 0.45));
  const scanP = clamp01((p - 0.3) / 0.55);
  const labelP = easeOutCubic(clamp01((p - 0.62) / 0.38));
  const pulse = 0.78 + 0.22 * Math.sin((t - d.start) * 3.2);

  return (
    <>
      {/* reticle */}
      {reticle > 0 && (
        <div
          className="absolute"
          style={{
            left: `${cx}%`,
            top: `${cy}%`,
            width: 64,
            height: 64,
            transform: `translate(-50%,-50%) scale(${0.6 + (1 - reticle) * 1.3}) rotate(${p * 180}deg)`,
            opacity: reticle,
            border: `1.5px solid ${d.color}`,
            borderRadius: "50%",
            borderTopColor: "transparent",
            borderBottomColor: "transparent",
          }}
        />
      )}

      {/* box */}
      <div
        className="absolute"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: `${w}%`,
          height: `${h}%`,
          transform: `scale(${0.3 + grow * 0.7})`,
          opacity: grow,
          border: `3px solid ${d.color}`,
          boxShadow: `0 0 0 1px rgba(0,0,0,0.35), 0 0 14px ${d.color}55, inset 0 0 18px ${d.color}22`,
          background: `${d.color}${p < 1 ? "22" : "12"}`,
          transition: "background 0.4s",
        }}
      >
        {/* corner ticks */}
        {[
          [0, 0, 0],
          [1, 0, 90],
          [1, 1, 180],
          [0, 1, 270],
        ].map(([ax, ay, r], i) => (
          <span
            key={i}
            className="absolute"
            style={{
              left: ax ? "auto" : -6,
              right: ax ? -6 : "auto",
              top: ay ? "auto" : -6,
              bottom: ay ? -6 : "auto",
              width: 12,
              height: 12,
              borderLeft: `3px solid ${d.color}`,
              borderTop: `3px solid ${d.color}`,
              transform: `rotate(${r}deg)`,
              opacity: pulse,
            }}
          />
        ))}
        {/* scan sweep */}
        {scanP > 0 && scanP < 1 && (
          <div
            className="absolute left-0 right-0"
            style={{
              top: `${scanP * 100}%`,
              height: 2,
              background: d.color,
              boxShadow: `0 0 10px 2px ${d.color}`,
              opacity: 0.9,
            }}
          />
        )}
        {scanP > 0 && scanP < 1 && (
          <div
            className="absolute left-0 right-0 top-0"
            style={{
              height: `${scanP * 100}%`,
              background: `linear-gradient(to bottom, transparent, ${d.color}33)`,
            }}
          />
        )}
      </div>

      {/* label */}
      {labelP > 0 && (
        <div
          className="absolute flex items-center gap-2 whitespace-nowrap"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: `translateY(calc(-100% - 6px)) translateY(${(1 - labelP) * 8}px)`,
            opacity: labelP,
            padding: "5px 11px",
            background: "rgba(38,34,30,0.88)",
            border: `2px solid ${d.color}`,
            borderRadius: 3,
            color: d.text,
            fontWeight: 600,
            fontSize: "clamp(10px, 1.7cqw, 19px)",
            letterSpacing: "0.01em",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
          }}
        >
          <span
            className="inline-block rounded-full"
            style={{ width: 7, height: 7, background: d.color, boxShadow: `0 0 6px ${d.color}` }}
          />
            {d.label}
        </div>
      )}
    </>
  );
}

/* ---------- scan beam + link lines from drone ---------- */

export function BeamLayer({ t, pose }: { t: number; pose: DronePose }) {
  const dx = pose.x;
  const dy = pose.y + 7 * pose.scale; // camera gimbal
  const scanning = t > 1.8 && t < DETECTIONS[0].start - 0.2;
  const sweep = Math.sin(t * 1.1) * 14;

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8cf0b0" stopOpacity="0.45" />
          <stop offset="1" stopColor="#8cf0b0" stopOpacity="0" />
        </linearGradient>
      </defs>

      {scanning && (
        <polygon
          points={`${dx},${dy} ${dx - 22 + sweep},100 ${dx + 6 + sweep},100`}
          fill="url(#beam)"
          opacity={easeInOut(clamp01((t - 1.8) / 0.8))}
        />
      )}

      {DETECTIONS.map((d, i) => {
        const next = DETECTIONS[i + 1]?.start ?? LOOP;
        const p = clamp01((t - d.start) / 0.6);
        const fade = 1 - clamp01((t - next + 0.4) / 0.6);
        if (p <= 0 || fade <= 0) return null;
        const bx = d.box.x + d.box.w / 2;
        const by = d.box.y;
        const ex = dx + (bx - dx) * easeOutCubic(p);
        const ey = dy + (by - dy) * easeOutCubic(p);
        const focusing = p < 1;
        return (
          <g key={d.id} opacity={fade}>
            {focusing && (
              <polygon
                points={`${dx},${dy} ${d.box.x},${d.box.y + d.box.h} ${d.box.x + d.box.w},${d.box.y + d.box.h}`}
                fill={d.color}
                opacity={0.14 * (1 - p)}
              />
            )}
            <line
              x1={dx}
              y1={dy}
              x2={ex}
              y2={ey}
              stroke={d.color}
              strokeWidth={0.18}
              strokeDasharray="0.9 0.6"
              strokeDashoffset={-t * 6}
              vectorEffect="non-scaling-stroke"
              opacity={0.75}
            />
            <circle cx={ex} cy={ey} r={0.55} fill={d.color} opacity={0.9}>
              <animate attributeName="r" values="0.4;0.8;0.4" dur="1.4s" repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- HUD ---------- */

export function Hud({ t }: { t: number }) {
  const fadeIn = easeOutCubic(clamp01((t - 0.3) / 0.8));

  return (
    <div
      className="pointer-events-none absolute inset-0 font-mono text-[#eef3ea]"
      style={{ opacity: fadeIn, fontSize: "clamp(8px, 1.15cqw, 13px)" }}
    >
      {/* frame corner brackets */}
      {[
        "left-3 top-3 border-l border-t",
        "right-3 top-3 border-r border-t",
        "left-3 bottom-3 border-l border-b",
        "right-3 bottom-3 border-r border-b",
      ].map((c, i) => (
        <span key={i} className={`absolute h-5 w-5 border-white/50 ${c}`} />
      ))}

      <div className="absolute left-6 top-5 rounded-sm bg-black/45 px-2 py-1 font-sans text-[9px] tracking-[0.14em] text-white/75 backdrop-blur-sm">
        ILLUSTRATIVE INSPECTION SCENE
      </div>

      {/* crosshair */}
      <div className="absolute left-1/2 top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 opacity-40">
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white" />
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white" />
      </div>

      {/* detection log (bottom left) */}
      <div className="absolute bottom-5 left-6 flex flex-col gap-1">
        {DETECTIONS.map((d) => {
          const p = easeOutCubic(clamp01((t - d.start - 0.7) / 0.5));
          if (p <= 0) return null;
          return (
            <div
              key={d.id}
              className="flex items-center gap-2 rounded-sm bg-black/45 px-2 py-1 backdrop-blur-[2px]"
              style={{ opacity: p, transform: `translateX(${(1 - p) * -12}px)` }}
            >
              <span className="h-2 w-2 rounded-[1px]" style={{ background: d.color }} />
              <span className="font-semibold uppercase tracking-wider" style={{ color: d.text }}>
                {d.label}
              </span>
            </div>
          );
        })}
        {t > 0.6 && t < DETECTIONS[0].start + 0.7 && (
          <div className="flex items-center gap-2 rounded-sm bg-black/45 px-2 py-1 tracking-wider text-[#9bf0b8]">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#9bf0b8]" />
            ILLUSTRATIVE SCAN
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- summary panel ---------- */

