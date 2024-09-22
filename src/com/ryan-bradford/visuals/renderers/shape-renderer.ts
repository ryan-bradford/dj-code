import p5 from "p5";
import { Renderer } from "./renderer";

class Color {
    constructor(public red: number, public blue: number, public green: number)  {

    }
}

export class ShapeRenderer implements Renderer {

    private lastChangedBeat: number;
    private colors: Array<Color>;

    constructor(private p5Instance: p5, private p5Constructors: any) {
        this.p5Instance.colorMode("rgb")
        const redColor = new Color(255, 0, 0);
        const blueColor = new Color(0, 255, 0);
        const greenColor = new Color(0, 0, 255);
        this.colors = [redColor, blueColor, greenColor];
    }

    initialize() { }

    render(lastBeat: number, nextBeat: number, bpm: number, spectrum: number[], centroid: number) {
        let currentTime = this.p5Instance.millis();
        if (lastBeat != this.lastChangedBeat) {
            // Rotate shape
            this.lastChangedBeat = lastBeat;
            this.colors = [this.colors[1], this.colors[2], this.colors[0]];
        }
        this.p5Instance.background(this.colors[0].red, this.colors[0].green, this.colors[0].blue);
    }

}