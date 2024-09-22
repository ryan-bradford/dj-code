import p5 from "p5";
import { BeatAwareStack } from "../beats/beat-aware-stack";


export class LaunchpadAdapter {

    constructor(private navigator: Navigator) {
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
            console.log('midi input', input);
            if(!midiInput.name.toLowerCase().includes("launchpad")) {
                continue;
            }
            midiInput.onmidimessage = (message) => this.getMIDIMessage(message);
        }
        midi.onstatechange = (state) => this.midiOnStateChange(state);
    }

    getMIDIMessage(midiMessage: WebMidi.MIDIMessageEvent) {
        if (midiMessage.data[1] == 52) {
            console.log(midiMessage);
        }
    }

    midiOnStateChange(state: WebMidi.MIDIConnectionEvent) {
        console.log(state);
    }

    onMIDIFailure() {
        console.log('Could not access your MIDI devices.');
    }

}