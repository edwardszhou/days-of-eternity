import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { MeshoptSimplifier } from 'meshoptimizer';
import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { RigidBody, TrimeshCollider } from '@react-three/rapier';

function generateHeight(width, depth) {
  let seed = Math.PI / 4;

  window.Math.random = function () {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const size = width * depth;
  const data = new Uint8Array(size);
  const perlin = new ImprovedNoise();
  const z = Math.random() * 100;

  let quality = 1;

  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < size; i++) {
      const x = i % width;
      const y = ~~(i / width);
      data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 2.25);
    }

    quality *= 5;
  }
  return data;
}

function generateTexture(data, width, height, sunPosition) {
  let context, image, imageData, shade;

  const vector3 = new THREE.Vector3(0, 0, 0);

  const sun = new THREE.Vector3(sunPosition.x, sunPosition.y, sunPosition.z);
  sun.normalize();

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  context = canvas.getContext('2d');
  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);

  image = context.getImageData(0, 0, canvas.width, canvas.height);
  imageData = image.data;

  for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
    vector3.x = data[j - 2] - data[j + 2];
    vector3.y = 2;
    vector3.z = data[j - width * 2] - data[j + width * 2];
    vector3.normalize();

    shade = vector3.dot(sun);

    imageData[i] = (144 + shade * 80) * (0.7 + data[j] * 0.007);
    imageData[i + 1] = (64 + shade * 64) * (0.7 + data[j] * 0.007);
    imageData[i + 2] = (32 + shade * 64) * (0.7 + data[j] * 0.007);
  }

  context.putImageData(image, 0, 0);

  // Scaled 4x

  const canvasScaled = document.createElement('canvas');
  canvasScaled.width = width * 4;
  canvasScaled.height = height * 4;

  context = canvasScaled.getContext('2d');
  context.scale(4, 4);
  context.drawImage(canvas, 0, 0);

  image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
  imageData = image.data;

  for (let i = 0, l = imageData.length; i < l; i += 4) {
    const v = ~~(Math.random() * 5);

    imageData[i] += v;
    imageData[i + 1] += v;
    imageData[i + 2] += v;
  }

  context.putImageData(image, 0, 0);

  return canvasScaled;
}

export default function Terrain({ width, depth, sunPosition, moveCamera }) {
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

    const srcIndexArray = plane2Ref.current.index.array;
    const targetCount = 3 * Math.floor(((1 / 16) * srcIndexArray.length) / 3);
    const [dstIndexArray, error] = MeshoptSimplifier.simplify(srcIndexArray, vertices2, 3, targetCount, 0.01, ['LockBorder']);
    console.log(`targetCount: ${targetCount}, count: ${dstIndexArray.length}`);

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
            <planeGeometry args={[1000, 1000, width - 1, depth - 1]} ref={plane2Ref} />
          ) : (
            <TrimeshCollider args={[colliderData.vertices, colliderData.indices]} />
          )}
        </mesh>
      </RigidBody>
    </>
  );
}
