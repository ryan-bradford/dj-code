import p5, { Filter } from "p5";

export class HyperColorFilter {
    private lastPeakBeat: number;
    private lastObservedRender: number;
    private intervalBeats = 8;
    private stepSize = 4;

    constructor(private p5: p5) {}

    applyFilter(lastBeat: number, nextBeat: number, bpm: number) {
        if (!this.lastPeakBeat) {
            this.lastPeakBeat = lastBeat;
        }

        const targetPeak = this.lastPeakBeat + 60000 / bpm * this.intervalBeats;
        if (
            this.lastObservedRender &&
            (this.lastObservedRender < targetPeak &&
            this.p5.millis() > targetPeak) ||  this.lastObservedRender > targetPeak
        ) {
            this.lastPeakBeat = lastBeat;
        }
        this.lastObservedRender = this.p5.millis();
        this.p5.loadPixels();

        const totalTime = targetPeak - this.lastPeakBeat;
        const traveledTime = this.p5.millis() - this.lastPeakBeat;
        const percent = traveledTime / totalTime;
        const cosVal = Math.abs(Math.cos(percent * Math.PI));

        for (var x = 0; x < this.p5.width; x += this.stepSize) {
            for (var y = 0; y < this.p5.height; y += this.stepSize) {
              var index = ((y*this.p5.width) + x) * 4;
              var redVal = 255 -this.p5.pixels[index];
              var greenVal = this.p5.pixels[index + 1];
              var blueVal = this.p5.pixels[index + 2];
              this.p5.fill(redVal, greenVal, blueVal);
              this.p5.ellipse(x, y, this.stepSize, this.stepSize);
            }
          }
        this.p5.updatePixels();
    }
}
