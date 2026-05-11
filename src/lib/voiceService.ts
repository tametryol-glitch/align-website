/**
 * Voice Service — OpenAI TTS + Whisper STT for AI Astrologer voice chat (Web)
 *
 * TTS: Sends text to backend /ai/tts → OpenAI TTS API → returns base64 audio
 * STT: Records audio via MediaRecorder → sends to backend /ai/transcribe → Whisper → returns text
 *
 * Voices available (OpenAI TTS):
 *   alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
 */

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export type TTSVoice = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'fable' | 'nova' | 'onyx' | 'sage' | 'shimmer';

export interface VoiceOption {
  id: TTSVoice;
  name: string;
  description: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'nova', name: 'Nova', description: 'Warm & expressive' },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft & calming' },
  { id: 'alloy', name: 'Alloy', description: 'Balanced & clear' },
  { id: 'echo', name: 'Echo', description: 'Smooth & steady' },
  { id: 'fable', name: 'Fable', description: 'Warm & narrative' },
  { id: 'onyx', name: 'Onyx', description: 'Deep & grounding' },
  { id: 'coral', name: 'Coral', description: 'Bright & friendly' },
  { id: 'sage', name: 'Sage', description: 'Wise & measured' },
  { id: 'ash', name: 'Ash', description: 'Gentle & neutral' },
  { id: 'ballad', name: 'Ballad', description: 'Melodic & soothing' },
];

export const DEFAULT_VOICE: TTSVoice = 'nova';

export const VOICE_SAMPLE_TEXT = 'The stars are aligning beautifully for you today. Your cosmic energy is radiating with potential.';

const STORAGE_KEY = 'align_astrologer_voice';

// ═══════════════════════════════════════════════════════════════════
// API helpers (uses same base URL as main API)
// ═══════════════════════════════════════════════════════════════════

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://align-api-v2-production.up.railway.app/api/v1';

let _authToken: string | null = null;

export function setVoiceAuthToken(token: string | null) {
  _authToken = token;
}

async function apiRequest(endpoint: string, body: any): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (_authToken) headers['Authorization'] = `Bearer ${_authToken}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'TTS request failed' }));
    throw new Error(typeof err.detail === 'string' ? err.detail : 'Voice service error');
  }
  return res.json();
}

// ═══════════════════════════════════════════════════════════════════
// Text preprocessing for speech
// ═══════════════════════════════════════════════════════════════════

const SYMBOL_MAP: Record<string, string> = {
  '♈': 'Aries', '♉': 'Taurus', '♊': 'Gemini', '♋': 'Cancer',
  '♌': 'Leo', '♍': 'Virgo', '♎': 'Libra', '♏': 'Scorpio',
  '♐': 'Sagittarius', '♑': 'Capricorn', '♒': 'Aquarius', '♓': 'Pisces',
  '☉': 'the Sun', '☽': 'the Moon', '☿': 'Mercury', '♀': 'Venus',
  '♂': 'Mars', '♃': 'Jupiter', '♄': 'Saturn', '♅': 'Uranus',
  '♆': 'Neptune', '♇': 'Pluto',
  '☊': 'North Node', '☋': 'South Node',
  '△': 'trine', '□': 'square', '☍': 'opposition', '⚹': 'sextile',
  '☌': 'conjunction',
  '✦': '', '✧': '', '★': '', '☆': '', '✶': '', '✴': '',
  '⟡': '', '◈': '', '✵': '',
};

export function prepareSpeechText(displayText: string): string {
  let s = displayText;

  // Strip visual-only elements
  s = s.replace(/^[=─—-]{3,}.*[=─—-]{3,}$/gm, '');
  s = s.replace(/^#{1,4}\s+/gm, '');
  s = s.replace(/^[\s]*[•●◦▸▹→✦✧★☆►]\s*/gm, '');
  s = s.replace(/^[\s]*[-–—]\s+/gm, '');
  s = s.replace(/^[\s]*\d+[.)]\s+/gm, '');

  // Replace astrological symbols with spoken words
  for (const [sym, word] of Object.entries(SYMBOL_MAP)) {
    s = s.split(sym).join(word);
  }

  // Convert degree notation
  s = s.replace(/(\d+)°(\d+)?[′'"]?\s*/g, (_, deg) => `${deg} degrees `);

  // Remove markdown bold/italic markers
  s = s.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1');
  s = s.replace(/_{1,2}([^_]+)_{1,2}/g, '$1');

  // Remove short parenthetical technical references
  s = s.replace(/\(([^)]{1,30})\)/g, (match, inner) => {
    const wordCount = inner.trim().split(/\s+/).length;
    if (wordCount <= 3) return '';
    return `, ${inner.trim()},`;
  });

  // Convert semicolons to periods
  s = s.replace(/;\s*/g, '. ');

  // Convert colons to dashes for natural speech
  s = s.replace(/:\s*/g, ' — ');

  // Collapse spaces/newlines
  s = s.replace(/[^\S\n]{2,}/g, ' ');
  s = s.replace(/\n{2,}/g, '. ');
  s = s.replace(/\n/g, '. ');

  // Clean up punctuation artifacts
  s = s.replace(/\.\s*\./g, '.');
  s = s.replace(/\.\s*,/g, '.');
  s = s.replace(/\.([A-Z])/g, '. $1');

  // Remove trailing "What else" type closings
  s = s.replace(/\s*(What else would you like to explore\??|What can I do to help you with your chart\??|Is there anything else you'd like to know about your chart\??|What would you like to dive into next\??)\s*$/i, '');

  return s.trim();
}

// ═══════════════════════════════════════════════════════════════════
// Voice Service Class
// ═══════════════════════════════════════════════════════════════════

class VoiceService {
  private currentAudio: HTMLAudioElement | null = null;
  private audioQueue: string[] = []; // blob URLs
  private isProcessingQueue = false;
  private stopRequested = false;
  private _isPlaying = false;
  private _isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private onPlaybackEnd: (() => void) | null = null;

  // ─── Text-to-Speech ───────────────────────────────────────────

  /**
   * Convert text to speech via backend. Returns a blob URL for playback.
   */
  private async textToSpeech(text: string, voice: TTSVoice = DEFAULT_VOICE): Promise<string> {
    const result = await apiRequest('/ai/tts', { text, voice, model: 'tts-1' });
    const audioBase64 = result.audio_base64;
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      throw new Error('TTS returned invalid audio data');
    }

    // Convert base64 to blob URL
    const byteChars = atob(audioBase64);
    const byteArray = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteArray[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  }

  /**
   * Split text into speakable chunks at sentence boundaries.
   */
  private splitIntoChunks(text: string): string[] {
    const abbrevs = ['Dr', 'Mr', 'Mrs', 'Ms', 'Prof', 'St', 'Jr', 'Sr', 'vs', 'etc', 'approx', 'dept'];
    const latinAbbrevs = ['e\\.g', 'i\\.e', 'a\\.m', 'p\\.m', 'cf', 'al'];
    let protected_ = text;

    for (const abbr of abbrevs) {
      const re = new RegExp(`\\b(${abbr})\\.\\s`, 'gi');
      protected_ = protected_.replace(re, `$1⁠ `);
    }
    for (const abbr of latinAbbrevs) {
      const re = new RegExp(`\\b(${abbr})\\.\\s`, 'gi');
      protected_ = protected_.replace(re, `$1⁠ `);
    }

    const sentences = protected_.match(/[^.!?]+[.!?]+[\s]*/g) || [protected_];
    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      const restored = sentence.replace(/⁠/g, '.').trim();
      if (!restored) continue;
      if (current.length + restored.length < 250) {
        current += (current ? ' ' : '') + restored;
      } else {
        if (current) chunks.push(current);
        current = restored;
      }
    }
    if (current) chunks.push(current);

    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Play a single blob URL. Returns when playback finishes.
   */
  private playAudioUrl(blobUrl: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const audio = new Audio(blobUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        URL.revokeObjectURL(blobUrl);
        if (this.currentAudio === audio) this.currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        if (this.currentAudio === audio) this.currentAudio = null;
        reject(new Error('Audio playback failed'));
      };

      audio.play().catch(reject);
    });
  }

  /**
   * Process the audio queue sequentially.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    try {
      while (this.audioQueue.length > 0 && !this.stopRequested) {
        const blobUrl = this.audioQueue.shift()!;
        await this.playAudioUrl(blobUrl);
      }
    } catch (err) {
      console.error('[VoiceService] queue playback error:', err);
    } finally {
      this.isProcessingQueue = false;
      if (this.audioQueue.length === 0) {
        this._isPlaying = false;
        this.onPlaybackEnd?.();
        this.onPlaybackEnd = null;
      }
    }
  }

  /**
   * Speak text aloud with chunked streaming.
   * First chunk plays immediately while rest are fetched in parallel.
   */
  async speak(text: string, voice: TTSVoice = DEFAULT_VOICE, onEnd?: () => void): Promise<void> {
    await this.stopPlayback();

    this.stopRequested = false;
    this._isPlaying = true;
    this.audioQueue = [];
    this.onPlaybackEnd = onEnd || null;

    const chunks = this.splitIntoChunks(text);

    // Fetch and play first chunk immediately
    const firstBlobUrl = await this.textToSpeech(chunks[0], voice);
    if (this.stopRequested) {
      URL.revokeObjectURL(firstBlobUrl);
      return;
    }

    this.audioQueue.push(firstBlobUrl);
    const playPromise = this.processQueue();

    // Fetch remaining chunks in parallel
    if (chunks.length > 1) {
      for (const chunk of chunks.slice(1)) {
        if (this.stopRequested) break;
        try {
          const blobUrl = await this.textToSpeech(chunk, voice);
          if (!this.stopRequested) {
            this.audioQueue.push(blobUrl);
            if (!this.isProcessingQueue) this.processQueue();
          } else {
            URL.revokeObjectURL(blobUrl);
          }
        } catch (err) {
          console.error('[VoiceService] chunk TTS error:', err);
        }
      }
    }

    await playPromise;
  }

  /**
   * Stop current playback.
   */
  async stopPlayback(): Promise<void> {
    this.stopRequested = true;
    this._isPlaying = false;

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }

    // Clean up queued blob URLs
    for (const url of this.audioQueue) {
      URL.revokeObjectURL(url);
    }
    this.audioQueue = [];
    this.isProcessingQueue = false;
    this.onPlaybackEnd?.();
    this.onPlaybackEnd = null;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  // ─── Speech-to-Text ───────────────────────────────────────────

  /**
   * Start recording audio via the browser MediaRecorder API.
   */
  async startRecording(): Promise<void> {
    if (this._isRecording) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm',
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.recordedChunks.push(e.data);
    };

    this.mediaRecorder.start(250); // collect in 250ms chunks
    this._isRecording = true;
  }

  /**
   * Stop recording and transcribe via backend Whisper.
   * Returns transcribed text.
   */
  async stopRecordingAndTranscribe(): Promise<string> {
    if (!this.mediaRecorder || !this._isRecording) {
      throw new Error('Not recording');
    }

    return new Promise<string>((resolve, reject) => {
      this.mediaRecorder!.onstop = async () => {
        this._isRecording = false;

        // Stop all tracks to release the microphone
        this.mediaRecorder?.stream.getTracks().forEach(t => t.stop());

        try {
          const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64 = (reader.result as string).split(',')[1]; // strip data URL prefix
              const result = await apiRequest('/ai/transcribe', { audio_base64: base64 });
              resolve(result.text || '');
            } catch (err: any) {
              reject(err);
            }
          };
          reader.readAsDataURL(blob);
        } catch (err: any) {
          reject(err);
        }
      };

      this.mediaRecorder!.stop();
    });
  }

  /**
   * Cancel recording without transcribing.
   */
  cancelRecording(): void {
    if (this.mediaRecorder && this._isRecording) {
      this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
      this.mediaRecorder.stop();
      this._isRecording = false;
      this.recordedChunks = [];
    }
  }

  get isRecording(): boolean {
    return this._isRecording;
  }

  // ─── Voice preference persistence ─────────────────────────────

  getSavedVoice(): TTSVoice {
    if (typeof window === 'undefined') return DEFAULT_VOICE;
    return (localStorage.getItem(STORAGE_KEY) as TTSVoice) || DEFAULT_VOICE;
  }

  saveVoice(voice: TTSVoice): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, voice);
    }
  }
}

export const voiceService = new VoiceService();
