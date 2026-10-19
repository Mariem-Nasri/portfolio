import { useEffect, useRef, useState } from "react";
import { DroneLayer } from "./Drone";
import { DetectionBox, BeamLayer, Hud } from "./Overlays";
import { DETECTIONS, LOOP, clamp01, dronePose } from "./timeline";
import refinery from "../assets/refinery.jpg";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function InspectionVideo() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const timeRef = useRef(0);
  const playingRef = useRef(true);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPlaying(!preference.matches);
    preference.addEventListener("change", syncPreference);
    return () => preference.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (playingRef.current) {
        timeRef.current = (timeRef.current + dt) % LOOP;
        setT(timeRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pose = dronePose(t);

  // camera drift (continuous across the loop)
  const ph = (t / LOOP) * Math.PI * 2;
  const kbScale = 1.035 + 0.035 * Math.sin(ph - Math.PI / 2);
  const kbX = 0.8 * Math.sin(ph);
  const kbY = 0.5 * Math.sin(ph * 0.5);

  // loop dip to black
  const dip = Math.max(clamp01((t - (LOOP - 0.45)) / 0.45), 1 - clamp01(t / 0.6));

  return (
    <div className="relative w-full select-none">
      {/* ---- frame ---- */}
      <div
        className="relative aspect-[17/9] w-full overflow-hidden rounded-xl bg-[#0d0d0d] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
        style={{ containerType: "inline-size" }}
        aria-label="Animated illustrative pipeline inspection scene"
      >
        {/* background plate */}
        <img
          src={refinery}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            transform: `scale(${kbScale}) translate(${kbX}%, ${kbY}%)`,
            willChange: "transform",
          }}
        />
        {/* warm grade + vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.45) 100%)",
          }}
        />

        {/* drone shadow hint on the ground (soft) */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            left: `${pose.x + 10}%`,
            top: `${Math.min(95, pose.y + 46)}%`,
            width: `${16 * pose.scale}%`,
            height: `${3.5 * pose.scale}%`,
            transform: "translate(-50%,-50%)",
            background: "radial-gradient(ellipse, rgba(0,0,0,0.35), transparent 70%)",
            filter: "blur(4px)",
            opacity: 0.6 * pose.scale,
          }}
        />

        <BeamLayer t={t} pose={pose} />
        <DroneLayer timeRef={timeRef} />

        <div className="pointer-events-none absolute inset-0">
          {DETECTIONS.map((d) => (
            <DetectionBox key={d.id} d={d} t={t} />
          ))}
        </div>

        <Hud t={t} />

        {/* scanlines + grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{ backgroundImage: GRAIN }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            background:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 3px)",
          }}
        />
        {/* loop dip */}
        <div
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: dip }}
        />

      </div>
    </div>
  );
}
