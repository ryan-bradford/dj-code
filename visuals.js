'use strict';

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
    isEmpty() {
        return this.array.length === 0;
    }
}

class BeatAwareStack {
    constructor() {
        this.lastValidBeats = new FixedStack(1);
        this.beatsThroughSixteen = 0;
    }
    getPercentThroughMeasure(beatCount, currentTime) {
        const percentThroughBeat = this.getPercentThroughBeat(currentTime);
        const remainingInMeasure = (this.beatsThroughSixteen - 1) % beatCount;
        const percent = ((remainingInMeasure + percentThroughBeat) / beatCount);
        return percent < 0 ? 1 + percent : percent;
    }
    getPercentThroughBeat(currentTime) {
        return (currentTime - this.getLastBeat(currentTime)) / this.getMillisBetweenBeats();
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
    registerBeat(bpm, time) {
        this.currentBpm = bpm;
        if (this.lastValidBeats.isEmpty() || this.beatsThroughSixteen === 16) {
            this.beatsThroughSixteen = 1;
        }
        else {
            this.beatsThroughSixteen += 1;
        }
        this.lastValidBeats.push(time);
    }
    registerSixteenMarker(time) {
        if (this.lastValidBeats.isEmpty()) {
            this.beatsThroughSixteen = 1;
        }
        else if (this.getPercentThroughBeat(time) > 0.5) {
            this.beatsThroughSixteen = 0;
        }
        else {
            this.beatsThroughSixteen = 1;
        }
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
            if (!midiInput.name.toLowerCase().includes("iac driver")) {
                continue;
            }
            midiInput.onmidimessage = (message) => this.getMIDIMessage(message);
        }
        midi.onstatechange = (state) => this.midiOnStateChange(state);
    }
    getMIDIMessage(midiMessage) {
        if (midiMessage.data[1] == 52) {
            this.beats.registerBeat(midiMessage.data[2] + 50, this.p5Instance.millis());
        }
    }
    midiOnStateChange(state) {
    }
    onMIDIFailure() {
        console.error('Could not access your MIDI devices.');
    }
}

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
        if (this.output == null) {
            return;
        }
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
    render(percent, lastBeat, bpm) {
        this.detectBeats(lastBeat, bpm);
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
        const intervalLength = 60000 / bpm * this.getBeatCount();
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
        return 1 - .2 / this.getBeatCount();
    }
}

class HypercolorRenderer extends AbstractShaderRenderer {
    constructor(p5, p5Constructors) {
        super(p5);
        this.p5Constructors = p5Constructors;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.shader = this.p5.loadShader("shaders/hypercolor.vert", "shaders/hypercolor.frag");
        });
    }
    getShader() {
        return this.shader;
    }
    getBeatCount() {
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
        return __awaiter(this, void 0, void 0, function* () {
            this.shader = this.p5.loadShader("shaders/hypercolor.vert", "shaders/clouds.frag");
        });
    }
    getShader() {
        return this.shader;
    }
    getBeatCount() {
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
    getFirstFrame() {
        return 1;
    }
    reset() {
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.images = new Map();
            for (var i = 0; i < this.getFramesInGif(); i++) {
                this.images.set(i, yield this.loadImage(i, true));
            }
        });
    }
    loadImage(frame, shouldRetry) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const offset = this.isZeroBased() ? 0 : 1;
                this.p5.loadImage(this.getFileName(frame + offset), resolve, reject);
            });
        });
    }
    render(percent, lastBeat, bpm) {
        const frame = ((Math.min(Math.round(percent * this.getFramesInGif()), this.getFramesInGif())) + this.getFirstFrame()) % this.getFramesInGif();
        if (this.images.get(frame) === undefined) {
            return;
        }
        this.p5.image(this.images.get(frame), -this.p5.width / 2, -this.p5.height / 2);
    }
}

class DancingShape extends AbstractGifRenderer {
    getFileName(frame) {
        const frameNumber = frame >= 10 ? frame : "0" + frame;
        return `gif/square/frame_${frameNumber}_delay-0.04s.gif`;
    }
    getBeatCount() {
        return 4;
    }
    getFramesInGif() {
        return 25;
    }
    isZeroBased() {
        return true;
    }
}

class PumpkinRenderer extends AbstractGifRenderer {
    getFileName(frame) {
        const frameNumber = frame >= 10 ? "0" + frame : "00" + frame;
        return `gif/pumpkin/ezgif-frame-${frameNumber}.jpg`;
    }
    getBeatCount() {
        return 8;
    }
    getFramesInGif() {
        return 60;
    }
    getFirstFrame() {
        return 27;
    }
    isZeroBased() {
        return false;
    }
}

class EvilGoatRenderer extends AbstractGifRenderer {
    getFileName(frame) {
        const frameNumber = frame >= 10 ? "0" + frame : "00" + frame;
        return `gif/evil-goat/shorter_${frameNumber}.jpg`;
    }
    getBeatCount() {
        return 16;
    }
    getFramesInGif() {
        return 64;
    }
    isZeroBased() {
        return true;
    }
}

class Color {
    constructor(red, green, blue) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }
}
class AbstractStrobeFilter {
    constructor(p5Instance) {
        this.p5Instance = p5Instance;
        this.p5Instance.colorMode("rgb");
    }
    reset() {
    }
    getBeatCount() {
        return 1;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    render(percent, lastBeat, bpm) {
        if (isNaN(bpm)) {
            return;
        }
        const num = Math.floor(percent / (1 / this.getStrobeFrequency())) % this.getColors().length;
        const color = this.getColors()[num];
        this.p5Instance.tint(color.red, color.green, color.blue);
    }
}

class RainbowStrobeFilter extends AbstractStrobeFilter {
    getStrobeFrequency() {
        return 8;
    }
    getColors() {
        return [
            new Color(255, 0, 0), // Red
            new Color(255, 165, 0), // Orange
            new Color(255, 255, 0), // Yellow
            new Color(0, 128, 0), // Green
            new Color(0, 0, 255), // Blue
            new Color(75, 0, 130), // Indigo
            new Color(238, 130, 238), // Violet
            new Color(255, 192, 203) // Pink
        ];
    }
    getBeatCount() {
        return 2;
    }
}

class BlankRenderer {
    constructor(p5Instance) {
        this.p5Instance = p5Instance;
        this.p5Instance.colorMode("rgb");
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.image = this.p5Instance.createImage(this.p5Instance.width, this.p5Instance.height);
            for (let x = 0; x < this.image.width; x += 1) {
                for (let y = 0; y < this.image.height; y += 1) {
                    this.image.set(x, y, 255);
                }
            }
            this.image.updatePixels();
        });
    }
    reset() {
    }
    render(percent, lastBeat, bpm) {
        this.p5Instance.image(this.image, -this.p5Instance.width / 2, -this.p5Instance.height / 2);
    }
    getBeatCount() {
        return 1;
    }
}

class HalloweenStrobeFilter extends AbstractStrobeFilter {
    getStrobeFrequency() {
        return 4;
    }
    getColors() {
        // dark yellow
        // orange
        // red
        // dark gray
        return [
            new Color(219, 0, 0), // Blood Red
            new Color(255, 255, 0), // Ghostly Yellow
            new Color(128, 0, 0), // Dark Burgundy
            new Color(255, 154, 0), // Halloween Orange
        ];
    }
    getBeatCount() {
        return 1;
    }
}

class RedBlackStrobeFilter extends AbstractStrobeFilter {
    getStrobeFrequency() {
        return 2;
    }
    getColors() {
        // dark yellow
        // orange
        // red
        // dark gray
        return [
            new Color(255, 0, 0), // Blood Red
            new Color(0, 0, 0), // Blood Red
        ];
    }
    getBeatCount() {
        return 2;
    }
}

class WhiteBlackStrobeFilter extends AbstractStrobeFilter {
    getStrobeFrequency() {
        return 4;
    }
    getColors() {
        return [
            new Color(255, 255, 255), // White
            new Color(0, 0, 0), // Black
        ];
    }
    getBeatCount() {
        return 1;
    }
}

class LaunchpadMapping {
    constructor(navigator, p5Instance, p5Constructors, setActiveRenderer, setActiveFilter, stack) {
        this.p5Instance = p5Instance;
        this.p5Constructors = p5Constructors;
        this.setActiveRenderer = setActiveRenderer;
        this.setActiveFilter = setActiveFilter;
        this.stack = stack;
        this.rendererConfig = [];
        this.filterConfig = [];
        this.launchpadAdapter = new LaunchpadAdapter(navigator);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const blank = new BlankRenderer(this.p5Instance);
            yield blank.initialize();
            this.rendererConfig.push({
                renderer: blank,
                color: LaunchpadColor.GREEN,
                x: 5,
                y: 0,
            });
            const couldRenderer = new CloudsRenderer(this.p5Instance, this.p5Constructors);
            yield couldRenderer.initialize();
            this.rendererConfig.push({
                renderer: couldRenderer,
                color: LaunchpadColor.GREEN,
                x: 0,
                y: 0,
            });
            const hypercolorRenderer = new HypercolorRenderer(this.p5Instance, this.p5Constructors);
            yield hypercolorRenderer.initialize();
            this.rendererConfig.push({
                renderer: hypercolorRenderer,
                color: LaunchpadColor.RED,
                x: 1,
                y: 0,
            });
            // Gif Renderers
            const dancingShapeRenderer = new DancingShape(this.p5Instance);
            yield dancingShapeRenderer.initialize();
            this.rendererConfig.push({
                renderer: dancingShapeRenderer,
                color: LaunchpadColor.LIGHT_BLUE,
                x: 2,
                y: 0,
            });
            const pumpkinRenderer = new PumpkinRenderer(this.p5Instance);
            yield pumpkinRenderer.initialize();
            this.rendererConfig.push({
                renderer: pumpkinRenderer,
                color: LaunchpadColor.ORANGE,
                x: 3,
                y: 0,
            });
            const goatRnederer = new EvilGoatRenderer(this.p5Instance);
            yield goatRnederer.initialize();
            this.rendererConfig.push({
                renderer: goatRnederer,
                color: LaunchpadColor.RED,
                x: 4,
                y: 0,
            });
            this.filterConfig.push({
                renderer: null,
                color: LaunchpadColor.RED,
                x: 0,
                y: 1,
            });
            this.filterConfig.push({
                renderer: new WhiteBlackStrobeFilter(this.p5Instance),
                color: LaunchpadColor.RED,
                x: 0,
                y: 2,
            });
            this.filterConfig.push({
                renderer: new RedBlackStrobeFilter(this.p5Instance),
                color: LaunchpadColor.RED,
                x: 0,
                y: 3,
            });
            this.filterConfig.push({
                renderer: new HalloweenStrobeFilter(this.p5Instance),
                color: LaunchpadColor.RED,
                x: 0,
                y: 4,
            });
            this.filterConfig.push({
                renderer: new RainbowStrobeFilter(this.p5Instance),
                color: LaunchpadColor.RED,
                x: 0,
                y: 5,
            });
        });
    }
    watchRendererConfig(config) {
        this.launchpadAdapter.changeMidiColor(config.x, config.y, config.color);
        this.launchpadAdapter.subscribeMidiPressed(config.x, config.y, () => {
            this.setRendererActive(config);
        });
    }
    watchFilterConfig(config) {
        this.launchpadAdapter.changeMidiColor(config.x, config.y, config.color);
        this.launchpadAdapter.subscribeMidiPressed(config.x, config.y, () => {
            this.setFilterActive(config);
        });
    }
    watchReset16() {
        this.launchpadAdapter.changeMidiColor(8, 0, LaunchpadColor.WHITE);
        this.launchpadAdapter.subscribeMidiPressed(8, 0, () => {
            this.stack.registerSixteenMarker(this.p5Instance.millis());
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
    setFilterActive(config) {
        if (this.activeFilter != null) {
            this.launchpadAdapter.changeMidiColor(this.activeFilter[0], this.activeFilter[1], this.activeFilter[2]);
        }
        this.launchpadAdapter.changeMidiColor(config.x, config.y, LaunchpadColor.LIGHT_BLUE);
        this.activeFilter = [config.x, config.y, config.color];
        this.setActiveFilter(config.renderer);
    }
    touchStarted() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.launchpadAdapter.init();
            this.rendererConfig.forEach((config) => this.watchRendererConfig(config));
            this.filterConfig.forEach((config) => this.watchFilterConfig(config));
            this.setRendererActive(this.rendererConfig[0]);
            // TOOD: Remove
            this.setFilterActive(this.filterConfig[0]);
            this.watchReset16();
        });
    }
}

let p5Constructors = window.p5;
let p5Instance = window;
let isStarted = false;
let beats = new BeatAwareStack();
let activeRenderer;
let activeFilter;
let mixxxAdapter;
let launchpadMapping;
let finishedInit = false;
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        p5Instance.createCanvas(window.innerWidth, window.innerHeight, p5Instance.WEBGL);
        // turn off the createGraphics layers stroke
        p5Instance.noStroke();
        mixxxAdapter = new MixxxAdapter(navigator, beats, p5Instance);
        launchpadMapping = new LaunchpadMapping(navigator, p5Instance, p5Constructors, (renderer) => {
            activeRenderer = renderer;
        }, (filter) => {
            activeFilter = filter;
        }, beats);
        yield launchpadMapping.init();
        finishedInit = true;
    });
}
function touchStarted() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isStarted == true || finishedInit == false) {
            return;
        }
        p5Instance.getAudioContext().resume();
        isStarted = true;
        mixxxAdapter.init();
        launchpadMapping.touchStarted();
    });
}
function draw() {
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

exports.draw = draw;
exports.setup = setup;
exports.touchStarted = touchStarted;
