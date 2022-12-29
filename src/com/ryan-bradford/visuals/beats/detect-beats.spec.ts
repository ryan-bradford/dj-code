import { detectBpm, isValidRatio } from "./detect-beats";
import { FixedStack } from "../utils/fixed-stack";
import * as assert from "assert";

const EXAMPLE_PERFECT = new FixedStack(4, [800, 800*2, 800*3, 800*4]);
const SLIGHTLY_LESS_PERFECT = new FixedStack(5, [801, 800 * 2 -2, 800 * 3 - 10, 800 * 4 + 4, 800 * 5 + 10]);
const MISSING_BEATS = new FixedStack(5, [801, 800 * 2 -2, 800 * 4 - 10, 800 * 5 + 4, 800 * 6 + 10]);
const INCLUDING_INVALID_DATA = new FixedStack(5, [801, 800 * 2 - 2, 800 * 2 + 235, 800 * 3 + 12, 800 * 4 - 10]);
const BPM_CHANGING = new FixedStack(4, [800, 800*2, 800*3, 800*3 + 700, 800*3 + 700 * 2, 800*3 + 700 * 3, 800*3 + 700 * 4]);


describe("detectBpm", () => {
  it("can detect the BPM of a song given perfect data", () => {
    assert.equal(detectBpm(EXAMPLE_PERFECT), 75);
  });

  it("can detect the BPM of a song given imperfect data", () => {
    assert.equal(detectBpm(SLIGHTLY_LESS_PERFECT), 75);
  });

  it("can detect the BPM of a song given missing beats data", () => {
    assert.equal(detectBpm(MISSING_BEATS), 74);
  });

  it("can detect the BPM of a song given invalid data", () => {
    assert.equal(detectBpm(INCLUDING_INVALID_DATA), 76);
  });

  it("can work with a suddenly changing BPM", () => {
    assert.equal(detectBpm(BPM_CHANGING), 86);
  });
});

describe("isValidBpm", () => {
    it("says two of the same numbers are not valid", () => {
        assert.equal(isValidRatio(5, 5), false);
    })
})
