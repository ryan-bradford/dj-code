import { BeatAwareStack } from "./beat-aware-stack"
import * as assert from "assert";

xdescribe("BeatAwareStack", () => {

    let stack: BeatAwareStack;

    beforeEach(() => {
        stack = new BeatAwareStack();
        stack
            .registerBeat(0).registerBeat(800).registerBeat(1600)
            .registerBeat(1800).registerBeat(2400).registerBeat(2600);
    })

    describe("getBpm", () => {
        it("can detect the BPM given input data", () => {
            assert.equal(stack.getBpm(), 75);
        });
    })

    describe("getLastBeat", () => {
        it("gives the last valid beat", () => {
            assert.equal(stack.getLastBeat(2600), 2400);
        })

        it("can predict beats it has not seen yet", () => {
            assert.equal(stack.getLastBeat(3300), 3200);
        })
    })

})