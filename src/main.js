import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

const hairstyles = [
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

class HairstyleAI {
  constructor() {
    this.video = document.getElementById('webcam');
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.loading = document.getElementById('loading');
    this.status = document.getElementById('status');
    this.hairstylesContainer = document.getElementById('hairstyles');
    this.model = null;
    this.isRunning = false;
  }

  async init() {
    try {
      await this.setupCamera();
      await this.loadModel();
      this.startDetection();
    } catch (error) {
      console.error('Initialization error:', error);
      this.status.textContent = 'Error initializing the application. Please refresh and try again.';
    }
  }

  async setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: false
    });
    this.video.srcObject = stream;
    
    return new Promise((resolve) => {
      this.video.onloadedmetadata = () => {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        resolve();
      };
    });
  }

  async loadModel() {
    await tf.ready();
    this.model = await blazeface.load();
    this.loading.style.display = 'none';
    this.status.textContent = 'Face detection ready!';
  }

  async detectFace() {
    if (!this.model || !this.video.readyState) return;

    const predictions = await this.model.estimateFaces(this.video, false);
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (predictions.length > 0) {
      this.status.textContent = 'Face detected!';
      this.showHairstyleSuggestions();
      
      predictions.forEach(prediction => {
        const start = prediction.topLeft;
        const end = prediction.bottomRight;
        const size = [end[0] - start[0], end[1] - start[1]];

        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(start[0], start[1], size[0], size[1]);
      });
    } else {
      this.status.textContent = 'No face detected. Please position your face in the camera.';
      this.clearHairstyleSuggestions();
    }
  }

  showHairstyleSuggestions() {
    const randomHairstyles = [...hairstyles]
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    this.hairstylesContainer.innerHTML = randomHairstyles
      .map(style => `
        <div class="hairstyle-card">
          <img src="${style.image}" alt="${style.name}">
          <h3>${style.name}</h3>
          <p>${style.description}</p>
        </div>
      `)
      .join('');
  }

  clearHairstyleSuggestions() {
    this.hairstylesContainer.innerHTML = `
      <div class="placeholder">
        <div class="camera-icon">📷</div>
        <p>Position your face in the camera to get hairstyle suggestions</p>
      </div>
    `;
  }

  startDetection() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    const detect = async () => {
      await this.detectFace();
      if (this.isRunning) {
        requestAnimationFrame(detect);
      }
    };
    
    detect();
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const app = new HairstyleAI();
  app.init();
});