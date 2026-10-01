// Real Web Biometric & Security Service
// 1. WebAuthn Fingerprint / Touch ID / Face ID hardware sensor
// 2. Live Camera Video Stream & Face Selfie Capture with Canvas

export interface BiometricAuthResult {
  success: boolean;
  type: 'fingerprint' | 'face';
  credentialId?: string;
  faceSnapshot?: string;
  message?: string;
}

export const realBiometricService = {
  // Check if browser/hardware supports WebAuthn Biometrics
  isHardwareBiometricAvailable: async (): Promise<boolean> => {
    try {
      if (
        window.PublicKeyCredential &&
        typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
      ) {
        return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
      return false;
    } catch {
      return false;
    }
  },

  // Enroll device hardware fingerprint/PIN/Face via WebAuthn
  enrollHardwareFingerprint: async (
    userId: string,
    displayName: string
  ): Promise<{ success: boolean; credentialId?: string; message?: string }> => {
    try {
      if (!window.PublicKeyCredential) {
        throw new Error('আপনার ব্রাউজার বা ডিভাইসে ফিঙ্গারপ্রিন্ট সেন্সর সাপোর্ট করছে না।');
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userIdBytes = new Uint8Array(16);
      for (let i = 0; i < Math.min(userId.length, 16); i++) {
        userIdBytes[i] = userId.charCodeAt(i);
      }

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'Watch & Earn BD',
          id: window.location.hostname
        },
        user: {
          id: userIdBytes,
          name: displayName || 'User',
          displayName: displayName || 'Watch & Earn Member'
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // phone fingerprint / touch ID / face ID
          userVerification: 'required'
        },
        timeout: 60000,
        attestation: 'none'
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      if (credential && credential.id) {
        return {
          success: true,
          credentialId: credential.id,
          message: 'ডিভাইস আসল ফিঙ্গারপ্রিন্ট সফলভাবে ভেরিফাই ও এনরোল হয়েছে!'
        };
      }
      return { success: false, message: 'ফিঙ্গারপ্রিন্ট রিড করা যায়নি।' };
    } catch (err: any) {
      console.warn('WebAuthn registration error:', err);
      // Graceful error messages
      if (err.name === 'NotAllowedError') {
        return { success: false, message: 'ফিঙ্গারপ্রিন্ট স্ক্যান বাতিল করা হয়েছে।' };
      }
      return {
        success: false,
        message: err.message || 'ডিভাইসে ফিঙ্গারপ্রিন্ট অ্যাক্সেস পাওয়া যায়নি।'
      };
    }
  },

  // Verify hardware fingerprint during withdrawal
  verifyHardwareFingerprint: async (
    credentialId?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!window.PublicKeyCredential) {
        throw new Error('আপনার ব্রাউজারে বায়োমেট্রিক সাপোর্ট নেই।');
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        rpId: window.location.hostname,
        userVerification: 'required'
      };

      if (credentialId) {
        publicKeyCredentialRequestOptions.allowCredentials = [
          {
            id: Uint8Array.from(atob(credentialId.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
            type: 'public-key',
            transports: ['internal']
          }
        ];
      }

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      if (assertion) {
        return { success: true, message: 'আসল ফিঙ্গারপ্রিন্ট ম্যাচ সম্পন্ন হয়েছে!' };
      }
      return { success: false, message: 'ফিঙ্গারপ্রিন্ট মেলেনি।' };
    } catch (err: any) {
      console.warn('WebAuthn verify error:', err);
      if (err.name === 'NotAllowedError') {
        return { success: false, message: 'ফিঙ্গারপ্রিন্ট ভেরিফিকেশন বাতিল করা হয়েছে।' };
      }
      return {
        success: false,
        message: err.message || 'ফিঙ্গারপ্রিন্ট ভেরিফিকেশন সম্পন্ন হয়নি।'
      };
    }
  },

  // Start Real Device Camera Video Stream
  startCameraStream: async (videoElement?: HTMLVideoElement | null): Promise<MediaStream | null> => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('আপনার ব্রাউজারে ক্যামেরা অ্যাক্সেস সাপোর্ট নেই।');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // selfie camera
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      if (videoElement) {
        videoElement.srcObject = stream;
        try {
          await videoElement.play();
        } catch {
          // auto-play policies will handle muted play
        }
      }
      return stream;
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission denied')) {
        const error = new Error('ক্যামেরার অনুমতি (Permission) দেওয়া হয়নি। ব্রাউজারের সাইট সেটিংসে গিয়ে ক্যামেরা Allow করুন অথবা ফিঙ্গারপ্রিন্ট ব্যবহার করুন।');
        error.name = 'PermissionDenied';
        throw error;
      }
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        const error = new Error('আপনার ডিভাইসে কোনো সেলফি ক্যামেরা খুঁজে পাওয়া যায়নি।');
        error.name = 'NoCameraFound';
        throw error;
      }
      throw err;
    }
  },

  // Capture face photo from live video element to base64
  captureFaceSnapshot: (videoElement: HTMLVideoElement): string | null => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 320;
      canvas.height = videoElement.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Draw mirrored video frame
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      return canvas.toDataURL('image/jpeg', 0.85);
    } catch (err) {
      console.error('Snapshot capture error:', err);
      return null;
    }
  },

  // Stop camera media tracks cleanly
  stopCameraStream: (stream: MediaStream | null) => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }
  }
};
