// eslint-disable-next-line no-var

import { midi } from '../mixxx/globals';
import { Mixxx } from '../mixxx/mixxx';

var MyController =  {

    init: function(id: String, debugging: String) {
        for (var i = 1; i <= 400; i++) {
            midi.sendShortMsg(0x90, i, 0x00);
        }
        midi.sendShortMsg(0xB0, 0x68, 0x6f);
        midi.sendShortMsg(0x90, 0x4A, 0x6f);
        midi.sendShortMsg(0x90, 0x33, 0x6f);
    },

    shutdown: function() {
        // turn off all LEDs
        for (var i = 1; i <= 40; i++) {
             midi.sendShortMsg(0x90, i, 0x00);
         }
     },

    someButton: function(channel: String, control: String, value: number, status: String, group: String) {
        if (value === 127) {
            Mixxx.togglePlay();
        }
    }
}
if (module) {
    (module as any).exports = MyController;
}

var module = {};


// Processes:
// 1. Button pressed -> do something in Mixxx
// 2. Mixxx changes output -> change a LED