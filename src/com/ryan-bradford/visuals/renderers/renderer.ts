export interface Renderer {

    load(): Promise<void>;

    unload(): void;

    isLoaded(): boolean;

    render(percent: number, lastBeat: number, bpm: number);

    getBeatCount(): number;

}
