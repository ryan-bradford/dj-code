import { engine } from "../globals";
import { Connection } from "./engine";

// https://manual.mixxx.org/2.4/en/chapters/appendix/mixxx_controls.html#control-[QuickEffectRack1_[ChannelI]_Effect1]-enabled

const EFFECT_MAPPING = {
    1: {
        effect: "DISTORTION"
    },
    2: {
        effect: "ECHO"
    },
    3: {
        effect: "FILTER"
    },
}

export class Mixxx {

    private loopType: LoopType = LoopType.NORMAL;
    private rateTempShiftTimers = new Map<number, number>();
    private effectStatus = new Map<number, number | undefined>
    private brakeStatus = new Map<number, boolean>;

    private static LIBRARY_CHANNEL = "[Library]";
    private static MASTER_CHANNEL = "[Master]";

    initializeFilters() {
        this.effectStatus = new Map();
        for (var i = 1; i <= 4; i++) {
            engine.setValue("[QuickEffectRack1_" + this.buildChannelString(i) + ']', 'enabled', true);
            engine.setValue(`[QuickEffectRack1_${this.buildChannelString(i)}]`, 'loaded_chain_preset', 0);
            this.effectStatus.set(i, undefined);
        }
    }

    togglePlay(deck: number) {
        var channel = this.buildChannelString(deck);
        engine.setValue(channel, 'play', !engine.getValue(channel, 'play') as any as number)
    }

    breakTrack(deck: number) {
        engine.brake(deck, true, 1)
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

    getHotcueColor(deck: number, hotcueId: number): number {
        var channel = this.buildChannelString(deck);
        return engine.getParameter(channel, 'hotcue_' + hotcueId + '_color');
    }

    getHotcueEnabled(deck: number, hotcueId: number): number {
        var channel = this.buildChannelString(deck);
        return engine.getParameter(channel, 'hotcue_' + hotcueId + '_enabled');
    }

    subscribeToHotcueEnabled(deck: number, hotcueId: number, callback: (color: number) => void) {
        var channel = this.buildChannelString(deck);
        var conn = engine.makeConnection(channel, 'hotcue_' + hotcueId + '_enabled', callback);
        conn.trigger();
        return conn;
    }

    setFaderLevel(deck: number, level: number) {
        engine.setParameter(this.buildChannelString(deck), "volume", level);
    }

    setXEqLevel(deck: number, level: number, eq: number) {
        const activeEffect = this.effectStatus.get(deck);
        if (eq === 1 && activeEffect != undefined) {
            engine.setValue("[QuickEffectRack1_" + this.buildChannelString(deck) + ']', 'super1', level);
        } else {
            var variable = "[EqualizerRack1_" + this.buildChannelString(deck) + "_Effect1]";
            engine.setParameter(variable, "parameter" + eq, level);
        }
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

    toggleActiveEffect(deck: number, effectIndex: number): number | undefined {
        const current = this.effectStatus.get(deck);
        if (current === effectIndex) {
            effectIndex = null;
        }
        this.effectStatus.set(deck, effectIndex);
        if (effectIndex == null) {
            engine.setValue(`[QuickEffectRack1_${this.buildChannelString(deck)}]`, 'loaded_chain_preset', 0);
        } else {
            engine.setValue(`[QuickEffectRack1_${this.buildChannelString(deck)}]`, 'loaded_chain_preset', effectIndex);
        }
        return effectIndex;
    }

    getCurrentActiveFilter(deck: number): number | undefined {
        return this.effectStatus.get(deck);
    }

    toggleHeadphoneCueEnabled(deck: number) {
        engine.setParameter(this.buildChannelString(deck), "pfl",
            !engine.getParameter(this.buildChannelString(deck), "pfl") as any);
    }

    subscribeToHeadphoneCueEnabled(deck: number, callback: (isEnabled: boolean) => void): Connection {
        return engine.makeConnection(this.buildChannelString(deck), "pfl", callback);
    }

    isDeckPlaying(deck: number): boolean {
        return engine.getParameter(this.buildChannelString(deck), "play") as any;
    }

    beatjump(deck: number, size: number, direction: string) {
        engine.setParameter(this.buildChannelString(deck), "beatjump_" + size + "_" + direction, 1);
    }

    changeMasterVolume(direction: string) {
        return engine.setParameter(Mixxx.MASTER_CHANNEL, "gain_" + direction + "_small", 1) as any;
    }

    changeHeadphoneVolume(direction: string) {
        return engine.setParameter(Mixxx.MASTER_CHANNEL, "headGain_" + direction + "_small", 1) as any;
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
