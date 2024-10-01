import * as P5Class from "p5";
import * as test from "p5/lib/addons/p5.sound";
import { BeatAwareStack } from "./beats/beat-aware-stack";
import { MixxxAdapter } from "./midi/mixxx-adapter";
import { Renderer } from "./renderers/renderer";
import { LaunchpadMapping } from "./mapping/launchpad-mapping";

let p5Constructors: any = (window as any).p5;
let p5Instance: P5Class = window as any;

let isStarted = false;
let beats: BeatAwareStack = new BeatAwareStack();
let activeRenderer: Renderer;
let mixxxAdapter: MixxxAdapter;
let launchpadMapping: LaunchpadMapping;

export function setup() {
    p5Instance.createCanvas(
        window.innerWidth,
        window.innerHeight,
        p5Instance.WEBGL
    );
    // turn off the createGraphics layers stroke
    p5Instance.noStroke();

    mixxxAdapter = new MixxxAdapter(navigator, beats, p5Instance);
    launchpadMapping = new LaunchpadMapping(
        navigator,
        p5Instance,
        p5Constructors,
        (renderer) => {
            activeRenderer = renderer;
        },
        beats
    );
    launchpadMapping.init();
}

export function touchStarted() {
    if (isStarted == true) {
        return;
    }
    (p5Instance.getAudioContext() as AudioContext).resume();
    isStarted = true;
    mixxxAdapter.init();
    launchpadMapping.touchStarted();
}

export function draw() {
    if (isStarted === false) {
        return;
    }
    // Pulse white on the beat, then fade out with an inverse cube curve
    let percent = beats.getPercentThroughMeasure(activeRenderer.getBeatCount(), p5Instance.millis());
    let lastBeat = beats.getLastBeat(p5Instance.millis());
    p5Instance.clear(undefined, undefined, undefined, undefined);
    activeRenderer.render(percent, lastBeat, beats.getBpm());
}
