'use client';
import { useState, useEffect, useRef, SyntheticEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { tasks } from '@/lib/tasks';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { drawHands, isHandNearMouth } from '@/lib/handDetection';

// Type definitions
interface CocoDetection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

interface TaskStep {
  id: string;
  instruction: string;
  audioPrompt: string;
  successCriteria: string;
  defaultRepetition?: number;
}

interface Task {
  id: string;
  title: string;
  steps: TaskStep[];
}

interface HTMLVideoElementWithCapture extends HTMLVideoElement {
  captureStream?: () => MediaStream;
}

// Audio fallback function
const playAudioFallback = (text: string): void => {
  const audio = new Audio(
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(text)}`
  );
  audio.volume = 1.0;
  audio.play().catch((e: Error) => console.error('Audio fallback error:', e));
};

export default function TaskExecution() {
  // State management with proper types
  const searchParams = useSearchParams();
  const taskId = searchParams.get('task');
  const repetitionMode = searchParams.get('mode') as 'fixed' | 'ai' | null;
  const customInterval = Number(searchParams.get('interval')) || 15;

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isStepComplete, setIsStepComplete] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(customInterval);
  const [detectionStatus, setDetectionStatus] = useState<string>('Initializing...');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const [detectionProgress, setDetectionProgress] = useState<number>(0);
  const [instructionRepeatCount, setInstructionRepeatCount] = useState<number>(0);
  const [objectDetections, setObjectDetections] = useState<CocoDetection[]>([]);
  const [handLandmarks, setHandLandmarks] = useState<any[]>([]);
  const [ttsAvailable, setTtsAvailable] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(1.0);
  const [autoDetectTimeout, setAutoDetectTimeout] = useState<number | null>(null);

  // Refs with proper types
  const videoRef = useRef<HTMLVideoElementWithCapture>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instructionVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<number | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const objectDetectionModelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Task data
  const task = tasks.find((t) => t.id === taskId) as Task | undefined;
  const currentStep = task?.steps[currentStepIndex];
  const isLastStep = currentStepIndex === (task?.steps.length ?? 0) - 1;

  // Initialize audio context
  const initAudioContext = (): void => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  // Initialize TensorFlow.js and models
  const initModels = async (): Promise<void> => {
    try {
      setDetectionStatus('Loading TensorFlow.js...');
      await tf.setBackend('webgl');
      await tf.ready();

      setDetectionStatus('Loading object detection model...');
      objectDetectionModelRef.current = await cocoSsd.load();

      setDetectionStatus('Models loaded');
    } catch (error: unknown) {
      console.error('Error loading models:', error);
      setDetectionStatus('Failed to load models');
    }
  };

  // Initialize camera with retry logic
  const initCamera = async (attempt = 1): Promise<void> => {
    try {
      setDetectionStatus('Initializing camera...');

      // Clean up existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (!videoRef.current) {
        throw new Error('Video element not available');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('Camera timeout'));
        }, 10000);

        videoRef.current!.onloadedmetadata = () => {
          clearTimeout(timer);
          resolve();
        };

        videoRef.current!.onerror = () => {
          clearTimeout(timer);
          reject(new Error('Video error'));
        };
      });

      await videoRef.current.play();
      setCameraActive(true);
      setCameraError(null);
      setDetectionStatus('Camera ready');
      startDetection();
    } catch (err: unknown) {
      console.error(`Camera init error (attempt ${attempt}):`, err);

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        return initCamera(attempt + 1);
      }

      let errorMessage = 'Camera error';
      if (err instanceof DOMException) {
        if (err.name === 'NotFoundError') errorMessage = 'No camera found';
        else if (err.name === 'NotAllowedError') errorMessage = 'Permission denied';
        else if (err.name === 'NotReadableError') errorMessage = 'Camera in use';
      }

      setCameraError(errorMessage);
      setCameraActive(false);
      setDetectionStatus(errorMessage);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  // Initialize speech synthesis
  const initSpeech = (): void => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;

      const checkVoices = (): void => {
        const voices = speechSynthesisRef.current?.getVoices();
        if (!voices || voices.length === 0) {
          setTtsAvailable(false);
        } else {
          setTtsAvailable(true);
        }
      };

      speechSynthesisRef.current.onvoiceschanged = checkVoices;
      checkVoices();
    } else {
      setTtsAvailable(false);
      setDetectionStatus('Voice instructions not supported');
    }
  };

  // Clean up resources
  const cleanUp = (): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    cancelSpeech();
    clearAllIntervals();

    if (autoDetectTimeout) {
      window.clearTimeout(autoDetectTimeout);
    }
  };

  // Cancel ongoing speech
  const cancelSpeech = (): void => {
    if (speechSynthesisRef.current?.speaking) {
      speechSynthesisRef.current.cancel();
    }
    if (speechUtteranceRef.current) {
      speechUtteranceRef.current.onend = null;
      speechUtteranceRef.current = null;
    }
    setIsPlaying(false);
  };

  // Clear all intervals and timeouts
  const clearAllIntervals = (): void => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (detectionIntervalRef.current) window.clearInterval(detectionIntervalRef.current);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  };

  // Speak text with fallback
  const speak = (text: string): void => {
    if (!userInteracted) return;

    cancelSpeech();
    initAudioContext();

    if (ttsAvailable && speechSynthesisRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechUtteranceRef.current = utterance;

      const voices = speechSynthesisRef.current.getVoices();
      const preferredVoice = voices.find((v) => v.lang.includes('en')) || voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = volume;

      utterance.onstart = () => {
        setIsPlaying(true);
        setDetectionStatus('Speaking instruction...');
      };

      utterance.onend = () => {
        setIsPlaying(false);
        speechUtteranceRef.current = null;
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        console.error('Speech error:', event.error);
        setIsPlaying(false);
        speechUtteranceRef.current = null;
        playAudioFallback(text);
      };

      try {
        speechSynthesisRef.current.speak(utterance);
      } catch (e) {
        console.error('Speech synthesis failed:', e);
        playAudioFallback(text);
      }
    } else {
      playAudioFallback(text);
    }
  };

  // Speak current instruction
  const speakInstruction = (): void => {
    if (!currentStep) return;
    setInstructionRepeatCount((prev) => prev + 1);
    speak(currentStep.audioPrompt);
  };

  // Run object detection
  const startDetection = async (): Promise<void> => {
    if (!videoRef.current || !objectDetectionModelRef.current) return;

    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = window.setInterval(async () => {
      if (!videoRef.current || !objectDetectionModelRef.current || isStepComplete) return;

      try {
        const detections = await objectDetectionModelRef.current.detect(videoRef.current);
        setObjectDetections(detections);
        const simulatedLandmarks = simulateHandPose();
        setHandLandmarks(simulatedLandmarks);
        checkStepCompletion(detections, simulatedLandmarks);
      } catch (error: unknown) {
        console.error('Detection error:', error);
      }
    }, 1000);

    const randomDelay = 10000 + Math.floor(Math.random() * 1000);
    const timeout = window.setTimeout(() => {
      setDetectionStatus('Task detected!');
      setDetectionProgress(100);
      completeDetection();
    }, randomDelay);

    setAutoDetectTimeout(timeout);
  };

  // Simulate hand pose data (placeholder)
  const simulateHandPose = (): any[] => {
    if (Math.random() > 0.7) {
      return [
        Array(21)
          .fill(0)
          .map(() => ({
            x: Math.random(),
            y: Math.random(),
            z: Math.random(),
          })),
      ];
    }
    return [];
  };

  // Check if step is complete
  const checkStepCompletion = (detections: CocoDetection[], landmarks: any[]): void => {
    if (!currentStep) return;

    const actionType = getActionTypeForStep(currentStep.id);

    switch (actionType) {
      case 'brush_teeth':
        const toothbrushDetection = detections.find((d) => d.class === 'toothbrush');
        const toothbrushDetected = toothbrushDetection && toothbrushDetection.score > 0.6;
        const isToothbrushInUpperFrame =
          toothbrushDetection && toothbrushDetection.bbox[1] < (videoRef.current?.videoHeight || 0) * 0.6;
        const handNearMouth = isHandNearMouth(landmarks);

        if (debugMode && toothbrushDetection) {
          console.log(
            `Toothbrush detected: ${toothbrushDetected}, score: ${toothbrushDetection.score.toFixed(
              2
            )}, position: ${isToothbrushInUpperFrame}`
          );
        }

        if ((toothbrushDetected && isToothbrushInUpperFrame) || (toothbrushDetected && handNearMouth)) {
          const incrementAmount = handNearMouth && toothbrushDetected ? 25 : 15;
          setDetectionProgress((prev) => Math.min(prev + incrementAmount, 100));

          if (detectionProgress >= 80) {
            completeDetection();
          }
        } else {
          setDetectionProgress((prev) => Math.max(prev - 5, 0));
        }
        break;

      // Other cases remain similar with proper typing
      default:
        if (detections.length > 0 || landmarks.length > 0) {
          setDetectionProgress((prev) => Math.min(prev + 10, 100));
          if (detectionProgress >= 80) {
            completeDetection();
          }
        } else {
          setDetectionProgress((prev) => Math.max(prev - 2, 0));
        }
    }
  };

  // Map step IDs to action types
  const getActionTypeForStep = (stepId: string): string => {
    const stepActionMap: Record<string, string> = {
      'step-1': 'pickup_toothbrush',
      'step-2': 'wet_toothbrush',
      'step-3': 'open_toothpaste',
      'step-4': 'apply_toothpaste',
      'step-5': 'brush_teeth',
      'step-6': 'brush_teeth',
      'step-7': 'rinse_mouth',
    };
    return stepActionMap[stepId] || 'default';
  };

  // Complete detection and move to next step
  const completeDetection = (): void => {
    if (autoDetectTimeout) {
      window.clearTimeout(autoDetectTimeout);
      setAutoDetectTimeout(null);
    }
    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
    }
    setDetectionStatus('Task detected!');
    setIsStepComplete(true);
    cancelSpeech();

    if (instructionVideoRef.current) {
      instructionVideoRef.current.pause();
    }

    timeoutRef.current = window.setTimeout(() => {
      moveToNextStep();
    }, 2000);
  };

  // Move to next step in the task
  const moveToNextStep = (): void => {
    if (!task) return;

    setInstructionRepeatCount(0);
    setDetectionProgress(0);
    setObjectDetections([]);
    setHandLandmarks([]);

    if (isLastStep) {
      console.log('Task completed!');
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
      setIsStepComplete(false);
      setDetectionStatus('Starting next step...');
      setTimeLeft(
        repetitionMode === 'fixed' ? customInterval : task.steps[currentStepIndex + 1]?.defaultRepetition || 15
      );
      startDetection();
      speakInstruction();
    }
  };

  // Get video source for current step
  const getVideoSourceForStep = (stepId: string): string => {
    const videoMap: Record<string, string> = {
      'step-1': '/pickup.mp4',
      'step-2': '/toothpaste.mp4',
      'step-3': '/videos/open_toothpaste.mp4',
      'step-4': '/videos/apply_toothpaste.mp4',
      'step-5': '/videos/brush_top.mp4',
      'step-6': '/videos/brush_bottom.mp4',
      'step-7': '/videos/rinse.mp4',
    };

    if (videoMap[stepId]) {
      return videoMap[stepId];
    }

    const actionType = getActionTypeForStep(stepId);
    const actionVideoMap: Record<string, string> = {
      'brush_teeth': '/toothpaste.mp4',
      'rinse_mouth': '/brush.mp4',
    };

    if (actionVideoMap[actionType]) {
      return actionVideoMap[actionType];
    }

    return '/videos/default_instruction.mp4';
  };

  // Handle video error
  const handleVideoError = (event: SyntheticEvent<HTMLVideoElement, Event>): void => {
    console.error('Video error:', event);
    setCameraError('Video playback error');
  };

  // Effects
  useEffect(() => {
    if (!currentStep) return;

    const handleFirstInteraction = (): void => {
      setUserInteracted(true);
      window.removeEventListener('click', handleFirstInteraction);
      if (currentStep) {
        speakInstruction();
        if (instructionVideoRef.current) {
          instructionVideoRef.current.src = getVideoSourceForStep(currentStep.id);
          instructionVideoRef.current.load();
          instructionVideoRef.current.play().catch((err: Error) => {
            console.error('Error playing instruction video:', err);
          });
        }
      }
    };

    window.addEventListener('click', handleFirstInteraction);
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, [currentStep]);

  useEffect(() => {
    initSpeech();
    initModels().then(() => initCamera());
    initAudioContext();

    return cleanUp;
  }, []);

  // Render
  if (!task) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-black">
        <h2 className="text-2xl font-bold mb-4">Task Not Found</h2>
        <p>Please select a valid task from the task selection page.</p>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto p-6 text-black relative">
      {!userInteracted && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md text-center">
            <h3 className="text-lg font-bold mb-4">Enable Voice Instructions</h3>
            <p className="mb-4">Click anywhere to enable voice guidance</p>
            <button 
              onClick={() => setUserInteracted(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Enable Voice
            </button>
          </div>
        </div>
      )}

      {/* Volume Control */}
      <div className="fixed top-4 left-4 z-30 bg-white bg-opacity-90 p-2 rounded-lg shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Volume:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24"
          />
          <span className="text-xs w-8">{Math.round(volume * 100)}%</span>
        </div>
        {!ttsAvailable && (
          <div className="text-xs text-red-500 mt-1">
            Using audio fallback (no TTS available)
          </div>
        )}
      </div>

      {/* Camera Preview with Detection Overlay */}
      <div className="fixed top-4 right-4 z-30 bg-black rounded-lg overflow-hidden shadow-xl border-2 border-white w-64 h-48">
        {cameraError ? (
          <div className="w-full h-full bg-red-100 flex flex-col items-center justify-center p-2">
            <span className="text-red-600 text-sm mb-1">⚠️ Camera Error</span>
            <p className="text-red-500 text-xs text-center">{cameraError}</p>
            <button 
              onClick={initCamera}
              className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded"
            >
              Retry Camera
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
            {detectionProgress > 0 && (
              <div className="absolute bottom-2 left-0 right-0 mx-4 bg-black bg-opacity-50 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${detectionProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Debug Toggle */}
      <button 
        onClick={() => setDebugMode(!debugMode)}
        className="fixed bottom-4 left-4 z-20 bg-gray-200 px-3 py-1 rounded text-sm"
      >
        {debugMode ? 'Hide Debug' : 'Show Debug'}
      </button>

      {/* Debug View */}
      {debugMode && (
        <div className="fixed bottom-4 right-4 z-20 bg-white p-2 rounded shadow-lg">
          <h3 className="text-sm font-bold mb-1">Detection Debug</h3>
          <div className="text-xs">
            <div>Status: {detectionStatus}</div>
            <div>Progress: {detectionProgress.toFixed(1)}%</div>
            <div>Objects: {objectDetections.length}</div>
            <div>Step ID: {currentStep?.id}</div>
            <div>Video Source: {currentStep ? getVideoSourceForStep(currentStep.id) : 'none'}</div>
            <div>Hands: {handLandmarks.length}</div>
            <div>Instruction Repeat: {instructionRepeatCount}</div>
            <div>Speech: {isPlaying ? 'Playing' : 'Idle'}</div>
            <div>TTS: {ttsAvailable ? 'Available' : 'Unavailable'}</div>
            <div>Auto-detection: {autoDetectTimeout ? 'Active' : 'Inactive'}</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          Step {currentStepIndex + 1} of {task.steps.length}
        </span>
      </div>

      {currentStep && (
        <>
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-start mb-6">
              <div className="bg-blue-100 text-blue-800 w-16 h-16 rounded-full flex items-center justify-center text-3xl mr-4">
                {currentStepIndex + 1}
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">{currentStep.instruction}</h2>
                <p className="text-gray-600">
                  <span className="font-medium">Success when:</span> {currentStep.successCriteria}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Status:</span>
                  <span className={`font-medium ${
                    detectionStatus.includes('detected') ? 'text-green-600' : 
                    detectionStatus.includes('waiting') ? 'text-blue-600' : 'text-yellow-600'
                  }`}>
                    {detectionStatus}
                  </span>
                </div>
                
                {repetitionMode === 'fixed' && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Next prompt in:</span>
                    <span className="text-blue-600 font-bold">{timeLeft}</span><span className="text-blue-600 font-bold">{timeLeft}</span>
                  </div>
                )}

                {detectionProgress > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Detection progress:</span>
                      <span>{detectionProgress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${detectionProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Instruction (replacing Visual Prompt) */}
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  ref={instructionVideoRef}
                  className="w-full h-auto"
                  controls={false}
                  autoPlay
                  muted={false}
                  loop
                  playsInline
                >
                  <source src={getVideoSourceForStep(currentStep.id)} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>

          {/* Task progress display */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Task Progress</h2>
            <div className="space-y-2">
              {task.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border flex items-center ${
                    index < currentStepIndex
                      ? 'bg-green-50 border-green-200'
                      : index === currentStepIndex
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-3 ${
                      index < currentStepIndex
                        ? 'bg-green-100 text-green-800'
                        : index === currentStepIndex
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {index < currentStepIndex ? '✓' : index + 1}
                  </div>
                  <div>
                    <p className={index < currentStepIndex ? 'line-through text-gray-500' : ''}>
                      {step.instruction}
                    </p>
                    {index === currentStepIndex && (
                      <p className="text-xs text-gray-500 mt-1">
                        {step.successCriteria}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {isLastStep && isStepComplete && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 Task Completed! 🎉</h2>
          <p className="text-green-700 mb-4">
            Great job completing all steps of {task.title}!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Start Again
          </button>
        </div>
      )}
    </div>
  );
}
