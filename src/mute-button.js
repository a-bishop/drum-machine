import {
  LitElement,
  html,
  css
} from 'lit-element';
import colors from './colors';

class MuteButton extends LitElement {
  static get styles() {
    return css `
      :host([hidden]) {
        display: none;
      }
      :host {
        display: block;
      }

      button {
        font-family: 'arcade';
        font-size: 16px;
      }

      .main {
        width: 30px;
        text-align: center;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2),
          0 1px 5px 0 rgba(0, 0, 0, 0.2);
      }

      .main:active {
        box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.2);
        transform: translate(1px, 1px);
      }
    `;
  }

  static get properties() {
    return {
      select: {
        type: String
      },
      bgColor: {
        type: String
      }
    };
  }

  constructor() {
    super();
    this.bgColor = colors.inactive;
  }

  render() {
    return html `
      <style>
        .main {
          background: ${this.bgColor};
        }
      </style>
      <button class="main" @click=${this.handleClick}>M</button>
    `;
  }

  handleClick() {
    const newColor =
      this.bgColor === colors.inactive ?
      colors.active :
      colors.inactive;
    this.bgColor = newColor;
    this.dispatchEvent(
      new CustomEvent('toggle-row-muted', {
        detail: {
          selected: this.select,
          muted: this.bgColor === colors.active
        }
      })
    );
  }
}

customElements.define('mute-button', MuteButton);