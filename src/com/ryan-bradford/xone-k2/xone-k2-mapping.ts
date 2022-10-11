import { engine } from "../globals";
import { Connection } from "../mixxx/engine";
import { Mixxx } from "../mixxx/mixxx"
import { ControlInfo, ControlType, XoneK2 } from "./xone-k2"
import * as Colors from "../util/color";

export class XoneK2Mapping {

    private mixxxSubscriptions: Array<Connection> = new Array();
    private midiSubscriptions: Array<number> = new Array();

    initMapping() {
        for (var i = 1; i <= 4; i++) {
            this.configureDeckMapping(i);
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
            if (event == 0) {
                this.xonek2.changeTopButtonLightColor(this.getXFromDeck(1), 1, Colors.RED);
                this.xonek2.changeTopButtonLightColor(this.getXFromDeck(2), 1, Colors.RED);
                this.xonek2.changeTopButtonLightColor(this.getXFromDeck(3), 1, Colors.RED);
                this.xonek2.changeTopButtonLightColor(this.getXFromDeck(4), 1, Colors.RED);
                this.xonek2.changeTopButtonLightColor(this.getXFromDeck(deck), 1, Colors.ORANGE);
                this.mixxx.setDeckMasterSync(deck);
            }
        });
        this.midiSubscriptions.push(xoneK2Subscription);
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