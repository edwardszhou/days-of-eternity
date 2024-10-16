import { Canvas } from '@react-three/fiber';
import './styles.css';
import Skybox from './components/Skybox';
import { CameraControls, PerspectiveCamera, Stats } from '@react-three/drei';
import TestSpheres from './components/TestSpheres';
import Terrain from './components/Terrain';
import { Bloom, EffectComposer } from '@react-three/postprocessing';

const sunPosition = { x: 100, y: -2, z: -100 };

export default function App() {
  return (
    <Canvas>
      <CameraControls makeDefault />
      <PerspectiveCamera fov={50} near={0.1} far={5000} position={[-110, 60, 360]} onUpdate={(self) => self.lookAt(100, 0, -150)} makeDefault />
      <fogExp2 attach="fog" color={'#432945'} density={0.0025} />
      <Stats />

      <Skybox sunPosition={sunPosition} />
      <TestSpheres />
      <Terrain width={1024} depth={1024} sunPosition={sunPosition} />
    </Canvas>
  );
}
