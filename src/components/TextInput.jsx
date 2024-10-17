import { Box, GradientTexture, Html, MeshTransmissionMaterial, Text3D } from '@react-three/drei';
import { gsap } from 'gsap';
import { memo, useEffect, useRef, useState } from 'react';
import { COLORS } from '../lib/constants';
import { RigidBody } from '@react-three/rapier';

const translate = { x: 5, y: 0.5, z: -40 };
const scale = 1.5;

export default memo(function TextInput({ origin, offset, setTextSelected }) {
  const [selected, setSelected] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [fallen, setFallen] = useState([]);

  const selectedRef = useRef(false);
  const charactersRef = useRef([]);

  const groupRef = useRef();
  const cursorRef = useRef();

  useEffect(() => {
    const { x, y, z } = offset;
    gsap.to(groupRef.current.position, {
      x,
      y,
      z,
      duration: 5,
      delay: 2,
      ease: 'power2.inOut'
    });
  }, [offset]);

  useEffect(() => {
    gsap.fromTo(
      cursorRef.current.scale,
      { x: 0.25, y: 1.5, z: 0.6 },
      { x: 0, y: 0, z: 0, duration: 0.5, ease: 'expo.inOut', yoyo: true, yoyoEase: 'expo.inOut', repeat: -1 }
    );

    const handleTyping = (ev) => {
      if (!selectedRef.current) return;
      switch (ev.key) {
        case 'Enter':
          const newFallen = charactersRef.current.map((char, i) => ({
            sourcePos: [
              i * scale * 0.6 + translate.x - scale * 4.5 + groupRef.current.position.x,
              translate.y - 0.3 * scale + groupRef.current.position.y,
              translate.z + groupRef.current.position.z
            ],
            char
          }));
          setFallen((state) => [...state, ...newFallen]);
        case 'Escape':
          setCharacters([]);
          charactersRef.current = [];
          setSelected(false);
          selectedRef.current = false;
          setTextSelected(false);
          break;
        case 'Backspace':
          setCharacters((state) => state.slice(0, -1));
          charactersRef.current.pop();
          break;
        default:
          if (ev.key.length !== 1 || charactersRef.current.length >= 14) break;
          setCharacters((state) => [...state, ev.key]);
          charactersRef.current.push(ev.key);
      }
    };
    window.addEventListener('keydown', handleTyping);
    return () => window.removeEventListener('keydown', handleTyping);
  }, []);

  const emissive = selected ? COLORS.redOrange : '#666666';
  return (
    <>
      <mesh
        position={origin}
        ref={groupRef}
        onClick={(ev) => {
          ev.stopPropagation();
          if (!selected) {
            setSelected(true);
            setTextSelected(true);
            selectedRef.current = true;
          }
        }}
        onPointerMissed={(ev) => {
          if (selected) ev.stopPropagation();
          setSelected(false);
          selectedRef.current = false;
          setTextSelected(false);
        }}
      >
        <Box position={[translate.x, translate.y, translate.z]} scale={[10.25 * scale, 2.25 * scale, 0.61 * scale]} visible={false} />

        <Text3D
          font="courier.json"
          position={[translate.x - 5 * scale, translate.y + (scale * 3) / 2, translate.z]}
          size={scale / 2}
          bevelEnabled
          bevelSize={scale / 20}
          bevelSegments={2}
          bevelThickness={scale / 10}
        >
          <meshPhysicalMaterial color={'white'} emissive={emissive} iridescence={0.8} />
          Enter Message:
        </Text3D>
        <Box position={[translate.x, translate.y - scale, translate.z]} scale={[10 * scale, 0.25 * scale, 0.55 * scale]}>
          <meshPhysicalMaterial color={'white'} emissive={emissive} iridescence={0.8} />
        </Box>
        <Box position={[translate.x, translate.y + scale, translate.z]} scale={[10 * scale, 0.25 * scale, 0.55 * scale]}>
          <meshPhysicalMaterial color={'white'} emissive={emissive} iridescence={0.8} />
        </Box>
        <Box position={[translate.x - 5 * scale, translate.y, translate.z]} scale={[0.25 * scale, 2.25 * scale, 0.6 * scale]}>
          <meshPhysicalMaterial color={'white'} emissive={emissive} iridescence={0.8} />
        </Box>
        <Box position={[translate.x + 5 * scale, translate.y, translate.z]} scale={[0.25 * scale, 2.25 * scale, 0.6 * scale]}>
          <meshPhysicalMaterial color={'white'} emissive={emissive} iridescence={0.8} />
        </Box>

        {characters.map((char, i) => (
          <Text3D
            font="courier.json"
            position={[i * scale * 0.6 + translate.x - scale * 4.5, translate.y - 0.3 * scale, translate.z]}
            size={0.7 * scale}
            bevelEnabled
            bevelSize={scale / 20}
            bevelSegments={2}
            bevelThickness={scale / 20}
            key={i}
          >
            <meshPhysicalMaterial color={'white'} emissive={'#AAAAAA'} iridescence={0.8} />
            {char}
          </Text3D>
        ))}
        <Box
          position={[characters.length * scale * 0.6 + translate.x - scale * 4.2, translate.y, translate.z]}
          scale={[0.25 * scale, 1.5 * scale, 0.6 * scale]}
          visible={selected}
          ref={cursorRef}
        >
          <MeshTransmissionMaterial roughness={0.4} anisotropicBlur={0.3} transmissionSampler thickness={4} />
        </Box>
      </mesh>

      {fallen.map(({ sourcePos, char }, i) => (
        <RigidBody colliders="cuboid" key={i} position={sourcePos}>
          <Text3D font="courier.json" size={0.7 * scale} bevelEnabled bevelSize={scale / 20} bevelSegments={2} bevelThickness={scale / 10}>
            <meshPhysicalMaterial iridescence={0.8}>
              <GradientTexture stops={[0, 1]} colors={[COLORS.lightOrange, COLORS.redOrange]} />
            </meshPhysicalMaterial>
            {char}
          </Text3D>
        </RigidBody>
      ))}
    </>
  );
});
