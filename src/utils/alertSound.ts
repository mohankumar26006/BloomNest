/**
 * Web Audio API Alert Sound Synthesizer
 * Plays an authoritative dual-tone warning chime (880Hz -> 587Hz)
 * triggered ONLY ONCE when a new SEVERE-range vital is recorded.
 */
let audioCtx: AudioContext | null = null;

export function playUrgentAlertSound(isMuted: boolean = false): void {
  if (isMuted) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    const now = audioCtx.currentTime;

    // Tone 1: High warning tone (880Hz - A5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: Lower resolution tone (587Hz - D5)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(587.33, now + 0.25);
    gain2.gain.setValueAtTime(0, now + 0.25);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc2.start(now + 0.25);
    osc2.stop(now + 0.7);
  } catch (e) {
    console.warn("Web Audio alert sound blocked or unavailable:", e);
  }
}
