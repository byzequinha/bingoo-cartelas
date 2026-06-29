let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration);
}

export function playMarkSound() {
  playTone(880, 0, 0.08, 'sine', 0.1);
  playTone(1100, 0.03, 0.06, 'sine', 0.06);
}

export function playBingoSound() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    playTone(freq, i * 0.12, 0.25, 'square', 0.08);
    playTone(freq * 1.5, i * 0.12 + 0.02, 0.2, 'sine', 0.06);
  });

  playTone(1047, 0.55, 0.5, 'square', 0.1);
  playTone(1047 * 1.5, 0.55, 0.5, 'sine', 0.08);
  playTone(1319, 0.55, 0.5, 'sine', 0.06);

  const ctx = getCtx();
  for (let i = 0; i < 6; i++) {
    const t = 1.1 + i * 0.08;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1200 + Math.random() * 800;
    gain.gain.setValueAtTime(0.04, ctx.currentTime + t);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + t);
    osc.stop(ctx.currentTime + t + 0.15);
  }
}

export function playUndoSound() {
  playTone(600, 0, 0.06, 'sine', 0.06);
  playTone(400, 0.05, 0.08, 'sine', 0.06);
}
