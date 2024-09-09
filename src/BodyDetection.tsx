import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const BodyPixVideoWithDress: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<bodyPix.BodyPix | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const loadedModel = await bodyPix.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  useEffect(() => {
    if (model && videoRef.current && canvasRef.current && threeCanvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const threeCanvas = threeCanvasRef.current;

      // Set up Three.js scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, video.videoWidth / video.videoHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true });
      renderer.setSize(video.videoWidth, video.videoHeight);

      // Load the dress model
      const loader = new GLTFLoader();
      loader.load('/blue.glb', (gltf) => {
        const dress = gltf.scene;
        scene.add(dress);
        
        // Position the dress to cover the body
        dress.position.set(0, -1, 0); // Adjust these values as needed
        dress.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
      });

      // Add lights to the scene
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(0, 1, 0);
      scene.add(directionalLight);

      camera.position.z = 5;

      const captureFrame = async () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          // BodyPix segmentation
          const segmentation = await model.segmentPersonParts(video);
          const coloredPartImage = bodyPix.toColoredPartMask(segmentation);
          bodyPix.drawMask(canvas, video, coloredPartImage, 0.7, 0, false);

          // Render Three.js scene
          renderer.render(scene, camera);
        }
        requestAnimationFrame(captureFrame);
      };

      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
          captureFrame();
        })
        .catch((err) => {
          console.error("Error accessing the camera", err);
        });
    }
  }, [model]);

  return (
    <div style={{ position: 'relative', width: '640px', height: '480px' }}>
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        width="640"
        height="480"
      />
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      <canvas
        ref={threeCanvasRef}
        width="640"
        height="480"
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
};

export default BodyPixVideoWithDress;