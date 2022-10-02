import { engine } from "../globals";
import { Connection } from "../mixxx/engine";
import { CueStatus, LoopStatus, LoopType, Mixxx, PlayStatus } from "../mixxx/mixxx";
import  * as Colors from "../util/color";
import { ButtonStatus, LaunchpadMkii } from "./launchpad-mkii";

export class LaunchpadMapping {

    private leftMixxxSubscriptions: Array<Connection> = new Array();
    private leftButtonSubscriptions: Array<number> = new Array();

    private rightMixxxSubscriptions: Array<Connection> = new Array();
    private rightButtonSubscriptions: Array<number> = new Array();

    private globalButtonSubscription: Array<number> = new Array();

    constructor(private launchpad: LaunchpadMkii, private mixxx: Mixxx) { }

    initMapping() {
        this.configureDeckMapping(1);
        this.configureDeckMapping(2);
        this.globalButtonSubscription.forEach(sub => this.launchpad.stopWatchingButton(sub));
        this.globalButtonSubscription = new Array();
        this.configureForBeatloopToggleButton();
    }

    private configureDeckMapping(deckNumber: number) {
        var xOffset = 0;
        if (deckNumber === 2 || deckNumber === 4) {
            xOffset += 4;
            this.rightMixxxSubscriptions.forEach(subscription => subscription.disconnect());
            this.rightButtonSubscriptions.forEach(subscription => this.launchpad.stopWatchingButton(subscription))
        }
        if (deckNumber === 1 || deckNumber === 3) {
            this.leftMixxxSubscriptions.forEach(subscription => subscription.disconnect());
            this.leftButtonSubscriptions.forEach(subscription => this.launchpad.stopWatchingButton(subscription))
        }

        this.configurePlayButton(xOffset, deckNumber);
        this.configureCueButton(xOffset, deckNumber);
        this.configureForAllBeatloopButtons(xOffset, deckNumber);
    }

    private configurePlayButton(xOffset: number, deck: number) {
        var launchpadSubscription = this.launchpad.watchButtonPressed(xOffset, 0, (event) => {
            if (event === ButtonStatus.PRESSED) {
                this.mixxx.togglePlay(deck);
            }
        });
        var mixxSubscription = this.mixxx.subscribeToPlayStatus(deck, (status) => {
            if (status === PlayStatus.PAUSED) {
                this.launchpad.changeButtonColor(xOffset, 0, Colors.BLACK)
            } else {
                this.launchpad.changeButtonColor(xOffset, 0, Colors.ORANGE)
            }
        })
        this.trackSubscriptions(launchpadSubscription, mixxSubscription, deck);
    }

    private configureCueButton(xOffset: number, deck: number) {
        var launchpadSubscription = this.launchpad.watchButtonPressed(xOffset + 1, 0, (event) => {
            engine.log("Cue Pressed");
            this.mixxx.touchCue(deck, event == ButtonStatus.PRESSED);
        });
        var mixxSubscription = this.mixxx.subscribeToCueStatus(deck, (status) => {
            if (status === CueStatus.UNSET) {
                this.launchpad.changeButtonColor(xOffset + 1, 0, Colors.BLACK)
            } else {
                this.launchpad.changeButtonColor(xOffset + 1, 0, Colors.ORANGE)
            }
        })
        this.trackSubscriptions(launchpadSubscription, mixxSubscription, deck);
    }

    private configureForAllBeatloopButtons(xOffset, deck: number) {
        var baseLoop = 0.125;
        var loopRow1 = [baseLoop, baseLoop * 2, baseLoop * 4, baseLoop*8];
        var loopRow2 = [ baseLoop * 16,  baseLoop * 32,  baseLoop * 64,  baseLoop * 128];
        for (var x = 0; x < loopRow1.length; x++) {
            this.configureForBeatloopButton(x + xOffset, 1, loopRow1[x], deck);
        }
        for (var x = 0; x < loopRow2.length; x++) {
            this.configureForBeatloopButton(x + xOffset, 2, loopRow2[x], deck);
        }
    }

    private configureForBeatloopButton(x, y: number, size: number, deck: number) {
        var launchpadSubscription = this.launchpad.watchButtonPressed(x, y, (event) => {
            this.mixxx.toggleBeatloop(deck, size, event === ButtonStatus.PRESSED);
        });
        var mixxSubscription = this.mixxx.subscribeToBeatloopStatus(deck, size, (status) => {
            if (status === LoopStatus.ENABLED) {
                this.launchpad.changeButtonColor(x, y, Colors.ORANGE)
            } else {
                this.launchpad.changeButtonColor(x, y, Colors.BLACK)
            }
        })
        this.trackSubscriptions(launchpadSubscription, mixxSubscription, deck);
    }

    private configureForBeatloopToggleButton() {
        var launchpadSubscription = this.launchpad.watchButtonPressed(8, 0, (event) => {
            if (event === ButtonStatus.PRESSED) {
                this.mixxx.toggleLoopType();
            }
            if (this.mixxx.getLoopType() === LoopType.SLIP) {
                this.launchpad.changeButtonColor(8, 0, Colors.ORANGE);
            } else {
                this.launchpad.changeButtonColor(8, 0, Colors.BLACK);
            }
        });
        this.globalButtonSubscription.push(launchpadSubscription);
    }

    private trackSubscriptions(launchpadSubscription: number, mixxxSubscription: Connection, deck: number) {
        if (deck === 1 || deck === 3) {
            if (launchpadSubscription) {
                this.leftButtonSubscriptions.push(launchpadSubscription);
            }
            if (mixxxSubscription) {
                this.leftMixxxSubscriptions.push(mixxxSubscription);
            }
        } else {
            if (launchpadSubscription) {
                this.rightButtonSubscriptions.push(launchpadSubscription);
            }
            if (mixxxSubscription) {
                this.rightMixxxSubscriptions.push(mixxxSubscription);
            }
        }
    }

}