import { detectBpm, isValidRatio } from "./detect-beats";
import { FixedStack } from "../utils/fixed-stack";

export class BeatAwareStack {

    private currentBpm: number;
    private lastValidBeats: FixedStack<number> = new FixedStack(1);

    registerBeat(time: number): BeatAwareStack {
        this.lastValidBeats.push(time);
        return this;
    }

    getLastBeat(currentTime: number): number {
        return this.lastValidBeats.getLast();
    }

    getNextBeat(currentTime: number): number {
        return this.getLastBeat(currentTime) + this.getMillisBetweenBeats();
    }

    getBpm(): number {
        return this.currentBpm;
    }

    setBpm(bpm: number) {
        this.currentBpm = bpm;
    }

    private getMillisBetweenBeats(): number {
        if (this.currentBpm == 0) {
            return 0;
        }
        return 60000 / this.currentBpm;
    }

}