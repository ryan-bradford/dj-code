// eslint-disable-next-line no-var

import { Mixxx } from '../mixxx/mixxx';

class MyController {

    static init(id, debugging) {
        for (var i = 1; i <= 400; i++) {
            midi.sendShortMsg(0x90, i, 0x00);
        }
        midi.sendShortMsg(0xB0, 0x68, 0x6f);
        midi.sendShortMsg(0x90, 0x4A, 0x6f);
        midi.sendShortMsg(0x90, 0x33, 0x6f);
    }

    static shutdown() {
        // turn off all LEDs
        for (var i = 1; i <= 40; i++) {
             midi.sendShortMsg(0x90, i, 0x00);
         }
     }

     static someButton(channel, control, value, status, group) {
        Mixxx.togglePlay();
    }
}

if (module) {
    module.exports = MyController;
}

var module = {};