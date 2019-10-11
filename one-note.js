import { LitElement, html, css } from './node_modules/lit-element';

class OneNote extends LitElement {
    static get styles() {
        return css`
            .note {
                width: 30px;
                height: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
                border: 1px dashed gainsboro;
            }
        `
    }

    static get properties() {
        return {
            clear: { type: Boolean },
            bgColor: { type: String },
            index: { type: Number },
        }
    }

    constructor() {
        super();
    }

    render() {
        return html`
            <style>
                .note {
                    background: ${this.bgColor}
                }
            </style>
            <div class=note @click=${this.handleClick}>
            <div class=text><slot></slot></div>
            </div>
        `;
    }

    beatUpdatedEvent() {
        this.dispatchEvent(new CustomEvent('note-changed', {
            detail: {
                index: this.index,
                bgColor: this.bgColor
            }
        }))
    }

    handleClick() {
        const newColor = this.bgColor === 'lightBlue' ? 'white' : 'lightBlue';
        this.bgColor = newColor;
        this.beatUpdatedEvent();
    }
}

customElements.define('one-note', OneNote);