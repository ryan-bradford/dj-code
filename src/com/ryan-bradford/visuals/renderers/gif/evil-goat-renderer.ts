import { AbstractGifRenderer } from "./abstract-gif-renderer"

export class EvilGoatRenderer extends AbstractGifRenderer {
    getFileName(frame: number): string {
        const frameNumber = frame >= 10 ? "0" + frame : "00" + frame;
        return `gif/evil-goat/shorter_${frameNumber}.jpg`
    }
    getBeatCount(): number {
        return 16;
    }

    getFramesInGif(): number {
        return 64;
    }

    isZeroBased(): boolean {
        return true;
    }
}
