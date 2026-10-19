export const LOOP = 16; // seconds

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number) => t * t * t;
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export interface Detection {
  id: string;
  label: string;
  color: string;
  text: string;
  /** percentage box inside the frame */
  box: { x: number; y: number; w: number; h: number };
  start: number; // seconds
}

export const DETECTIONS: Detection[] = [
  {
    id: "corrosion",
    label: "Corrosion",
    color: "#e8862a",
    text: "#f5b24a",
    box: { x: 10.5, y: 24, w: 17, h: 14 },
    start: 3.2,
  },
  {
    id: "leak",
    label: "Leak",
    color: "#f0b232",
    text: "#f7c75a",
    box: { x: 20.5, y: 69.5, w: 23.5, h: 18 },
    start: 6.4,
  },
  {
    id: "crack",
    label: "Crack",
    color: "#e4561c",
    text: "#f29a4a",
    box: { x: 50, y: 76, w: 20.5, h: 15.5 },
    start: 9.6,
  },
];


export interface DronePose {
  x: number; // % of frame width
  y: number; // % of frame height
  scale: number;
  yaw: number; // radians
  roll: number;
  pitch: number;
}

function rawPose(t: number) {
  // fly in from top-right
  const e = easeOutCubic(clamp01(t / 3.2));
  let x = lerp(96, 69, e);
  let y = lerp(14, 40, e);
  let s = lerp(0.5, 1, e);

  // hover bob
  x += Math.sin(t * 0.6) * 1.1;
  y += Math.sin(t * 0.95) * 1.3 + Math.sin(t * 2.1) * 0.25;

  // lean toward each target while inspecting
  DETECTIONS.forEach((d) => {
    const p = clamp01((t - d.start + 0.6) / 1.4);
    const back = clamp01((t - d.start - 1.8) / 1.0);
    const w = easeInOut(p) * (1 - easeInOut(back));
    const cx = d.box.x + d.box.w / 2;
    x += (cx - 69) * 0.08 * w;
    y += 2.2 * w;
  });

  // fly out at the end
  const o = easeInCubic(clamp01((t - 14.3) / 1.7));
  x += o * 34;
  y -= o * 30;
  s *= 1 - o * 0.35;

  return { x, y, s };
}

export function dronePose(t: number): DronePose {
  const a = rawPose(t);
  const b = rawPose(t + 0.05);
  const vx = (b.x - a.x) / 0.05;
  const vy = (b.y - a.y) / 0.05;
  return {
    x: a.x,
    y: a.y,
    scale: a.s,
    roll: -vx * 0.012 + Math.sin(t * 1.3) * 0.015,
    pitch: vy * 0.01 + Math.sin(t * 0.8) * 0.02,
    yaw: Math.sin(t * 0.35) * 0.18 - 0.25,
  };
}

