import { LitElement, html, css } from 'lit-element';
import './select-menu.js';
import './mute-button.js';
import './beat-row.js';
import './arp-row.js'

const scales = {
    'minor pentatonic': [0, 3, 4, 6, 9, 11],
    'major': [0, 2, 4, 6, 8, 10],
}

const notes = {
    0: 'A', 1: 'Bb', 2: 'B', 3: 'C', 4: 'Db', 5: 'D', 6: 'E', 7: 'Eb', 8: 'F', 9: 'Gb', 10: 'G', 11: 'Ab'
}

const arpTonics = ['G', 'D', 'A', 'B', 'F', 'C'];

const arpMovement = {
    alternateUp: "alternateUp",
    randomWalk: "randomWalk",
    up: "up",
    down: "down",
    upDown: "upDown",
    downUp: "downUp",
    alternateDown: "alternateDown",
    random: "random",
    randomOnce: "randomOnce"
}

class MainContent extends LitElement {
    static get styles() {
        return css`
        host([hidden]) { display: none; }
        :host { display: block }

        select-menu, mute-button, solo-button {
            align-self: center;
            justify-self: center;
        }

        .mainGrid {
            display: grid;
            grid-template-columns: 120px 40px 300px;
            grid-row-gap: 5px;
        }

        .row {
            display: flex;
            align-items: center;
            justify-content: space-around;
        }

        .buttonRow {
            display: flex;
            align-items: center;
            justify-content: space-evenly;
            margin: 5px;
        }

        .transportBeat {
            width: 30px;
            height: 5px;
            margin: 7px 0;
            border: 1px solid black;
            visibility: hidden;
        }

        .slideContainer {
            margin: 5px;
        }
    
        @media only screen and (max-width: 600px) {
            body {
                margin: 0 auto;
            }
        }
        `
    }

    static get properties() {
        return {
            activeBeat: { type: String },
            sequences: { type: Array }
        }
    }

    constructor() {
        super();

        this.octave = 3;
        this.noteIndex = 9
        this.note = notes[this.noteIndex];
        this.scale = 'minor pentatonic';
        this.currScaleWithOctave = scales[this.scale].map(interval => {
            const newIndex = (this.noteIndex + interval) % Object.keys(notes).length;
            if (interval > 11) {
                return `${notes[newIndex]}${this.octave + 1}`
            }
            return `${notes[newIndex]}${this.octave}`;
        });

        this.transportBeatStyle = {
            background: 'white',
            visibility: 'hidden'
        }
        this.activeBeat = 'beatIndex0';

        // Bass setup
        const bassDrum = new Tone.MembraneSynth().toMaster();
        this.bassSeq = new Tone.Sequence(function (time, note) {
            bassDrum.triggerAttackRelease(note, '8n', time);
        }, [null, null, null, null, null, null, null, null], '8n').start();

        // Snare setup
        this.snare = new Tone.Player({
            "url": "./sounds/snare.wav",
            "autostart": false
        }).toMaster();
        this.snareSeq = new Tone.Sequence(function (time, note) {
            note.start(time + 0.03)
        }, [null, null, null, null, null, null, null, null], "8n").start();

        // hiHat setup
        const hiHat = new Tone.NoiseSynth().toMaster();
        this.hiHatSeq = new Tone.Sequence(function (time, note) {
            hiHat.triggerAttackRelease(note, time);
        }, [null, null, null, null, null, null, null, null], "8n").start();

        // Arpeggiator Setup
        console.log(arpMovement['randomWalk'])
        const synth = new Tone.Synth().toMaster();
        this.arpSeq = new Tone.Pattern((time, note) => {
            synth.triggerAttackRelease(note, '32n', time);
        }, this.currScaleWithOctave, arpMovement.alternateUp).start();
        this.arpSeq.interval = '16n';

        var comp = new Tone.Compressor(-30, 3);
        comp.toMaster();
        Tone.Transport.loop = true;
        Tone.Transport.loopStart = 0;
        Tone.Transport.loopEnd = 2;

        this.sequences = [this.bassSeq, this.snareSeq, this.hiHatSeq, this.arpSeq]

        this.cleared = 'false';
    }

    render() {
        return html`
        <style>
            #${this.activeBeat} {
                background: ${this.transportBeatStyle.background};
                visibility: ${this.transportBeatStyle.visibility};
            }
        </style>
        <div class='mainContainer'>
            <div class='mainGrid'>
                <select-menu select='bass-drum'>
                </select-menu>
                <mute-button @toggle-row-muted="${this.handleToggleRowMuted}" select='bass-drum'>
                </mute-button>
                <div class='row'>
                    <beat-row class='beat-row' id='bass-drum' select='bass-drum' @beat-row-updated="${this.handleBassUpdate}" clearAll="${this.cleared}"></beat-row>
                </div>
                <select-menu select='snare-drum'>
                 </select-menu>
                 <mute-button @toggle-row-muted="${this.handleToggleRowMuted}" select='snare-drum'>
                </mute-button>
                <div class='row'>
                    <beat-row class='beat-row' id='snare-drum' select='snare-drum' @beat-row-updated="${this.handleSnareUpdate}" clearAll="${this.cleared}"></beat-row>
                </div>
                <select-menu select='hi-hat'>
                </select-menu>
                <mute-button @toggle-row-muted="${this.handleToggleRowMuted}" select='hi-hat'>
                </mute-button>
                <div class='row'>
                    <beat-row class='beat-row' id='hi-hat' select='hi-hat' @beat-row-updated="${this.handleHiHatUpdate}" clearAll="${this.cleared}"></beat-row>
                </div>
                <div></div>
                <div></div>
                <div class='row'>
                    <div class='transportBeat' id='beatIndex0'>
                    </div>
                    <div class='transportBeat' id='beatIndex1'>
                    </div>
                    <div class='transportBeat' id='beatIndex2'>
                    </div>
                    <div class='transportBeat' id='beatIndex3'>
                    </div>
                    <div class='transportBeat' id='beatIndex4'>
                    </div>
                    <div class='transportBeat' id='beatIndex5'>
                    </div>
                    <div class='transportBeat' id='beatIndex6'>
                    </div>
                    <div class='transportBeat' id='beatIndex7'>
                    </div>
                </div>
                <div></div>
                <div></div>
                <div class='buttonRow'>
                    <button id='start-button' @click="${this.startBeat}"> Play
                    </button >
                    <button id='stop-button' @click="${this.pauseBeat}"> Pause </button>
                    <button id='cancel-button' @click="${this.stopBeat}"> Stop </button>
                    <button id='clear-button' @click="${this.clear}"> Clear All </button>
                </div>
                <div></div>
                <div></div>
                <div class='row'>
                    <div class="slideContainer">
                    <label for="bpmSlider">BPM ${Math.floor(Tone.Transport.bpm.value)}</label>
                        <input type="range" min="1" max="250" value="80 " class="slider" name="bpmSlider" id="bpmSlider" @change="${this.updateBPM}" >
                    </div >
                    <div class="slideContainer">
                    <label for="swingSlider">Swing</label>
                        <input type="range" min="0" max="100" value="0" class="slider" name="swingSlider" id="swingSlider" @change="${this.updateSwing}" >
                    </div >
                </div>
                <div></div>
                <div></div>
                <div class=row>
                    <select id="arpSelect" @change=${this.handleArpMovementUpdate}>
                        ${Object.keys(arpMovement).map(pattern => html`<option>${pattern}</option>`)}
                    </select>
                    <select id="arpScale" @change=${this.handleArpScaleChange}>
                        ${Object.keys(scales).map(scale => html`<option>${scale}</option>`)}
                    </select>
                    <select id="arpOctave" @change=${this.handleArpOctaveChange}>
                        <option>2</option>
                        <option selected>3</option>
                        <option>4</option>
                        <option>5</option>
                    </select>
                </div>
                <div class=row>ARPEGGIATOR</div>
                <mute-button @toggle-row-muted="${this.handleToggleRowMuted}" select='arpeggiator'>
                </mute-button>
                <div class='row'>
                    <arp-row class='arp-row' id='arp' select='arpeggiator' @arp-row-updated="${this.handleArpNoteUpdate}" clearAll="${this.cleared}" notes="${JSON.stringify(arpTonics)}"></arp-row>
                </div>
            </div>
        </div >
            `
    }

    handleBassUpdate(e) {
        for (const [i, note] of e.detail.notes.entries()) {
            if (note) {
                this.bassSeq.at(i, "C2");
            } else {
                this.bassSeq.remove(i);
            }
        }
    }

    handleSnareUpdate(e) {
        for (const [i, note] of e.detail.notes.entries()) {
            if (note) {
                this.snareSeq.at(i, this.snare);
            } else {
                this.snareSeq.remove(i);
            }
        }
    }

    handleHiHatUpdate(e) {
        for (const [i, note] of e.detail.notes.entries()) {
            if (note) {
                this.hiHatSeq.at(i, { 'time': i });
            } else {
                this.hiHatSeq.remove(i);
            }
        }
    }

    updateArpSequence() {
        this.currScaleWithOctave = scales[this.scale].map(interval => {
            const newIndex = (this.noteIndex + interval) % Object.keys(notes).length;
            if (interval > 11) {
                return `${notes[newIndex]}${this.octave + 1}`
            }
            return `${notes[newIndex]}${this.octave}`;
        });
        this.arpSeq.values = this.currScaleWithOctave;
    }

    handleArpNoteUpdate(e) {
        console.log(e.detail.note)
        this.noteIndex = e.detail.note
        this.note = notes[this.noteIndex];
        // this.updateArpSequence();
    }

    handleArpMovementUpdate(e) {
        const arpMove = this.shadowRoot.getElementById("arpSelect").value;
        this.arpSeq.pattern = arpMove;
        this.updateArpSequence();
    }

    handleArpScaleChange() {
        this.scale = this.shadowRoot.getElementById("arpScale").value;
        this.updateArpSequence();
    }

    handleArpOctaveChange() {
        this.octave = this.shadowRoot.getElementById("arpOctave").value;
        this.updateArpSequence();
    }


    handleToggleRowMuted(e) {
        switch (e.detail.selected) {
            case ('bass-drum'):
                this.bassSeq.mute = e.detail.muted ? true : false;
                break;
            case ('snare-drum'):
                this.snareSeq.mute = e.detail.muted ? true : false;
                break;
            case ('hi-hat'):
                this.hiHatSeq.mute = e.detail.muted ? true : false;
                break;
            case ('arpeggiator'):
                this.arpSeq.mute = e.detail.muted ? true : false;
                break;
        }
    }

    handleToggleRowSoloed(e) {
        switch (e.detail.selected) {
            case ('bass-drum'):
                this.updateSequences(this.bassSeq, e.detail.soloed);
                break;
            case ('snare-drum'):
                this.updateSequences(this.snareSeq, e.detail.soloed);
                break;
            case ('hi-hat'):
                this.updateSequences(this.hiHatSeq, e.detail.soloed);
                break;
            case ('arpeggiator'):
                this.updateSequences(this.arpSeq, e.detail.soloed);
                break;
        }
    }

    updateBPM() {
        const bpmSlider = this.shadowRoot.getElementById("bpmSlider")
        Tone.Transport.bpm.value = bpmSlider.value;
        this.requestUpdate();
    }

    updateSwing() {
        const swingSlider = this.shadowRoot.getElementById("swingSlider")
        Tone.Transport.swing = swingSlider.value * 0.01;
        this.requestUpdate();
    }

    startBeat() {
        Tone.Transport.start();
        this.transportBeatStyle.background = 'yellow';
        this.transportBeatStyle.visibility = 'visible';
        this.requestUpdate(); // <-- required to ensure the first beat is displayed properly
        Tone.Transport.scheduleRepeat(() => {
            const tick = (Math.floor(Tone.Transport.ticks * .1));
            if (tick < 10) {
                this.activeBeat = `beatIndex0`;
            } else {
                this.activeBeat = `beatIndex${parseInt((tick + '').charAt(0))}`;
            }
        }, "32n");
    }

    pauseBeat() {
        Tone.Transport.pause();
    }

    stopBeat() {
        Tone.Transport.stop();
        this.activeBeat = 'beatIndex0';
        this.removeTransportBeatStyle()
    }

    clear() {
        Tone.Transport.stop();
        this.removeTransportBeatStyle()
        this.cleared = !this.cleared;
        const beatRows = this.shadowRoot.querySelectorAll('.beat-row');
        const arpRow = this.shadowRoot.querySelector('.arp-row');
        arpRow.clearAll = this.cleared;
        for (let beatRow of beatRows) {
            beatRow.clearAll = this.cleared;
        }
    }

    removeTransportBeatStyle() {
        this.transportBeatStyle.background = 'white'
        this.transportBeatStyle.visibility = 'hidden'
        this.requestUpdate();
    }
}

customElements.define('main-content', MainContent);