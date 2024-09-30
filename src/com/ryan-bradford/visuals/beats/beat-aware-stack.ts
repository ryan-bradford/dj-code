import { FixedStack } from "../utils/fixed-stack";

export class BeatAwareStack {

    private currentBpm: number;
    private lastValidBeats: FixedStack<number> = new FixedStack(1);
    private beatsThroughSixteen = 0;

    getPercentThroughMeasure(beatCount: number, currentTime: number): number {
        const percentThroughBeat = this.getPercentThroughBeat(currentTime);
        const remainingInMeasure = this.beatsThroughSixteen % beatCount;
        return (remainingInMeasure + percentThroughBeat) / beatCount;
    }

    getPercentThroughBeat(currentTime: number): number {
        return (currentTime - this.getLastBeat(currentTime)) / this.getMillisBetweenBeats();
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

    registerBeat(bpm: number, time: number) {
        this.currentBpm = bpm;
        if (this.lastValidBeats.isEmpty() || this.beatsThroughSixteen === 15) {
            this.beatsThroughSixteen = 0;
        } else {
            this.beatsThroughSixteen += 1;
        }
        this.lastValidBeats.push(time);
    }

    registerSixteenMarker(time: number) {
        if (this.lastValidBeats.isEmpty()) {
            this.beatsThroughSixteen = 0;
        } else if (this.getPercentThroughBeat(time) > 0.5) {
            this.beatsThroughSixteen = 1;
        } else {
            this.beatsThroughSixteen = 0;
        }
    }

    private getMillisBetweenBeats(): number {
        if (this.currentBpm == 0) {
            return 0;
        }
        return 60000 / this.currentBpm;
    }

}