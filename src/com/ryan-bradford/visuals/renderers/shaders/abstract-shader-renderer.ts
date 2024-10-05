import p5, { Shader } from "p5";
import { Renderer } from "../renderer";

export abstract class AbstractShaderRenderer implements Renderer {
    private lastPeakBeat = 0;
    private lastX = 0;
    private lastY = 0;
    private lastFrame = 0;
    private currentDirectionX = 2 * Math.random() - 1;
    private currentDirectionY = 2 * Math.random() - 1;
    private frameDirection = 1;

    constructor(protected p5: p5) { }

    abstract load(): Promise<void>;

    abstract getShader(): Shader;

    abstract getBeatCount(): number;

    abstract getMouseScaleValue(): number;

    abstract getFrameScaleValue(): number;

    abstract isLoaded(): boolean;

    abstract unload(): void;

    public getNextFrameDirection(direction: number): number {
        return direction * -1;
    }

    render(percent: number, lastBeat: number, bpm: number) {
        this.detectBeats(lastBeat, bpm);
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
        this.p5.rect(0,0,this.p5.width, this.p5.height);
    }

    private detectBeats(lastBeat: number, bpm: number) {
        const intervalLength = 60000 / bpm * this.getBeatCount();
        const realTraveledTime = lastBeat - this.lastPeakBeat;
        const realPercent = realTraveledTime / intervalLength;
        if (
            realPercent > this.getGoalPercentOff()
        ) {
            if (lastBeat - this.lastPeakBeat > intervalLength + 100) {
                console.log("WOAH!");
            }
            this.lastPeakBeat = this.p5.millis();
            this.currentDirectionX = 2 * Math.random() - 1;
            this.currentDirectionY = 2 * Math.random() - 1;
            this.frameDirection = this.getNextFrameDirection(this.frameDirection);
        }
    }

    private getGoalPercentOff() {
        return 1 - .2 / this.getBeatCount()
    }

}
