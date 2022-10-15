import { engine } from "../globals";
import { Connection } from "./engine";

export class Mixxx {

    private loopType: LoopType = LoopType.NORMAL;
    private rateTempShiftTimers = new Map<number, number>();

    private static LIBRARY_CHANNEL = "[Library]";

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
                    engine.setValue(channel, 'beatloop_' + size + '_toggle', 1);
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
        var channel = this.buildChannelString(deck);
        var conn = engine.makeConnection(channel, 'hotcue_' + hotcueId + '_color', callback);
        conn.trigger();
        return conn;
    }

    setFaderLevel(deck: number, level: number) {
        engine.setParameter(this.buildChannelString(deck), "volume", level);
    }

    setXEqLevel(deck: number, level: number, eq: number) {
        var variable = "[EqualizerRack1_" + this.buildChannelString(deck) + "_Effect1]";
        engine.setParameter(variable, "parameter" + eq, level);
    }

    isSyncEnabledOnDeck(deck: number): boolean {
        return engine.getParameter(this.buildChannelString(deck), "sync_mode") === 1 ||
            engine.getParameter(this.buildChannelString(deck), "sync_mode") === 2;
    }

    getDeckCurrentBpm(deck: number): number {
        return engine.getParameter(this.buildChannelString(deck), "visual_bpm");
    }

    getDeckOriginalBpm(deck: number): number {
        return engine.getParameter(this.buildChannelString(deck), "file_bpm");
    }

    setDeckToDefaultBpm(deck: number) {
        engine.setParameter(this.buildChannelString(deck), "rate_set_default", 1);
    }

    enableSyncOnDeck(deck: number) {
        engine.setParameter(this.buildChannelString(deck), "sync_enabled", 1);
    }

    subscribeToSyncMode(deck: number, callback: (mode: number) => void) {
        var channel = this.buildChannelString(deck);
        var conn = engine.makeConnection(channel, 'sync_mode', callback);
        conn.trigger();
        return conn;
    }

    changeDeckRateSmall(deck: number, direction: string) {
        engine.setParameter(this.buildChannelString(deck), "bpm_" + direction + "_small", 1);
    }

    tempBeatShiftDirection(deck: number, direction: string) {
        engine.stopTimer(this.rateTempShiftTimers.get(deck));
        engine.setParameter(this.buildChannelString(deck), "rate_temp_" + direction, 1);
        this.rateTempShiftTimers.set(deck, engine.beginTimer(500, () => {
            engine.setParameter(this.buildChannelString(deck), "rate_temp_up", 0);
            engine.setParameter(this.buildChannelString(deck), "rate_temp_down", 0);
        }));
    }

    toggleKeyLock(deck: number) {
        engine.setParameter(this.buildChannelString(deck), "keylock", !engine.getParameter(this.buildChannelString(deck), "keylock") as any);
    }

    subscribeToKeylock(deck: number, callback: (isEnabled: boolean) => void) {
        var channel = this.buildChannelString(deck);
        var conn = engine.makeConnection(channel, 'keylock', callback);
        conn.trigger();
        return conn;
    }

    openFolder() {
        engine.setValue(Mixxx.LIBRARY_CHANNEL, "MoveRight", 1);
    }

    closeFolder() {
        engine.setValue(Mixxx.LIBRARY_CHANNEL, "MoveLeft", 1);
        engine.setValue(Mixxx.LIBRARY_CHANNEL, "MoveLeft", 1);
    }

    navigateLibraryDirection(direction: number) {
        engine.setValue(Mixxx.LIBRARY_CHANNEL, "MoveVertical", direction);
    }

    moveFocusDirection(direction: number) {
        engine.setValue(Mixxx.LIBRARY_CHANNEL, "MoveFocus", direction);
    }

    loadTrack(deck: number) {
        engine.setParameter(this.buildChannelString(deck), "LoadSelectedTrack", 1);
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