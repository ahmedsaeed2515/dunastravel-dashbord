/**
 * Reliable Notification Sound Synthesizer & Audio Player
 */

let cachedWavDataUri: string | null = null;
let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!globalAudioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      globalAudioCtx = new AudioCtx();
    }
  }
  return globalAudioCtx;
}

// Unlock audio context on any user interaction
if (typeof window !== "undefined") {
  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  };
  ["click", "touchstart", "pointerdown", "keydown"].forEach((evt) => {
    window.addEventListener(evt, unlock, { passive: true });
  });
}

function getChimeWavDataUri(): string {
  if (cachedWavDataUri) return cachedWavDataUri;

  const sampleRate = 22050;
  const duration = 0.45;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Pleasant double chime: Note 1 (E5 - 659.25Hz) + Note 2 (B5 - 987.77Hz)
    if (t < 0.3) {
      const env1 = Math.exp(-t * 12);
      sample += Math.sin(2 * Math.PI * 659.25 * t) * env1 * 0.5;
    }
    if (t >= 0.08) {
      const t2 = t - 0.08;
      const env2 = Math.exp(-t2 * 10);
      sample += Math.sin(2 * Math.PI * 987.77 * t2) * env2 * 0.6;
    }

    const sample16 = Math.max(-1, Math.min(1, sample)) * 32767;
    view.setInt16(44 + i * 2, sample16, true);
  }

  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  cachedWavDataUri = "data:audio/wav;base64," + btoa(binary);
  return cachedWavDataUri;
}

export const playNotificationSound = (): void => {
  if (typeof window === "undefined") return;

  // 1. Try HTML5 Audio with WAV Data URI (works independently of AudioContext state)
  try {
    const dataUri = getChimeWavDataUri();
    const audio = new Audio(dataUri);
    audio.volume = 0.9;
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch((err) => {
        console.warn("HTML5 audio play blocked:", err);
      });
    }
  } catch (err) {
    console.warn("HTML5 Audio error:", err);
  }

  // 2. Try Web Audio API (Synthesizer)
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = getAudioContext() || new AudioCtx();

    const playOscillators = () => {
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(987.77, now + 0.08);
      gain2.gain.setValueAtTime(0.35, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.5);
    };

    if (ctx.state === "suspended") {
      ctx.resume().then(() => {
        playOscillators();
      }).catch(() => {});
    } else {
      playOscillators();
    }
  } catch (err) {
    console.warn("Web Audio synth error:", err);
  }
};
