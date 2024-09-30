import p5, { Shader } from "p5";
import { Renderer } from "../renderer";

export abstract class AbstractGifRenderer implements Renderer {
    private lastPeakBeat = 0;
    private images: Map<number, p5.Image>;

    constructor(protected p5: p5) { }

    abstract getBeatCount(): number;

    abstract getFramesInGif(): number;

    abstract getFileName(frame: number): string;

    reset() {

    }

    initialize(): void {
        this.images = new Map();
        Array(this.getFramesInGif()).fill(1).map((_, i) => i).forEach(i => {
            this.p5.loadImage(this.getFileName(i+1), (loaded) => {
                loaded.resize(this.p5.width, this.p5.height);
                this.images.set(i+1, loaded);
            });
        });
    }

    render(percent: number, lastBeat: number, bpm: number) {
        if (isNaN(bpm)) {
            bpm = 128;
        }
        const frame = Math.max(1, Math.min(Math.round(percent * this.getFramesInGif()), this.getFramesInGif()));
        if (this.images.get(frame) === undefined) {
            console.log("skipping", frame, percent);
            return;
        }

        this.p5.image(this.images.get(frame), -this.p5.width / 2, -this.p5.height / 2);
    }

}