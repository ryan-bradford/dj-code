import * as P5Class from "p5";
import * as test from "p5/lib/addons/p5.sound";
import { BeatAwareStack } from "./beats/beat-aware-stack";

let mic: P5Class.AudioIn;

let p5Constructors: any = (window as any).p5;
let p5Instance: P5Class = window as any;
const avgWindow = 20;
const threshold = 0.1;

let fft: P5Class.FFT;
let peakDetect: P5Class.PeakDetect;
let lastPeak;
let isStarted = false;
let beats: BeatAwareStack = new BeatAwareStack();

export function setup() {
  p5Instance.createCanvas(710, 200);

  // Create an Audio input
  mic = new p5Constructors.AudioIn();

  // start the Audio Input.
  // By default, it does not .connect() (to the computer speakers)
  mic.start();
  fft = new p5Constructors.FFT();
  fft.setInput(mic);
  peakDetect = new p5Constructors.PeakDetect(0, 2000, 0.3);
  peakDetect.onPeak((peak) => {
    beats.registerBeat(p5Instance.millis());
  });
}

export function touchStarted() {
  (p5Instance.getAudioContext() as AudioContext).resume();
  isStarted = true;
}

export function draw() {
  // Pulse white on the beat, then fade out with an inverse cube curve
  let lastBeat = beats.getLastBeat(p5Instance.millis());
  p5Instance.background(
    p5Instance.map(1 / p5Instance.pow((p5Instance.millis() - lastBeat) / 1000 + 1, 3), 1, 0, 255, 100)
  );
  if (!isStarted) {
    return;
  }
  drawSpectrumGraph(0, 0, p5Instance.width, p5Instance.height);
}

// Graphing code adapted from https://jankozeluh.g6.cz/index.html by Jan Koželuh
function drawSpectrumGraph(left, top, w, h) {
  let spectrum = fft.analyze();
  peakDetect.update(fft);

  p5Instance.stroke("limegreen");
  p5Instance.fill("darkgreen");
  p5Instance.strokeWeight(1);

  p5Instance.beginShape();
  p5Instance.vertex(left, top + h);

  let peak = 0;
  // compute a running average of values to avoid very
  // localized energy from triggering a beat.
  let runningAvg = 0;
  for (let i = 0; i < spectrum.length; i++) {
    p5Instance.vertex(
      //left + map(i, 0, spectrum.length, 0, w),
      // Distribute the spectrum values on a logarithmic scale
      // We do this because as you go higher in the spectrum
      // the same perceptible difference in tone requires a
      // much larger chang in frequency.
      left + p5Instance.map(p5Instance.log(i), 0, p5Instance.log(spectrum.length), 0, w),
      // Spectrum values range from 0 to 255
      top + p5Instance.map(spectrum[i], 0, 255, h, 0)
    );

    runningAvg += spectrum[i] / avgWindow;
    if (i >= avgWindow) {
      runningAvg -= spectrum[i] / avgWindow;
    }
    if (runningAvg > peak) {
      peak = runningAvg;
    }
  }
  // any time there is a sudden increase in peak energy, call that a beat
  if (peak > lastPeak * (1 + threshold)) {
    // print(`tick ${++i}`);
    // beat = p5.millis();
  }
  lastPeak = peak;

  p5Instance.vertex(left + w, top + h);
  p5Instance.endShape(p5Instance.CLOSE);
  // this is the range of frequencies covered by the FFT
  let nyquist = 22050;

  // get the centroid (value in hz)
  let centroid = fft.getCentroid();

  // the mean_freq_index calculation is for the display.
  // centroid frequency / hz per bucket
  let mean_freq_index = centroid / (nyquist / spectrum.length);
  p5Instance.stroke("red");
  // convert index to x value using a logarithmic x axis
  let cx = p5Instance.map(
    p5Instance.log(mean_freq_index),
    0,
    p5Instance.log(spectrum.length),
    0,
    p5Instance.width
  );
  p5Instance.line(cx, 0, cx, h);
}
