import { useThree } from "@react-three/fiber";
import { Box, Environment } from "@react-three/drei";
import React from "react";

export default function Skybox() {
  return <Environment background={true} files="spruit_sunrise_4k.hdr" />;
}
