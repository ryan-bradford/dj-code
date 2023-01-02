import { detectBpm, isValidRatio } from "./detect-beats";
import { FixedStack } from "../utils/fixed-stack";

export class BeatAwareStack {

    private beats: FixedStack<number> = new FixedStack(20);
    private currentBpm: number = 100;
    private lastValidBeats: FixedStack<number> = new FixedStack(1);

    registerBeat(time: number): BeatAwareStack {
        this.currentBpm = detectBpm(this.beats);
        let currentGap = this.getMillisBetweenBeats();
        if (this.lastValidBeats.length() == 0 || currentGap == 0) {
            this.lastValidBeats.push(time);
        } else {
            for (let i = 0; i < this.lastValidBeats.length(); i++) {
                let beat = this.lastValidBeats.getArray()[i];
                let gap = time - beat;
                if (gap < currentGap) {
                    continue;
                }
                if (isValidRatio(gap, currentGap)) {
                    this.lastValidBeats.push(time);
                    break;
                }
            }
        }
        this.beats.push(time);
        return this;
    }

    getLastBeat(currentTime: number): number {
        if (!this.beats.length() || !this.lastValidBeats.length()) {
            return 0;
        }
        let timeSinceLastBeat = currentTime - this.lastValidBeats.getLast();
        let currentGap = this.getMillisBetweenBeats();
        if (!currentGap) {
            return 0;
        }
        return this.lastValidBeats.getLast() + Math.floor(timeSinceLastBeat / currentGap) * currentGap;
    }

    getNextBeat(currentTime: number): number {
        return this.getLastBeat(currentTime) + this.getMillisBetweenBeats();
    }

    getBpm(): number {
        return this.currentBpm;
    }

    private getMillisBetweenBeats(): number {
        if (this.currentBpm == 0) {
            return 0;
        }
        return 60000 / this.currentBpm;
    }

}