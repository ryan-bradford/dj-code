import p5, { Shader } from "p5";
import { Renderer } from "../renderer";

export abstract class AbstractGifRenderer implements Renderer {
    private lastPeakBeat = 0;
    private images: Map<number, p5.Image> = new Map();

    constructor(protected p5: p5) { }

    abstract getBeatCount(): number;

    abstract getFramesInGif(): number;

    abstract getFileName(frame: number): string;

    abstract isZeroBased(): boolean;

    padNumber(n: number, m: number): string {
        const zeroes = '0'.repeat(m - n.toString().length);
        return zeroes + n.toString();
    }

    getFirstFrame(): number {
        return 1;
    }

    unload() {
        this.images = new Map();
        this.p5.clearStorage();
    }

    isLoaded(): boolean {
        return this.images.size > 0;
    }

    async load(): Promise<void> {
        this.images = new Map();
        for (var i = 0; i < this.getFramesInGif(); i++) {
            this.images.set(i, await this.loadImage(i, true));
        }
    }

    async loadImage(frame: number, shouldRetry: boolean): Promise<p5.Image> {
        return new Promise((resolve, reject) => {
            const offset = this.isZeroBased() ? 0 : 1;
            this.p5.loadImage(this.getFileName(frame + offset), (image) => {
                image.resize(this.p5.width, this.p5.height);
                resolve(image);
            }, reject);
        })
    }

    render(percent: number, lastBeat: number, bpm: number) {
        if (isNaN(bpm)) {
            bpm = 128;
        }
        const frame = ((Math.min(Math.round(percent * this.getFramesInGif()), this.getFramesInGif())) + this.getFirstFrame()) % this.getFramesInGif();
        if (this.images.get(frame) === undefined) {
            return;
        }

        this.p5.image(this.images.get(frame), -this.p5.width / 2, -this.p5.height / 2);
    }

}
