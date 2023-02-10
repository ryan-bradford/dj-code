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
        this.currentBpm = 100;
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
            this.beats.setBpm(midiMessage.data[2]);
        }
    }
    midiOnStateChange(state) {
        console.log(state);
    }
    onMIDIFailure() {
        console.log('Could not access your MIDI devices.');
    }
}

class OceanRenderer {
    constructor(p5, p5Constructors) {
        this.p5 = p5;
        this.p5Constructors = p5Constructors;
    }
    initialize() {
        this.image = this.p5.loadImage("ocean.jpg");
    }
    render(lastBeat, nextBeat, spectrum, centroid) {
        this.p5.image(this.image, 0, 0);
        this.p5.filter("invert");
        this.p5.filter("dilate");
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
    initialize() {
    }
    render(lastBeat, nextBeat, spectrum, centroid) {
        this.p5Instance.millis();
        if (lastBeat != this.lastChangedBeat) {
            // Rotate shape
            this.lastChangedBeat = lastBeat;
            this.colors = [this.colors[1], this.colors[2], this.colors[0]];
        }
        this.p5Instance.background(this.colors[0].red, this.colors[0].green, this.colors[0].blue);
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
    initialize() {
    }
    render(lastBeat, nextBeat, spectrum, centroid) {
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

let mic;
let p5Constructors = window.p5;
let p5Instance = window;
let fft;
let beats = new BeatAwareStack();
let shapeRenderer;
let activeRenderer;
let oceanRenderer;
let mixxxAdapter;
function setup() {
    p5Instance.createCanvas(window.innerWidth, window.innerHeight);
    // Create an Audio input
    mic = new p5Constructors.AudioIn();
    // start the Audio Input.
    // By default, it does not .connect() (to the computer speakers)
    mic.start();
    fft = new p5Constructors.FFT();
    fft.setInput(mic);
    shapeRenderer = new ShapeRenderer(p5Instance, p5Constructors);
    new WaveRenderer(p5Instance);
    oceanRenderer = new OceanRenderer(p5Instance, p5Constructors);
    oceanRenderer.initialize();
    activeRenderer = shapeRenderer;
    mixxxAdapter = new MixxxAdapter(navigator, beats, p5Instance);
}
function touchStarted() {
    p5Instance.getAudioContext().resume();
    mixxxAdapter.init();
}
function draw() {
    // Pulse white on the beat, then fade out with an inverse cube curve
    let lastBeat = beats.getLastBeat(p5Instance.millis());
    let nextBeat = beats.getNextBeat(p5Instance.millis());
    let spectrum = fft.analyze();
    let centroid = fft.getCentroid();
    p5Instance.clear(undefined, undefined, undefined, undefined);
    activeRenderer.render(lastBeat, nextBeat, spectrum, centroid);
}
// qmidinet -n 1 -i lo -a yes

exports.draw = draw;
exports.setup = setup;
exports.touchStarted = touchStarted;
