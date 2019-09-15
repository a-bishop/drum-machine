import { LitElement, html, css } from 'lit-element';

const state = {
    UNSOLOED: {
        COLOR: 'white',
    },
    SOLOED: {
        COLOR: 'darkSalmon',
    }
}

class SoloButton extends LitElement {

    static get styles() {
        return css`
    :host([hidden]) { display: none; }
    :host { display: block; }
    .main {
      width: 30px;
      text-align: center;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.2);
    }
    .main:active {
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 2px 5px 0 rgba(0, 0, 0, 0.2);
      transform: translate(1px, 1px);
    }`;
    }

    static get properties() {
        return {
            select: { type: String },
            bgColor: { type: String }
        };
    }

    constructor() {
        super();
        this.bgColor = state.UNSOLOED.COLOR
    }

    render() {
        return html`
    <style>
      .main {
        background: ${this.bgColor}
      }
      </style>
      <button class='main' @click=${this.handleClick}>S
      </button>
    `;
    }

    handleClick() {
        const newColor = this.bgColor === state.SOLOED.COLOR ? state.UNSOLOED.COLOR : state.SOLOED.COLOR
        this.bgColor = newColor;
        this.dispatchEvent(new CustomEvent('toggle-row-soloed', {
            detail: {
                selected: this.select,
                soloed: this.bgColor === state.SOLOED.COLOR
            }
        }))
    }
}

customElements.define('solo-button', SoloButton);