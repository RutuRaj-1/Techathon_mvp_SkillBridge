import React, { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

interface VisualProctorProps {
    onLogout?: () => void;
}

const LOOK_AWAY_TIME = 5000;
const NO_FACE_TIME = 5000;
const TAMPER_TIME = 5000;
const WARNING_LIMIT = 2; // Allowing up to 2 warnings before submission/logout
const MIN_LUMINANCE = 20;

const VisualProctor: React.FC<VisualProctorProps> = ({ onLogout }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
    const [warnings, setWarnings] = useState(0);
    const [message, setMessage] = useState("Initializing robust AI proctoring...");
    const [isRunning, setIsRunning] = useState(false);

    const faceLandmarker = useRef<FaceLandmarker | null>(null);
    const noFaceStart = useRef<number | null>(null);
    const lookAwayStart = useRef<number | null>(null);
    const tamperStart = useRef<number | null>(null);

    // 1. Initialize MediaPipe
    useEffect(() => {
        let isMounted = true;
        const setupMediaPipe = async () => {
            try {
                const filesetResolver = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );

                if (!isMounted) return;

                faceLandmarker.current = await FaceLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                        delegate: "GPU" // or "CPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });

                if (!isMounted) {
                    faceLandmarker.current?.close();
                    return;
                }

                await startCamera();
                setIsRunning(true);
                setMessage("AI Proctoring Live");
            } catch (err) {
                console.error("MediaPipe Init Error:", err);
                setMessage("AI Initialization Failed. Please refresh.");
            }
        };

        setupMediaPipe();
        return () => {
            isMounted = false;
            // Safari/Chrome safety for stopping camera streams
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
            if (faceLandmarker.current) {
                faceLandmarker.current.close();
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: "user" }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Important for some browsers to trigger play
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().catch(e => console.error("Play error:", e));
                };
            }
        } catch (err) {
            setMessage("Camera access denied.");
            throw err;
        }
    };

    const checkLuminance = () => {
        if (!videoRef.current || videoRef.current.readyState !== 4) return 255;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return 255;

        canvas.width = 40;
        canvas.height = 30;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let lum = 0;
        for (let i = 0; i < data.length; i += 4) {
            lum += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        }
        return lum / (canvas.width * canvas.height);
    };

    const isLookingAway = (landmarks: any[]) => {
        if (!landmarks || landmarks.length === 0) return false;

        // MediaPipe indices for iris: Left (468, 469, 470, 471), Right (473, 474, 475, 476)
        // Simple look-away detection based on eye-iris ratio or horizontal deviation
        const face = landmarks[0];
        if (!face || !face[468] || !face[473]) return false;

        const leftIris = face[468];
        const rightIris = face[473];

        // Face boundaries for reference
        const leftEdge = face[234].x;
        const rightEdge = face[454].x;
        const faceCenter = (leftEdge + rightEdge) / 2;
        const irisCenter = (leftIris.x + rightIris.x) / 2;

        const dev = Math.abs(irisCenter - faceCenter);
        return dev > 0.08; // Normalized threshold. If > 0.08, looking away heavily
    };

    const triggerViolation = (reason: string) => {
        setWarnings(prev => {
            const next = prev + 1;
            if (next > WARNING_LIMIT) {
                alert(`Security Violation: ${reason}. System auto-submitting...`);
                if (onLogout) {
                    onLogout();
                }
                return next;
            } else {
                alert(`Warning! Don't switch focus or leave. Reason: ${reason}`);
                return next;
            }
        });
    };

    // 2. Monitoring Loop
    useEffect(() => {
        if (!isRunning) return;

        const monitor = setInterval(() => {
            if (!videoRef.current || !faceLandmarker.current) return;
            if (videoRef.current.readyState !== 4) return; // Wait for video

            const now = Date.now();

            // A. Tampering (Luminance)
            const brightness = checkLuminance();
            if (brightness < MIN_LUMINANCE) {
                if (!tamperStart.current) tamperStart.current = now;
                else if (now - tamperStart.current > TAMPER_TIME) {
                    triggerViolation("Camera blocked or too dark");
                    tamperStart.current = null;
                }
                return;
            } else {
                tamperStart.current = null;
            }

            // B. Face & Eye Detection
            const startTimeMs = performance.now();
            try {
                const results = faceLandmarker.current.detectForVideo(videoRef.current, startTimeMs);

                if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
                    if (!noFaceStart.current) noFaceStart.current = now;
                    else if (now - noFaceStart.current > NO_FACE_TIME) {
                        triggerViolation("User face not visible");
                        noFaceStart.current = null;
                    }
                } else {
                    noFaceStart.current = null;

                    if (isLookingAway(results.faceLandmarks)) {
                        if (!lookAwayStart.current) lookAwayStart.current = now;
                        else if (now - lookAwayStart.current > LOOK_AWAY_TIME) {
                            triggerViolation("Eye contact lost");
                            lookAwayStart.current = null;
                        }
                    } else {
                        lookAwayStart.current = null;
                    }
                }
            } catch (error) {
                console.error("Detection error:", error);
            }
        }, 1000);

        return () => clearInterval(monitor);
    }, [isRunning, onLogout]);

    return (
        <div style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.95)",
            padding: "10px",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
            width: "180px",
            backdropFilter: "blur(8px)"
        }}>
            <div style={{ position: "relative", width: "100%", borderRadius: "10px", overflow: "hidden", background: "#000" }}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                        width: "100%",
                        display: "block",
                        transform: "scaleX(-1)", // Mirror video
                        objectFit: "cover",
                        height: "120px"
                    }}
                />
                {!isRunning && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "10px" }}>
                        Waiting for Camera...
                    </div>
                )}
            </div>
            <div style={{ marginTop: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: isRunning ? "#4ade80" : "#facc15", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {message}
                </div>
                {warnings > 0 && (
                    <div style={{ fontSize: "10px", color: "#f87171", marginTop: "4px", backgroundColor: "rgba(248, 113, 113, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                        Warning: {warnings}/{WARNING_LIMIT}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisualProctor;
