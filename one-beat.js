import { LitElement, html, css } from 'lit-element';

class OneBeat extends LitElement {
    static get styles() {
        return css`
            .beat {
                width: 30px;
                height: 30px;
                border: 1px solid black;
            }
        `
    }

    static get properties() {
        return {
            clear: { type: Boolean },
            bgColor: { type: String },
            instrument: { type: String },
            index: { type: Number },
            isLit: { type: Boolean }
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
        // if (this.bgColor === 'lightBlue') {
        //     switch (this.instrument) {
        //         case 'bass-drum':
        //             const bassDrum = new Tone.MembraneSynth().toMaster();
        //             bassDrum.triggerAttackRelease("C2", "8n");
        //             break;
        //         case 'snare-drum':
        //             new Tone.Player({
        //                 "url": "./sounds/snare.wav",
        //                 "autostart": true
        //             }).toMaster();
        //             break;
        //         case 'hi-hat':
        //             const hiHat = new Tone.NoiseSynth().toMaster();
        //             hiHat.triggerAttackRelease("8n");
        //             break;
        //         default:
        //             break;
        //     }
        // }

    }
}

customElements.define('one-beat', OneBeat);