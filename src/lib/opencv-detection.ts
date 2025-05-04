// lib/opencv-detection.ts
declare global {
    interface Window {
      cv: any;
    }
  }
  
  export async function loadOpenCV(): Promise<void> {
    return new Promise((resolve) => {
      if (window.cv) return resolve();
  
      const script = document.createElement('script');
      script.src = 'https://docs.opencv.org/4.5.5/opencv.js';
      script.async = true;
      script.onload = () => {
        // Wait for OpenCV to be ready
        const checkReady = setInterval(() => {
          if (window.cv?.getBuildInformation) {
            clearInterval(checkReady);
            resolve();
          }
        }, 100);
      };
      document.body.appendChild(script);
    });
  }
  
  export function detectToothbrush(canvas: HTMLCanvasElement): boolean {
    const src = new window.cv.Mat();
    const dst = new window.cv.Mat();
    const gray = new window.cv.Mat();
    
    try {
      // 1. Read image from canvas
      window.cv.imread(canvas, src);
      
      // 2. Convert to grayscale
      window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY);
      
      // 3. Edge detection (simple approach)
      window.cv.Canny(gray, dst, 50, 100, 3, false);
      
      // 4. Count edges (toothbrush will create many edges)
      const edgeCount = window.cv.countNonZero(dst);
      const threshold = 1000; // Adjust based on testing
      
      // Clean up
      src.delete();
      gray.delete();
      dst.delete();
      
      return edgeCount > threshold;
    } catch (error) {
      console.error('OpenCV error:', error);
      return false;
    }
  }