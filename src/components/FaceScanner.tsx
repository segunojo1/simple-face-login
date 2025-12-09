"use client";

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

export type ScanResult = {
  descriptor: number[];
  imageDataUrl: string;
};

export default function FaceScanner({ onScan }: { onScan: (result: ScanResult) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Loading models...");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    async function init() {
      setStatus("Loading models...");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setStatus("Starting camera...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream as any;
        await new Promise((res) => (videoRef.current!.onloadedmetadata = () => res(null)));
        await videoRef.current.play();
      }
      setReady(true);
      setStatus("Camera ready. Look at the camera and click Scan.");
    }
    init();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  async function handleScan() {
    if (!videoRef.current) return;
    setWorking(true);
    setStatus("Detecting face...");
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setWorking(false);
      setStatus("No face detected. Try again.");
      return;
    }

    // Draw and export frame
    if (canvasRef.current && videoRef.current) {
      const w = videoRef.current.videoWidth;
      const h = videoRef.current.videoHeight;
      canvasRef.current.width = w;
      canvasRef.current.height = h;
      const ctx = canvasRef.current.getContext("2d")!;
      ctx.drawImage(videoRef.current, 0, 0, w, h);
      const imageDataUrl = canvasRef.current.toDataURL("image/jpeg", 0.8);

      onScan({ descriptor: Array.from(detection.descriptor), imageDataUrl });
      setWorking(false);
      setStatus("Scan complete.");
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      <video ref={videoRef} className="rounded-md w-full max-w-md" autoPlay muted playsInline />
      <canvas ref={canvasRef} className="hidden" />
      <div className="text-sm text-zinc-600 dark:text-zinc-400">{status}</div>
      <button
        className="px-4 py-2 rounded-full bg-black text-white disabled:opacity-50"
        onClick={handleScan}
        disabled={!ready || working}
      >
        {working ? "Scanning..." : "Scan"}
      </button>
    </div>
  );
}
