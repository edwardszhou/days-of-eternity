import * as THREE from 'three';
import { MeshoptSimplifier } from 'meshoptimizer';
import { memo, useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { RigidBody, TrimeshCollider } from '@react-three/rapier';
import { generateHeight, generateTexture } from '../lib/helpers';

export default memo(function Terrain({ width, depth, sunPosition, moveCamera }) {
  const meshRef = useRef(null);
  const planeRef = useRef(null);
  const textureRef = useRef(null);
  const mesh2Ref = useRef(null);
  const plane2Ref = useRef(null);

  const pointer = useThree((state) => state.pointer);
  const raycaster = useThree((state) => state.raycaster);
  const camera = useThree((state) => state.camera);

  const [colliderData, setColliderData] = useState();

  useEffect(() => {
    const vertices = planeRef.current.attributes.position.array;
    const vertices2 = plane2Ref.current.attributes.position.array;
    const heightData = generateHeight(width, depth);
    for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
      vertices[j + 2] = heightData[i] * 0.3;
      vertices2[j + 2] = heightData[i] * 0.3;
    }

    // Remesh for collider
    const srcIndexArray = plane2Ref.current.index.array;
    const targetCount = 3 * Math.floor(((1 / 16) * srcIndexArray.length) / 3); // remesh to 1/16 of original resolution
    const [dstIndexArray, error] = MeshoptSimplifier.simplify(srcIndexArray, vertices2, 3, targetCount, 0.01, ['LockBorder']);

    plane2Ref.current.index.array.set(dstIndexArray);
    plane2Ref.current.index.needsUpdate = true;

    plane2Ref.current.setDrawRange(0, dstIndexArray.length);
    plane2Ref.current.needsUpdate = true;
    setColliderData({ indices: dstIndexArray, vertices: vertices2 });

    textureRef.current.image = generateTexture(heightData, width, depth, sunPosition);
  }, [width, depth]);

  const handleClick = (ev) => {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current);

    if (intersects.length > 0) {
      if (intersects[0].point.x > 250 || intersects[0].point.z < -250) return;
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(meshRef.current.matrixWorld);
      const normalDisplace = intersects[0].face.normal.clone().applyMatrix3(normalMatrix).normalize().multiplyScalar(20);
      const targetPos = new THREE.Vector3().addVectors(intersects[0].point, normalDisplace);
      moveCamera(targetPos.x, targetPos.y + 5, targetPos.z);
    }
  };

  return (
    <>
      <mesh rotation={[-0.5 * Math.PI, 0, 0]} onClick={handleClick} ref={meshRef}>
        <planeGeometry args={[1000, 1000, width - 1, depth - 1]} ref={planeRef} />
        <meshPhysicalMaterial>
          <canvasTexture
            ref={textureRef}
            attach="map"
            wrapS={THREE.ClampToEdgeWrapping}
            wrapT={THREE.ClampToEdgeWrapping}
            colorSpace={THREE.SRGBColorSpace}
          />
        </meshPhysicalMaterial>
      </mesh>
      <RigidBody type="fixed">
        <mesh rotation={[-0.5 * Math.PI, 0, 0]} onClick={handleClick} ref={mesh2Ref}>
          {!colliderData ? (
            <>
              <planeGeometry args={[1000, 1000, width - 1, depth - 1]} ref={plane2Ref} />
              <meshBasicMaterial wireframe visible={false} />
            </>
          ) : (
            <TrimeshCollider args={[colliderData.vertices, colliderData.indices]} />
          )}
        </mesh>
      </RigidBody>
    </>
  );
});
