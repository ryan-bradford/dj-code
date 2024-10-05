import { BeatAwareStack } from "./beat-aware-stack";
import * as assert from "assert";

describe('BeatAwareStack', () => {

    it('calculates the percent of the way through a beat', () => {
        const stack = new BeatAwareStack();
        stack.registerBeat(60, 0);
        stack.registerBeat(60, 1000);
        assert.equal(stack.getPercentThroughBeat(1500), 0.5);
        assert.equal(stack.getPercentThroughMeasure(4, 1500), 1.5/4);
        assert.equal(stack.getPercentThroughMeasure(4, 2500), 2.5 / 4);
        assert.equal(stack.getPercentThroughMeasure(4, 6500), 2.5 / 4);
        stack.registerSixteenMarker(1600);
        assert.equal(stack.getPercentThroughMeasure(4, 1800), (3 + .8) / 4);
        assert.equal(stack.getPercentThroughMeasure(4, 2000), 0);
    });

});
