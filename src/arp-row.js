import { LitElement, html, css } from 'lit-element';
import './select-menu.js';
import './one-note.js';
import { notes, arpTonics } from './notes.js';

class ArpRow extends LitElement {
  static get styles() {
    return css`
      :host([hidden]) {
        display: none;
      }
      :host {
        display: block;
      }
      .rowContainer {
        width: 300px;
      }
      .arpRow {
        display: flex;
        justify-content: space-around;
      }
    `;
  }

  static get properties() {
    return {
      cells: { type: Array },
      noteIndexes: { type: Array },
      clearAll: { type: Boolean },
      activeNote: { type: Number }
    };
  }

  constructor() {
    super();
    this.activeNote = arpTonics[0];
  }

  updateActiveNote(e) {
    this.activeNote = e.detail.bgColor === 'lightBlue' ? e.detail.index : null;
    if (this.activeNote === e.detail.index) {
      let event = new CustomEvent('arp-row-updated', {
        detail: {
          noteIndex: e.detail.index
        }
      });
      this.dispatchEvent(event);
    }
    if (this.activeNote === null) this.stopArpSeq();
  }

  stopArpSeq() {
    let event = new CustomEvent('arp-row-updated', {
      detail: {
        stopArpSeq: true
      }
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <div class="rowContainer">
        <div class="arpRow">
          ${this.noteIndexes.map(noteIndex => {
            const bgColor =
              this.activeNote === noteIndex ? 'lightBlue' : 'white';
            return html`
              <one-note
                @note-changed=${this.updateActiveNote}
                class="note"
                index="${noteIndex}"
                bgColor=${bgColor}
                >${notes[noteIndex]}</one-note
              >
            `;
          })}
        </div>
      </div>
    `;
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'clearAll' && oldValue !== undefined) {
        let notes = this.shadowRoot.querySelectorAll('.note');
        for (let note of notes) {
          note.bgColor = 'white';
          this.stopArpSeq();
        }
      }
    });
  }
}

customElements.define('arp-row', ArpRow);
