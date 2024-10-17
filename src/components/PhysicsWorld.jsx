import { PerspectiveCamera } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { memo, useCallback, useRef, useState } from 'react';
import { gsap } from 'gsap';

import Terrain from './Terrain';
import { sunPosition, WORLD_DEPTH, WORLD_WIDTH } from '../lib/constants';

export default memo(function PhysicsWorld({}) {
  const [isMoving, setIsMoving] = useState(false);
  const cameraRef = useRef();

  const moveCamera = useCallback(
    (x, y, z) => {
      if (isMoving) return;
      setIsMoving(true);
      gsap.to(cameraRef.current.position, {
        x,
        y,
        z,
        duration: 5,
        ease: 'power2.inOut',
        onComplete: () => setIsMoving(false)
      });
    },
    [cameraRef]
  );

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
      {/* <TestSpheres /> */}
      <Terrain width={WORLD_WIDTH} depth={WORLD_DEPTH} sunPosition={sunPosition} moveCamera={moveCamera} />
    </Physics>
  );
});
