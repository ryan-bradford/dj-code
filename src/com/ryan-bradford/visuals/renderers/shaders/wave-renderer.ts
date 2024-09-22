import p5, { FFT, PeakDetect } from "p5";
import { Renderer } from "../renderer";

export class WaveRenderer implements Renderer {
  private width: number;
  private height: number;
  private left = 0;
  private top = 0;

  constructor(private p5Instance: p5) {
    this.width = this.p5Instance.width;
    this.height = this.p5Instance.height;
  }

  initialize() { }

  render(
    lastBeat: number,
    nextBeat: number,
    bpm: number,
    spectrum: number[],
    centroid: number
  ) {
    this.p5Instance.background(
        this.p5Instance.map(1 / this.p5Instance.pow((this.p5Instance.millis() - lastBeat) / 1000 + 1, 3), 1, 0, 255, 100)
    );

    this.p5Instance.stroke("limegreen");
    this.p5Instance.fill("darkgreen");
    this.p5Instance.strokeWeight(1);

    this.p5Instance.beginShape();
    this.p5Instance.vertex(this.left, this.top + this.height);

    let peak = 0;
    // compute a running average of values to avoid very
    // localized energy from triggering a beat.
    for (let i = 0; i < spectrum.length; i++) {
      this.p5Instance.vertex(
        //left + map(i, 0, spectrum.length, 0, w),
        // Distribute the spectrum values on a logarithmic scale
        // We do this because as you go higher in the spectrum
        // the same perceptible difference in tone requires a
        // much larger chang in frequency.
        this.left +
          this.p5Instance.map(
            this.p5Instance.log(i),
            0,
            this.p5Instance.log(spectrum.length),
            0,
            this.width
          ),
        // Spectrum values range from 0 to 255
        this.top + this.p5Instance.map(spectrum[i], 0, 255, this.height, 0)
      );
    }

    this.p5Instance.vertex(this.left + this.width, this.top + this.height);
    this.p5Instance.endShape(this.p5Instance.CLOSE);
    // this is the range of frequencies covered by the FFT
    let nyquist = 22050;

    // the mean_freq_index calculation is for the display.
    // centroid frequency / hz per bucket
    let mean_freq_index = centroid / (nyquist / spectrum.length);
    this.p5Instance.stroke("red");
    // convert index to x value using a logarithmic x axis
    let cx = this.p5Instance.map(
      this.p5Instance.log(mean_freq_index),
      0,
      this.p5Instance.log(spectrum.length),
      0,
      this.p5Instance.width
    );
    this.p5Instance.line(cx, 0, cx, this.height);
  }
}
