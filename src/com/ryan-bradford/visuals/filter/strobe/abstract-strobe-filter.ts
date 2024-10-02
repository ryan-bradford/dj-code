import p5 from "p5";
import { Filter } from "../filter";

export class Color {
    constructor(public red: number, public green: number, public blue: number) {

    }
}

export abstract class AbstractStrobeFilter implements Filter {

    constructor(private p5Instance: p5) {
        this.p5Instance.colorMode("rgb")
    }

    abstract getColors(): Array<Color>;

    abstract getStrobeFrequency(): number;

    reset() {
    }

    getBeatCount(): number {
        return 1;
    }

    async initialize(): Promise<void> {

    }

    render(percent: number, lastBeat: number, bpm: number) {
        if (isNaN(bpm)) {
            return;
        }
        const num = Math.floor(percent / (1/this.getStrobeFrequency())) % this.getColors().length;
        const color = this.getColors()[num];
        this.p5Instance.tint(color.red, color.green, color.blue);
    }

}
