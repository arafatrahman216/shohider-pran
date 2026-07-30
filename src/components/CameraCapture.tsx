"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CameraCapture.module.css";

export type CameraCaptureLabels = {
  openCamera: string;
  guideHint: string;
  capture: string;
  cancel: string;
  unsupported: string;
  permissionDenied: string;
};

export default function CameraCapture({
  onCapture,
  labels,
}: {
  onCapture: (file: File) => void;
  labels: CameraCaptureLabels;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function openCamera() {
    setError(null);
    setPreviewUrl(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(labels.unsupported);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setActive(true);
    } catch {
      setError(labels.permissionDenied);
    }
  }

  useEffect(() => {
    if (active && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [active]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
        setPreviewUrl(URL.createObjectURL(blob));
        onCapture(file);
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <div className={styles.wrapper}>
      {!active && (
        <button type="button" className={styles.openButton} onClick={openCamera}>
          {labels.openCamera}
        </button>
      )}

      {active && (
        <>
          <div className={styles.viewport}>
            <video ref={videoRef} className={styles.video} autoPlay playsInline muted />
            <div className={styles.guide} aria-hidden="true" />
            <p className={styles.guideHint}>{labels.guideHint}</p>
          </div>
          <div className={styles.controls}>
            <button type="button" className={styles.captureButton} onClick={capture}>
              {labels.capture}
            </button>
            <button type="button" className={styles.cancelButton} onClick={stopCamera}>
              {labels.cancel}
            </button>
          </div>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- blob: preview, next/image can't optimize it
        <img src={previewUrl} alt="" className={styles.previewImg} />
      )}
    </div>
  );
}
