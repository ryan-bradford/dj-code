'use strict';

class FixedStack {
    constructor(targetLength, array) {
        this.targetLength = targetLength;
        if (!targetLength && !array) {
            throw "BAD";
        }
        this.array = array ? array : [];
    }
    [Symbol.iterator]() {
        return this.array[Symbol.iterator]();
    }
    push(t) {
        this.array.push(t);
        if (this.array.length > this.targetLength) {
            this.array = this.array.slice(1, this.targetLength + 1);
        }
    }
    forEach(callback) {
        this.array.forEach(callback);
    }
    length() {
        return this.array.length;
    }
    getArray() {
        return this.array;
    }
    getLast() {
        if (!this.array.length) {
            return undefined;
        }
        return this.getTopN(1)[0];
    }
    getTopN(toGet) {
        return this.array.slice(this.array.length - toGet, this.array.length);
    }
}

class BeatAwareStack {
    constructor() {
        this.lastValidBeats = new FixedStack(1);
    }
    registerBeat(time) {
        this.lastValidBeats.push(time);
        return this;
    }
    getLastBeat(currentTime) {
        return this.lastValidBeats.getLast();
    }
    getNextBeat(currentTime) {
        return this.getLastBeat(currentTime) + this.getMillisBetweenBeats();
    }
    getBpm() {
        return this.currentBpm;
    }
    setBpm(bpm) {
        this.currentBpm = bpm;
    }
    getMillisBetweenBeats() {
        if (this.currentBpm == 0) {
            return 0;
        }
        return 60000 / this.currentBpm;
    }
}

class MixxxAdapter {
    constructor(navigator, beats, p5Instance) {
        this.navigator = navigator;
        this.beats = beats;
        this.p5Instance = p5Instance;
    }
    init() {
        this.navigator.requestMIDIAccess().then((midi) => this.requestMIDIAccessSuccess(midi), () => this.onMIDIFailure());
    }
    requestMIDIAccessSuccess(midi) {
        var inputs = midi.inputs.values();
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            let midiInput = input.value;
            if (!midiInput.name.toLowerCase().includes("port 0")) {
                continue;
            }
            midiInput.onmidimessage = (message) => this.getMIDIMessage(message);
        }
        midi.onstatechange = (state) => this.midiOnStateChange(state);
    }
    getMIDIMessage(midiMessage) {
        if (midiMessage.data[1] == 52) {
            this.beats.registerBeat(this.p5Instance.millis());
            this.beats.setBpm(midiMessage.data[2] + 50);
        }
    }
    midiOnStateChange(state) {
    }
    onMIDIFailure() {
        console.error('Could not access your MIDI devices.');
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const LaunchpadColor = {
    RED: 5,
    WHITE: 3,
    GREEN: 21,
    LIGHT_BLUE: 37,
    PINK: 57,
    LIGHT_ORANGE: 60,
    ORANGE: 9,
    YELLOW: 124
};
class LaunchpadAdapter {
    constructor(navigator) {
        this.navigator = navigator;
        this.callbacks = new Map();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const midi = yield this.navigator.requestMIDIAccess({ sysex: true });
            this.requestMIDIAccessSuccess(midi);
        });
    }
    requestMIDIAccessSuccess(midi) {
        midi.inputs.forEach(midiInput => {
            if (!midiInput.name.toLowerCase().includes("mk3 mi")) {
                return;
            }
            console.log('midi input', midiInput);
            midiInput.onmidimessage = (message) => this.getMIDIMessage(message);
        });
        midi.outputs.forEach(output => {
            if (!output.name.toLowerCase().includes("mk3 mi")) {
                return;
            }
            this.output = output;
            output.send([240, 0, 32, 41, 2, 13, 14, 1, 247]);
            for (var x = 0; x < 10; x++) {
                for (var y = 0; y < 10; y++) {
                    output.send([0x90, this.getButtonMidiId(x, y), 0]);
                }
            }
            // output.send([0x90, this.getButtonMidiId(5, 5), 5]);
        });
        midi.onstatechange = (state) => this.midiOnStateChange(state);
    }
    getMIDIMessage(midiMessage) {
        console.log(midiMessage);
        const midiKey = midiMessage.data[1];
        const isPress = midiMessage.data[2] === 127;
        if (isPress && this.callbacks.has(midiKey)) {
            this.callbacks.get(midiKey)();
        }
    }
    midiOnStateChange(state) {
        console.log(state);
    }
    subscribeMidiPressed(x, y, callback) {
        this.callbacks.set(this.getButtonMidiId(x, y), callback);
    }
    changeMidiColor(x, y, color) {
        this.output.send([0x90, this.getButtonMidiId(x, y), color]);
    }
    onMIDIFailure() {
        console.log('Could not access your MIDI devices.');
    }
    getButtonMidiId(x, y) {
        if (y === 8) {
            return 104 + x;
        }
        else {
            return 1 + x + (1 + y) * 10;
        }
    }
    getButtonX(midiNumber) {
        if (midiNumber >= 104) {
            return [8, midiNumber - 104];
        }
        else {
            return [Math.floor(midiNumber / 10) - 1, midiNumber % 10 - 1];
        }
    }
}

class AbstractShaderRenderer {
    constructor(p5) {
        this.p5 = p5;
        this.lastPeakBeat = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.lastFrame = 0;
        this.currentDirectionX = 2 * Math.random() - 1;
        this.currentDirectionY = 2 * Math.random() - 1;
        this.frameDirection = 1;
    }
    getNextFrameDirection(direction) {
        return direction * -1;
    }
    reset() {
    }
    render(lastBeat, nextBeat, bpm) {
        this.detectBeats(lastBeat, bpm);
        const intervalLength = 60000 / bpm * this.getIntervalLength();
        const traveledTime = this.p5.millis() - this.lastPeakBeat;
        const percent = traveledTime / intervalLength;
        let scaledValue = Math.abs(Math.sin(percent * Math.PI)) || 0;
        scaledValue = Math.max(scaledValue, .1);
        // instead of just setting the active shader we are passing it to the createGraphics layer
        this.p5.shader(this.getShader());
        // here we're using setUniform() to send our uniform values to the shader
        this.lastFrame += this.frameDirection * scaledValue * this.getFrameScaleValue();
        this.lastX += this.currentDirectionX * this.getMouseScaleValue() * scaledValue;
        this.lastY += this.currentDirectionY * this.getMouseScaleValue() * scaledValue;
        this.getShader().setUniform("iMouse", [this.lastX, this.lastY]);
        this.getShader().setUniform("iFrame", this.lastFrame);
        this.getShader().setUniform("iTime", this.lastFrame);
        this.getShader().setUniform("iResolution", [this.p5.width, this.p5.height]);
        // rect gives us some geometry on the screen
        this.p5.rect(0, 0, this.p5.width, this.p5.height);
    }
    detectBeats(lastBeat, bpm) {
        const intervalLength = 60000 / bpm * this.getIntervalLength();
        const realTraveledTime = lastBeat - this.lastPeakBeat;
        const realPercent = realTraveledTime / intervalLength;
        if (realPercent > this.getGoalPercentOff()) {
            if (lastBeat - this.lastPeakBeat > intervalLength + 100) {
                console.log("WOAH!");
            }
            this.lastPeakBeat = this.p5.millis();
            this.currentDirectionX = 2 * Math.random() - 1;
            this.currentDirectionY = 2 * Math.random() - 1;
            this.frameDirection = this.getNextFrameDirection(this.frameDirection);
        }
    }
    getGoalPercentOff() {
        return 1 - .2 / this.getIntervalLength();
    }
}

class HypercolorRenderer extends AbstractShaderRenderer {
    constructor(p5, p5Constructors) {
        super(p5);
        this.p5Constructors = p5Constructors;
    }
    initialize() {
        this.shader = this.p5.loadShader("shaders/hypercolor.vert", "shaders/hypercolor.frag");
    }
    getShader() {
        return this.shader;
    }
    getIntervalLength() {
        return 1;
    }
    getMouseScaleValue() {
        return 1;
    }
    getFrameScaleValue() {
        return 4;
    }
}

class CloudsRenderer extends AbstractShaderRenderer {
    constructor(p5, p5Constructors) {
        super(p5);
        this.p5Constructors = p5Constructors;
    }
    initialize() {
        this.shader = this.p5.loadShader("shaders/hypercolor.vert", "shaders/clouds.frag");
    }
    getShader() {
        return this.shader;
    }
    getIntervalLength() {
        return 1;
    }
    getMouseScaleValue() {
        return 0;
    }
    getFrameScaleValue() {
        return 0.1;
    }
    getNextFrameDirection() {
        return 1;
    }
}

class AbstractGifRenderer {
    constructor(p5) {
        this.p5 = p5;
        this.lastPeakBeat = 0;
    }
    reset() {
    }
    initialize() {
        this.images = new Map();
        Array(this.getFramesInGif()).fill(1).map((_, i) => i).forEach(i => {
            const frameNumber = i >= 10 ? i : "0" + i;
            this.p5.loadImage(this.getGifPath() + `frame_${frameNumber}_delay-0.04s.gif`, (loaded) => {
                loaded.resize(this.p5.width, this.p5.height);
                this.images.set(i, loaded);
            });
        });
    }
    render(lastBeat, nextBeat, bpm) {
        if (isNaN(bpm)) {
            bpm = 128;
        }
        this.detectBeats(lastBeat, bpm);
        const intervalLength = 60000 / bpm * this.getIntervalLength();
        const traveledTime = this.p5.millis() - this.lastPeakBeat;
        let percent = (traveledTime / intervalLength) % 1;
        const frame = Math.min(Math.round(percent * this.getFramesInGif()), this.getFramesInGif() - 1);
        if (this.images.get(frame) === undefined) {
            return;
        }
        this.p5.image(this.images.get(frame), -this.p5.width / 2, -this.p5.height / 2);
    }
    detectBeats(lastBeat, bpm) {
        const intervalLength = 60000 / bpm * this.getIntervalLength();
        const realTraveledTime = lastBeat - this.lastPeakBeat;
        const realPercent = realTraveledTime / intervalLength;
        if (realPercent > this.getGoalPercentOff()) {
            if (lastBeat - this.lastPeakBeat > intervalLength + 100) {
                console.log("WOAH!");
            }
            this.lastPeakBeat = this.p5.millis();
        }
    }
    getGoalPercentOff() {
        return 1 - .2 / this.getIntervalLength();
    }
}

class DancingShape extends AbstractGifRenderer {
    getGifPath() {
        return "gif/square/";
    }
    getIntervalLength() {
        return 4;
    }
    getFramesInGif() {
        return 25;
    }
}

class LaunchpadMapping {
    constructor(navigator, p5Instance, p5Constructors, setActiveRenderer) {
        this.p5Instance = p5Instance;
        this.p5Constructors = p5Constructors;
        this.setActiveRenderer = setActiveRenderer;
        this.rendererConfig = [];
        this.launchpadAdapter = new LaunchpadAdapter(navigator);
    }
    init() {
        const couldRenderer = new CloudsRenderer(this.p5Instance, this.p5Constructors);
        couldRenderer.initialize();
        this.rendererConfig.push({
            renderer: couldRenderer,
            color: LaunchpadColor.GREEN,
            x: 0,
            y: 0,
        });
        this.setActiveRenderer(couldRenderer);
        const hypercolorRenderer = new HypercolorRenderer(this.p5Instance, this.p5Constructors);
        hypercolorRenderer.initialize();
        this.rendererConfig.push({
            renderer: hypercolorRenderer,
            color: LaunchpadColor.RED,
            x: 1,
            y: 0,
        });
        // Gif Renderers
        const dancingShapeRenderer = new DancingShape(this.p5Instance);
        dancingShapeRenderer.initialize();
        this.rendererConfig.push({
            renderer: dancingShapeRenderer,
            color: LaunchpadColor.LIGHT_BLUE,
            x: 2,
            y: 0,
        });
    }
    watchRendererConfig(config) {
        this.launchpadAdapter.changeMidiColor(config.x, config.y, config.color);
        this.launchpadAdapter.subscribeMidiPressed(config.x, config.y, () => {
            this.setRendererActive(config);
        });
    }
    setRendererActive(config) {
        if (this.activeRenderer != null) {
            this.launchpadAdapter.changeMidiColor(this.activeRenderer[0], this.activeRenderer[1], this.activeRenderer[2]);
        }
        this.launchpadAdapter.changeMidiColor(config.x, config.y, LaunchpadColor.WHITE);
        this.activeRenderer = [config.x, config.y, config.color];
        this.setActiveRenderer(config.renderer);
    }
    touchStarted() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.launchpadAdapter.init();
            this.rendererConfig.forEach((config) => this.watchRendererConfig(config));
            this.setRendererActive(this.rendererConfig[0]);
        });
    }
}

let p5Constructors = window.p5;
let p5Instance = window;
let beats = new BeatAwareStack();
let activeRenderer;
let mixxxAdapter;
let launchpadMapping;
function setup() {
    p5Instance.createCanvas(window.innerWidth, window.innerHeight, p5Instance.WEBGL);
    // turn off the createGraphics layers stroke
    p5Instance.noStroke();
    mixxxAdapter = new MixxxAdapter(navigator, beats, p5Instance);
    launchpadMapping = new LaunchpadMapping(navigator, p5Instance, p5Constructors, (renderer) => {
        activeRenderer = renderer;
    });
    launchpadMapping.init();
}
function touchStarted() {
    p5Instance.getAudioContext().resume();
    mixxxAdapter.init();
    launchpadMapping.touchStarted();
}
function draw() {
    // Pulse white on the beat, then fade out with an inverse cube curve
    let lastBeat = beats.getLastBeat(p5Instance.millis());
    let nextBeat = beats.getNextBeat(p5Instance.millis());
    p5Instance.clear(undefined, undefined, undefined, undefined);
    activeRenderer.render(lastBeat, nextBeat, beats.getBpm());
}

exports.draw = draw;
exports.setup = setup;
exports.touchStarted = touchStarted;
