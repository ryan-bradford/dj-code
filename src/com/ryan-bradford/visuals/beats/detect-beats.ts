import { FixedStack } from "../utils/fixed-stack";

const FASTEST_BPM = 200;
const SLOWEST_BPM = 5;
const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const BUCKET_COUNT = 10;
const BPM_FUDGE_FACTOR = 0.05;

export function detectBpm(beats: FixedStack<number>): number {
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
    let bpmToCountMap: Map<number, number> = new Map(bpmBuckets
        .filter(bucket => bucket.length)
        .map(bucket => {
            let avg = !bucket.length ? 0 : bucket.reduce((a, b) => a + b, 0) / bucket.length;
            return bucket.map((val) => avg);
        })
        .map(bucket => {
            return [bucket[0], bucket.length]
        }));
    let possibleBpms = Array.from(bpmToCountMap.keys())
    possibleBpms.forEach((bpm: number, index) => {
        for (var toTest = index + 1; toTest < possibleBpms.length; toTest++) {
            if (isValidRatio(bpm, toTest)) {
                let currentCount = bpmToCountMap.get(bpm);
                bpmToCountMap.delete(bpm);
                bpmToCountMap.set(toTest, bpmToCountMap.get(toTest) + currentCount);
            }
        }
    })
    let highestCount = 0;
    let bestBpm = 0;
    possibleBpms = Array.from(bpmToCountMap.keys())
    possibleBpms.forEach((bpm) => {
        let count = bpmToCountMap.get(bpm);
        if (count > highestCount) {
            highestCount = count;
            bestBpm = bpm;
        }
    })
    // merge buckets that are even ratios.
    return Math.round(bestBpm);
}

export function isValidRatio(a: number, b: number) {
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
function bucketNumbersLinearly(data, bucketCount, min, max): Array<Array<number>> {
    var i = 0, l = data.length;
    // If min and max are given, set them to the highest and lowest data values
    if (typeof min === 'undefined') {
        min = Infinity;
        max = -Infinity;
        for (i = 0; i < l; i++) {
            if (data[i] < min) min = data[i];
            if (data[i] > max) max = data[i];
        }
    }
    var inc = (max - min) / bucketCount,
        buckets = new Array(bucketCount);
    // Initialize buckets
    for (i = 0; i < bucketCount; i++) {
        buckets[i] = [];
    }
    // Put the numbers into buckets
    for (i = 0; i < l; i++) {
        // Buckets include the lower bound but not the higher bound, except the top bucket
        if (data[i] === max) {
            buckets[bucketCount-1].push(data[i]);
        } else {
            buckets[((data[i] - min) / inc) | 0].push(data[i]);
        }
    }
    return buckets;
}


