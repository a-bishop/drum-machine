import { LitElement, html, css } from '../node_modules/lit-element';

class SelectMenu extends LitElement {

  static get styles() {
    return css`
    :host([hidden]) { display: none; }
    :host { display: block; }
    select {
      width: 100px;
    }
    `
  }

  static get properties() {
    return {
      select: { type: String },
    };
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <select class='main'>
        <option value=${this.select}>${this.select}
        </option>
      </select>
    `;
  }
}

customElements.define('select-menu', SelectMenu);