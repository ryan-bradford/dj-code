import p5, { Shader } from "p5";
import { Renderer } from "../renderer";

export abstract class AbstractGifRenderer implements Renderer {
    private lastPeakBeat = 0;
    private images: Map<number, p5.Image>;

    constructor(protected p5: p5) { }

    abstract getGifPath(): string;

    abstract getIntervalLength(): number;

    abstract getFramesInGif(): number;

    reset() {

    }

    initialize(): void {
        this.images = new Map();
        Array(this.getFramesInGif()).fill(1).map((_, i) => i).forEach(i => {
            const frameNumber = i >= 10 ? i : "0" + i;
            this.p5.loadImage(this.getGifPath() + `frame_${frameNumber}_delay-0.04s.gif`, (loaded) => {
                loaded.resize(this.p5.width, this.p5.height);
                this.images.set(i, loaded);
            });
        });
    }

    render(lastBeat: number, nextBeat: number, bpm: number, spectrum: number[], centroid: number) {
        this.detectBeats(lastBeat, bpm);
        const intervalLength = 60000 / bpm * this.getIntervalLength();
        const traveledTime = this.p5.millis() - this.lastPeakBeat;
        let percent = (traveledTime / intervalLength) % 1;
        const frame = Math.min(Math.round(percent * this.getFramesInGif()), this.getFramesInGif() - 1);
        if (this.images.get(frame) === undefined) {
            return;
        }

        this.p5.image(this.images.get(frame), -this.p5.width / 2, -this.p5.height / 2);
    }

    private detectBeats(lastBeat: number, bpm: number) {
        const intervalLength = 60000 / bpm * this.getIntervalLength();
        const realTraveledTime = lastBeat - this.lastPeakBeat;
        const realPercent = realTraveledTime / intervalLength;
        if (
            realPercent > this.getGoalPercentOff()
        ) {
            // console.log("BEAT " + lastBeat + " " + (lastBeat - this.lastPeakBeat) + " " + intervalLength);
            if (lastBeat - this.lastPeakBeat > intervalLength + 100) {
                console.log("WOAH!");
            }
            this.lastPeakBeat = this.p5.millis();
        } else {
            // console.log("NOT_BEAT " + lastBeat + " " + (lastBeat - this.lastPeakBeat) + " " + intervalLength);
        }
    }

    private getGoalPercentOff() {
        return 1 - .2 / this.getIntervalLength()
    }

}