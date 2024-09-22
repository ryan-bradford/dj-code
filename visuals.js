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

class LaunchpadAdapter {
    constructor(navigator) {
        this.navigator = navigator;
    }
    init() {
        this.navigator.requestMIDIAccess().then((midi) => this.requestMIDIAccessSuccess(midi), () => this.onMIDIFailure());
    }
    requestMIDIAccessSuccess(midi) {
        var inputs = midi.inputs.values();
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            let midiInput = input.value;
            console.log('midi input', input);
            if (!midiInput.name.toLowerCase().includes("launchpad")) {
                continue;
            }
            midiInput.onmidimessage = (message) => this.getMIDIMessage(message);
        }
        midi.onstatechange = (state) => this.midiOnStateChange(state);
    }
    getMIDIMessage(midiMessage) {
        if (midiMessage.data[1] == 52) {
            console.log(midiMessage);
        }
    }
    midiOnStateChange(state) {
        console.log(state);
    }
    onMIDIFailure() {
        console.log('Could not access your MIDI devices.');
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
            console.log('midi input', input);
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
        console.log(state);
    }
    onMIDIFailure() {
        console.log('Could not access your MIDI devices.');
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
    render(lastBeat, nextBeat, bpm, spectrum, centroid) {
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
        else {
            console.log("NOT_BEAT " + lastBeat + " " + (lastBeat - this.lastPeakBeat) + " " + intervalLength);
        }
    }
    getGoalPercentOff() {
        return 1 - .2 / this.getIntervalLength();
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

class Color {
    constructor(red, blue, green) {
        this.red = red;
        this.blue = blue;
        this.green = green;
    }
}
class ShapeRenderer {
    constructor(p5Instance, p5Constructors) {
        this.p5Instance = p5Instance;
        this.p5Constructors = p5Constructors;
        this.p5Instance.colorMode("rgb");
        const redColor = new Color(255, 0, 0);
        const blueColor = new Color(0, 255, 0);
        const greenColor = new Color(0, 0, 255);
        this.colors = [redColor, blueColor, greenColor];
    }
    reset() {
    }
    initialize() { }
    render(lastBeat, nextBeat, bpm, spectrum, centroid) {
        this.p5Instance.millis();
        if (lastBeat != this.lastChangedBeat) {
            // Rotate shape
            this.lastChangedBeat = lastBeat;
            this.colors = [this.colors[1], this.colors[2], this.colors[0]];
        }
        this.p5Instance.background(this.colors[0].red, this.colors[0].green, this.colors[0].blue);
    }
}

class ShapesRenderer extends AbstractShaderRenderer {
    constructor(p5, p5Constructors) {
        super(p5);
        this.p5Constructors = p5Constructors;
    }
    initialize() {
        this.shader = this.p5.loadShader("shaders/hypercolor.vert", "shaders/shapes.frag");
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
        return 0.1;
    }
}

class SquiggleRenderer extends AbstractShaderRenderer {
    constructor(p5, p5Constructors) {
        super(p5);
        this.p5Constructors = p5Constructors;
    }
    initialize() {
        this.shader = this.p5.loadShader("shaders/hypercolor.vert", "shaders/squiggle.frag");
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
        return 0.2;
    }
}

class WaveRenderer {
    constructor(p5Instance) {
        this.p5Instance = p5Instance;
        this.left = 0;
        this.top = 0;
        this.width = this.p5Instance.width;
        this.height = this.p5Instance.height;
    }
    reset() {
    }
    initialize() { }
    render(lastBeat, nextBeat, bpm, spectrum, centroid) {
        this.p5Instance.background(this.p5Instance.map(1 / this.p5Instance.pow((this.p5Instance.millis() - lastBeat) / 1000 + 1, 3), 1, 0, 255, 100));
        this.p5Instance.stroke("limegreen");
        this.p5Instance.fill("darkgreen");
        this.p5Instance.strokeWeight(1);
        this.p5Instance.beginShape();
        this.p5Instance.vertex(this.left, this.top + this.height);
        // compute a running average of values to avoid very
        // localized energy from triggering a beat.
        for (let i = 0; i < spectrum.length; i++) {
            this.p5Instance.vertex(
            //left + map(i, 0, spectrum.length, 0, w),
            // Distribute the spectrum values on a logarithmic scale
            // We do this because as you go higher in the spectrum
            // the same perceptible difference in tone requires a
            // much larger chang in frequency.
            this.left +
                this.p5Instance.map(this.p5Instance.log(i), 0, this.p5Instance.log(spectrum.length), 0, this.width), 
            // Spectrum values range from 0 to 255
            this.top + this.p5Instance.map(spectrum[i], 0, 255, this.height, 0));
        }
        this.p5Instance.vertex(this.left + this.width, this.top + this.height);
        this.p5Instance.endShape(this.p5Instance.CLOSE);
        // this is the range of frequencies covered by the FFT
        let nyquist = 22050;
        // the mean_freq_index calculation is for the display.
        // centroid frequency / hz per bucket
        let mean_freq_index = centroid / (nyquist / spectrum.length);
        this.p5Instance.stroke("red");
        // convert index to x value using a logarithmic x axis
        let cx = this.p5Instance.map(this.p5Instance.log(mean_freq_index), 0, this.p5Instance.log(spectrum.length), 0, this.p5Instance.width);
        this.p5Instance.line(cx, 0, cx, this.height);
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
    render(lastBeat, nextBeat, bpm, spectrum, centroid) {
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
            // console.log("BEAT " + lastBeat + " " + (lastBeat - this.lastPeakBeat) + " " + intervalLength);
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

let mic;
let p5Constructors = window.p5;
let p5Instance = window;
let fft;
let beats = new BeatAwareStack();
let activeRenderer;
let hypercolorRenderer;
let squiggleRenderer;
let cloudsRenderer;
let shapesRenderer;
let dancingShapeRenderer;
let mixxxAdapter;
let launchpadAdapter;
function setup() {
    p5Instance.createCanvas(window.innerWidth, window.innerHeight, p5Instance.WEBGL);
    // turn off the createGraphics layers stroke
    p5Instance.noStroke();
    // Create an Audio input
    mic = new p5Constructors.AudioIn();
    // start the Audio Input.
    // By default, it does not .connect() (to the computer speakers)
    mic.start();
    fft = new p5Constructors.FFT();
    fft.setInput(mic);
    new ShapeRenderer(p5Instance, p5Constructors);
    new WaveRenderer(p5Instance);
    hypercolorRenderer = new HypercolorRenderer(p5Instance, p5Constructors);
    squiggleRenderer = new SquiggleRenderer(p5Instance, p5Constructors);
    cloudsRenderer = new CloudsRenderer(p5Instance, p5Constructors);
    shapesRenderer = new ShapesRenderer(p5Instance, p5Constructors);
    hypercolorRenderer.initialize();
    squiggleRenderer.initialize();
    cloudsRenderer.initialize();
    shapesRenderer.initialize();
    // Gif Renderers
    dancingShapeRenderer = new DancingShape(p5Instance);
    dancingShapeRenderer.initialize();
    activeRenderer = dancingShapeRenderer;
    mixxxAdapter = new MixxxAdapter(navigator, beats, p5Instance);
    launchpadAdapter = new LaunchpadAdapter(navigator);
}
function touchStarted() {
    p5Instance.getAudioContext().resume();
    mixxxAdapter.init();
    launchpadAdapter.init();
}
function draw() {
    // Pulse white on the beat, then fade out with an inverse cube curve
    let lastBeat = beats.getLastBeat(p5Instance.millis());
    let nextBeat = beats.getNextBeat(p5Instance.millis());
    let spectrum = fft.analyze();
    let centroid = fft.getCentroid();
    p5Instance.clear(undefined, undefined, undefined, undefined);
    activeRenderer.render(lastBeat, nextBeat, beats.getBpm(), spectrum, centroid);
}

exports.draw = draw;
exports.setup = setup;
exports.touchStarted = touchStarted;
