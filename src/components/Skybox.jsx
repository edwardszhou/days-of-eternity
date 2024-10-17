import { Environment, Sky, Stars } from '@react-three/drei';
import React from 'react';
import { COLORS } from '../lib/constants';

export default function Skybox({ sunPosition }) {
  return (
    <>
      <hemisphereLight intensity={0.5} color={COLORS.lightOrange} groundColor={COLORS.purple} />
      <ambientLight intensity={0.05} />
      <directionalLight color={COLORS.redOrange} intensity={1} position={[sunPosition.x, sunPosition.y + 20, sunPosition.z]} />
      <directionalLight color={COLORS.magenta} intensity={3} position={[-sunPosition.x, sunPosition.y + 20, -sunPosition.z]} />

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
