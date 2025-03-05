import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { Camera, RefreshCw } from 'lucide-react';

interface Hairstyle {
  name: string;
  image: string;
  description: string;
  faceShape: string;
}

const hairstyles: Hairstyle[] = [
  {
    name: "Classic Fade",
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
    description: "A timeless cut that works well with most face shapes",
    faceShape: "oval"
  },
  {
    name: "Textured Crop",
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80",
    description: "Perfect for adding volume and texture to your look",
    faceShape: "round"
  },
  {
    name: "Long Layered",
    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80",
    description: "Ideal for those wanting a longer, flowing style",
    faceShape: "square"
  }
];

function App() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [suggestedHairstyles, setSuggestedHairstyles] = useState<Hairstyle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      await tf.ready();
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load model:', error);
      setIsLoading(false);
    }
  };

  const detectFace = async () => {
    if (model && webcamRef.current && canvasRef.current) {
      const webcam = webcamRef.current.video!;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;

      // Match canvas size to video
      canvas.width = webcam.videoWidth;
      canvas.height = webcam.videoHeight;

      // Get predictions
      const predictions = await model.estimateFaces(webcam, false);

      if (predictions.length > 0) {
        setFaceDetected(true);
        // Randomly select hairstyles for demonstration
        const randomHairstyles = hairstyles
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
        setSuggestedHairstyles(randomHairstyles);

        // Draw face detection box
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        predictions.forEach((prediction: any) => {
          const start = prediction.topLeft;
          const end = prediction.bottomRight;
          const size = [end[0] - start[0], end[1] - start[1]];

          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(start[0], start[1], size[0], size[1]);
        });
      } else {
        setFaceDetected(false);
        setSuggestedHairstyles([]);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        detectFace();
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isLoading, model]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">HairstyleAI</h1>
          <p className="text-gray-600">Discover your perfect hairstyle using AI</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="relative">
              <Webcam
                ref={webcamRef}
                className="w-full rounded-lg"
                mirrored={true}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                {isLoading ? 'Loading face detection...' : 
                 faceDetected ? 'Face detected! Here are your suggestions.' : 
                 'No face detected. Please position your face in the camera.'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Suggested Hairstyles</h2>
            {suggestedHairstyles.length > 0 ? (
              <div className="space-y-6">
                {suggestedHairstyles.map((style, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <img
                      src={style.image}
                      alt={style.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-xl font-semibold">{style.name}</h3>
                    <p className="text-gray-600 mt-2">{style.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Camera className="w-12 h-12 mb-4" />
                <p>Position your face in the camera to get hairstyle suggestions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;