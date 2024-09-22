export interface Renderer {

    initialize();

    reset();

    render(lastBeat: number, nextBeat: number, bpm: number);

}