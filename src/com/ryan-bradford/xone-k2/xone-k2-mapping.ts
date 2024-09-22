import { engine } from "../globals";
import { Connection } from "../mixxx/engine";
import { Mixxx } from "../mixxx/mixxx"
import { ButtonStatus, ControlInfo, ControlType, EncoderPress, EncoderTurn, XoneK2 } from "./xone-k2"
import * as Colors from "../util/color";

export class XoneK2Mapping {

    private mixxxSubscriptions: Array<Connection> = new Array();
    private midiSubscriptions: Array<number> = new Array();

    private bpmSliderTimer;
    private bpmSliderTimerCount = 0;

    initMapping() {
        for (var i = 1; i <= 4; i++) {
            this.configureDeckMapping(i);
        }
        this.configureForTrackSelector();
    }

    stopMapping() {
        if (this.bpmSliderTimer) {
            engine.stopTimer(this.bpmSliderTimer);
        }
    }

    constructor(private xonek2: XoneK2, private mixxx: Mixxx) {

    }

    private configureDeckMapping(deck: number) {
        this.configureFaderMapping(deck);
        this.configureXEqMapping(deck, 1);
        this.configureXEqMapping(deck, 2);
        this.configureXEqMapping(deck, 3);
        this.configureForSyncMapping(deck);
        this.xonek2.changeTopButtonLightColor(this.getXFromDeck(deck), 1, Colors.DARK_GREEN);
        this.configureForTempTempoChange(deck);
        this.configureForKeylock(deck);
        this.configureForHeadphoneCueMapping(deck);
        this.configureForEffectMapping(deck);
    }

    private configureFaderMapping(deck: number) {
        var control = new ControlInfo(ControlType.FADER, this.getXFromDeck(deck), 0);
        var xoneK2Subscription = this.xonek2.watchMidiControl(control, (event) => {
            this.mixxx.setFaderLevel(deck, event / 127);
        });
        this.midiSubscriptions.push(xoneK2Subscription);
    }

    private configureXEqMapping(deck: number, eq: number) {
        var control = new ControlInfo(ControlType.KNOB, this.getXFromDeck(deck), eq - 1);
        var xoneK2Subscription = this.xonek2.watchMidiControl(control, (event) => {
            this.mixxx.setXEqLevel(deck, event / 127, eq);
        });
        this.midiSubscriptions.push(xoneK2Subscription);
    }

    private configureForSyncMapping(deck: number) {
        var control = new ControlInfo(ControlType.BUTTON_TOP, this.getXFromDeck(deck), 1);
        var xoneK2Subscription = this.xonek2.watchMidiControl(control, (event) => {
            if (event == 127) {
                if (this.mixxx.isSyncEnabledOnDeck(deck)) {
                    this.shiftTrackBpm(deck);
                } else {
                    this.mixxx.enableSyncOnDeck(deck);
                }
            }
        });

        var mixxxSubscriptions = this.mixxx.subscribeToSyncMode(deck, (mode) => {
            if (mode === 0) {
                this.xonek2.changeTopButtonLightColor(this.getXFromDeck(deck), 1, Colors.DARK_GREEN);
            } else if (mode === 1) {
                this.xonek2.changeTopButtonLightColor(this.getXFromDeck(deck), 1, Colors.RED);
            } else if (mode === 2) {
                this.xonek2.changeTopButtonLightColor(this.getXFromDeck(deck), 1, Colors.ORANGE);
            }
        })
        this.midiSubscriptions.push(xoneK2Subscription);
        this.mixxxSubscriptions.push(mixxxSubscriptions);
    }

    private shiftTrackBpm(deck: number) {
        const currentBpm = this.mixxx.getDeckCurrentBpm(deck);
        const originalBpm = this.mixxx.getDeckOriginalBpm(deck);
        const percentDiff = (originalBpm - currentBpm) / currentBpm;
        if (!this.checkForBpmShiftCompletion(deck)) {
            var direction: string;
            if (percentDiff < 0) {
                direction = "down";
            } else {
                direction = "up";
            }
            var desiredTimeInBars = 128 / Math.pow(2, this.bpmSliderTimerCount);
            var desiredTime = desiredTimeInBars / originalBpm * 60;
            var neededIntervals = Math.abs(Math.round(currentBpm - originalBpm) / 0.1);
            if (this.bpmSliderTimer) {
                engine.stopTimer(this.bpmSliderTimer);
            }
            this.bpmSliderTimer = engine.beginTimer(desiredTime / neededIntervals * 1000, () => {
                if (this.checkForBpmShiftCompletion(deck)) {
                    return;
                }
                this.mixxx.changeDeckRateSmall(deck, direction);
            });
            this.bpmSliderTimerCount++;
        }
    }

    private checkForBpmShiftCompletion(deck: number): boolean {
        const currentBpm = this.mixxx.getDeckCurrentBpm(deck);
        const originalBpm = this.mixxx.getDeckOriginalBpm(deck);
        const percentDiff = (originalBpm - currentBpm) / currentBpm;
        const absolutePercentDiff = Math.abs(percentDiff);
        if (absolutePercentDiff < 0.01) {
            this.mixxx.setDeckToDefaultBpm(deck);
            if (this.bpmSliderTimer) {
                engine.stopTimer(this.bpmSliderTimer);
            }
            this.bpmSliderTimer = undefined;
            this.bpmSliderTimerCount = 0;
            return true;
        }
        return false;
    }

    private configureForKeylock(deck: number) {
        var button = new ControlInfo(ControlType.BUTTON_TOP, this.getXFromDeck(deck), 2);
        const xonek2Subscription = this.xonek2.watchMidiControl(button, (value) => {
            if (value === 127) {
                this.mixxx.toggleKeyLock(deck);
            }
        })
        const mixxxSubscriptions = this.mixxx.subscribeToKeylock(deck, (isEnabled) => {
            if (isEnabled) {
                this.xonek2.changeTopButtonLightColor(this.getXFromDeck(deck), 2, Colors.RED);
            } else {
                this.xonek2.changeTopButtonLightColor(this.getXFromDeck(deck), 2, Colors.DARK_GREEN);
            }
        })
        this.midiSubscriptions.push(xonek2Subscription);
        this.mixxxSubscriptions.push(mixxxSubscriptions);
    }

    private configureForTempTempoChange(deck: number) {
        var encoderTurn = new ControlInfo(ControlType.ENCODER_TOP_TURN, this.getXFromDeck(deck), 0);
        const xonek2Subscription = this.xonek2.watchMidiControl(encoderTurn, (value: EncoderTurn) => {
            var speedDirection;
            var jumpDirection;
            if (value === EncoderTurn.CLOCKWISE) {
                speedDirection = "up";
                jumpDirection = "forward";
            } else if (value === EncoderTurn.COUNTER_CLOCKWISE) {
                speedDirection = "down";
                jumpDirection = "backward";
            }
            if (this.mixxx.isDeckPlaying(deck)) {
                this.mixxx.tempBeatShiftDirection(deck, speedDirection);
            } else {
                this.mixxx.beatjump(deck, 1, jumpDirection);
            }
        })
        this.midiSubscriptions.push(xonek2Subscription);
    }


    private configureForTrackSelector() {
        var encoderLeftTurn = new ControlInfo(ControlType.ENCODER_BOTTOM_TURN, 0, 0);
        var encoderLeftPress = new ControlInfo(ControlType.ENCODER_BOTTOM_PRESS, 0, 0);
        var encoderRightTurn = new ControlInfo(ControlType.ENCODER_BOTTOM_TURN, 1, 0);
        var encoderRightPress = new ControlInfo(ControlType.ENCODER_BOTTOM_PRESS, 1, 0);
        var rightDoublePressTimer: number = undefined;
        this.midiSubscriptions.push(this.xonek2.watchMidiControl(encoderLeftPress, (event: EncoderPress) => {
        }));
        this.midiSubscriptions.push(this.xonek2.watchMidiControl(encoderLeftTurn, (event: EncoderTurn) => {
            if (event === EncoderTurn.CLOCKWISE) {
                this.mixxx.moveFocusDirection(1);
            } else {
                this.mixxx.moveFocusDirection(-1);
            }
        }));
        this.midiSubscriptions.push(this.xonek2.watchMidiControl(encoderRightPress, (event: EncoderPress) => {
            if (event === EncoderPress.PRESS_DOWN) {
                if (rightDoublePressTimer) {
                    engine.stopTimer(rightDoublePressTimer);
                    rightDoublePressTimer = undefined;
                    this.mixxx.closeFolder();
                    return;
                }
                rightDoublePressTimer = engine.beginTimer(500, () => {
                    rightDoublePressTimer = undefined;
                    this.mixxx.openFolder();
                }, 1)
            }
        }));
        this.midiSubscriptions.push(this.xonek2.watchMidiControl(encoderRightTurn, (event: EncoderTurn) => {
            if (event === EncoderTurn.CLOCKWISE) {
                this.mixxx.navigateLibraryDirection(1);
            } else {
                this.mixxx.navigateLibraryDirection(-1);
            }
        }));

        for (let deck = 1; deck <= 4; deck++) {
            this.xonek2.changeBottomButtonLightColor(this.getXFromDeck(deck), 0, Colors.DARK_GREEN);
            var buttonControl = new ControlInfo(ControlType.BUTTON_BOTTOM, this.getXFromDeck(deck), 0);
            this.midiSubscriptions.push(this.xonek2.watchMidiControl(buttonControl, (event: ButtonStatus) => {
                if (event === ButtonStatus.PRESSED) {
                    this.mixxx.loadTrack(deck);
                    this.xonek2.changeBottomButtonLightColor(this.getXFromDeck(deck), 0, Colors.RED);
                    engine.beginTimer(1000, () => {
                        this.xonek2.changeBottomButtonLightColor(this.getXFromDeck(deck), 0, Colors.DARK_GREEN);
                    }, 1)
                }
            }))
        }
    }

    private configureForHeadphoneCueMapping(deck: number) {
        var button = new ControlInfo(ControlType.BUTTON_TOP, this.getXFromDeck(deck), 0);
        const xonek2Subscription = this.xonek2.watchMidiControl(button, (value) => {
            if (value === 127) {
                this.mixxx.toggleHeadphoneCueEnabled(deck);
            }
        })
        this.xonek2.changeTopButtonLightColor(this.getXFromDeck(deck), 0, Colors.DARK_GREEN);
        const mixxxSubscriptions = this.mixxx.subscribeToHeadphoneCueEnabled(deck, (isEnabled) => {
            if (isEnabled) {
                this.xonek2.changeTopButtonLightColor(this.getXFromDeck(deck), 0, Colors.RED);
            } else {
                this.xonek2.changeTopButtonLightColor(this.getXFromDeck(deck), 0, Colors.DARK_GREEN);
            }
        })
        this.midiSubscriptions.push(xonek2Subscription);
        this.mixxxSubscriptions.push(mixxxSubscriptions);
    }

    private configureForEffectMapping(deck: number) {
        // For all 3 filters, setup filter bindings
    }

    private configureForEffect(deck: number, effectIndex: number) {
        // Turn light to green
        // Watch button
            // When button is pressed, update filter
        // Watch filter status
            // When filter status changes, update the button color
    }

    private getXFromDeck(deck: number) {
        if (deck == 1) {
            return 1;
        } else if (deck == 2) {
            return 2;
        } else if (deck == 3) {
            return 0;
        } else if (deck == 4) {
            return 3;
        }
    }
}