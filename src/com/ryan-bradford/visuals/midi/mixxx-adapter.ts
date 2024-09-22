import p5 from "p5";
import { BeatAwareStack } from "../beats/beat-aware-stack";


export class MixxxAdapter {

    constructor(private navigator: Navigator, private beats: BeatAwareStack, private p5Instance: p5) {
    }

    init() {
        this.navigator.requestMIDIAccess().then(
            (midi) => this.requestMIDIAccessSuccess(midi),
            () => this.onMIDIFailure());
    }

    requestMIDIAccessSuccess(midi: WebMidi.MIDIAccess) {
        var inputs = midi.inputs.values();
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            let midiInput: WebMidi.MIDIInput = input.value;
            if(!midiInput.name.toLowerCase().includes("port 0")) {
                continue;
            }
            midiInput.onmidimessage = (message) => this.getMIDIMessage(message);
        }
        midi.onstatechange = (state) => this.midiOnStateChange(state);
    }

    getMIDIMessage(midiMessage: WebMidi.MIDIMessageEvent) {
        if (midiMessage.data[1] == 52) {
            this.beats.registerBeat(this.p5Instance.millis());
            this.beats.setBpm(midiMessage.data[2] + 50);
        }
    }

    midiOnStateChange(state: WebMidi.MIDIConnectionEvent) {
    }

    onMIDIFailure() {
        console.error('Could not access your MIDI devices.');
    }

}