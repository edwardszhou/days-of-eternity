import { Sparkles } from '@react-three/drei';

const Sphere = ({ size = 1, amount = 50, color = 'white', emissive, glow, ...props }) => (
  <mesh {...props}>
    <sphereGeometry args={[size, 64, 64]} />
    <meshPhysicalMaterial roughness={0} color={color} emissive={emissive || color} envMapIntensity={0.2} />
    <Sparkles count={amount} scale={size * 2} size={6} speed={0.4} />
    {/* <Shadow rotation={[-Math.PI / 2, 0, 0]} scale={size * 1.5} position={[0, -size, 0]} color="black" opacity={1} /> */}
  </mesh>
);

export default function TestSpheres() {
  return (
    <>
      <Sphere color="white" amount={50} emissive="green" glow="lightgreen" position={[1, 1, -1]} />
      <Sphere color="white" amount={30} emissive="purple" glow="#ff90f0" size={0.5} position={[-1.5, 0.5, -2]} />
      <Sphere color="lightpink" amount={20} emissive="orange" glow="#ff9f50" size={0.25} position={[-1, 0.25, 1]} />
    </>
  );
}
