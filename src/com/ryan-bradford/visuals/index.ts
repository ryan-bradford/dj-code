import * as P5Class from "p5";
import * as test from "p5/lib/addons/p5.sound";
import { BeatAwareStack } from "./beats/beat-aware-stack";
import { LaunchpadAdapter } from "./midi/launchpad-adapter";
import { MixxxAdapter } from "./midi/mixxx-adapter";
import { CloudsRenderer } from "./renderers/shaders/clouds-renderer";
import { HypercolorRenderer } from "./renderers/shaders/hypercolor-renderer";
import { Renderer } from "./renderers/renderer";
import { ShapeRenderer } from "./renderers/shaders/shape-renderer";
import { ShapesRenderer } from "./renderers/shapes-renderer";
import { SquiggleRenderer } from "./renderers/shaders/squiggle-renderer";
import { WaveRenderer } from "./renderers/wave-renderer";
import { DancingShape } from "./renderers/gif/dancing-shape-gif";

let mic: P5Class.AudioIn;

let p5Constructors: any = (window as any).p5;
let p5Instance: P5Class = window as any;

let fft: P5Class.FFT;
let isStarted = false;
let beats: BeatAwareStack = new BeatAwareStack();
let shapeRenderer: Renderer;
let waveRenderer: Renderer;
let activeRenderer: Renderer;
let hypercolorRenderer: Renderer;
let squiggleRenderer: Renderer;
let cloudsRenderer: Renderer;
let shapesRenderer: Renderer;
let dancingShapeRenderer: Renderer;
let mixxxAdapter: MixxxAdapter;
let launchpadAdapter: LaunchpadAdapter;

export function setup() {
  p5Instance.createCanvas(window.innerWidth, window.innerHeight, p5Instance.WEBGL);
  // turn off the createGraphics layers stroke
  p5Instance.noStroke();

  // Create an Audio input
  mic = new p5Constructors.AudioIn();

  // start the Audio Input.
  // By default, it does not .connect() (to the computer speakers)
  mic.start();
  fft = new p5Constructors.FFT();
  fft.setInput(mic);
  shapeRenderer = new ShapeRenderer(p5Instance, p5Constructors);
  waveRenderer = new WaveRenderer(p5Instance);
  hypercolorRenderer = new HypercolorRenderer(p5Instance, p5Constructors);
  squiggleRenderer = new SquiggleRenderer(p5Instance, p5Constructors);
  cloudsRenderer = new CloudsRenderer(p5Instance, p5Constructors);
  shapesRenderer = new ShapesRenderer(p5Instance, p5Constructors);
  hypercolorRenderer.initialize();
  squiggleRenderer.initialize();
  cloudsRenderer.initialize();
  shapesRenderer.initialize();

  // Gif Renderers
  dancingShapeRenderer = new DancingShape(p5Instance);
  dancingShapeRenderer.initialize();

  activeRenderer = cloudsRenderer;
  mixxxAdapter = new MixxxAdapter(navigator, beats, p5Instance);
  launchpadAdapter =  new LaunchpadAdapter(navigator);
}

export function touchStarted() {
  (p5Instance.getAudioContext() as AudioContext).resume();
  isStarted = true;
  mixxxAdapter.init();
  launchpadAdapter.init();
}

export function draw() {
  // Pulse white on the beat, then fade out with an inverse cube curve
  let lastBeat = beats.getLastBeat(p5Instance.millis());
  let nextBeat = beats.getNextBeat(p5Instance.millis());
  let spectrum = fft.analyze();
  let centroid = fft.getCentroid();
  p5Instance.clear(undefined, undefined, undefined, undefined);
  activeRenderer.render(lastBeat, nextBeat, beats.getBpm(), spectrum, centroid);
}

