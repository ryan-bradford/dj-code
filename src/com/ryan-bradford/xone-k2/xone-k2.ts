import { engine, midi } from '../globals';
import { ColorMapperType } from '../mixxx/color-mapper';
import * as Colors from "../util/color";

declare const ColorMapper: ColorMapperType;
declare const print;


export class XoneK2 {
    midiWatchers: Map<String, Map<number, (event: number) => void>> = new Map();
    subscriptionToMidiId: Map<number, String> = new Map();

    public colors = new ColorMapper({
        [Colors.BLACK]: -1,
        [Colors.RED]: 0,
        [Colors.ORANGE]: 36,
        [Colors.DARK_GREEN]: 72
    })

    init() {
        this.clearButtons();
        this.resetSubscriptions();
    }

    shutdown() {
        this.clearButtons();
        this.resetSubscriptions();
    }

    private clearButtons() {
        for (var x = 0; x < 4; x++) {
            for (var y = 0; y < 4; y++) {
                this.changeBottomButtonLightColor(x, y, Colors.BLACK);
                this.changeTopButtonLightColor(x, y, Colors.BLACK);
            }
        }
        this.changeExitSetupButtonColor(Colors.BLACK);
        this.changeLayerButtonColor(Colors.BLACK);
    }

    private resetSubscriptions() {
        this.midiWatchers = new Map();
        this.subscriptionToMidiId = new Map();
        for (var i = 0; i < 100; i++) {
            var midiObject = this.getMidiControl(i);
            if (midiObject) {
                this.midiWatchers.set(midiObject.toString(), new Map());
            }
        }
    }

    midiControlChanged(midiNumber: number, event: number) {
        var control = this.getMidiControl(midiNumber);
        this.midiWatchers.get(control.toString()).forEach(callback => {
            if (callback) {
                callback(event);
            }
        })
    }

    watchMidiControl(control: ControlInfo, callback: (event: number) => void): number {
        var subscriptionId = Math.random()
        this.midiWatchers.get(control.toString()).set(subscriptionId, callback);
        this.subscriptionToMidiId.set(subscriptionId, control.toString());
        return subscriptionId;
    }

    stopWatchingMidiControl(subscriptionId: number) {
        this.midiWatchers.get(this.subscriptionToMidiId.get(subscriptionId))
            .set(subscriptionId, undefined);
    }

    changeTopButtonLightColor(x: number, y: number, color: number) {
        this.changeButtonColor(y * 4 + x + 40, color);
    }

    changeBottomButtonLightColor(x: number, y: number, color: number) {
        this.changeButtonColor(y * 4 + x + 24, color);
    }

    changeLayerButtonColor(color: number) {
        if (color == Colors.RED) {
            midi.sendShortMsg(0x9B, 12, 0x0F);
        } else if (color == Colors.ORANGE) {
            midi.sendShortMsg(0x9B, 16, 0x0F);
        } else if (color == Colors.DARK_GREEN) {
            midi.sendShortMsg(0x9B, 20, 0x0F);
        } else if (color == Colors.BLACK) {
            midi.sendShortMsg(0x8B, 12, 0x0F);
        }
    }

    changeExitSetupButtonColor(color: number) {
        if (color == Colors.RED) {
            midi.sendShortMsg(0x9B, 15, 0x0F);
        } else if (color == Colors.ORANGE) {
            midi.sendShortMsg(0x9B, 19, 0x0F);
        } else if (color == Colors.DARK_GREEN) {
            midi.sendShortMsg(0x9B, 23, 0x0F);
        } else if (color == Colors.BLACK) {
            midi.sendShortMsg(0x8B, 15, 0x0F);
        }
    }

    private changeButtonColor(midiNumber: number, color: number) {
        if (color == Colors.BLACK) {
            midi.sendShortMsg(0x8B, midiNumber, 0x0F);
        } else {
            midi.sendShortMsg(0x9B, midiNumber + this.colors.getValueForNearestColor(color), 0x0F);
        }
    }

    private getMidiControl(midiNumber: number): ControlInfo {
        var midiInfo: ControlInfo;
        if (midiNumber == 21 || midiNumber == 20) {
            midiInfo = new ControlInfo(ControlType.ENCODER_BOTTOM_TURN, midiNumber - 20, 0);
            // Bottom Encoders
        } else if (midiNumber >= 24 && midiNumber <= 39) {
            midiInfo = new ControlInfo(ControlType.BUTTON_BOTTOM,
                (midiNumber - 24) % 4,
                Math.floor((midiNumber - 24) / 4));
            // Bottom Button
        } else if (midiNumber == 65) {
            midiInfo = new ControlInfo(ControlType.SETUP_BUTTON,
                0,
                0);
        } else if(midiNumber == 62) {
            midiInfo = new ControlInfo(ControlType.LAYER_BUTTON,
                0,
                0);
            // Very bottom button DUPE
        } else if (midiNumber >= 16 && midiNumber <= 19) {
            midiInfo = new ControlInfo(ControlType.FADER,
                midiNumber - 16,
                0);
            // Faders
        } else if (midiNumber >= 40 && midiNumber <= 51) {
            midiInfo = new ControlInfo(ControlType.BUTTON_TOP,
                (midiNumber - 40) % 4,
                Math.floor((midiNumber - 40) / 4));
            // Top buttoms
        } else if (midiNumber >= 4 && midiNumber <= 15) {
            midiInfo = new ControlInfo(ControlType.KNOB,
                (midiNumber - 4) % 4,
                2- Math.floor((midiNumber - 4) / 4));
            // Knobs
        } else if (midiNumber >= 0 && midiNumber <= 3) {
            midiInfo = new ControlInfo(ControlType.ENCODER_TOP_TURN,
                midiNumber,
                0);
            // Top encoders
        } else if (midiNumber == 63 || midiNumber == 64) {
            midiInfo = new ControlInfo(ControlType.ENCODER_BOTTOM_PRESS,
                midiNumber - 63,
                0);
        } else if (midiNumber >= 52 && midiNumber <= 55) {
            midiInfo = new ControlInfo(ControlType.ENCODER_TOP_PRESS,
                midiNumber - 52,
                0);
        }
        return midiInfo;
    }
}


export class ControlInfo {

    constructor(public type: ControlType, public x: number, public y: number) {

    }

    public toString(): String {
        return this.type + " " + this.x + " " + this.y;
    }
}

export enum ControlType {
    BUTTON_TOP,
    BUTTON_BOTTOM,
    KNOB,
    LAYER_BUTTON,
    SETUP_BUTTON,
    ENCODER_TOP_TURN,
    ENCODER_BOTTOM_TURN,
    ENCODER_TOP_PRESS,
    ENCODER_BOTTOM_PRESS,
    FADER,
}

export enum ButtonStatus {
    UNPRESSED = 0,
    PRESSED = 127
}