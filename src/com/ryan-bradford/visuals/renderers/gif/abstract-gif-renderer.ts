import p5, { Shader } from "p5";
import { Renderer } from "../renderer";

export abstract class AbstractGifRenderer implements Renderer {
    private lastPeakBeat = 0;
    private images: Map<number, p5.Image>;

    constructor(protected p5: p5) { }

    abstract getBeatCount(): number;

    abstract getFramesInGif(): number;

    abstract getFileName(frame: number): string;

    abstract isZeroBased(): boolean;

    getFirstFrame(): number {
        return 1;
    }

    reset() {

    }

    async initialize(): Promise<void> {
        this.images = new Map();
        for (var i = 0; i < this.getFramesInGif(); i++) {
            console.log(i);
            this.images.set(i, await this.loadImage(i, true));
        }
    }

    async loadImage(frame: number, shouldRetry: boolean): Promise<p5.Image> {
        return new Promise((resolve, reject) => {
            const offset = this.isZeroBased() ? 0 : 1;
            this.p5.loadImage(this.getFileName(frame + offset), resolve, reject);
        })
    }

    render(percent: number, lastBeat: number, bpm: number) {
        if (isNaN(bpm)) {
            bpm = 128;
        }
        const frame = ((Math.min(Math.round(percent * this.getFramesInGif()), this.getFramesInGif())) + this.getFirstFrame()) % this.getFramesInGif();
        if (this.images.get(frame) === undefined) {
            console.log(frame);
            return;
        }

        this.p5.image(this.images.get(frame), -this.p5.width / 2, -this.p5.height / 2);
    }

}
