import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { useEffect, useMemo, useRef } from 'react';
import { Cone } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

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

export default function Terrain({ width = 512, depth = 512, sunPosition }) {
  const meshRef = useRef(null);
  const planeRef = useRef(null);
  const textureRef = useRef(null);
  const helperRef = useRef(null);
  const { pointer, raycaster, camera } = useThree();

  useEffect(() => {
    const vertices = planeRef.current.attributes.position.array;
    const heightData = generateHeight(width, depth);
    for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
      vertices[j + 2] = heightData[i] * 0.3;
    }

    // textureRef.current.image = generateTexture(heightData, width, depth, sunPosition);
  }, [width, depth]);

  const handleClick = (ev) => {
    raycaster.setFromCamera(pointer, camera);
    // See if the ray from the camera into the world hits one of our meshes
    const intersects = raycaster.intersectObject(meshRef.current);

    // Toggle rotation bool for meshes that we clicked
    if (intersects.length > 0) {
      helperRef.current.position.set(0, 0, 0);
      helperRef.current.lookAt(intersects[0].face.normal);
      console.log(intersects[0].face.normal);
      // helperRef.current.position.copy(intersects[0].point);
      helperRef.current.position.addVectors(intersects[0].point, intersects[0].face.normal.clone().multiplyScalar(10));

      // camera.position.copy(intersects[0].point);
      // camera.position.y += 10;
      // camera.lookAt(100, 0, -150);
    }
  };

  return (
    <>
      <mesh rotation={[-0.5 * Math.PI, 0, 0]} onClick={handleClick} ref={meshRef}>
        {/* <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-normal" array={normals} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-uv" array={uvs} itemSize={2} />
        <bufferAttribute attach="index" array={indicies} itemSize={1} />
      </bufferGeometry> */}
        <planeGeometry args={[1000, 1000, width - 1, depth - 1]} ref={planeRef} />
        <meshNormalMaterial />
        {/* <meshPhysicalMaterial>
          <canvasTexture
            ref={textureRef}
            attach="map"
            wrapS={THREE.ClampToEdgeWrapping}
            wrapT={THREE.ClampToEdgeWrapping}
            colorSpace={THREE.SRGBColorSpace}
          />
        </meshPhysicalMaterial> */}
      </mesh>
      <mesh ref={helperRef}>
        <coneGeometry args={[5, 20, 3]} translate={[0, 50, 0]} rotateX={Math.PI / 2} />
        <meshNormalMaterial />
      </mesh>
    </>
  );
}
