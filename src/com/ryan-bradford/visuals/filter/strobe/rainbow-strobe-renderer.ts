import { AbstractStrobeFilter, Color } from "./abstract-strobe-filter";

export class RainbowStrobeFilter extends AbstractStrobeFilter {
    getStrobeFrequency(): number {
        return 8;
    }

    getColors(): Array<Color> {
        return [
            new Color(255, 0, 0), // Red
            new Color(255, 165, 0), // Orange
            new Color(255, 255, 0), // Yellow
            new Color(0, 128, 0), // Green
            new Color(0, 0, 255), // Blue
            new Color(75, 0, 130), // Indigo
            new Color(238, 130, 238), // Violet
            new Color(255, 192, 203) // Pink
        ]
    }

    getBeatCount(): number {
        return 2;
    }

}
