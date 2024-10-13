import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import "./styles.css";

export default function App() {
  return (
    <Canvas>
      <mesh>
        <boxGeometry args={[4, 2, 4]} />
        <meshPhongMaterial />
      </mesh>
      <ambientLight intensity={0.1} />
      <directionalLight color="red" position={[0, 0, 5]} />
      <Environment background={true} files="spruit_sunrise_4k.hdr" />
    </Canvas>
  );
}
