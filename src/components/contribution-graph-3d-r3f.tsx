'use client';

import { useMemo, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import type { ContributionDay } from '@/types/contributions';
import { useGraphAppearanceStore } from '@/store/graph-appearance';
import * as THREE from 'three';

interface ContributionGraph3DR3FProps {
  contributions: ContributionDay[];
  width?: number;
  height?: number;
}

interface CubeProps {
  position: [number, number, number];
  contribution: ContributionDay;
  size: number;
  maxCount: number;
  baseColor: string;
  minOpacity: number;
  maxOpacity: number;
  onHover?: (day: ContributionDay | null, position: { x: number; y: number }) => void;
}

function ContributionCube({ 
  position, 
  contribution, 
  size, 
  maxCount, 
  baseColor, 
  minOpacity, 
  maxOpacity,
  onHover 
}: CubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const height = contribution.count > 0 ? Math.max(0.1, (contribution.count / maxCount) * 3) : 0.1;
  
  const intensity = Math.max(0, Math.min(4, contribution.intensity));
  const stops = [0, 1, 2, 3, 4].map((i) => minOpacity + (i * (maxOpacity - minOpacity)) / 4);
  const alpha = stops[intensity];
  
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);
  
  const color = new THREE.Color(r / 255, g / 255, b / 255);
  color.multiplyScalar(alpha + (1 - alpha) * 0.1); 

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.y = THREE.MathUtils.lerp(
        meshRef.current.scale.y,
        hovered ? height * 1.2 : height,
        0.1
      );
      
      if (hovered) {
        meshRef.current.rotation.y += 0.02;
      } else {
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
      }
    }
  });

  const handlePointerOver = (event: any) => {
    setHovered(true);
    if (onHover && contribution.date) {
      const rect = event.target.getBoundingClientRect();
      onHover(contribution, { x: rect.left, y: rect.top });
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    if (onHover) {
      onHover(null, { x: 0, y: 0 });
    }
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[position[0], height / 2, position[2]]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={[size, height, size]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshPhongMaterial 
          color={color} 
          transparent 
          opacity={0.9}
          emissive={hovered ? new THREE.Color(0x222222) : new THREE.Color(0x000000)}
          shininess={hovered ? 100 : 30}
        />
      </mesh>
      
      {contribution.count > maxCount * 0.7 && (
        <mesh
          position={[position[0], height / 2, position[2]]}
          scale={[size * 1.1, height * 1.1, size * 1.1]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.1}
          />
        </mesh>
      )}
    </group>
  );
}

function ContributionGrid({ 
  contributions, 
  maxCount, 
  baseColor, 
  minOpacity, 
  maxOpacity,
  onHover 
}: {
  contributions: ContributionDay[];
  maxCount: number;
  baseColor: string;
  minOpacity: number;
  maxOpacity: number;
  onHover?: (day: ContributionDay | null, position: { x: number; y: number }) => void;
}) {
  const weeks = useMemo(() => {
    if (contributions.length === 0) return [] as ContributionDay[][];
    const list = [...contributions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const weeksAcc: ContributionDay[][] = [];
    let current: ContributionDay[] = [];
    list.forEach((day, index) => {
      const date = new Date(day.date);
      const dow = date.getDay();
      if (index === 0) {
        for (let i = 0; i < dow; i++) current.push({ date: '', count: 0, color: '#ebedf0', intensity: 0 });
      }
      current.push(day);
      if (current.length === 7) {
        weeksAcc.push(current);
        current = [];
      }
    });
    if (current.length > 0) {
      while (current.length < 7) current.push({ date: '', count: 0, color: '#ebedf0', intensity: 0 });
      weeksAcc.push(current);
    }
    return weeksAcc;
  }, [contributions]);

  const appearance = useGraphAppearanceStore((s) => s.appearance);
  const size = Math.max(0.3, Math.min(1.0, appearance.size / 20));
  const gap = Math.max(0, Math.min(0.3, appearance.gap / 20));

  const gridCenter = useMemo(() => {
    if (weeks.length === 0) return [0, 0, 0];
    const totalWeeks = weeks.length;
    const totalDays = 7;
    const centerX = (totalWeeks - 1) * (size + gap) / 2;
    const centerZ = (totalDays - 1) * (size + gap) / 2;
    return [centerX, 0, centerZ];
  }, [weeks.length, size, gap]);

  return (
    <group position={[-gridCenter[0], -gridCenter[1], -gridCenter[2]]}>
      {weeks.map((week, weekIndex) => 
        week.map((day, dayIndex) => {
          if (!day.date) return null;
          const x = weekIndex * (size + gap);
          const z = dayIndex * (size + gap);
          return (
            <ContributionCube
              key={`${weekIndex}-${dayIndex}`}
              position={[x, 0, z]}
              contribution={day}
              size={size}
              maxCount={maxCount}
              baseColor={baseColor}
              minOpacity={minOpacity}
              maxOpacity={maxOpacity}
              onHover={onHover}
            />
          );
        })
      )}
    </group>
  );
}

const ContributionGraph3DR3F = forwardRef<{ captureCanvas: () => string | null }, ContributionGraph3DR3FProps>(({ 
  contributions, 
  width = 800, 
  height = 416 
}, ref) => {
  const appearance = useGraphAppearanceStore((s) => s.appearance);
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<any>(null);

  const maxCount = useMemo(() => {
    let max = 0;
    for (const d of contributions) {
      if (d.count > max) max = d.count;
    }
    return max || 1;
  }, [contributions]);

  const handleHover = (day: ContributionDay | null, position: { x: number; y: number }) => {
    setHoveredDay(day);
  };

  const captureCanvas = () => {
    if (rendererRef.current) {
      try {
        rendererRef.current.render();
        return rendererRef.current.domElement.toDataURL('image/png');
      } catch (error) {
        console.error('Error capturing 3D canvas:', error);
        return null;
      }
    }
    return null;
  };

  useImperativeHandle(ref, () => ({
    captureCanvas
  }), []);

  return (
    <div className="w-full overflow-hidden" style={{ width, height }}>
      <Canvas
        ref={canvasRef}
        camera={{ 
          position: [15, 12, 15], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        style={{ width: '100%', height: '100%' }}
        shadows
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          rendererRef.current = gl;
        }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[20, 20, 10]} 
          intensity={1.2}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <pointLight position={[-15, 10, -15]} intensity={0.4} color="#ffffff" />
        <pointLight position={[15, 5, 15]} intensity={0.3} color="#ffffff" />

        <ContributionGrid
          contributions={contributions}
          maxCount={maxCount}
          baseColor={appearance.baseColor}
          minOpacity={appearance.minOpacity}
          maxOpacity={appearance.maxOpacity}
          onHover={handleHover}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={60}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI - Math.PI / 8}
          dampingFactor={0.05}
          enableDamping={true}
          autoRotate={false}
          autoRotateSpeed={0.5}
          target={[0, 0, 0]}
        />

        {hoveredDay && (
          <Html
            position={[0, 5, 0]}
            center
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <div className="bg-gray-900/95 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
              <div>{new Date(hoveredDay.date).toDateString()}</div>
              <div>{hoveredDay.count} contributions</div>
            </div>
          </Html>
        )}
      </Canvas>
    </div>
  );
});

ContributionGraph3DR3F.displayName = 'ContributionGraph3DR3F';

export default ContributionGraph3DR3F;
