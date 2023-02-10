export interface Renderer {

    initialize();

    render(lastBeat: number, nextBeat: number, spectrum: Array<number>, centroid: number);

}