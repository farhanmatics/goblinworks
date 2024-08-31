import React, { useRef, useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import { PoseDetector, createDetector, SupportedModels } from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<PoseDetector | null>(null);
  const [sunglassesImage, setSunglassesImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log("Video stream started");
        }
      } catch (err) {
        console.error("Error accessing the camera: ", err);
      }
    };

    startVideo();
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = '/glasspic.png'; // Adjust the path as needed
    img.onload = () => setSunglassesImage(img);
  }, []);

  useEffect(() => {
    const runPoseDetection = async () => {
      try {
        console.log("Starting pose detection setup");
        await tf.ready();
        console.log("TensorFlow.js is ready");

        detectorRef.current = await createDetector(SupportedModels.MoveNet);
        console.log("Detector created");

        if (!canvasRef.current || !videoRef.current) {
          console.error("Canvas or video ref is null");
          return;
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) {
          console.error("Unable to get 2D context");
          return;
        }

        // Set canvas size to match video
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        const detect = async () => {
          if (videoRef.current && detectorRef.current && canvasRef.current && ctx && sunglassesImage) {
            try {
              const poses = await detectorRef.current.estimatePoses(videoRef.current);
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

              poses.forEach(pose => {
                const leftEye = pose.keypoints[1];
                const rightEye = pose.keypoints[2];

                if (leftEye.score && rightEye.score && leftEye.score > 0.5 && rightEye.score > 0.5) {
                  const eyeDistance = Math.sqrt(
                    Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
                  );
                  const sunglassesWidth = eyeDistance + 100;
                  const sunglassesHeight = ((sunglassesWidth / sunglassesImage.width) * sunglassesImage.height) - 10;

                  const centerX = (leftEye.x + rightEye.x) / 2;
                  const centerY = (leftEye.y + rightEye.y) / 2;

                  ctx.drawImage(
                    sunglassesImage,
                    centerX - sunglassesWidth / 2,
                    centerY - sunglassesHeight / 2,
                    sunglassesWidth,
                    sunglassesHeight
                  );

                  console.log("Sunglasses drawn");
                }
              });
            } catch (error) {
              console.error("Error in pose estimation:", error);
            }
          } else {
            console.log("Video, detector, canvas, context, or sunglasses image not ready");
          }
          requestAnimationFrame(detect);
        };

        detect();
      } catch (error) {
        console.error("Error in runPoseDetection:", error);
      }
    };

    runPoseDetection();
  }, [sunglassesImage]);

  return (
    <div className="App">
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <video ref={videoRef} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}

export default App;
