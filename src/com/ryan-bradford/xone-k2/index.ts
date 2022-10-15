// eslint-disable-next-line no-var

import { Mixxx } from '../mixxx/mixxx';
import "../../../../node_modules/core-js/actual/map"
import "../../../../node_modules/core-js/actual/math"
import "../../../../node_modules/core-js/actual/number"
import "../../../../node_modules/core-js/actual/array"
import  * as Colors from "../util/color";
import { XoneK2 } from './xone-k2';
import { XoneK2Mapping } from './xone-k2-mapping';
import { engine, midi } from '../globals';

var mixxx: Mixxx = new Mixxx();
var xonek2: XoneK2 = new XoneK2();
var mapping: XoneK2Mapping = new XoneK2Mapping(xonek2, mixxx);

var MyXoneK2 =  {

    init: function(id: String, debugging: String) {
        xonek2.init();
        mapping.initMapping();

    },

    shutdown: function() {
        xonek2.shutdown();
        mapping.stopMapping();
     },

    midiSignal: function(channel: string, control: string, value: number, status: string, group: string) {
        var realControl = Number.parseInt(control);
        if (Number.parseInt(control) == 15 || Number.parseInt(control) == 12
            || Number.parseInt(control) == 13 || Number.parseInt(control) == 14) {
            if (Number.parseInt(status) == 155 || Number.parseInt(status) == 139) {
                realControl += 50;
            }
        }
        xonek2.midiControlChanged(realControl, value);
    }
}
if (module) {
    (module as any).exports = MyXoneK2;
}

var module = {};


/** Processes:
1. Button pressed -> do something in Mixxx
2. Mixxx changes output -> change a LED

----

Functions:
1. Play/pause
2. Queue button (blinking light when set)
5. Deck swapping
3. Slip loops
4. Toggle decks
6. Hot-cues + colors
13. Stop auto-unloop on normal mode

7. Rewind button
8. Beatjump??
9. Mute button with fade??
10. Slide BPM to track with pace
11. Toggle slip
12: Toggle loop colors based on slip

Xone K2;
4. Sync features

---
Broad Functionality:
1. Easy config A/B testing



**/