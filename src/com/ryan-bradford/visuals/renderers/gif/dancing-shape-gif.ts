import { AbstractGifRenderer } from "./abstract-gif-renderer"

export class DancingShape extends AbstractGifRenderer {
    getGifPath(): string {
       return "gif/square/"
    }
    getIntervalLength(): number {
        return 4;
    }

    getFramesInGif(): number {
        return 25;
    }
}