import {
  LitElement,
  html,
  css
} from 'lit-element';
import colors from './colors';

class OneBeat extends LitElement {
  static get styles() {
    return css `
      .beat {
        width: 30px;
        height: 30px;
        border: 1px solid black;
        cursor: pointer;
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
    };
  }

  constructor() {
    super();
    this.bgColor = colors.inactive;
  }

  render() {
    return html `
      <style>
        .beat {
          background: ${this.bgColor};
        }
      </style>
      <div class="beat" @click=${this.handleClick}></div>
    `;
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'clear') {
        this.bgColor = colors.inactive;
        this.beatUpdatedEvent();
      }
    });
  }

  beatUpdatedEvent() {
    this.dispatchEvent(
      new CustomEvent('beat-updated', {
        detail: {
          instrument: this.instrument,
          index: this.index,
          isActive: this.bgColor === colors.active
        }
      })
    );
  }

  handleClick() {
    const newColor = this.bgColor === colors.active ? colors.inactive : colors.active;
    this.bgColor = newColor;
    this.beatUpdatedEvent();
  }
}

customElements.define('one-beat', OneBeat);