import p5, { Shader } from "p5";
import { BeatAwareStack } from "../beats/beat-aware-stack";
import { AbstractShaderRenderer } from "./abstract-shader-renderer";

export class ShapesRenderer extends AbstractShaderRenderer {

    private shader: Shader;

    constructor(p5: p5, private p5Constructors: any) {
        super(p5);
    }

    initialize() {
        this.shader = this.p5.loadShader(
            "shaders/hypercolor.vert",
            "shaders/shapes.frag"
        );
    }

    getShader(): p5.Shader {
        return this.shader;
    }

    getIntervalLength(): number {
        return 1;
    }

    getMouseScaleValue() {
        return 1;
    }

    getFrameScaleValue() {
        return 0.1;
    }
}