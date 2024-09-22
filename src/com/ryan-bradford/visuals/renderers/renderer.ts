export interface Renderer {

    initialize();

    reset();

    render(lastBeat: number, nextBeat: number, bpm: number, spectrum: Array<number>, centroid: number);

}