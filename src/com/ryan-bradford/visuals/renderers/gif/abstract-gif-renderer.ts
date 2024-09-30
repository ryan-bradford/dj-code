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
            this.p5.loadImage(this.getFileName(i), (loaded) => {
                loaded.resize(this.p5.width, this.p5.height);
                this.images.set(i, loaded);
            });
        });
    }

    render(percent: number, lastBeat: number, bpm: number) {
        if (isNaN(bpm)) {
            bpm = 128;
        }
        const frame = Math.min(Math.round(percent * this.getFramesInGif()), this.getFramesInGif() - 1);
        if (this.images.get(frame) === undefined) {
            return;
        }

        this.p5.image(this.images.get(frame), -this.p5.width / 2, -this.p5.height / 2);
    }

}