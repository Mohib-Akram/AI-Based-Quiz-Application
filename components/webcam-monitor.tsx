"use client";

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface WebcamMonitorProps {
  quizId: string;
  onViolation: (type: string) => void;
  onThresholdBreach?: () => void;
}

export const WebcamMonitor = forwardRef(
  ({ quizId, onViolation, onThresholdBreach }: WebcamMonitorProps, ref) => {
    const { user } = useAuth();

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modelRef = useRef<any>(null);
    const rafRef = useRef<number | null>(null);

    // FRAME COUNTERS
    const multiFaceFrames = useRef(0);
    const noFaceFrames = useRef(0);
    const lastViolationTime = useRef<Record<string, number>>({});

    const [violations, setViolations] = useState<string[]>([]);
    const [cheatingScore, setCheatingScore] = useState(0);
    const [flash, setFlash] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useImperativeHandle(ref, () => ({
      stopMonitoring: stopWebcam,
    }));

    /* ================= START CAMERA ================= */
    useEffect(() => {
      if (typeof window === "undefined") return;

      const start = async () => {
        const tf = await import("@tensorflow/tfjs-core");
        await import("@tensorflow/tfjs-backend-webgl");
        const blazeface = await import("@tensorflow-models/blazeface");

        if (!videoRef.current) return;

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          console.log("Camera stream started:", stream);

          modelRef.current = await blazeface.load();
          console.log("Detector initialized:", modelRef.current);

          detectionLoop();
        } catch (err) {
          console.error("Error accessing camera or initializing detector:", err);
        }
      };

      start();

      // SECURITY EVENTS
      const onVis = () => document.hidden && logViolation("Tab Switch");
      const onFS = () =>
        !document.fullscreenElement && logViolation("Fullscreen Exit");

      document.addEventListener("visibilitychange", onVis);
      document.addEventListener("fullscreenchange", onFS);

      return () => {
        console.log("WebcamMonitor unmounting, stopping webcam...");
        stopWebcam();
        document.removeEventListener("visibilitychange", onVis);
        document.removeEventListener("fullscreenchange", onFS);
      };
    }, []);

    /* ================= STOP CAMERA ================= */
    const stopWebcam = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      console.log("Webcam stopped");
    };

    /* ================= MAIN LOOP ================= */
    const detectionLoop = async () => {
      if (!modelRef.current || !videoRef.current) {
        rafRef.current = requestAnimationFrame(detectionLoop);
        return;
      }

      try {
        const faces = await modelRef.current.estimateFaces(videoRef.current, false);
        console.log("Faces detected:", faces?.length, faces);

        // ONLY MULTIPLE FACES LOGIC
        if (faces && faces.length > 1) {
          multiFaceFrames.current++;
          console.log("Multiple face frame count:", multiFaceFrames.current);
          if (multiFaceFrames.current > 20) logViolation("Multiple People Detected");
        } else {
          multiFaceFrames.current = 0;
        }

        // If at least one face exists, track the first face for gaze/blink/head movement
        if (faces && faces.length > 0) {
          setIsSearching(false);
          noFaceFrames.current = 0; // Reset no-face counter
          const face = faces[0];
          drawFaceBox(face);
        } else {
          noFaceFrames.current++;
          if (noFaceFrames.current > 15) { // Start searching after 15 frames
            setIsSearching(true);
          }
          if (noFaceFrames.current > 60) { // Log violation after 60 frames ( ~2 seconds)
            logViolation("No Face Detected");
          }
        }
      } catch (err) {
        console.error("Error estimating faces:", err);
      }

      rafRef.current = requestAnimationFrame(detectionLoop);
    };


    /* ================= DRAW ================= */
    const drawFaceBox = (face: any) => {
      const ctx = canvasRef.current?.getContext("2d");
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !video || !canvas) return;

      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      ctx.clearRect(0, 0, rect.width, rect.height);
      
      const scaleX = rect.width / video.videoWidth;
      const scaleY = rect.height / video.videoHeight;
      
      const x = face.topLeft[0] * scaleX;
      const y = face.topLeft[1] * scaleY;
      const w = (face.bottomRight[0] - face.topLeft[0]) * scaleX;
      const h = (face.bottomRight[1] - face.topLeft[1]) * scaleY;

      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
    };

    /* ================= VIOLATIONS ================= */
    const SCORE_MAP: Record<string, number> = {
      "Multiple People Detected": 10,
      "Tab Switch": 10,
      "Fullscreen Exit": 10,
      "No Face Detected": 10,
    };

    const logViolation = async (type: string) => {
      if (!user) return;

      const now = Date.now();
            if (now - (lastViolationTime.current[type] || 0) < 2000) return;
      lastViolationTime.current[type] = now;

      setFlash(true);
      setTimeout(() => setFlash(false), 200);

      setViolations((v) => {
        const updatedViolations = [...v, type];
        onViolation(type);
        if (updatedViolations.length >= 5) {
          stopWebcam();
          onThresholdBreach?.();
        }
        return updatedViolations;
      });

      setCheatingScore((s) => Math.min(s + (SCORE_MAP[type] ?? 10), 100));

      try {
        await addDoc(collection(db, "monitoring"), {
          userId: user.uid,
          quizId,
          alertType: type,
          timestamp: serverTimestamp(),
        });
      } catch (err) {
        console.error("Error logging violation to Firestore:", err);
      }
    };

    /* ================= UI ================= */
    return (
      <div className="relative space-y-3">
        {flash && (
          <div className="absolute inset-0 bg-red-500 opacity-40 rounded-lg animate-pulse" />
        )}

        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="rounded border w-full h-auto max-w-full"
            style={{ maxHeight: "240px" }}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none w-full h-full"
            style={{ maxHeight: "240px" }}
          />
        </div>

        {isSearching && (
          <Alert variant="destructive" className="border-yellow-500 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              Searching for face...
            </AlertDescription>
          </Alert>
        )}

        {violations.length > 0 && !isSearching && (
          <Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {violations.slice(-3).join(", ")}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }
);

WebcamMonitor.displayName = "WebcamMonitor";
