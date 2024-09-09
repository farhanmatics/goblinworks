import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

function Glasses() {
  const gltf = useLoader(GLTFLoader, '/glass.glb');
  const modelRef = useRef<THREE.Group>();
  const { viewport } = useThree();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (gltf) {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3());
      const targetWidth = 30 / viewport.width; // Convert 30px (half of 60px) to Three.js units
      const newScale = targetWidth / size.x;
      setScale(newScale);

      // Center the model
      gltf.scene.position.set(0, 0, 0);

      // Rotate the model to face forward (you may need to adjust these values)
      gltf.scene.rotation.set(0, Math.PI, 0);
    }
  }, [gltf, viewport]);

  return <primitive object={gltf.scene} ref={modelRef} scale={[scale, scale, scale]} />;
}

function LoadPage() {
  return (
    <div>
      <h1>This is a Loading Page</h1>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '600px',
        height: '600px',
        border: '2px solid black',
        boxSizing: 'border-box'
      }}>
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 1]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Glasses />
          <OrbitControls enablePan={false} enableZoom={false} />
        </Canvas>
      </div>
    </div>
  );
}

export default LoadPage;