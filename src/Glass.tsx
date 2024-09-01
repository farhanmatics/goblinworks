import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { createDetector, SupportedModels } from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function Glasses({ position, scale }: { position: [number, number, number], scale: [number, number, number] }) {
  const gltf = useLoader(GLTFLoader, '/glass.glb');
  const { camera } = useThree();

  useEffect(() => {
    if (gltf) {
      console.log("Glasses model loaded", gltf);
      gltf.scene.scale.set(scale[0], scale[1], scale[2]);
      gltf.scene.position.set(position[0], position[1], position[2]);
    }
  }, [gltf, position, scale]);

  useFrame(() => {
    if (gltf) {
      gltf.scene.lookAt(camera.position);
    }
  });

  return gltf ? <primitive object={gltf.scene} /> : null;
}

function Glass() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [glassesPosition, setGlassesPosition] = useState<[number, number, number]>([0, 0, -5]);
  const [glassesScale, setGlassesScale] = useState<[number, number, number]>([1, 1, 1]);
  const detectorRef = useRef<any>(null);
  const glassesRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };
        }
      } catch (err) {
        console.error("Error accessing the camera: ", err);
      }
    };

    startVideo();
  }, []);

  useEffect(() => {
    const runPoseDetection = async () => {
      try {
        await tf.ready();
        console.log("TensorFlow.js is ready");
        detectorRef.current = await createDetector(SupportedModels.MoveNet);
        console.log("Pose detector created");

        const loader = new GLTFLoader();
        loader.load(
          '/glass.glb',
          (gltf) => {
            console.log("Glasses model loaded successfully", gltf);
            glassesRef.current = gltf.scene;
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const size = box.getSize(new THREE.Vector3());
            glassesRef.current.userData.aspectRatio = size.x / size.y;
            console.log("Glasses aspect ratio:", glassesRef.current.userData.aspectRatio);
          },
          (progress) => {
            console.log("Loading progress:", (progress.loaded / progress.total) * 100, "%");
          },
          (error) => {
            console.error("Error loading glasses model:", error);
          }
        );

        const detect = async () => {
          if (videoRef.current && detectorRef.current && glassesRef.current) {
            try {
              const poses = await detectorRef.current.estimatePoses(videoRef.current);
              console.log("Detected poses:", poses);
              if (poses.length > 0) {
                const leftEye = poses[0].keypoints[1];
                const rightEye = poses[0].keypoints[2];
                const nose = poses[0].keypoints[0];

                if (leftEye.score > 0.5 && rightEye.score > 0.5 && nose.score > 0.5) {
                  const fixedWidth = 200; // Fixed width in pixels
                  const glassesWidth = fixedWidth / videoRef.current.videoWidth;
                  const glassesHeight = glassesWidth / glassesRef.current.userData.aspectRatio;

                  const centerX = (leftEye.x + rightEye.x) / 2;
                  const centerY = nose.y;

                  // Convert 2D coordinates to 3D space
                  const x = (centerX / videoRef.current.videoWidth) * 2 - 1;
                  const y = -(centerY / videoRef.current.videoHeight) * 2 + 1;

                  setGlassesPosition([x, y, -1]); // Moved closer to the camera
                  setGlassesScale([glassesWidth, glassesHeight, glassesWidth]);
                  console.log("Glasses position:", [x, y, -1]);
                  console.log("Glasses scale:", [glassesWidth, glassesHeight, glassesWidth]);
                }
              }
            } catch (error) {
              console.error("Error in pose estimation:", error);
            }
          }
          requestAnimationFrame(detect);
        };

        detect();
      } catch (error) {
        console.error("Error in runPoseDetection:", error);
      }
    };

    runPoseDetection();
  }, []);

  return (
    <div className="App" style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Glasses position={glassesPosition} scale={glassesScale} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default Glass;