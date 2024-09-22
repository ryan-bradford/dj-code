import p5, { Shader } from "p5";
import { AbstractShaderRenderer } from "./abstract-shader-renderer";

export class CloudsRenderer extends AbstractShaderRenderer {
    private shader: Shader;

    constructor(p5: p5, private p5Constructors: any) {
        super(p5);
    }

    initialize() {
        this.shader = this.p5.loadShader(
            "shaders/hypercolor.vert",
            "shaders/clouds.frag"
        );
    }

    getShader(): p5.Shader {
        return this.shader;
    }

    getIntervalLength(): number {
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
