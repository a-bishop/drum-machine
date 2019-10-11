import { LitElement, html, css } from "../node_modules/lit-element/lit-element.js";

class OneBeat extends LitElement {
  static get styles() {
    return css`
            .beat {
                width: 30px;
                height: 30px;
                border: 1px solid black;
            }
        `;
  }

  static get properties() {
    return {
      clear: {
        type: Boolean
      },
      bgColor: {
        type: String
      },
      instrument: {
        type: String
      },
      index: {
        type: Number
      },
      isLit: {
        type: Boolean
      }
    };
  }

  constructor() {
    super();
    this.bgColor = 'white';
    this.isLit = false;
  }

  render() {
    return html`
            <style>
                .beat {
                    background: ${this.bgColor}
                }
            </style>
            <div class=beat @click=${this.handleClick}>
            </div>
        `;
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'clear') {
        this.bgColor = 'white';
        this.isLit = false;
        this.beatUpdatedEvent();
      }
    });
  }

  beatUpdatedEvent() {
    this.dispatchEvent(new CustomEvent('beat-updated', {
      detail: {
        instrument: this.instrument,
        index: this.index,
        newState: this.isLit
      }
    }));
  }

  handleClick() {
    if (!this.isLit) {
      this.isLit = true;
      this.bgColor = 'lightBlue';
    } else {
      this.isLit = false;
      this.bgColor = 'white';
    }

    this.beatUpdatedEvent();
  }

}

customElements.define('one-beat', OneBeat);