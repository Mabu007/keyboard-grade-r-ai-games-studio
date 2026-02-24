// Simple Web Audio API Synthesizer
const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
const ctx = new AudioContextClass();

const osc = (type: OscillatorType, freq: number, duration: number, vol = 0.1, delay = 0) => {
  setTimeout(() => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + duration);
  }, delay * 1000);
};

export const playSound = {
  jump: () => osc('square', 400, 0.1, 0.1),
  shoot: () => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(800, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.1);
  },
  explosion: () => {
    // Noise buffer for explosion
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    noise.connect(g);
    g.connect(ctx.destination);
    noise.start();
  },
  collect: () => osc('sine', 1200, 0.1, 0.1),
  
  // New Sounds
  success: () => {
    osc('sine', 523.25, 0.2, 0.1, 0);    // C5
    osc('sine', 659.25, 0.2, 0.1, 0.1);  // E5
    osc('sine', 783.99, 0.4, 0.1, 0.2);  // G5
  },
  wrong: () => {
    osc('sawtooth', 150, 0.4, 0.15);
    osc('sawtooth', 140, 0.4, 0.15); // Dissonant low
  }
};

// Simple background music sequencer
let musicInterval: number | null = null;
export const playMusic = (start: boolean) => {
  if (!start) {
    if (musicInterval) clearInterval(musicInterval);
    musicInterval = null;
    return;
  }
  
  // Prevent double playing
  if (musicInterval) return;

  let note = 0;
  const bassline = [110, 110, 130, 110, 146, 110, 130, 123];
  
  musicInterval = window.setInterval(() => {
    const freq = bassline[note % bassline.length];
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(0.05, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.2);
    note++;
  }, 200);
};