import { LitElement, html, css } from 'lit-element';

class Template extends LitElement {
    static get styles() {
        return css`
            .mainContainer {

            }
        `
    }

    static get properties() { }

    constructor() {
        super();
    }

    render() {
        return html`
            <div class=mainContainer>
            </div>
        `
    }
}


customElements.define('template', Template);