import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { Camera, RefreshCw } from 'lucide-react';

interface Hairstyle {
  name: string;
  imageUrl: string;
  description: string;
  faceShape: string;
  suitability: string;
  maintenance: string;
}

const hairstyles: Hairstyle[] = [
  {
    name: "Classic Fade",
    imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033",
    description: "A timeless cut that gradually fades from short on the sides to longer on top",
    faceShape: "oval",
    suitability: "Perfect for professional settings and casual occasions",
    maintenance: "Requires trimming every 2-3 weeks to maintain the fade"
  },
  {
    name: "Textured Crop",
    imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c",
    description: "Short, layered cut with natural texture and movement",
    faceShape: "round",
    suitability: "Great for adding height and reducing roundness",
    maintenance: "Low maintenance, style with matte product for best results"
  },
  {
    name: "Modern Quiff",
    imageUrl: "https://images.unsplash.com/photo-1520975954732-35dd22299614",
    description: "Longer on top with swept-back styling and shorter sides",
    faceShape: "square",
    suitability: "Ideal for highlighting strong jaw features",
    maintenance: "Requires regular styling and good quality hair products"
  },
  {
    name: "Slick Back Undercut",
    imageUrl: "https://images.unsplash.com/photo-1517163879738-f708d629fff0",
    description: "Short sides with longer top hair styled backward",
    faceShape: "oval",
    suitability: "Works well for both formal and casual settings",
    maintenance: "Daily styling required, trim every 4-6 weeks"
  },
  {
    name: "Textured Pompadour",
    imageUrl: "https://images.unsplash.com/photo-1523297467724-f6758d7124c5",
    description: "Volume on top with clean sides and natural texture",
    faceShape: "round",
    suitability: "Adds height and elongates the face",
    maintenance: "Medium maintenance, requires styling products"
  }
];

function App() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceShape, setFaceShape] = useState<string>("");
  const [cameraEnabled, setCameraEnabled] = useState(true);

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  const detectFace = async () => {
    if (!model || !webcamRef.current || !canvasRef.current) return;

    setIsDetecting(true);
    const webcam = webcamRef.current.video!;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Ensure canvas dimensions match webcam
    canvas.width = webcam.videoWidth;
    canvas.height = webcam.videoHeight;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const predictions = await model.estimateFaces(webcam, false);

      if (predictions.length > 0) {
        const face = predictions[0];
        const startPoint = face.topLeft as [number, number];
        const endPoint = face.bottomRight as [number, number];
        const width = endPoint[0] - startPoint[0];
        const height = endPoint[1] - startPoint[1];

        // Draw face rectangle
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(startPoint[0], startPoint[1], width, height);

        // Enhanced face shape detection
        const ratio = width / height;
        const faceWidth = width;
        
        if (ratio > 0.95) {
          setFaceShape("round");
        } else if (ratio < 0.85) {
          setFaceShape("oval");
        } else if (faceWidth > canvas.width * 0.4) {
          setFaceShape("square");
        } else {
          setFaceShape("oval");
        }
      } else {
        setFaceShape("");
      }
    } catch (error) {
      console.error("Face detection error:", error);
    }

    setIsDetecting(false);
  };

  const handleReset = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setFaceShape("");
    setCameraEnabled(false);
    // Re-enable camera after a brief delay
    setTimeout(() => setCameraEnabled(true), 100);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Hairstyle Recommender
          </h1>
          <p className="text-lg text-gray-600">
            Get personalized hairstyle suggestions based on your face shape using AI detection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="relative aspect-video">
              {cameraEnabled && (
                <Webcam
                  ref={webcamRef}
                  className="w-full h-full rounded-lg"
                  mirrored={true}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "user"
                  }}
                />
              )}
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={detectFace}
                disabled={isDetecting || !model}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                <Camera size={20} />
                {isDetecting ? "Detecting..." : "Detect Face"}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw size={20} />
                Reset
              </button>
            </div>
            {faceShape && (
              <div className="mt-4 text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-lg font-semibold">
                  Detected Face Shape: <span className="text-blue-600 capitalize">{faceShape}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Showing hairstyles that best complement your face shape
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Recommended Hairstyles</h2>
            <div className="space-y-6">
              {hairstyles
                .filter(style => !faceShape || style.faceShape === faceShape)
                .map((style, index) => (
                  <div key={index} className="flex gap-4 items-start border-b pb-6 last:border-0">
                    <img
                      src={style.imageUrl}
                      alt={style.name}
                      className="w-32 h-32 object-cover rounded-lg shadow-md"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{style.name}</h3>
                      <p className="text-gray-700 mt-1">{style.description}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Suitability:</span> {style.suitability}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Maintenance:</span> {style.maintenance}
                        </p>
                        <p className="text-sm text-blue-600 font-medium">
                          Best for: <span className="capitalize">{style.faceShape}</span> face shape
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;