'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';

interface Exercise {
    name: string;
    description: string;
    targetKeypoints: { name: string; x: number; y: number }[];
    duration: number;
    connections: [string, string][];
}

const exercises: Exercise[] = [
    {
        name: 'Arm Stretch',
        description: 'Stretch both arms out to the sides at shoulder height',
        targetKeypoints: [
            { name: 'left_shoulder', x: 0.3, y: 0.3 },
            { name: 'right_shoulder', x: 0.7, y: 0.3 },
            { name: 'left_elbow', x: 0.1, y: 0.3 },
            { name: 'right_elbow', x: 0.9, y: 0.3 },
            { name: 'left_wrist', x: 0.0, y: 0.3 },
            { name: 'right_wrist', x: 1.0, y: 0.3 },
            { name: 'left_hip', x: 0.3, y: 0.6 },
            { name: 'right_hip', x: 0.7, y: 0.6 },
        ],
        connections: [
            ['left_shoulder', 'left_elbow'],
            ['left_elbow', 'left_wrist'],
            ['right_shoulder', 'right_elbow'],
            ['right_elbow', 'right_wrist'],
            ['left_shoulder', 'right_shoulder'],
            ['left_hip', 'right_hip'],
            ['left_shoulder', 'left_hip'],
            ['right_shoulder', 'right_hip'],
        ],
        duration: 15,
    },
    {
        name: 'Neck Stretch',
        description: 'Tilt your head gently to each side',
        targetKeypoints: [
            { name: 'nose', x: 0.5, y: 0.2 },
            { name: 'left_ear', x: 0.4, y: 0.2 },
            { name: 'right_ear', x: 0.6, y: 0.2 },
            { name: 'left_shoulder', x: 0.3, y: 0.3 },
            { name: 'right_shoulder', x: 0.7, y: 0.3 },
        ],
        connections: [
            ['left_ear', 'left_shoulder'],
            ['right_ear', 'right_shoulder'],
            ['left_shoulder', 'right_shoulder'],
            ['nose', 'left_ear'],
            ['nose', 'right_ear'],
        ],
        duration: 10,
    },
];

// New color scheme
const colors = {
    primary: '#D6BC8B', // Warm golden taupe - more vibrant than original
    primaryDark: '#B8976C', // Darker golden taupe
    primaryLight: '#E8D4AF', // Light warm beige
    secondary: '#94785A', // Medium warm taupe
    accent: '#FFCF8B', // Soft peachy/apricot accent
    highlight: '#FFB347', // Mango/orange highlight for important elements
    text: '#5D4B36', // Dark taupe for text
    textLight: '#7A6A5F', // Lighter text color
    background: '#FBF7F1', // Very light cream background
    white: '#FFFFFF',
    offWhite: '#FAF9F7',
    softBlue: '#B7D1E2', // Soft blue for variety
    softGreen: '#C5D8B9' // Soft green for variety
};

const Page = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const referenceCanvasRef = useRef<HTMLCanvasElement>(null);

    const [currentExercise, setCurrentExercise] = useState(0);
    const [feedback, setFeedback] = useState('Loading model...');
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isModelReady, setIsModelReady] = useState(false);
    const [cameraError, setCameraError] = useState(false);
    const [exerciseComplete, setExerciseComplete] = useState(false);
    const [poseMatched, setPoseMatched] = useState(false);
    const [debugMode, setDebugMode] = useState(false);
    const [currentSimilarity, setCurrentSimilarity] = useState(0);
    const [detectionQuality, setDetectionQuality] = useState('Poor');

    const detectorRef = useRef<posedetection.PoseDetector | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // ADJUSTED: Significantly lower the threshold for pose matching
    const POSE_MATCH_THRESHOLD = 50; // Changed from 65 to 50 for much more lenient matching


    useEffect(() => {
        let stream: MediaStream;

        const initializeCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user'
                    },
                    audio: false,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setCameraError(true);
                setFeedback('Could not access camera. Please enable permissions.');
            }
        };

        const loadDetector = async () => {
            try {
                await tf.setBackend('webgl');
                await tf.ready();

                // IMPROVED: Even better configuration for the model
                const detector = await posedetection.createDetector(
                    posedetection.SupportedModels.MoveNet,
                    {
                        modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                        enableSmoothing: true,
                        minPoseScore: 0.1 // Significantly lowered from 0.2 to detect even more poses
                    }
                );

                detectorRef.current = detector;
                setIsModelReady(true);
                setFeedback('Model loaded! Get into position.');
            } catch (error) {
                console.error('Error loading model:', error);
                setFeedback('Failed to load model. Please refresh the page.');
            }
        };

        const detectPose = async () => {
            if (!videoRef.current || !canvasRef.current || !detectorRef.current) return;

            try {
                // IMPROVED: Added more configuration options for detection
                const poses = await detectorRef.current.estimatePoses(videoRef.current, {
                    flipHorizontal: false,
                    maxPoses: 1,
                    scoreThreshold: 0.1 // Lower threshold to detect more keypoints
                });

                const ctx = canvasRef.current.getContext('2d');
                if (!ctx) return;

                // Clear canvas
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                // Draw video frame first
                ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

                if (poses.length > 0 && !exerciseComplete) {
                    const pose = poses[0];

                    // Calculate how many keypoints were detected with reasonable confidence
                    const detectedPoints = pose.keypoints.filter(kp => kp.score && kp.score > 0.15).length;
                    const totalPoints = pose.keypoints.length;
                    const detectionRate = detectedPoints / totalPoints;

                    // Update detection quality feedback
                    if (detectionRate > 0.8) {
                        setDetectionQuality('Excellent');
                    } else if (detectionRate > 0.6) {
                        setDetectionQuality('Good');
                    } else if (detectionRate > 0.4) {
                        setDetectionQuality('Fair');
                    } else {
                        setDetectionQuality('Poor');
                    }

                    // Draw the pose with more visible styling
                    drawStickman(ctx, pose.keypoints, exercises[currentExercise].connections);

                    // Compare pose and update feedback
                    const similarity = comparePose(pose);
                    setCurrentSimilarity(similarity);

                    const isMatched = similarity > POSE_MATCH_THRESHOLD;
                    setPoseMatched(isMatched);

                    if (isMatched) {
                        setFeedback(`Pose Matched! ${countdown}s remaining`);
                    } else if (detectionRate < 0.4) {
                        setFeedback(`Move closer to camera or improve lighting! ${countdown}s remaining`);
                    } else {
                        setFeedback(`Getting closer! Keep adjusting! ${countdown}s remaining`);
                    }
                } else if (!exerciseComplete) {
                    setFeedback('No pose detected. Make sure you are visible in the camera.');
                    setDetectionQuality('Poor');
                }
            } catch (err) {
                console.error('Pose detection error:', err);
            }

            animationFrameIdRef.current = requestAnimationFrame(detectPose);
        };


        const start = async () => {
            await initializeCamera();
            await loadDetector();
            drawReferencePose();
            startExerciseTimer(exercises[currentExercise].duration);
            detectPose();
        };

        start();

        return () => {
            animationFrameIdRef.current && cancelAnimationFrame(animationFrameIdRef.current);
            stream?.getTracks().forEach(track => track.stop());
            detectorRef.current?.dispose();
            clearInterval(timerRef.current ?? undefined);
        };
    }, [currentExercise]);

    const startExerciseTimer = (duration: number) => {
        let remaining = duration;
        setCountdown(remaining);

        clearInterval(timerRef.current ?? undefined);
        timerRef.current = setInterval(() => {
            remaining -= 1;
            setCountdown(remaining);
            if (remaining <= 0) {
                clearInterval(timerRef.current ?? undefined);
                setExerciseComplete(true);
                setFeedback('✅ Exercise completed!');
            }
        }, 1000);
    };

    const nextExercise = () => {
        setExerciseComplete(false);
        setPoseMatched(false);
        setCurrentSimilarity(0);
        setCountdown(null);
        setCurrentExercise((prev) => (prev + 1) % exercises.length);
    };

    const drawStickman = (
        ctx: CanvasRenderingContext2D,
        keypoints: posedetection.Keypoint[],
        connections: [string, string][]
    ) => {
        // Draw connections first (thicker lines)
        connections.forEach(([a, b]) => {
            const p1 = keypoints.find(p => p.name === a);
            const p2 = keypoints.find(p => p.name === b);

            // IMPROVED: Lower confidence threshold for drawing
            if (p1 && p2 && p1.score && p2.score && p1.score > 0.1 && p2.score > 0.1) { // Further lowered threshold
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = poseMatched ? 'rgba(255, 179, 71, 0.8)' : 'rgba(255, 207, 139, 0.8)'; // Use new colors
                ctx.lineWidth = 4;
                ctx.stroke();
            }
        });

        // Then draw keypoints (larger circles)
        keypoints.forEach(kp => {
            // IMPROVED: Lower confidence threshold for drawing
            if (kp.score && kp.score > 0.1) { // Further lowered threshold
                // Draw a white outline first for better visibility
                ctx.beginPath();
                ctx.arc(kp.x, kp.y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = colors.white;
                ctx.fill();

                // Then draw the colored circle - color indicates confidence
                const confidence = kp.score || 0;
                ctx.beginPath();
                ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = `${colors.primary}`;
                ctx.fill();

                // Add keypoint name if in debug mode
                if (debugMode) {
                    ctx.fillStyle = colors.white;
                    ctx.font = '12px Arial';
                    ctx.fillText(`${kp.name || ''} (${(kp.score || 0).toFixed(2)})`, kp.x + 10, kp.y);
                }
            }
        });
    };

    // Draw a figure instead of dots on reference canvas
    const drawReferencePose = () => {
        const canvas = referenceCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the figure based on current exercise
        if (currentExercise === 0) {
            drawArmStretchFigure(ctx, canvas.width, canvas.height);
        } else if (currentExercise === 1) {
            drawNeckStretchFigure(ctx, canvas.width, canvas.height);
        }

        // If debug mode is on, also draw keypoints and connections
        if (debugMode) {
            const { targetKeypoints, connections } = exercises[currentExercise];
            const denormalize = (x: number, y: number) => ({ x: x * canvas.width, y: y * canvas.height });

            // Draw connections
            connections.forEach(([a, b]) => {
                const pointA = targetKeypoints.find(p => p.name === a);
                const pointB = targetKeypoints.find(p => p.name === b);
                if (pointA && pointB) {
                    const aPos = denormalize(pointA.x, pointA.y);
                    const bPos = denormalize(pointB.x, pointB.y);
                    ctx.beginPath();
                    ctx.moveTo(aPos.x, aPos.y);
                    ctx.lineTo(bPos.x, bPos.y);
                    ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });

            // Draw keypoints
            targetKeypoints.forEach(p => {
                const pos = denormalize(p.x, p.y);
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(0, 200, 255, 0.8)';
                ctx.fill();
                ctx.fillStyle = 'black';
                ctx.font = '10px Arial';
                ctx.fillText(p.name, pos.x + 6, pos.y);
            });
        }
    };

    // Drawing an arm stretch figure
    const drawArmStretchFigure = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = Math.min(width, height) / 4;

        // Draw body
        ctx.fillStyle = colors.primary;
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 2;

        // Head
        ctx.beginPath();
        ctx.arc(centerX, centerY - 1.5 * scale, scale * 0.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Face
        // Eyes
        ctx.fillStyle = colors.white;
        ctx.beginPath();
        ctx.arc(centerX - scale * 0.15, centerY - 1.6 * scale, scale * 0.08, 0, 2 * Math.PI);
        ctx.arc(centerX + scale * 0.15, centerY - 1.6 * scale, scale * 0.08, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = colors.text;
        ctx.beginPath();
        ctx.arc(centerX - scale * 0.15, centerY - 1.6 * scale, scale * 0.04, 0, 2 * Math.PI);
        ctx.arc(centerX + scale * 0.15, centerY - 1.6 * scale, scale * 0.04, 0, 2 * Math.PI);
        ctx.fill();

        // Smile
        ctx.beginPath();
        ctx.arc(centerX, centerY - 1.5 * scale, scale * 0.25, 0.2, Math.PI - 0.2);
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Torso
        ctx.fillStyle = colors.primaryLight;
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - scale * 0.5, centerY - scale);
        ctx.lineTo(centerX + scale * 0.5, centerY - scale);
        ctx.lineTo(centerX + scale * 0.6, centerY + scale);
        ctx.lineTo(centerX - scale * 0.6, centerY + scale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Arms stretched out (key for this exercise)
        ctx.lineWidth = 4;
        ctx.strokeStyle = colors.secondary;

        // Left arm
        ctx.beginPath();
        ctx.moveTo(centerX - scale * 0.5, centerY - scale * 0.9);
        ctx.lineTo(centerX - scale * 1.8, centerY - scale * 0.9);
        ctx.stroke();

        // Right arm
        ctx.beginPath();
        ctx.moveTo(centerX + scale * 0.5, centerY - scale * 0.9);
        ctx.lineTo(centerX + scale * 1.8, centerY - scale * 0.9);
        ctx.stroke();

        // Hands
        ctx.fillStyle = colors.primaryLight;
        ctx.beginPath();
        ctx.arc(centerX - scale * 1.8, centerY - scale * 0.9, scale * 0.15, 0, 2 * Math.PI);
        ctx.arc(centerX + scale * 1.8, centerY - scale * 0.9, scale * 0.15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Legs
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX - scale * 0.3, centerY + scale);
        ctx.lineTo(centerX - scale * 0.4, centerY + scale * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX + scale * 0.3, centerY + scale);
        ctx.lineTo(centerX + scale * 0.4, centerY + scale * 2);
        ctx.stroke();

        // Feet
        ctx.fillStyle = colors.secondary;
        ctx.beginPath();
        ctx.ellipse(centerX - scale * 0.4, centerY + scale * 2.1, scale * 0.25, scale * 0.1, 0, 0, 2 * Math.PI);
        ctx.ellipse(centerX + scale * 0.4, centerY + scale * 2.1, scale * 0.25, scale * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();
    };

    // Drawing a neck stretch figure
    const drawNeckStretchFigure = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = Math.min(width, height) / 4;

        // Draw body
        ctx.fillStyle = colors.primary;
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 2;

        // Head tilted to show neck stretch
        ctx.save();
        ctx.translate(centerX, centerY - 1.5 * scale);
        ctx.rotate(Math.PI * 0.1); // Tilt the head slightly

        // Head
        ctx.beginPath();
        ctx.arc(0, 0, scale * 0.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Face
        // Eyes
        ctx.fillStyle = colors.white;
        ctx.beginPath();
        ctx.arc(-scale * 0.15, -scale * 0.1, scale * 0.08, 0, 2 * Math.PI);
        ctx.arc(scale * 0.15, -scale * 0.1, scale * 0.08, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = colors.text;
        ctx.beginPath();
        ctx.arc(-scale * 0.15, -scale * 0.1, scale * 0.04, 0, 2 * Math.PI);
        ctx.arc(scale * 0.15, -scale * 0.1, scale * 0.04, 0, 2 * Math.PI);
        ctx.fill();

        // Smile - relaxed for neck stretch
        ctx.beginPath();
        ctx.arc(0, 0, scale * 0.25, 0.2, Math.PI - 0.2);
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        // Neck (emphasized for this exercise)
        ctx.lineWidth = 3;
        ctx.strokeStyle = colors.accent;
        ctx.beginPath();
        ctx.moveTo(centerX - scale * 0.1, centerY - scale * 1.1);
        ctx.lineTo(centerX - scale * 0.05, centerY - scale);
        ctx.stroke();

        // Arrow showing direction of stretch
        ctx.lineWidth = 2;
        ctx.strokeStyle = colors.highlight;
        ctx.beginPath();
        ctx.moveTo(centerX + scale * 0.6, centerY - scale * 1.5);
        ctx.lineTo(centerX + scale * 0.3, centerY - scale * 1.3);
        ctx.lineTo(centerX + scale * 0.5, centerY - scale * 1.4);
        ctx.lineTo(centerX + scale * 0.4, centerY - scale * 1.6);
        ctx.stroke();

        // Torso
        ctx.fillStyle = colors.primaryLight;
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - scale * 0.5, centerY - scale);
        ctx.lineTo(centerX + scale * 0.5, centerY - scale);
        ctx.lineTo(centerX + scale * 0.6, centerY + scale);
        ctx.lineTo(centerX - scale * 0.6, centerY + scale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Arms at sides
        ctx.lineWidth = 4;
        ctx.strokeStyle = colors.secondary;

        // Left arm
        ctx.beginPath();
        ctx.moveTo(centerX - scale * 0.5, centerY - scale * 0.9);
        ctx.lineTo(centerX - scale * 0.7, centerY);
        ctx.stroke();

        // Right arm
        ctx.beginPath();
        ctx.moveTo(centerX + scale * 0.5, centerY - scale * 0.9);
        ctx.lineTo(centerX + scale * 0.7, centerY);
        ctx.stroke();

        // Hands
        ctx.fillStyle = colors.primaryLight;
        ctx.beginPath();
        ctx.arc(centerX - scale * 0.7, centerY, scale * 0.15, 0, 2 * Math.PI);
        ctx.arc(centerX + scale * 0.7, centerY, scale * 0.15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Legs
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX - scale * 0.3, centerY + scale);
        ctx.lineTo(centerX - scale * 0.4, centerY + scale * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX + scale * 0.3, centerY + scale);
        ctx.lineTo(centerX + scale * 0.4, centerY + scale * 2);
        ctx.stroke();

        // Feet
        ctx.fillStyle = colors.secondary;
        ctx.beginPath();
        ctx.ellipse(centerX - scale * 0.4, centerY + scale * 2.1, scale * 0.25, scale * 0.1, 0, 0, 2 * Math.PI);
        ctx.ellipse(centerX + scale * 0.4, centerY + scale * 2.1, scale * 0.25, scale * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();
    };

    const comparePose = (userPose: posedetection.Pose) => {
        const { targetKeypoints } = exercises[currentExercise];
        let totalScore = 0;
        let matchedPoints = 0;
        let missedPoints = 0;

        if (!videoRef.current || !canvasRef.current) return 0;

        // Normalize user points to 0-1 range with even lower confidence threshold
        const normalizedUserPoints = userPose.keypoints
            .filter(p => p.score && p.score > 0.1) // Further lowered threshold
            .map(p => ({
                name: p.name,
                x: p.x / canvasRef.current!.width,
                y: p.y / canvasRef.current!.height,
                confidence: p.score || 0
            }));

        // Calculate body scale with fallback options
        const userLeftShoulder = normalizedUserPoints.find(p => p.name === 'left_shoulder');
        const userRightShoulder = normalizedUserPoints.find(p => p.name === 'right_shoulder');
        const userLeftHip = normalizedUserPoints.find(p => p.name === 'left_hip');
        const userRightHip = normalizedUserPoints.find(p => p.name === 'right_hip');
        const targetLeftShoulder = targetKeypoints.find(p => p.name === 'left_shoulder');
        const targetRightShoulder = targetKeypoints.find(p => p.name === 'right_shoulder');
        const targetLeftHip = targetKeypoints.find(p => p.name === 'left_hip');
        const targetRightHip = targetKeypoints.find(p => p.name === 'right_hip');

        let scaleX = 1.0;
        let scaleY = 1.0;

        // Try multiple approaches to estimate body scale
        // 1. Try shoulder width first
        if (userLeftShoulder && userRightShoulder && targetLeftShoulder && targetRightShoulder) {
            const userShoulderWidth = Math.abs(userRightShoulder.x - userLeftShoulder.x);
            const targetShoulderWidth = Math.abs(targetRightShoulder.x - targetLeftShoulder.x);
            if (targetShoulderWidth > 0) {
                scaleX = userShoulderWidth / targetShoulderWidth;
            }
        }
        // 2. Try hip width if shoulders not available
        else if (userLeftHip && userRightHip && targetLeftHip && targetRightHip) {
            const userHipWidth = Math.abs(userRightHip.x - userLeftHip.x);
            const targetHipWidth = Math.abs(targetRightHip.x - targetLeftHip.x);
            if (targetHipWidth > 0) {
                scaleX = userHipWidth / targetHipWidth;
            }
        }

        // Calculate vertical scale with fallbacks
        // 1. Try torso height first
        if (userLeftShoulder && userLeftHip && targetLeftShoulder && targetLeftHip) {
            const userTorsoHeight = Math.abs(userLeftHip.y - userLeftShoulder.y);
            const targetTorsoHeight = Math.abs(targetLeftHip.y - targetLeftShoulder.y);
            if (targetTorsoHeight > 0) {
                scaleY = userTorsoHeight / targetTorsoHeight;
            }
        }
        // 2. Use right side if left not available
        else if (userRightShoulder && userRightHip && targetRightShoulder && targetRightHip) {
            const userTorsoHeight = Math.abs(userRightHip.y - userRightShoulder.y);
            const targetTorsoHeight = Math.abs(targetRightHip.y - targetRightShoulder.y);
            if (targetTorsoHeight > 0) {
                scaleY = userTorsoHeight / targetTorsoHeight;
            }
        }

        // Constrain scales to reasonable ranges to avoid extreme values
        scaleX = Math.max(0.5, Math.min(2.0, scaleX));
        scaleY = Math.max(0.5, Math.min(2.0, scaleY));

        // IMPROVED: Much more forgiving thresholds for different body parts
        const thresholds: { [key: string]: number } = {
            wrist: 0.4,      // Much more tolerance for wrists
            elbow: 0.35,     // Much more tolerance for elbows
            shoulder: 0.25,  // More tolerance for shoulders
            hip: 0.25,       // More tolerance for hips
            knee: 0.35,      // Much more tolerance for knees
            ankle: 0.4,      // Much more tolerance for ankles
            ear: 0.2,        // More tolerance for ears
            eye: 0.15,       // More tolerance for eyes
            nose: 0.15,      // More tolerance for nose
            default: 0.25    // More forgiving default threshold
        };

        // Get threshold based on keypoint name
        const getThresholdForKeypoint = (name: string): number => {
            for (const [key, value] of Object.entries(thresholds)) {
                if (name.includes(key)) return value;
            }
            return thresholds.default;
        };

        // Calculate center points for normalization with fallback options
        const getUserCenter = () => {
            // Try shoulders first
            if (userLeftShoulder && userRightShoulder) {
                return {
                    x: (userLeftShoulder.x + userRightShoulder.x) / 2,
                    y: userLeftShoulder.y
                };
            }
            // Try hips if shoulders not available
            else if (userLeftHip && userRightHip) {
                return {
                    x: (userLeftHip.x + userRightHip.x) / 2,
                    y: (userLeftHip.y - 0.25) // Estimate shoulder height
                };
            }
            // Default fallback
            return { x: 0.5, y: 0.3 };
        };


        const getTargetCenter = () => {
            if (targetLeftShoulder && targetRightShoulder) {
                return {
                    x: (targetLeftShoulder.x + targetRightShoulder.x) / 2,
                    y: targetLeftShoulder.y
                };
            }
            else if (targetLeftHip && targetRightHip) {
                return {
                    x: (targetLeftHip.x + targetRightHip.x) / 2,
                    y: (targetLeftHip.y - 0.25) // Estimate shoulder height
                };
            }
            return { x: 0.5, y: 0.3 };
        };

        const userCenter = getUserCenter();
        const targetCenter = getTargetCenter();

        // Compare each keypoint with improved scaling and centering
        for (const targetPoint of targetKeypoints) {
            const userPoint = normalizedUserPoints.find(p => p.name === targetPoint.name);

            if (userPoint) {
                // Calculate centered and scaled distances
                const normalizedUserX = userCenter.x + ((userPoint.x - userCenter.x) / scaleX);
                const normalizedUserY = userCenter.y + ((userPoint.y - userCenter.y) / scaleY);

                const dx = normalizedUserX - targetPoint.x;
                const dy = normalizedUserY - targetPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Get threshold for this specific body part
                const threshold = getThresholdForKeypoint(targetPoint.name);

                // Calculate point score (1 = perfect, 0 = too far)
                // IMPROVED: Smoother falloff for score calculation
                const pointScore = Math.max(0, 1 - (distance / threshold));

                // IMPROVED: Weight certain keypoints more based on exercise and confidence
                let weight = 1.0;

                // Factor in confidence in the weighting
                weight *= (0.5 + 0.5 * userPoint.confidence); // Confidence affects weight but doesn't zero it out

                // Arms are more important for arm exercises
                if (currentExercise === 0 && (targetPoint.name.includes('elbow') || targetPoint.name.includes('wrist'))) {
                    weight *= 1.8; // Increased weight
                }
                // Head position more important for neck exercises
                if (currentExercise === 1 && (targetPoint.name.includes('ear') || targetPoint.name.includes('nose'))) {
                    weight *= 1.8; // Increased weight
                }

                totalScore += pointScore * weight;
                matchedPoints += weight;
            } else {
                // We're missing this point in the user's pose
                // IMPROVED: Less penalty for non-critical points
                const isCritical = (currentExercise === 0 &&
                    (targetPoint.name.includes('wrist') || targetPoint.name.includes('elbow'))) ||
                    (currentExercise === 1 &&
                        (targetPoint.name.includes('ear') || targetPoint.name.includes('nose')));

                missedPoints += isCritical ? 1.0 : 0.5;
            }
        }

        // IMPROVED: Much more forgiving scoring with minimal penalty for missing points
        const missingPointPenalty = Math.min(15, missedPoints * 3); // Lower cap on penalty (15 instead of 20)
        const baseScore = matchedPoints > 0 ? (totalScore / matchedPoints) * 100 : 0;

        // Apply bonus for having more detected points
        const detectionBonus = normalizedUserPoints.length > 10 ? 5 : 0;

        // Adjust final score with bonus
        const adjustedScore = Math.max(0, baseScore - missingPointPenalty + detectionBonus);

        return Math.min(100, adjustedScore);
    };

    useEffect(() => {
        const updateCanvasSize = () => {
            if (videoRef.current && canvasRef.current) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
            }
        };

        videoRef.current?.addEventListener('loadedmetadata', updateCanvasSize);
        return () => {
            videoRef.current?.removeEventListener('loadedmetadata', updateCanvasSize);
        };
    }, []);
    const resetModel = async () => {
        if (detectorRef.current) {
            await detectorRef.current.dispose();
            detectorRef.current = null;

            setFeedback('Resetting detector...');

            try {
                const detector = await posedetection.createDetector(
                    posedetection.SupportedModels.MoveNet,
                    {
                        modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                        enableSmoothing: true,
                        minPoseScore: 0.1
                    }
                );

                detectorRef.current = detector;
                setFeedback('Detector reset complete. Try again!');
            } catch (error) {
                console.error('Error resetting model:', error);
                setFeedback('Failed to reset model. Please refresh the page.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 md:p-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-amber-800 text-center">
                Muscle Relaxation For Cerebral Palsy
            </h1>

            <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2 text-black">{exercises[currentExercise].name}</h2>
                    <p className="text-gray-600 mb-4">{exercises[currentExercise].description}</p>
                    <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <canvas
                            ref={referenceCanvasRef}
                            className="absolute top-0 left-0 w-full h-full"
                            width={400}
                            height={400}
                        />
                    </div>
                    <div className="mt-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={debugMode}
                                onChange={() => setDebugMode(!debugMode)}
                                className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Debug Mode</span>
                        </label>
                        {debugMode && (
                            <div className="text-sm text-gray-500 mt-2 space-y-1">
                                <p>Similarity: {currentSimilarity.toFixed(1)}% (Threshold: {POSE_MATCH_THRESHOLD}%)</p>
                                <p>Detection Quality: {detectionQuality}</p>
                                <button
                                    onClick={resetModel}
                                    className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs py-1 px-2 rounded"
                                >
                                    Reset Detector
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-2/3 flex flex-col gap-4">
                    <div className="relative aspect-video rounded-xl border border-gray-300 overflow-hidden bg-black">
                        {!isModelReady && !cameraError && (
                            <div className="absolute inset-0 flex items-center justify-center text-white">
                                Initializing camera and model...
                            </div>
                        )}
                        {cameraError && (
                            <div className="absolute inset-0 flex items-center justify-center text-red-500 bg-black p-4">
                                Camera access denied. Please enable permissions.
                            </div>
                        )}
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            autoPlay
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 w-full h-full z-10"
                        />
                        {isModelReady && !exerciseComplete && (
                            <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs text-white bg-black bg-opacity-50">
                                Detection:
                                <span className={
                                    detectionQuality === 'Excellent' ? 'text-green-400 ml-1' :
                                        detectionQuality === 'Good' ? 'text-blue-400 ml-1' :
                                            detectionQuality === 'Fair' ? 'text-yellow-400 ml-1' :
                                                'text-red-400 ml-1'
                                }>
                                    {detectionQuality}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        {countdown !== null && (
                            <p className="text-center text-gray-600 mb-2">
                                Time remaining: {countdown}s
                            </p>
                        )}

                        {exerciseComplete && (
                            <button
                                onClick={nextExercise}
                                className="mt-4 w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-4 rounded"
                            >
                                Next Exercise
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;