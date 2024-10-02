import { AbstractStrobeFilter, Color } from "./abstract-strobe-filter";

export class RedBlackStrobeFilter extends AbstractStrobeFilter {
    getStrobeFrequency(): number {
        return 2;
    }

    getColors(): Array<Color> {
        // dark yellow
        // orange
        // red
        // dark gray
        return [
            new Color(255, 0, 0), // Blood Red
            new Color(0, 0, 0), // Blood Red
        ]
    }

    getBeatCount(): number {
        return 2;
    }

}
