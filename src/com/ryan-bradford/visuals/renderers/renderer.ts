export interface Renderer {

    render(lastBeat: number, nextBeat: number, spectrum: Array<number>, centroid: number);

}