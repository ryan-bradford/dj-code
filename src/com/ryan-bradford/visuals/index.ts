import * as P5Class from "p5";
import * as test from "p5/lib/addons/p5.sound";
import { BeatAwareStack } from "./beats/beat-aware-stack";
import { Renderer } from "./renderers/renderer";
import { ShapeRenderer } from "./renderers/shape-renderer";
import { WaveRenderer } from "./renderers/wave-renderer";

let mic: P5Class.AudioIn;

let p5Constructors: any = (window as any).p5;
let p5Instance: P5Class = window as any;

let fft: P5Class.FFT;
let peakDetect: P5Class.PeakDetect;
let isStarted = false;
let beats: BeatAwareStack = new BeatAwareStack();
let sound: P5Class.SoundFile;
let waveRenderer: Renderer;

export function preload(){
    sound = p5Instance.loadSound('song.mp3');
}

export function setup() {
  p5Instance.createCanvas(710, 200);

  // Create an Audio input
  // mic = new p5Constructors.AudioIn();

  // start the Audio Input.
  // By default, it does not .connect() (to the computer speakers)
  // mic.start();
  fft = new p5Constructors.FFT();
  // fft.setInput(mic);
  peakDetect = new p5Constructors.PeakDetect(0, 2000, 0.3);
  peakDetect.onPeak((peak) => {
    beats.registerBeat(p5Instance.millis());
  });
  waveRenderer = new WaveRenderer(p5Instance);
}

export function touchStarted() {
  // (p5.getAudioContext() as AudioContext).resume();
  isStarted = true;

  if (sound.isPlaying()) {
    sound.pause();
  } else {
    sound.loop();
  }
}

export function draw() {
  // Pulse white on the beat, then fade out with an inverse cube curve
  let lastBeat = beats.getLastBeat(p5Instance.millis());
  let nextBeat = beats.getNextBeat(p5Instance.millis());
  let spectrum = fft.analyze();
  peakDetect.update(fft);
  let centroid = fft.getCentroid();
  waveRenderer.render(lastBeat, nextBeat, spectrum, centroid);
}

