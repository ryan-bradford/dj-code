export interface Filter {

    initialize(): Promise<void>;

    reset();

    render(percent: number, lastBeat: number, bpm: number);

    getBeatCount(): number;

}
