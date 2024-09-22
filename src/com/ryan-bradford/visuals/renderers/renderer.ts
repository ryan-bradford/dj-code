export interface Renderer {

    initialize();

    render(lastBeat: number, nextBeat: number, bpm: number, spectrum: Array<number>, centroid: number);

}