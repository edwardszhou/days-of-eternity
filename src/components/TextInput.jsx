import { Box, Html, MeshTransmissionMaterial } from '@react-three/drei';
import { gsap } from 'gsap';
import { memo, useEffect, useRef, useState } from 'react';
import { COLORS } from '../lib/constants';

export default memo(function TextInput({ origin, offset, setTextSelected }) {
  const [selected, setSelected] = useState(false);
  const groupRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    const { x, y, z } = offset;
    gsap.to(groupRef.current.position, {
      x,
      y,
      z,
      duration: 5,
      delay: 3,
      ease: 'power2.inOut'
    });
  }, [offset]);

  const emissive = selected ? COLORS.redOrange : '#666666';
  return (
    <>
      <mesh position={origin} ref={groupRef}>
        <Box
          position={[5, 0.5, -10]}
          scale={[10.25, 2.25, 0.61]}
          onClick={(ev) => {
            ev.stopPropagation();
            inputRef.current.focus();
            if (!selected) {
              setSelected(true);
              setTextSelected(true);
            }
          }}
          on
          onPointerMissed={(ev) => {
            if (selected) ev.stopPropagation();
            inputRef.current.blur();
            setSelected(false);
            setTimeout(() => {
              setTextSelected(false);
            }, 1000);
          }}
          visible={false}
        />
        <Html style={{ opacity: 0 }} prepend>
          <input ref={inputRef} onChange={(val) => console.log(val)} onBlur={() => console.log('blurred')}></input>
        </Html>

        <Box position={[5, -0.5, -10]} scale={[10, 0.25, 0.55]}>
          <meshPhysicalMaterial color={'white'} emissive={emissive} iridescence={0.8} />
        </Box>
        <Box position={[5, 1.5, -10]} scale={[10, 0.25, 0.55]}>
          <meshPhysicalMaterial color={'white'} emissive={emissive} iridescence={0.8} />
        </Box>
        <Box position={[0, 0.5, -10]} scale={[0.25, 2.25, 0.6]}>
          <meshPhysicalMaterial color={'white'} emissive={emissive} iridescence={0.8} />
        </Box>
        <Box position={[10, 0.5, -10]} scale={[0.25, 2.25, 0.6]}>
          <meshPhysicalMaterial color={'white'} emissive={emissive} iridescence={0.8} />
        </Box>

        <Box position={[0.5, 0.5, -10]} scale={[0.25, 1.5, 0.6]}>
          <MeshTransmissionMaterial roughness={0.4} anisotropicBlur={0.3} transmissionSampler thickness={4} />
        </Box>
      </mesh>
    </>
  );
});
