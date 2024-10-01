import p5 from "p5";
import { BeatAwareStack } from "../beats/beat-aware-stack";

export const LaunchpadColor = {
    RED: 5,
    WHITE: 3,
    GREEN: 21,
    LIGHT_BLUE: 37,
    PINK: 57,
    LIGHT_ORANGE: 60,
    ORANGE: 9,
    YELLOW: 124
}

export class LaunchpadAdapter {

    private output: MIDIOutput;
    private callbacks = new Map<number, () => void>();

    constructor(private navigator: Navigator) {
    }

    async init(): Promise<void> {
        const midi = await this.navigator.requestMIDIAccess({ sysex: true });
        this.requestMIDIAccessSuccess(midi);
    }

    requestMIDIAccessSuccess(midi: MIDIAccess) {
        midi.inputs.forEach(midiInput => {
            if(!midiInput.name.toLowerCase().includes("mk3 mi")) {
                return;
            }
            midiInput.onmidimessage = (message) => this.getMIDIMessage(message);
        });

        midi.outputs.forEach(output => {
            if(!output.name.toLowerCase().includes("mk3 mi")) {
                return;
            }
            this.output = output;
            output.send([240, 0, 32, 41, 2, 13, 14, 1, 247])
            for (var x = 0; x < 10; x ++) {
                for (var y = 0; y < 10; y ++) {
                    output.send([0x90, this.getButtonMidiId(x, y), 0])
                }
            }
            // output.send([0x90, this.getButtonMidiId(5, 5), 5]);
        });

        midi.onstatechange = (state) => this.midiOnStateChange(state);
    }

    getMIDIMessage(midiMessage: MIDIMessageEvent) {
        const midiKey = midiMessage.data[1];
        const isPress = midiMessage.data[2] === 127;
        if (isPress && this.callbacks.has(midiKey)) {
            this.callbacks.get(midiKey)();
        }
    }

    midiOnStateChange(state: Event) {
        console.log(state);
    }

    subscribeMidiPressed(x: number, y: number, callback: () => void) {
        this.callbacks.set(this.getButtonMidiId(x, y), callback);
    }

    changeMidiColor(x: number, y: number, color: number) {
        this.output.send([0x90, this.getButtonMidiId(x, y), color]);
    }

    onMIDIFailure() {
        console.log('Could not access your MIDI devices.');
    }

    private getButtonMidiId(x: number, y: number) {
        if (y === 8) {
            return 104 + x;
        } else {
            return  1 + x + (1 + y)*10;
        }
    }

    private getButtonX(midiNumber: number): [number, number] {
        if (midiNumber >= 104) {
            return [8, midiNumber - 104];
        } else {
            return [Math.floor(midiNumber / 10) - 1, midiNumber % 10 - 1];
        }
    }

}
