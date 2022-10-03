import { engine } from "../globals";
import { Connection } from "./engine";

export class Mixxx {

    private loopType: LoopType = LoopType.NORMAL;

    togglePlay(deck: number) {
        var channel = this.buildChannelString(deck);
        engine.setValue(channel, 'play', !engine.getValue(channel, 'play') as any as number)
    }

    subscribeToPlayStatus(deck: number, callback: (status: PlayStatus) => void): Connection {
        var channel = this.buildChannelString(deck);
        var conn = engine.makeConnection(channel, "play", callback);
        conn.trigger();
        return conn;
    }

    touchCue(deck: number, buttonStatus: boolean) {
        var channel = this.buildChannelString(deck);
        engine.setValue(channel, 'cue_default', buttonStatus)
    }

    subscribeToCueStatus(deck: number, callback: (status: CueStatus) => void): Connection {
        var channel = this.buildChannelString(deck);
        var conn = engine.makeConnection(channel, "cue_indicator", callback);
        conn.trigger();
        return conn;
    }

    toggleBeatloop(deck: number, size: number, isDownPress: boolean) {
        var channel = this.buildChannelString(deck);
        if (this.loopType === LoopType.SLIP) {
            engine.setValue(channel, "slip_enabled", true);
            if (isDownPress) {
                engine.setValue(channel, 'beatloop_' + size + '_activate', isDownPress);
            } else {
                if (engine.getValue(channel, 'beatloop_' + size + '_enabled')) {
                    engine.setValue(channel, 'beatloop_' + size + '_toggle', 1);
                }
                engine.setValue(channel, "slip_enabled", false);
            }
        } else {
            if (isDownPress) {
                if (engine.getValue(channel, 'beatloop_' + size + '_enabled')) {
                    if (engine.getValue(channel, 'beatloop_' + size + '_enabled')) {
                        engine.setValue(channel, 'beatloop_' + size + '_toggle', 1);
                    }
                } else {
                    engine.setValue(channel, 'beatloop_' + size + '_activate', isDownPress);
                }
            }
        }
    }

    getLoopType(): LoopType {
        return this.loopType;
    }

    toggleLoopType() {
        if (this.loopType === LoopType.NORMAL) {
            this.loopType = LoopType.SLIP;
        } else {
            this.loopType = LoopType.NORMAL;
        }
    }

    subscribeToBeatloopStatus(deck: number, size: number, callback: (status: LoopStatus) => void) {
        var channel = this.buildChannelString(deck);
        var conn = engine.makeConnection(channel, 'beatloop_' + size + '_enabled', callback);
        conn.trigger();
        return conn;
    }

    toggleHotcue(deck: number, hotcueId: number, status: boolean) {
        var channel = this.buildChannelString(deck);
        engine.setValue(channel, "hotcue_" + hotcueId + "_activate", status);
    }

    subscribeToHotcueColor(deck: number, hotcueId: number, callback: (color: number) => void) {
        engine.log(deck + " " + hotcueId);
        var channel = this.buildChannelString(deck);
        var conn = engine.makeConnection(channel, 'hotcue_' + hotcueId + '_color', callback);
        conn.trigger();
        return conn;
    }

    private buildChannelString(deck: number): string {
        return "[Channel" + deck + "]";
    }
}

export enum LoopStatus {
    ENABLED = 1,
    DISABLED = 0
}

export enum PlayStatus {
    PAUSED = 0,
    PLAYING = 1
}

export enum CueStatus {
    UNSET = 0,
    SET = 1
}

export enum LoopType {
    SLIP,
    NORMAL
}