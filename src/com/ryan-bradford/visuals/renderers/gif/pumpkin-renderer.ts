import { AbstractGifRenderer } from "./abstract-gif-renderer"

export class PumpkinRenderer extends AbstractGifRenderer {
    getFileName(frame: number): string {
        const frameNumber = frame >= 10 ? "0" + frame : "00" + frame;
        return `gif/pumpkin/ezgif-frame-${frameNumber}.jpg`
    }

    getBeatCount(): number {
        return 4;
    }

    getFramesInGif(): number {
        return 60;
    }
}