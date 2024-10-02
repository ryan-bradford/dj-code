import { AbstractStrobeFilter, Color } from "./abstract-strobe-filter";

export class WhiteBlackStrobeFilter extends AbstractStrobeFilter {
    getStrobeFrequency(): number {
        return 4;
    }

    getColors(): Array<Color> {
        return [
            new Color(255, 255, 255), // White
            new Color(0, 0, 0), // Black
        ]
    }

    getBeatCount(): number {
        return 1;
    }

}
