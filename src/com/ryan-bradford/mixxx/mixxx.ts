import { engine } from "../globals";

export class Mixxx {
    static togglePlay() {
        engine.setValue("[Channel1]", 'play', !engine.getValue("[Channel1]", 'play') as any as number)
    }
}