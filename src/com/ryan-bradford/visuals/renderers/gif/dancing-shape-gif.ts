import { AbstractGifRenderer } from "./abstract-gif-renderer"

export class DancingShape extends AbstractGifRenderer {
    getFileName(frame: number): string {
        const frameNumber = frame >= 10 ? frame : "0" + frame;
        return `gif/square/frame_${frameNumber}_delay-0.04s.gif`
    }
    getBeatCount(): number {
        return 4;
    }

    getFramesInGif(): number {
        return 25;
    }

    isZeroBased(): boolean {
        return true;
    }
}
