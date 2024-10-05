import { AbstractGifRenderer } from "./abstract-gif-renderer"

export class HandsRenderer extends AbstractGifRenderer {
    getFileName(frame: number): string {
        return `gif/hands/output_${this.padNumber(frame, 5)}.png`;
    }
    getBeatCount(): number {
        return 16;
    }

    getFramesInGif(): number {
        return 182;
    }

    isZeroBased(): boolean {
        return false;
    }
}
