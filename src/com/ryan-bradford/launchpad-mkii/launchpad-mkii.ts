// Buttons are rows of 10 starting at 11
// Top row is 104 - 111

import { engine, midi } from '../globals';
import { ColorMapperType } from '../mixxx/color-mapper';
import * as Colors from "../util/color";

declare const ColorMapper: ColorMapperType;
declare const print;

export class LaunchpadMkii {

    buttonWatchers: Map<number, Map<number, (event: number) => void>> = new Map();
    subscriptionToMidiId: Map<number, number> = new Map();

    public colors = new ColorMapper({
        [Colors.BLACK]: 0,
        [Colors.ORANGE]: 10,
        [Colors.LIGHT_GREEN]: 21,
        [Colors.WHITE]: 3,
        [Colors.DARK_GREEN]: 27,
        [Colors.PURPLE]: 50,
        [Colors.PINK]: 57,
        [Colors.LIGHT_BLUE]: 78,
        [Colors.DARK_BLUE]: 67,
        [Colors.BROWN]: 83,
        [Colors.RED]: 5
    })

    init() {
        this.buttonWatchers = new Map();
        this.subscriptionToMidiId = new Map();
        for (var x = 0; x < 9; x++) {
            for (var y = 0; y < 9; y++) {
                this.changeButtonColor(x, y, Colors.BLACK);
                this.buttonWatchers.set(this.getButtonMidiId(x, y), new Map());
            }
        }
    }

    shutdown() {
        this.buttonWatchers = new Map();
        this.subscriptionToMidiId = new Map();
        for (var x = 0; x < 9; x++) {
            for (var y = 0; y < 9; y++) {
                this.changeButtonColor(x, y, Colors.BLACK);
            }
        }
    }

    buttonPressed(midiNumber: number, event: ButtonStatus) {
        this.buttonWatchers.get(midiNumber).forEach(callback => {
            if (callback) {
                callback(event);
            }
        })
    }

    watchButtonPressed(x: number, y: number, callback: (event: ButtonStatus) => void): number {
        var midiNumber = this.getButtonMidiId(x, y);
        var subscriptionId = Math.random()
        this.buttonWatchers.get(midiNumber).set(subscriptionId, callback);
        this.subscriptionToMidiId.set(subscriptionId, midiNumber);
        return subscriptionId;
    }

    stopWatchingButton(subscriptionId: number) {
        this.buttonWatchers.get(this.subscriptionToMidiId.get(subscriptionId))
            .set(subscriptionId, undefined);
    }

    changeButtonColor(x: number, y: number, color: number) {
        var midiNumber = this.getButtonMidiId(x, y);
        if (midiNumber >= 104) {
            midi.sendShortMsg(0xB0, this.getButtonMidiId(x, y), this.colors.getValueForNearestColor(color));
        } else {
            midi.sendShortMsg(0x90, this.getButtonMidiId(x, y), this.colors.getValueForNearestColor(color));
        }
    }

    /**
     * 0 indexed
     */
    private getButtonMidiId(x: number, y: number) {
        if (y === 8) {
            return 104 + x;
        } else {
            return  1 + x + (1 + y)*10;
        }
    }

    private getButtonX(midiNumber: number): [number, number] {
        if (midiNumber >= 104) {
            return [8, midiNumber - 104];
        } else {
            return [Math.floor(midiNumber / 10) - 1, midiNumber % 10 - 1];
        }
    }
}

export enum ButtonStatus {
    UNPRESSED = 0,
    PRESSED = 127
}

/*
104 -> 111
81
71
61
51
41
31 -> 39
21 -> 29
11 -> 19
*/
