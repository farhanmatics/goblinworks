import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';

const Posenet: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [detector, setDetector] = useState<posedetection.PoseDetector | null>(null);
  const [dressImage, setDressImage] = useState<HTMLImageElement | null>(null);

  // Ensure TensorFlow.js backend is ready before running anything
  useEffect(() => {
    const initializeBackend = async () => {
      await tf.setBackend('webgl'); // Set the backend to WebGL
      await tf.ready(); // Ensure the backend is ready
    };

    initializeBackend();
  }, []);

  // Load the green dress image from the public folder
  useEffect(() => {
    const image = new Image();
    image.src = `${process.env.PUBLIC_URL}/mobi.png`;
    image.onload = () => {
      setDressImage(image);
    };
  }, []);

  // Set page title to "Posenet"
  useEffect(() => {
    document.title = 'Posenet';
  }, []);

  // Load MoveNet model
  useEffect(() => {
    const loadModel = async () => {
      await tf.ready(); // Ensure TensorFlow.js is ready

      const model = posedetection.SupportedModels.MoveNet;
      const detectorConfig = {
        modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      };
      const detector = await posedetection.createDetector(model, detectorConfig);
      setDetector(detector);
    };

    loadModel();
  }, []);

  // Start video stream
  useEffect(() => {
    const getVideo = () => {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error('Error accessing webcam:', err));
    };

    getVideo();
  }, []);

  // Perform pose detection
  useEffect(() => {
    if (detector) {
      const detectPose = async () => {
        const video = videoRef.current;
        if (!video) return;

        // Detect poses every 100ms
        const intervalId = setInterval(async () => {
          if (video.readyState === 4) {
            const poses = await detector.estimatePoses(video);

            // Clear the previous canvas
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (poses.length > 0) {
                  const keypoints = poses[0].keypoints;
                  drawKeypoints(keypoints, ctx);
                  if (dressImage) {
                    drawDress(keypoints, ctx, dressImage);
                  }
                }
              }
            }
          }
        }, 100);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
      };

      detectPose();
    }
  }, [detector, dressImage]);

  // Function to draw keypoints
  const drawKeypoints = (keypoints: posedetection.Keypoint[], ctx: CanvasRenderingContext2D) => {
    keypoints.forEach((keypoint) => {
      const { x, y, score } = keypoint;
      if (score && score > 0.5) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      }
    });
  };

  // Function to draw the green dress image
  // Function to draw the green dress image
const drawDress = (keypoints: posedetection.Keypoint[], ctx: CanvasRenderingContext2D, image: HTMLImageElement) => {
  // Get the necessary keypoints: left shoulder, right shoulder, left hip, right hip
  const leftShoulder = keypoints.find(point => point.name === 'left_shoulder');
  const rightShoulder = keypoints.find(point => point.name === 'right_shoulder');
  const leftHip = keypoints.find(point => point.name === 'left_hip');
  const rightHip = keypoints.find(point => point.name === 'right_hip');

  // Ensure all keypoints are detected
  if (leftShoulder && rightShoulder && leftHip && rightHip) {
    // Calculate neck position (midpoint between left and right shoulder)
    const neckX = (leftShoulder.x + rightShoulder.x) / 2;
    const neckY = (leftShoulder.y + rightShoulder.y) / 2;

    // Offset the dress to start below the neck (e.g., 10 pixels below)
    const offsetY = 0;

    // Get the dimensions of the dress area (between shoulders and hips)
    const minX = Math.min(leftShoulder.x, rightShoulder.x, leftHip.x, rightHip.x);
    const maxX = Math.max(leftShoulder.x, rightShoulder.x, leftHip.x, rightHip.x);
    const minY = Math.min(leftHip.y, rightHip.y);  // Start from hips for height calculation
    const dressWidth = maxX - minX;
    const dressHeight = minY - (neckY + offsetY); // Height from below the neck to hips

    // Draw the dress image below the neck
    ctx.drawImage(image, minX, neckY + offsetY, dressWidth, dressHeight);
  }
};


  return (
    <div style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          width: '640px',
          height: '480px',
        }}
        autoPlay
        playsInline
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          position: 'absolute',
          width: '640px',
          height: '480px',
        }}
      />
    </div>
  );
};

export default Posenet;
