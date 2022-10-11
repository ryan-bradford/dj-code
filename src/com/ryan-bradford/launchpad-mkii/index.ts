// eslint-disable-next-line no-var

import { Mixxx } from '../mixxx/mixxx';
import { LaunchpadMkii } from './launchpad-mkii';
import "../../../../node_modules/core-js/actual/map"
import "../../../../node_modules/core-js/actual/math"
import "../../../../node_modules/core-js/actual/number"
import "../../../../node_modules/core-js/actual/array"
import { LaunchpadMapping } from './launchpad-mapping';

var mixxx: Mixxx = new Mixxx();
var launchpad: LaunchpadMkii = new LaunchpadMkii();
var mapping: LaunchpadMapping = new LaunchpadMapping(launchpad, mixxx);

var MyController =  {

    init: function(id: String, debugging: String) {
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
