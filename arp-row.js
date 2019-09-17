import { LitElement, html, css } from 'lit-element';
import './select-menu.js';
import './one-note.js';

class ArpRow extends LitElement {
    static get styles() {
        return css`
            :host([hidden]) { display: none; }
            :host { display: block; }
            .rowContainer {
                width: 300px;
            }
            .arpRow {
                display: flex;
                justify-content: space-around;
            }`
    }

    static get properties() {
        return {
            cells: { type: Array },
            notes: { type: Array },
            clearAll: { type: Boolean },
            activeNote: { type: Number }
        }
    }

    constructor() {
        super();
        this.activeNote = 0;
    }

    render() {
        return html`
        <div class=rowContainer>    
            <div class=arpRow>
            ${this.notes.map((note, index) => html`<one-note @note-changed="${e => {
            if (e.detail.newState) this.activeNote = e.detail.index
            let event = new CustomEvent('arp-row-updated', {
                detail: {
                    note: note
                }
            });
            this.dispatchEvent(event);
        }}" class="beat" index=${index} active=${this.activeNote} clear=${this.clearAll} note="${this.notes[index]}">${this.notes[index]}</one-note>`)}
                </div>
        </div>`

    }

    updated(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            if (propName === 'clearAll') {
                let beats = this.shadowRoot.querySelectorAll('.beat')
                for (let beat of beats) {
                    beat.clear = this.clearAll;
                }
            }
        })
    }
}


customElements.define('arp-row', ArpRow);