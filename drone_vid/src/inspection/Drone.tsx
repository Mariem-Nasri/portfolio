import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { dronePose } from "./timeline";

const BODY = "#2b2d30";
const BODY_LIGHT = "#3a3d41";
const ARM = "#1f2123";
const CARBON = "#16181a";

const ARMS = [
  { a: 0.62, front: true },
  { a: -0.62, front: true },
  { a: Math.PI - 0.62, front: false },
  { a: Math.PI + 0.62, front: false },
];
const ARM_LEN = 1.12;

function Rotor({ speedRef, dir }: { speedRef: MutableRefObject<number>; dir: number }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    ref.current.rotation.y += speedRef.current * dir * dt;
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[1.0, 0.012, 0.075]} />
        <meshStandardMaterial color={CARBON} roughness={0.5} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.0, 0.012, 0.075]} />
        <meshStandardMaterial color={CARBON} roughness={0.5} />
      </mesh>
      {/* motion-blur disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 40]} />
        <meshBasicMaterial color="#1b1d1f" transparent opacity={0.16} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.46, 0.5, 48]} />
        <meshBasicMaterial color="#2a2c2e" transparent opacity={0.32} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function DroneModel({ timeRef }: { timeRef: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null!);
  const speed = useRef(42);
  const leds = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  useFrame((state) => {
    const t = timeRef.current;
    const pose = dronePose(t);
    const { width, height } = state.viewport;
    group.current.position.set(
      (pose.x / 100 - 0.5) * width,
      (0.5 - pose.y / 100) * height,
      0
    );
    group.current.scale.setScalar(pose.scale * (width / 9.4));
    group.current.rotation.set(0.42 + pose.pitch, pose.yaw, pose.roll);
    speed.current = 40 + Math.sin(t * 3) * 4;

    const blink = (Math.sin(t * 6) + 1) / 2;
    leds.current.forEach((m, i) => {
      if (m) m.emissiveIntensity = i < 2 ? 1.6 + blink * 1.2 : 1.1 + blink * 0.6;
    });
  });

  return (
    <group ref={group}>
      {/* main body */}
      <RoundedBox args={[1.15, 0.36, 0.78]} radius={0.09} smoothness={3}>
        <meshStandardMaterial color={BODY} roughness={0.42} metalness={0.25} />
      </RoundedBox>
      <RoundedBox args={[0.7, 0.16, 0.5]} radius={0.06} smoothness={3} position={[0, 0.24, 0]}>
        <meshStandardMaterial color={BODY_LIGHT} roughness={0.5} metalness={0.2} />
      </RoundedBox>
      {/* front sensor cluster */}
      {[-0.17, 0.17].map((x, i) => (
        <mesh key={i} position={[x, 0.03, 0.4]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#0c0d0e" roughness={0.2} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, -0.08, 0.4]}>
        <boxGeometry args={[0.3, 0.05, 0.02]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* arms, motors, rotors, legs */}
      {ARMS.map(({ a, front }, i) => {
        const ex = Math.cos(a) * ARM_LEN;
        const ez = Math.sin(a) * ARM_LEN;
        return (
          <group key={i}>
            <mesh
              position={[ex / 2, 0.06, ez / 2]}
              rotation={[0, -a, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.045, 0.055, ARM_LEN, 12]} />
              <meshStandardMaterial color={ARM} roughness={0.45} metalness={0.3} />
            </mesh>
            {/* motor */}
            <mesh position={[ex, 0.14, ez]}>
              <cylinderGeometry args={[0.1, 0.11, 0.14, 20]} />
              <meshStandardMaterial color="#25272a" roughness={0.35} metalness={0.5} />
            </mesh>
            <mesh position={[ex, 0.225, ez]}>
              <cylinderGeometry args={[0.035, 0.035, 0.04, 12]} />
              <meshStandardMaterial color="#444" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* LED strip */}
            <mesh position={[ex * 0.82, 0.02, ez * 0.82]}>
              <boxGeometry args={[0.16, 0.05, 0.16]} />
              <meshStandardMaterial
                ref={(el) => {
                  leds.current[i] = el;
                }}
                color={front ? "#2cff8a" : "#2cff8a"}
                emissive="#22e676"
                emissiveIntensity={1.5}
                toneMapped={false}
              />
            </mesh>
            {/* rotor */}
            <group position={[ex, 0.25, ez]}>
              <Rotor speedRef={speed} dir={i % 2 === 0 ? 1 : -1} />
            </group>
            {/* landing legs */}
            <mesh position={[ex * 0.62, -0.34, ez * 0.62]} rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.56, 10]} />
              <meshStandardMaterial color={ARM} roughness={0.5} />
            </mesh>
          </group>
        );
      })}
      {/* skids */}
      {[0.55, -0.55].map((z, i) => (
        <mesh key={i} position={[0, -0.63, z * 1.18]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 1.4, 10]} />
          <meshStandardMaterial color={ARM} roughness={0.5} />
        </mesh>
      ))}

      {/* gimbal camera */}
      <group position={[0, -0.3, 0.18]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.16, 16]} />
          <meshStandardMaterial color="#1d1f21" roughness={0.4} metalness={0.4} />
        </mesh>
        <RoundedBox args={[0.34, 0.28, 0.32]} radius={0.05} smoothness={3} position={[0, -0.2, 0]}>
          <meshStandardMaterial color="#232528" roughness={0.4} metalness={0.3} />
        </RoundedBox>
        <mesh position={[0, -0.2, 0.19]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.1, 0.08, 20]} />
          <meshStandardMaterial color="#0b0c0d" roughness={0.2} metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.2, 0.235]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.055, 20]} />
          <meshStandardMaterial color="#2a3a52" roughness={0.05} metalness={0.9} emissive="#182a44" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  );
}

export function DroneLayer({ timeRef }: { timeRef: MutableRefObject<number> }) {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 10], fov: 35 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <ambientLight intensity={0.55} color="#dfe6ee" />
      <hemisphereLight color="#d9e3ee" groundColor="#6a5c48" intensity={0.9} />
      <directionalLight position={[6, 5, 4]} intensity={2.4} color="#ffe2b8" />
      <directionalLight position={[-5, 2, 2]} intensity={0.6} color="#c9d4e2" />
      <directionalLight position={[0, -3, 3]} intensity={0.35} color="#b9a88c" />
      <DroneModel timeRef={timeRef} />
    </Canvas>
  );
}
