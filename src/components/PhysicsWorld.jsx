import {
  AccumulativeShadows,
  Box,
  ContactShadows,
  GradientTexture,
  MeshReflectorMaterial,
  PerspectiveCamera,
  RandomizedLight
} from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { memo, useCallback, useRef, useState } from 'react';
import { gsap } from 'gsap';

import Terrain from './Terrain';
import { COLORS, sunPosition, WORLD_DEPTH, WORLD_WIDTH } from '../lib/constants';
import { useFrame } from '@react-three/fiber';
import TextInput from './TextInput';

export default memo(function PhysicsWorld({}) {
  const [isMoving, setIsMoving] = useState(false);
  const [textSelected, setTextSelected] = useState(false);
  const [textOffset, setTextOffset] = useState({ x: -110, y: 60, z: 360 });
  const cameraRef = useRef();
  const cameraVel = useRef(0);

  const moveCamera = (x, y, z) => {
    if (isMoving || textSelected) return;
    setIsMoving(true);
    setTextOffset({ x, y, z });
    gsap.to(cameraRef.current.position, {
      x,
      y,
      z,
      duration: 5,
      ease: 'power2.inOut',
      onComplete: () => setIsMoving(false)
    });
  };

  useFrame(({ pointer, camera }) => {
    if (!textSelected) {
      if (pointer.x > 0.6 && camera?.rotation.y > -1.2 && cameraVel.current > -0.5) {
        cameraVel.current -= (0.005 * (pointer.x - 0.6)) / 0.4;
      } else if (pointer.x < -0.6 && camera?.rotation.y < 0.25 && cameraVel.current < 0.5) {
        cameraVel.current += (0.005 * (pointer.x + 0.6)) / -0.4;
      }
    }
    cameraVel.current = Math.round(cameraVel.current * 0.975 * 10000) / 10000;
    camera.rotateY(cameraVel.current / 100);
  });

  return (
    <Physics debug colliders={false}>
      <PerspectiveCamera
        fov={50}
        near={0.1}
        far={5000}
        position={[-110, 60, 360]}
        onUpdate={(self) => self.lookAt(100, 0, -150)}
        makeDefault
        ref={cameraRef}
      />
      <TextInput origin={[-110, 60, 360]} offset={textOffset} setTextSelected={setTextSelected} />
      {/* <TestSpheres /> */}
      <Terrain width={WORLD_WIDTH} depth={WORLD_DEPTH} sunPosition={sunPosition} moveCamera={moveCamera} />
    </Physics>
  );
});
