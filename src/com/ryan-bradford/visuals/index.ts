import * as P5Class from "p5";
import * as test from "p5/lib/addons/p5.sound";
import { BeatAwareStack } from "./beats/beat-aware-stack";
import { MixxxAdapter } from "./midi/mixxx-adapter";
import { OceanRenderer } from "./renderers/ocean-renderer";
import { Renderer } from "./renderers/renderer";
import { ShapeRenderer } from "./renderers/shape-renderer";
import { WaveRenderer } from "./renderers/wave-renderer";

let mic: P5Class.AudioIn;

let p5Constructors: any = (window as any).p5;
let p5Instance: P5Class = window as any;

let fft: P5Class.FFT;
let isStarted = false;
let beats: BeatAwareStack = new BeatAwareStack();
let shapeRenderer: Renderer;
let waveRenderer: Renderer;
let activeRenderer: Renderer;
let oceanRenderer: Renderer;
let mixxxAdapter: MixxxAdapter;

export function setup() {
  p5Instance.createCanvas(window.innerWidth, window.innerHeight);

  // Create an Audio input
  mic = new p5Constructors.AudioIn();

  // start the Audio Input.
  // By default, it does not .connect() (to the computer speakers)
  mic.start();
  fft = new p5Constructors.FFT();
  fft.setInput(mic);
  shapeRenderer = new ShapeRenderer(p5Instance, p5Constructors);
  waveRenderer = new WaveRenderer(p5Instance);
  oceanRenderer = new OceanRenderer(p5Instance, p5Constructors);
  oceanRenderer.initialize();
  activeRenderer = shapeRenderer;
  mixxxAdapter = new MixxxAdapter(navigator, beats, p5Instance);
}

export function touchStarted() {
  (p5Instance.getAudioContext() as AudioContext).resume();
  isStarted = true;
  mixxxAdapter.init();
}

export function draw() {
  // Pulse white on the beat, then fade out with an inverse cube curve
  let lastBeat = beats.getLastBeat(p5Instance.millis());
  let nextBeat = beats.getNextBeat(p5Instance.millis());
  let spectrum = fft.analyze();
  let centroid = fft.getCentroid();
  p5Instance.clear(undefined, undefined, undefined, undefined);
  activeRenderer.render(lastBeat, nextBeat, spectrum, centroid);
}


// qmidinet -n 1 -i lo -a yes