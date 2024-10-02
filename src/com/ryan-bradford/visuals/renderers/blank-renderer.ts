import p5 from "p5";
import { Renderer } from "./renderer";


export class BlankRenderer implements Renderer {

    private image: p5.Image;

    constructor(private p5Instance: p5) {
        this.p5Instance.colorMode("rgb")
    }

    async initialize(): Promise<void> {
        this.image = this.p5Instance.createImage(this.p5Instance.width, this.p5Instance.height);
        for (let x = 0; x < this.image.width; x += 1) {
            for (let y = 0; y < this.image.height; y += 1) {
                this.image.set(x, y, 255);
            }
        }
        this.image.updatePixels();
    }

    reset() {
    }

    render(percent: number, lastBeat: number, bpm: number) {
        this.p5Instance.image(this.image, -this.p5Instance.width / 2, -this.p5Instance.height / 2);
    }

    getBeatCount(): number {
        return 1;
    }

}
