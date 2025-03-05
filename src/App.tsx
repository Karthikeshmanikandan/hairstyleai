import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Camera, RefreshCw } from 'lucide-react';
import { hairstyles } from './hairstyles';
import type { HairstyleRecommendation, FaceShape } from './types';

function App() {
  const webcamRef = useRef<Webcam>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [faceShape, setFaceShape] = useState<FaceShape | null>(null);
  const [recommendations, setRecommendations] = useState<HairstyleRecommendation[]>([]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        ]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    loadModels();
  }, []);

  const detectFaceShape = async (imageElement: HTMLImageElement) => {
    try {
      const detections = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (detections) {
        // This is a simplified face shape detection logic
        // In a real app, you'd want more sophisticated measurements
        const landmarks = detections.landmarks;
        const jawline = landmarks.getJawOutline();
        
        // Simple example - you'd want more complex logic in production
        const faceWidth = jawline[16].x - jawline[0].x;
        const faceHeight = detections.detection.box.height;
        const ratio = faceHeight / faceWidth;

        let shape: FaceShape['type'];
        if (ratio > 1.75) shape = 'long';
        else if (ratio > 1.5) shape = 'oval';
        else if (ratio > 1.25) shape = 'heart';
        else if (ratio > 1) shape = 'square';
        else shape = 'round';

        setFaceShape({ type: shape, confidence: 0.8 });
        
        // Filter hairstyles suitable for the detected face shape
        const suitable = hairstyles.filter(style => 
          style.suitableFor.includes(shape)
        );
        setRecommendations(suitable);
      }
    } catch (error) {
      console.error('Error detecting face:', error);
    }
  };

  const captureImage = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setIsCaptured(true);

        // Create an image element to use with face-api
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => detectFaceShape(img);
      }
    }
  };

  const resetCapture = () => {
    setIsCaptured(false);
    setCapturedImage('');
    setFaceShape(null);
    setRecommendations([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold">Loading AI models...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">AI Hairstyle Recommender</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-center mb-6">
            {!isCaptured ? (
              <div className="relative">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="rounded-lg"
                />
                <button
                  onClick={captureImage}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Camera size={20} />
                  Capture
                </button>
              </div>
            ) : (
              <div className="relative">
                <img src={capturedImage} alt="Captured" className="rounded-lg" />
                <button
                  onClick={resetCapture}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw size={20} />
                  Retake
                </button>
              </div>
            )}
          </div>

          {faceShape && (
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">Detected Face Shape</h2>
              <p className="text-lg capitalize">{faceShape.type}</p>
            </div>
          )}
        </div>

        {recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Recommended Hairstyles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((style) => (
                <div key={style.id} className="rounded-lg overflow-hidden shadow-md">
                  <img
                    src={style.imageUrl}
                    alt={style.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{style.name}</h3>
                    <p className="text-gray-600">{style.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;