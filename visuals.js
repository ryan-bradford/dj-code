'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

let mic;
function sketch(p5) {
    p5.setup = () => {
        p5.createCanvas(710, 200);
        // Create an Audio input
        mic = new window.p5.AudioIn();
        // start the Audio Input.
        // By default, it does not .connect() (to the computer speakers)
        mic.start();
    };
    p5.draw = () => {
        p5.background(200);
        // Get the overall volume (between 0 and 1.0)
        let vol = mic.getLevel();
        p5.fill(127);
        p5.stroke(0);
        // Draw an ellipse with height based on volume
        let h = p5.map(vol, 0, 1, p5.height, 0);
        p5.ellipse(p5.width / 2, h - 25, 50, 50);
    };
}

exports.sketch = sketch;
