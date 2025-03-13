import React, { useState, useRef } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

function App() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const hairstyleSuggestions = [
    "Modern Textured Quiff",
    "Classic Fade with Side Part",
    "Messy Beach Waves",
    "Sleek Bob Cut",
    "Layered Shag",
    "Textured Pixie Cut",
    "Modern Mullet",
    "Curtain Bangs with Layers",
    "Blunt Cut Lob",
    "Tousled Medium Length"
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please make sure you've granted camera permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const photoData = canvas.toDataURL('image/jpeg');
      setPhoto(photoData);
      
      // Stop the camera stream
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setCameraActive(false);
      
      // Generate a random suggestion
      const randomSuggestion = hairstyleSuggestions[Math.floor(Math.random() * hairstyleSuggestions.length)];
      setSuggestion(randomSuggestion);
    }
  };

  const retake = () => {
    setPhoto(null);
    setSuggestion(null);
    startCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-center mb-6 text-purple-800">
            AI Hairstyle Advisor
          </h1>

          <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-4">
            {!cameraActive && !photo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={startCamera}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Start Camera
                </button>
              </div>
            )}
            {cameraActive && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}
            {photo && (
              <img
                src={photo}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="space-y-4">
            {cameraActive && (
              <button
                onClick={capturePhoto}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
              >
                <Camera className="w-5 h-5" />
                Capture Photo
              </button>
            )}

            {photo && suggestion && (
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-purple-800 mb-2">
                    Suggested Hairstyle:
                  </h2>
                  <p className="text-purple-900">{suggestion}</p>
                </div>
                <button
                  onClick={retake}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;