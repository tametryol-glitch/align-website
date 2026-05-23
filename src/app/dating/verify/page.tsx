'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getVerificationStatus, submitVerification, type VerificationResult } from '@/lib/photoVerificationService';
import { Shield, Camera, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PhotoVerificationPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadStatus = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const result = await getVerificationStatus(user.id);
    setVerification(result);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && user) loadStatus();
  }, [authLoading, user, loadStatus]);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 640 },
      });
      setCameraStream(stream);
    } catch {
      setCameraError('Camera access denied. Please allow camera access in your browser settings.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, 640, 640);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id || !capturedImage) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Convert data-URL → File without fetch() (CSP connect-src blocks data: URLs)
      const [header, base64] = capturedImage.split(',');
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const file = new File([bytes], 'selfie.jpg', { type: 'image/jpeg' });

      const result = await submitVerification(user.id, file);
      if (result.success) {
        setCapturedImage(null);
        await new Promise(r => setTimeout(r, 3000));
        await loadStatus();
      } else {
        setSubmitError(result.error || 'Submission failed. Please try again.');
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const status = verification?.status || 'none';

  return (
    <div className="max-w-lg mx-auto" style={{ minHeight: '100vh' }}>
      <Link href="/dating/profile" className="inline-flex items-center gap-1 text-sm text-accent-primary mb-4">
        <ArrowLeft size={16} /> Back to Profile
      </Link>

      <div className="text-center mb-8">
        <Shield size={32} color="#4ADE80" className="mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-white mb-2">Photo Verification</h1>
        <p className="text-sm text-text-tertiary max-w-xs mx-auto">
          Verify your identity to earn a trusted badge on your dating profile
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
        </div>
      ) : status === 'approved' ? (
        <div className="rounded-2xl p-6 text-center" style={{
          background: 'linear-gradient(135deg, rgba(74,222,128,0.08), rgba(74,222,128,0.02))',
          border: '1px solid rgba(74,222,128,0.3)',
        }}>
          <CheckCircle size={48} color="#4ADE80" className="mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-green-400 mb-1">Verified!</h2>
          <p className="text-sm text-text-tertiary">
            Your profile now shows a verified badge.
          </p>
        </div>
      ) : status === 'pending' ? (
        <div className="rounded-2xl p-6 text-center" style={{
          background: 'linear-gradient(135deg, rgba(250,204,21,0.08), rgba(250,204,21,0.02))',
          border: '1px solid rgba(250,204,21,0.3)',
        }}>
          <Clock size={48} color="#FACC15" className="mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-yellow-400 mb-1">Under Review</h2>
          <p className="text-sm text-text-tertiary">
            Your selfie is being reviewed. This usually takes 24-48 hours.
          </p>
        </div>
      ) : status === 'rejected' ? (
        <div className="space-y-4">
          <div className="rounded-2xl p-6 text-center" style={{
            background: 'linear-gradient(135deg, rgba(248,113,113,0.08), rgba(248,113,113,0.02))',
            border: '1px solid rgba(248,113,113,0.3)',
          }}>
            <XCircle size={48} color="#F87171" className="mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-red-400 mb-1">Not Approved</h2>
            {verification?.rejection_reason && (
              <p className="text-sm text-text-tertiary">{verification.rejection_reason}</p>
            )}
            <p className="text-sm text-text-muted mt-2">You can try again with a clearer selfie.</p>
          </div>
          <button
            onClick={startCamera}
            className="w-full py-3.5 rounded-2xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)' }}
          >
            Try Again
          </button>
        </div>
      ) : (
        /* No verification yet — show camera */
        <div className="space-y-4">
          <div className="rounded-2xl p-4" style={{
            backgroundColor: 'rgba(155,111,246,0.06)',
            border: '1px solid rgba(155,111,246,0.15)',
          }}>
            <h3 className="text-sm font-medium text-white mb-2">How it works:</h3>
            <ol className="text-sm text-text-tertiary space-y-1.5">
              <li>1. Take a clear selfie with good lighting</li>
              <li>2. Make sure your face is fully visible</li>
              <li>3. We&apos;ll compare it with your profile photos</li>
              <li>4. Once approved, you get a verified badge</li>
            </ol>
          </div>

          {cameraError && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-200 border border-red-500/30"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
              {cameraError}
            </div>
          )}

          {submitError && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-200 border border-red-500/30"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
              {submitError}
            </div>
          )}

          {cameraStream ? (
            <div className="space-y-3">
              <div className="rounded-2xl overflow-hidden aspect-square relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={stopCamera}
                  className="flex-1 py-3 rounded-2xl text-sm font-medium text-text-secondary"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)' }}
                >
                  Capture
                </button>
              </div>
            </div>
          ) : capturedImage ? (
            <div className="space-y-3">
              <div className="rounded-2xl overflow-hidden aspect-square">
                <img src={capturedImage} alt="Selfie" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setCapturedImage(null); startCamera(); }}
                  className="flex-1 py-3 rounded-2xl text-sm font-medium text-text-secondary"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  Retake
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)' }}
                >
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={startCamera}
              className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)' }}
            >
              <Camera size={18} /> Take Selfie
            </button>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
