import { Environment, Sky, Stars } from '@react-three/drei';
import React from 'react';

export default function Skybox({ sunPosition }) {
  return (
    <>
      <hemisphereLight intensity={0.8} color="#FFD09B" groundColor="#432945" />
      <ambientLight intensity={0.1} />
      <directionalLight color="#FB6D48" intensity={0.8} position={[sunPosition.x / 20, sunPosition.y, sunPosition.z / 20]} />
      <directionalLight color="#6C0345" intensity={0.4} position={[sunPosition.x / -20, sunPosition.y, sunPosition.z / -20]} />

      <Environment files="spruit_sunrise_4k.hdr" environmentIntensity={0.3} environmentRotation={[0, (5 * Math.PI) / 12, 0]} />
      {/* <Environment
        background="only"
        files={[
          'skybox/exosystem2_lf.jpg',
          'skybox/exosystem2_rt.jpg',
          'skybox/exosystem2_up.jpg',
          'skybox/exosystem2_dn.jpg',
          'skybox/exosystem2_ft.jpg',
          'skybox/exosystem2_bk.jpg'
        ]}
      /> */}
      <Sky rayleigh={5.5} turbidity={9} sunPosition={[sunPosition.x, sunPosition.y, sunPosition.z]} distance={450000} />
      <Stars count={5000} depth={800} factor={20} fade speed={2} />
    </>
  );
}
