// eslint-disable-next-line no-var

import { Mixxx } from '../mixxx/mixxx';
import { LaunchpadMkii } from './launchpad-mkii';
import "../../../../node_modules/core-js/actual/map"
import "../../../../node_modules/core-js/actual/math"
import "../../../../node_modules/core-js/actual/number"
import "../../../../node_modules/core-js/actual/array"
import { LaunchpadMapping } from './launchpad-mapping';
var led = 10;
import { engine } from "../globals";

var mixxx: Mixxx = new Mixxx();
var launchpad: LaunchpadMkii = new LaunchpadMkii();
var mapping: LaunchpadMapping = new LaunchpadMapping(launchpad, mixxx);
declare const print;

var MyController =  {

    init: function(id: String, debugging: String) {
        engine.log("initing");
        launchpad.init();
        mapping.initMapping();
    },

    shutdown: function() {
        launchpad.shutdown();
     },

    buttonPressed: function(channel: string, control: string, value: number, status: string, group: string) {
        launchpad.buttonPressed(Number.parseInt(control), value);
    }
}
if (module) {
    (module as any).exports = MyController;
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