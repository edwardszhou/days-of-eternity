import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { Suspense } from 'react';

import './styles.css';
import Skybox from './components/Skybox';
import PhysicsWorld from './components/PhysicsWorld';
import { COLORS, sunPosition } from './lib/constants';

export default function App() {
  return (
    <Canvas>
      <Suspense>
        {/* <CameraControls /> */}
        <fogExp2 attach="fog" color={COLORS.purple} density={0.003} />
        <Stats />
        <Skybox sunPosition={sunPosition} />
        <PhysicsWorld />
      </Suspense>
    </Canvas>
  );
}
