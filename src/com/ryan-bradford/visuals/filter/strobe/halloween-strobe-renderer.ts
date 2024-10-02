import { AbstractStrobeFilter, Color } from "./abstract-strobe-filter";

export class HalloweenStrobeFilter extends AbstractStrobeFilter {
    getStrobeFrequency(): number {
        return 4;
    }

    getColors(): Array<Color> {
        // dark yellow
        // orange
        // red
        // dark gray
        return [
            new Color(219, 0, 0), // Blood Red
            new Color(255, 255, 0), // Ghostly Yellow
            new Color(128, 0, 0), // Dark Burgundy
            new Color(255, 154, 0), // Halloween Orange
        ]
    }

    getBeatCount(): number {
        return 1;
    }

}
