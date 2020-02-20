import {
  LitElement,
  html,
  css
} from 'lit-element';
import './select-menu.js';
import './one-beat.js';

class BeatRow extends LitElement {
  static get styles() {
    return css `
      :host([hidden]) {
        display: none;
      }
      :host {
        display: block;
      }
      .rowContainer {
        width: 300px;
      }
      .beatRow {
        display: flex;
        justify-content: space-around;
      }
    `;
  }

  static get properties() {
    return {
      clearAll: {
        type: Boolean
      },
      cells: {
        type: Array
      },
      instrument: {
        type: String
      },
      notes: {
        type: Array
      }
    };
  }

  constructor() {
    super();
    this.cells = Array.apply(null, Array(8)).map(function () {});
    this.notes = new Array(8).fill(null);
  }

  render() {
    return html `
      <div class="rowContainer">
        <div class="beatRow">
          ${this.cells.map(
            (item, index) =>
              html`
                <one-beat
                  @beat-updated="${e => {
                    this.notes.splice(e.detail.index, 1, e.detail.isActive);
                    let event = new CustomEvent('beat-row-updated', {
                      detail: {
                        instrument: this.instrument,
                        notes: this.notes
                      }
                    });
                    this.dispatchEvent(event);
                  }}"
                  class="beat"
                  index=${index}
                  clear=${this.clearAll}
                  instrument=${this.instrument}
                ></one-beat>
              `
          )}
        </div>
      </div>
    `;
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'clearAll') {
        let beats = this.shadowRoot.querySelectorAll('.beat');
        for (let beat of beats) {
          beat.clear = !beat.clear;
        }
      }
    });
  }
}

customElements.define('beat-row', BeatRow);