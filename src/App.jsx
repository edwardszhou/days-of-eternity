import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { CameraControls, PerspectiveCamera, Stats } from '@react-three/drei';
import { Suspense, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Physics, RigidBody } from '@react-three/rapier';

import './styles.css';
import Skybox from './components/Skybox';
import TestSpheres from './components/TestSpheres';
import Terrain from './components/Terrain';

const sunPosition = { x: 100, y: -2, z: -100 };

export default function App() {
  const [isMoving, setIsMoving] = useState(false);
  const cameraVel = useRef(0);
  const cameraRef = useRef();

  const moveCamera = (x, y, z) => {
    // if (isMoving) return;
    // setIsMoving(true);
    // gsap.to(cameraRef.current.position, {
    //   x,
    //   y,
    //   z,
    //   duration: 5,
    //   ease: 'power2.inOut',
    //   onComplete: () => setIsMoving(false)
    // });
  };

  const pointer = new THREE.Vector2();
  const handlePointerMove = (ev) => {
    pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(ev.clientY / window.innerHeight) * 2 + 1;

    if (pointer.x > 0.6) {
      cameraVel.current += 1;
    }
  };

  return (
    <Canvas onPointerMove={handlePointerMove}>
      <Suspense>
        <CameraControls />
        <PerspectiveCamera
          fov={50}
          near={0.1}
          far={5000}
          position={[-110, 60, 360]}
          onUpdate={(self) => self.lookAt(100, 0, -150)}
          makeDefault
          ref={cameraRef}
        />
        <fogExp2 attach="fog" color={'#432945'} density={0.0025} />
        <Stats />

        <Skybox sunPosition={sunPosition} />
        <Physics debug colliders={false}>
          {/* <TestSpheres /> */}
          <Terrain width={1024} depth={1024} sunPosition={sunPosition} moveCamera={moveCamera} />
        </Physics>
      </Suspense>
    </Canvas>
  );
}
