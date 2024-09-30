export interface Renderer {

    initialize();

    reset();

    render(percent: number, lastBeat: number, bpm: number);

    getBeatCount(): number;

}