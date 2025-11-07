import * as React from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as THREE from "three";

function StlMesh({ src }: { src: string }) {
  const geometry = useLoader(STLLoader, src) as THREE.BufferGeometry;

  // Normalize: center, scale, and ensure normals for proper shading
  React.useMemo(() => {
    geometry.computeVertexNormals?.();
    geometry.center();
    const box = new THREE.Box3().setFromBufferAttribute(
      geometry.getAttribute("position") as THREE.BufferAttribute
    );
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = 1 / maxDim; // fit into unit cube
    geometry.scale(s, s, s);
  }, [geometry]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color="#9aa7b2" metalness={0.2} roughness={0.4} />
    </mesh>
  );
}

export default function StlViewer({ src }: { src: string }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [1.8, 1.4, 1.8], fov: 45 }}
      style={{ width: "100%", height: "100%", display: "block", background: "transparent" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 2]} intensity={1.0} castShadow />
      <group position={[0, -0.2, 0]}>
        <StlMesh src={src} />
      </group>
      <Environment preset="studio" />
      <OrbitControls enableDamping />
    </Canvas>
  );
}
