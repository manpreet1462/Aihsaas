// app/dashboard/tasks/start/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';

// Demo task data
const brushingTeethTask = {
  id: 'brushing-teeth',
  title: 'Brushing Teeth',
  description: 'Step-by-step guide to brushing teeth',
  steps: [
    {
      id: 'step-1',
      instruction: 'Pick up your toothbrush',
      visualCue: '/toothbrush.png',
      cvModelPrompt: 'toothbrush in hand',
      successCriteria: 'Toothbrush is in hand',
      maxAttempts: 3,
    },
    {
      id: 'step-2',
      instruction: 'Wet the toothbrush under water',
      visualCue: '/toothbrush-water.png',
      cvModelPrompt: 'toothbrush under running water',
      successCriteria: 'Toothbrush is wet',
      maxAttempts: 3,
    },
    {
      id: 'step-3',
      instruction: 'Apply toothpaste to the brush',
      visualCue: '/toothpaste.png',
      cvModelPrompt: 'toothpaste on brush',
      successCriteria: 'Toothpaste is on brush',
      maxAttempts: 3,
    },
    {
      id: 'step-4',
      instruction: 'Brush your teeth (top) for 30 seconds',
      visualCue: '/brushing-top.png',
      cvModelPrompt: 'brushing top teeth',
      successCriteria: 'Top teeth brushed',
      maxAttempts: 6,
    },
    {
      id: 'step-5',
      instruction: 'Brush your teeth (bottom) for 30 seconds',
      visualCue: '/brushing-bottom.png',
      cvModelPrompt: 'brushing bottom teeth',
      successCriteria: 'Bottom teeth brushed',
      maxAttempts: 6,
    },
    {
      id: 'step-6',
      instruction: 'Rinse your mouth with water',
      visualCue: '/rinsing.png',
      cvModelPrompt: 'child rinsing mouth',
      successCriteria: 'Mouth rinsed',
      maxAttempts: 3,
    },
  ],
  difficulty: 'medium',
  category: 'hygiene',
};

declare global {
  interface Window {
    cv: any;
  }
}

export default function TaskExecution() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [opencvReady, setOpencvReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentStep = brushingTeethTask.steps[currentStepIndex];
  const isLastStep = currentStepIndex === brushingTeethTask.steps.length - 1;

  // Load OpenCV.js
  useEffect(() => {
    if (window.cv) {
      setOpencvReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.5.5/opencv.js';
    script.async = true;
    script.onload = () => {
      const checkReady = setInterval(() => {
        if (window.cv?.getBuildInformation) {
          clearInterval(checkReady);
          setOpencvReady(true);
          console.log('OpenCV loaded');
        }
      }, 100);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Real computer vision analysis
  const analyzeImage = (): boolean => {
    if (!canvasRef.current || !opencvReady) return false;

    try {
      const src = new window.cv.Mat();
      const dst = new window.cv.Mat();
      const gray = new window.cv.Mat();
      
      // Read image from canvas
      window.cv.imread(canvasRef.current, src);
      
      // Convert to grayscale
      window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY);
      
      // Edge detection (simple approach)
      window.cv.Canny(gray, dst, 50, 100, 3, false);
      
      // Count edges (toothbrush will create many edges)
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
  };

  const captureAndAnalyze = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Capture frame
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    const ctx = canvasRef.current.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);

    console.log(`Checking: ${currentStep.instruction}`);
    setCaptureCount(prev => prev + 1);

    const isComplete = opencvReady ? analyzeImage() : 
      captureCount >= Math.max(2, Math.floor(Math.random() * 4)); // Fallback
    
    if (isComplete) {
      setStepCompleted(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      setTimeout(() => {
        if (!isLastStep) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          console.log('Task completed!');
        }
      }, 2000);
    } else if (captureCount >= (currentStep.maxAttempts || 3)) {
      setStepCompleted(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimeout(() => {
        if (!isLastStep) {
          setCurrentStepIndex(prev => prev + 1);
        }
      }, 2000);
    }
  };

  // Camera and interval management (keep your existing implementations)
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    setStepCompleted(false);
    setCaptureCount(0);

    if (isCameraActive) {
      intervalRef.current = setInterval(captureAndAnalyze, 3000); // Check every 3 seconds
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentStepIndex, isCameraActive]);

  const handleManualComplete = () => {
    setStepCompleted(true);
    // if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeout(() => {
      if (!isLastStep) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        console.log('Task completed!');
      }
    }, 1000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{brushingTeethTask.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <h2 className="text-xl font-semibold mb-2">Current Step</h2>
            <div className="flex items-start mb-4">
              <div className="bg-blue-100 p-3 rounded-lg mr-3">
                <span className="text-2xl">{currentStepIndex + 1}</span>
              </div>
              <div>
                <p className="text-lg font-medium">{currentStep.instruction}</p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Success when:</strong> {currentStep.successCriteria}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                //   style={{ 
                //     width: `${Math.min(100, (captureCount / (currentStep.maxAttempts || 3)) * 100}%)}` 
                //   }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">
                Attempt {captureCount} of {currentStep.maxAttempts || 3}
              </span>
            </div>

            {stepCompleted && (
              <div className="bg-green-100 text-green-800 p-3 rounded mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Step completed! {!isLastStep && "Preparing next step..."}
              </div>
            )}

            <button
              onClick={handleManualComplete}
              className="mt-4 bg-blue-100 text-blue-800 px-4 py-2 rounded hover:bg-blue-200 transition"
            >
              Mark as Complete
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Task Progress</h3>
            <div className="space-y-2">
              {brushingTeethTask.steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`p-3 rounded flex items-start ${index === currentStepIndex ? 'bg-blue-50 border border-blue-200' : ''} 
                    ${index < currentStepIndex ? 'bg-green-50' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 
                    ${index < currentStepIndex ? 'bg-green-100 text-green-800' : ''}
                    ${index === currentStepIndex ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                    {index < currentStepIndex ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div>
                    <p className={`${index < currentStepIndex ? 'line-through text-gray-500' : ''}`}>
                      {step.instruction}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg overflow-hidden relative">
          {isCameraActive ? (
            <>
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                Camera active
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-white p-6 text-center">
              <div>
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p>Camera not available</p>
                <p className="text-sm text-gray-400 mt-1">Running in demo mode</p>
                <button 
                  onClick={startCamera}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLastStep && stepCompleted && (
        <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200 text-center">
          <h3 className="text-xl font-semibold text-green-800 mb-2">🎉 Task Completed! 🎉</h3>
          <p className="text-green-700">Great job! You've completed all steps of brushing your teeth.</p>
          <button 
            onClick={() => setCurrentStepIndex(0)}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Start Again
          </button>
        </div>
      )}
    </div>
  );
}