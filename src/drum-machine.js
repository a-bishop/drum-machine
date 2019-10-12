import { LitElement, html, css } from 'lit-element';
import './select-menu.js';
import './mute-button.js';
import './beat-row.js';
import './arp-row.js';
import { notes, arpTonics } from './notes.js';
// 0: 'C', 1: 'C#', 2: 'D', 3: 'Eb', 4: 'E', 5: 'F',
// 6: 'F#', 7: 'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11: 'B'

// notes of scale represent # of intervals from tonic
const scales = {
  'minor pentatonic': [0, 3, 5, 7, 10],
  'harmonic minor': [0, 2, 3, 5, 7, 8, 11],
  blues: [0, 3, 5, 6, 7, 10],
  arabic: [0, 1, 4, 5, 7, 8, 11],
  'whole tone': [0, 2, 4, 6, 8, 10],
  'hungarian roma': [0, 2, 3, 6, 7, 8, 11]
};

const arpMovement = {
  upDown: 'upDown',
  downUp: 'downUp',
  alternateUp: 'alternateUp',
  alternateDown: 'alternateDown',
  randomWalk: 'randomWalk',
  random: 'random'
};

class DrumMachine extends LitElement {
  static get styles() {
    return css`
      host([hidden]) {
        display: none;
      }
      :host {
        display: block;
      }

      select-menu,
      mute-button,
      solo-button {
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
    `;
  }

  static get properties() {
    return {
      activeBeat: { type: String },
      sequences: { type: Array }
    };
  }

  constructor() {
    super();

    this.octave = 3;
    this.noteIndex = arpTonics[0];
    this.note = notes[this.noteIndex];
    this.scale = Object.keys(scales)[0];
    this.currScaleWithOctave = scales[this.scale].map(interval => {
      const newIndex = (this.noteIndex + interval) % Object.keys(notes).length;
      if (interval > 11) {
        return `${notes[newIndex]}` + (this.octave + 1);
      }
      return `${notes[newIndex]}${this.octave}`;
    });
    console.log(this.scale, this.currScaleWithOctave);

    this.transportBeatStyle = {
      background: 'white',
      visibility: 'hidden'
    };
    this.activeBeat = 'beatIndex0';

    // Bass setup
    const bassDrum = new Tone.MembraneSynth().toMaster();
    this.bassSeq = new Tone.Sequence(
      function(time, note) {
        bassDrum.triggerAttackRelease(note, '8n', time);
      },
      [null, null, null, null, null, null, null, null],
      '8n'
    ).start();

    // Snare setup
    const snare = new Tone.NoiseSynth({
      noise: {
        type: 'brown',
        playbackRate: 3
      },
      envelope: {
        attack: 0.001,
        decay: 0.13,
        sustain: 0,
        release: 0.03
      }
    }).toMaster();

    this.snareSeq = new Tone.Sequence(
      function(time, note) {
        snare.triggerAttackRelease(note, time);
      },
      [null, null, null, null, null, null, null, null],
      '8n'
    ).start();

    // hiHat setup
    const hiHat = new Tone.NoiseSynth({
      noise: {
        type: 'pink'
      }
    }).toMaster();
    this.hiHatSeq = new Tone.Sequence(
      function(time, note) {
        hiHat.triggerAttackRelease(note, time);
      },
      [null, null, null, null, null, null, null, null],
      '8n'
    ).start();

    var autoFilter = new Tone.AutoFilter({
      frequency: '8m',
      min: 800,
      max: 15000
    }).connect(Tone.Master);

    //connect the noise
    hiHat.connect(autoFilter);

    //start the autofilter LFO
    autoFilter.start();

    // Arpeggiator Setup
    console.log(arpMovement['randomWalk']);
    const synth = new Tone.FMSynth({
      oscillator: {
        type: 'triangle'
      }
    }).toMaster();

    this.arpSeq = new Tone.Pattern(
      (time, note) => {
        synth.triggerAttackRelease(note, '32n', time);
      },
      this.currScaleWithOctave,
      arpMovement.upDown
    ).start();
    this.arpSeq.interval = '8n';

    var comp = new Tone.Compressor(-30, 3);
    comp.toMaster();
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = 2;

    this.sequences = [this.bassSeq, this.snareSeq, this.hiHatSeq, this.arpSeq];

    this.cleared = false;
  }

  render() {
    return html`
      <style>
        #${this.activeBeat} {
          background: ${this.transportBeatStyle.background};
          visibility: ${this.transportBeatStyle.visibility};
        }
      </style>
      <div class="mainContainer">
        <div class="mainGrid">
          <select-menu select=${JSON.stringify(['bass-drum', 'tom'])}>
          </select-menu>
          <mute-button
            @toggle-row-muted="${this.handleToggleRowMuted}"
            select="bass-drum"
          >
          </mute-button>
          <div class="row">
            <beat-row
              class="beat-row"
              id="bass-drum"
              select="bass-drum"
              @beat-row-updated="${this.handleBassUpdate}"
              clearAll="${this.cleared}"
            ></beat-row>
          </div>
          <select-menu select=${JSON.stringify(['snare-tight', 'snare-loose'])}>
          </select-menu>
          <mute-button
            @toggle-row-muted="${this.handleToggleRowMuted}"
            select="snare-drum"
          >
          </mute-button>
          <div class="row">
            <beat-row
              class="beat-row"
              id="snare-drum"
              select="snare-drum"
              @beat-row-updated="${this.handleSnareUpdate}"
              clearAll="${this.cleared}"
            ></beat-row>
          </div>
          <select-menu
            select="${JSON.stringify(['hi-hat-closed', 'hi-hat-open'])}"
          >
          </select-menu>
          <mute-button
            @toggle-row-muted="${this.handleToggleRowMuted}"
            select="hi-hat"
          >
          </mute-button>
          <div class="row">
            <beat-row
              class="beat-row"
              id="hi-hat"
              select="hi-hat"
              @beat-row-updated="${this.handleHiHatUpdate}"
              clearAll="${this.cleared}"
            ></beat-row>
          </div>
          <div></div>
          <div></div>
          <div class="row">
            <div class="transportBeat" id="beatIndex0"></div>
            <div class="transportBeat" id="beatIndex1"></div>
            <div class="transportBeat" id="beatIndex2"></div>
            <div class="transportBeat" id="beatIndex3"></div>
            <div class="transportBeat" id="beatIndex4"></div>
            <div class="transportBeat" id="beatIndex5"></div>
            <div class="transportBeat" id="beatIndex6"></div>
            <div class="transportBeat" id="beatIndex7"></div>
          </div>
          <div></div>
          <div></div>
          <div class="buttonRow">
            <button id="start-button" @click="${this.startBeat}">Play</button>
            <button id="stop-button" @click="${this.pauseBeat}">Pause</button>
            <button id="cancel-button" @click="${this.stopBeat}">Stop</button>
            <button id="clear-button" @click="${this.clear}">Clear All</button>
          </div>
          <div></div>
          <div></div>
          <div class="row">
            <div class="slideContainer">
              <label for="bpmSlider"
                >BPM ${Math.floor(Tone.Transport.bpm.value)}</label
              >
              <input
                type="range"
                min="1"
                max="250"
                value="80 "
                class="slider"
                name="bpmSlider"
                id="bpmSlider"
                @change="${this.updateBPM}"
              />
            </div>
            <div class="slideContainer">
              <label for="swingSlider">Swing</label>
              <input
                type="range"
                min="0"
                max="100"
                value="0"
                class="slider"
                name="swingSlider"
                id="swingSlider"
                @change="${this.updateSwing}"
              />
            </div>
          </div>
          <div></div>
          <div></div>
          <div class="row">
            <select id="arpSelect" @change=${this.handleArpMovementUpdate}>
              ${Object.keys(arpMovement).map(
                pattern =>
                  html`
                    <option>${pattern}</option>
                  `
              )}
            </select>
            <select id="arpScale" @change=${this.handleArpScaleChange}>
              ${Object.keys(scales).map(
                scale =>
                  html`
                    <option>${scale}</option>
                  `
              )}
            </select>
            <select id="arpOctave" @change=${this.handleArpOctaveChange}>
              <option>2</option>
              <option selected>3</option>
              <option>4</option>
              <option>5</option>
            </select>
          </div>
          <div class="row">ARPEGGIATOR</div>
          <mute-button
            @toggle-row-muted="${this.handleToggleRowMuted}"
            select="arpeggiator"
          >
          </mute-button>
          <div class="row">
            <arp-row
              class="arp-row"
              id="arp"
              select="arpeggiator"
              @arp-row-updated="${this.handleArpNoteUpdate}"
              clearAll="${this.cleared}"
              noteIndexes="${JSON.stringify(arpTonics)}"
            ></arp-row>
          </div>
        </div>
      </div>
    `;
  }

  handleBassUpdate(e) {
    for (const [i, note] of e.detail.notes.entries()) {
      if (note) {
        this.bassSeq.at(i, 'C2');
      } else {
        this.bassSeq.remove(i);
      }
    }
  }

  handleSnareUpdate(e) {
    for (const [i, note] of e.detail.notes.entries()) {
      if (note) {
        this.snareSeq.at(i, { time: i });
      } else {
        this.snareSeq.remove(i);
      }
    }
  }

  handleHiHatUpdate(e) {
    for (const [i, note] of e.detail.notes.entries()) {
      if (note) {
        this.hiHatSeq.at(i, { time: i });
      } else {
        this.hiHatSeq.remove(i);
      }
    }
  }

  updateArpSequence() {
    this.currScaleWithOctave = scales[this.scale].map(interval => {
      const newIndex = (this.noteIndex + interval) % Object.keys(notes).length;
      if (interval > 11) {
        return `${notes[newIndex]}` + (this.octave + 1);
      }
      return `${notes[newIndex]}${this.octave}`;
    });
    this.arpSeq.values = this.currScaleWithOctave;
    console.log(this.scale, this.currScaleWithOctave);
  }

  handleArpNoteUpdate(e) {
    if (e.detail.stopArpSeq) {
      this.arpSeq.stop();
      return;
    } else if (this.arpSeq.state === 'stopped') this.arpSeq.start(0);
    this.noteIndex = e.detail.noteIndex;
    this.note = notes[this.noteIndex];
    this.updateArpSequence();
  }

  handleArpMovementUpdate() {
    const arpMove = this.shadowRoot.getElementById('arpSelect').value;
    this.arpSeq.pattern = arpMove;
    this.updateArpSequence();
  }

  handleArpScaleChange() {
    this.scale = this.shadowRoot.getElementById('arpScale').value;
    this.updateArpSequence();
  }

  handleArpOctaveChange() {
    this.octave = this.shadowRoot.getElementById('arpOctave').value;
    this.updateArpSequence();
  }

  handleToggleRowMuted(e) {
    switch (e.detail.selected) {
      case 'bass-drum':
        this.bassSeq.mute = e.detail.muted ? true : false;
        break;
      case 'snare-drum':
        this.snareSeq.mute = e.detail.muted ? true : false;
        break;
      case 'hi-hat':
        this.hiHatSeq.mute = e.detail.muted ? true : false;
        break;
      case 'arpeggiator':
        this.arpSeq.mute = e.detail.muted ? true : false;
        break;
    }
  }

  handleToggleRowSoloed(e) {
    switch (e.detail.selected) {
      case 'bass-drum':
        this.updateSequences(this.bassSeq, e.detail.soloed);
        break;
      case 'snare-drum':
        this.updateSequences(this.snareSeq, e.detail.soloed);
        break;
      case 'hi-hat':
        this.updateSequences(this.hiHatSeq, e.detail.soloed);
        break;
      case 'arpeggiator':
        this.updateSequences(this.arpSeq, e.detail.soloed);
        break;
    }
  }

  updateBPM() {
    const bpmSlider = this.shadowRoot.getElementById('bpmSlider');
    Tone.Transport.bpm.value = bpmSlider.value;
    this.requestUpdate();
  }

  updateSwing() {
    const swingSlider = this.shadowRoot.getElementById('swingSlider');
    Tone.Transport.swing = swingSlider.value * 0.01;
    this.requestUpdate();
  }

  startBeat() {
    Tone.Transport.start();
    this.transportBeatStyle.background = 'yellow';
    this.transportBeatStyle.visibility = 'visible';
    this.requestUpdate(); // <-- required to ensure the first beat is displayed properly
    Tone.Transport.scheduleRepeat(() => {
      const tick = Math.floor(Tone.Transport.ticks * 0.1);
      if (tick < 10) {
        this.activeBeat = `beatIndex0`;
      } else {
        this.activeBeat = `beatIndex${parseInt((tick + '').charAt(0))}`;
      }
    }, '32n');
  }

  pauseBeat() {
    Tone.Transport.pause();
  }

  stopBeat() {
    Tone.Transport.stop();
    this.activeBeat = 'beatIndex0';
    this.removeTransportBeatStyle();
    console.log(this.cleared);
  }

  clear() {
    for (let i = 0; i < 2; i++) {
      Tone.Transport.stop();
      this.removeTransportBeatStyle();
      this.cleared = !this.cleared;
      const beatRows = this.shadowRoot.querySelectorAll('.beat-row');
      const arpRow = this.shadowRoot.querySelector('.arp-row');
      arpRow.clearAll = this.cleared;
      for (let beatRow of beatRows) {
        beatRow.clearAll = this.cleared;
      }
    }
  }

  removeTransportBeatStyle() {
    this.transportBeatStyle.background = 'white';
    this.transportBeatStyle.visibility = 'hidden';
    this.requestUpdate();
  }
}

customElements.define('drum-machine', DrumMachine);
