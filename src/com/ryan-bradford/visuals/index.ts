import * as P5Class from "p5";
import * as test from "p5/lib/addons/p5.sound";
import { BeatAwareStack } from "./beats/beat-aware-stack";
import { MixxxAdapter } from "./midi/mixxx-adapter";
import { Renderer } from "./renderers/renderer";
import { LaunchpadMapping } from "./mapping/launchpad-mapping";
import { Filter } from "./filter/filter";

let p5Constructors: any = (window as any).p5;
let p5Instance: P5Class = window as any;

let isStarted = false;
let beats: BeatAwareStack = new BeatAwareStack();
let activeRenderer: Renderer;
let activeFilter: Filter;
let mixxxAdapter: MixxxAdapter;
let launchpadMapping: LaunchpadMapping;
let finishedInit = false;

export async function setup() {
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
        (filter) => {
            activeFilter = filter;
        },
        beats
    );
    await launchpadMapping.init();
    finishedInit = true;
}

export async function touchStarted() {
    if (isStarted == true || finishedInit == false) {
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
    let lastBeat = beats.getLastBeat(p5Instance.millis());
    p5Instance.clear(undefined, undefined, undefined, undefined);
    if (activeFilter) {
        let percent = beats.getPercentThroughMeasure(activeFilter.getBeatCount(), p5Instance.millis());
        activeFilter.render(percent, lastBeat, beats.getBpm());
    }
    if (activeRenderer) {
        let percent = beats.getPercentThroughMeasure(activeRenderer.getBeatCount(), p5Instance.millis());
        activeRenderer.render(percent, lastBeat, beats.getBpm());
    }
}
