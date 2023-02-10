import p5, { Image } from "p5";
import { Renderer } from "./renderer";

export class OceanRenderer implements Renderer {

    image: Image;

    constructor(private p5: p5, private p5Constructors: any) {
    }

    initialize() {
        this.image = this.p5.loadImage("ocean.jpg");
    }

    render(lastBeat: number, nextBeat: number, spectrum: number[], centroid: number) {
        this.p5.image(this.image, 0, 0);
        this.p5.filter("invert")
        this.p5.filter("dilate");
    }

}