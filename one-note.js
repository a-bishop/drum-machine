import { LitElement, html, css } from 'lit-element';

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
            isLit: { type: Boolean },
            note: { type: String }
        }
    }

    constructor() {
        super();
        this.bgColor = 'white';
        this.isLit = false;
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
        this.dispatchEvent(new CustomEvent('note-changed', {
            detail: {
                index: this.index,
                newState: this.isLit
            }
        }))
    }

    handleClick() {
        const on = this.isLit ? true : false
        if (!on) {
            this.isLit = true;
            this.bgColor = 'lightBlue';
        } else {
            this.isLit = false;
            this.bgColor = 'white';
        }
        this.beatUpdatedEvent();
    }
}

customElements.define('one-note', OneNote);