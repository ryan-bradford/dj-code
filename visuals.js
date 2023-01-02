'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const FASTEST_BPM = 200;
const SLOWEST_BPM = 5;
const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const BUCKET_COUNT = 10;
const BPM_FUDGE_FACTOR = 0.05;
function detectBpm(beats) {
    // Cases:
    // 1. Perfectly aligned
    // 2. Skipped beat
    // 3. Extra beat off time
    // 4. Changing BPM
    // 5. Random beat
    /**
     * Algorithm:
     * 1. Calculate distance between beats
     * 2. Group into buckets
     * 3. Find relations between buckets
     */
    const smallestBpm = SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND / FASTEST_BPM;
    let initialBpms = beats.getArray().map((val, index) => {
        if (index == 0) {
            return undefined;
        }
        return val - beats.getArray()[index - 1];
    })
        .filter(val => val != undefined)
        .filter(val => val >= smallestBpm)
        .map(val => SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND / val)
        .map(Math.round);
    let bpmBuckets = bucketNumbersLinearly(initialBpms, BUCKET_COUNT, SLOWEST_BPM, FASTEST_BPM);
    let bpmToCountMap = new Map(bpmBuckets
        .filter(bucket => bucket.length)
        .map(bucket => {
        let avg = !bucket.length ? 0 : bucket.reduce((a, b) => a + b, 0) / bucket.length;
        return bucket.map((val) => avg);
    })
        .map(bucket => {
        return [bucket[0], bucket.length];
    }));
    let possibleBpms = Array.from(bpmToCountMap.keys());
    possibleBpms.forEach((bpm, index) => {
        for (var toTest = index + 1; toTest < possibleBpms.length; toTest++) {
            if (isValidRatio(bpm, toTest)) {
                let currentCount = bpmToCountMap.get(bpm);
                bpmToCountMap.delete(bpm);
                bpmToCountMap.set(toTest, bpmToCountMap.get(toTest) + currentCount);
            }
        }
    });
    let highestCount = 0;
    let bestBpm = 0;
    possibleBpms = Array.from(bpmToCountMap.keys());
    possibleBpms.forEach((bpm) => {
        let count = bpmToCountMap.get(bpm);
        if (count > highestCount) {
            highestCount = count;
            bestBpm = bpm;
        }
    });
    // merge buckets that are even ratios.
    return Math.round(bestBpm);
}
function isValidRatio(a, b) {
    let ratio = Math.max(a, b) / Math.min(a, b);
    let logRatio = Math.log2(ratio);
    if (logRatio < BPM_FUDGE_FACTOR) {
        return false;
    }
    let remainder = logRatio % 1;
    let trueRemainder = Math.min(remainder, 1 - remainder);
    return trueRemainder < BPM_FUDGE_FACTOR;
}
/**
 * Put numbers into buckets that have equal-size ranges.
 *
 * @param {Number[]} data The data to bucket.
 * @param {Number} bucketCount The number of buckets to use.
 * @param {Number} [min] The minimum allowed data value. Defaults to the smallest value passed.
 * @param {Number} [max] The maximum allowed data value. Defaults to the largest value passed.
 *
 * @return {Number[][]} An array of buckets of numbers.
 */
function bucketNumbersLinearly(data, bucketCount, min, max) {
    var i = 0, l = data.length;
    // If min and max are given, set them to the highest and lowest data values
    if (typeof min === 'undefined') {
        min = Infinity;
        max = -Infinity;
        for (i = 0; i < l; i++) {
            if (data[i] < min)
                min = data[i];
            if (data[i] > max)
                max = data[i];
        }
    }
    var inc = (max - min) / bucketCount, buckets = new Array(bucketCount);
    // Initialize buckets
    for (i = 0; i < bucketCount; i++) {
        buckets[i] = [];
    }
    // Put the numbers into buckets
    for (i = 0; i < l; i++) {
        // Buckets include the lower bound but not the higher bound, except the top bucket
        if (data[i] === max) {
            buckets[bucketCount - 1].push(data[i]);
        }
        else {
            buckets[((data[i] - min) / inc) | 0].push(data[i]);
        }
    }
    return buckets;
}

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
        this.beats = new FixedStack(20);
        this.currentBpm = 100;
        this.lastValidBeats = new FixedStack(1);
    }
    registerBeat(time) {
        this.currentBpm = detectBpm(this.beats);
        let currentGap = this.getMillisBetweenBeats();
        if (this.lastValidBeats.length() == 0 || currentGap == 0) {
            this.lastValidBeats.push(time);
        }
        else {
            for (let i = 0; i < this.lastValidBeats.length(); i++) {
                let beat = this.lastValidBeats.getArray()[i];
                let gap = time - beat;
                if (gap < currentGap) {
                    continue;
                }
                if (isValidRatio(gap, currentGap)) {
                    this.lastValidBeats.push(time);
                    break;
                }
            }
        }
        this.beats.push(time);
        return this;
    }
    getLastBeat(currentTime) {
        if (!this.beats.length() || !this.lastValidBeats.length()) {
            return 0;
        }
        let timeSinceLastBeat = currentTime - this.lastValidBeats.getLast();
        let currentGap = this.getMillisBetweenBeats();
        if (!currentGap) {
            return 0;
        }
        return this.lastValidBeats.getLast() + Math.floor(timeSinceLastBeat / currentGap) * currentGap;
    }
    getNextBeat(currentTime) {
        return this.getLastBeat(currentTime) + this.getMillisBetweenBeats();
    }
    getBpm() {
        return this.currentBpm;
    }
    getMillisBetweenBeats() {
        if (this.currentBpm == 0) {
            return 0;
        }
        return 60000 / this.currentBpm;
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
    render(lastBeat, nextBeat, spectrum, centroid) {
        this.p5Instance.background(this.p5Instance.map(1 / this.p5Instance.pow((this.p5Instance.millis() - lastBeat) / 1000 + 1, 3), 1, 0, 255, 100));
        if (!lastBeat) {
            return;
        }
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

let p5Constructors = window.p5;
let p5Instance = window;
let fft;
let peakDetect;
let beats = new BeatAwareStack();
let sound;
let waveRenderer;
function preload() {
    sound = p5Instance.loadSound('song.mp3');
}
function setup() {
    p5Instance.createCanvas(710, 200);
    // Create an Audio input
    // mic = new p5Constructors.AudioIn();
    // start the Audio Input.
    // By default, it does not .connect() (to the computer speakers)
    // mic.start();
    fft = new p5Constructors.FFT();
    // fft.setInput(mic);
    peakDetect = new p5Constructors.PeakDetect(0, 2000, 0.3);
    peakDetect.onPeak((peak) => {
        beats.registerBeat(p5Instance.millis());
    });
    waveRenderer = new WaveRenderer(p5Instance);
}
function touchStarted() {
    if (sound.isPlaying()) {
        sound.pause();
    }
    else {
        sound.loop();
    }
}
function draw() {
    // Pulse white on the beat, then fade out with an inverse cube curve
    let lastBeat = beats.getLastBeat(p5Instance.millis());
    let nextBeat = beats.getNextBeat(p5Instance.millis());
    let spectrum = fft.analyze();
    peakDetect.update(fft);
    let centroid = fft.getCentroid();
    waveRenderer.render(lastBeat, nextBeat, spectrum, centroid);
}

exports.draw = draw;
exports.preload = preload;
exports.setup = setup;
exports.touchStarted = touchStarted;
