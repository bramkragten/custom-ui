import Swiper from 'https://cdn.jsdelivr.net/gh/bramkragten/custom-ui@master/swipe-card/js/swiper.min.js';

const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;

class SwipeCard extends LitElement {

    get properties() {
        return {
            _config: {},
            _cards: {},
        };
    }

    setConfig(config) {
        if (!config || !config.cards || !Array.isArray(config.cards)) {
            throw new Error("Card config incorrect");
        }
        this._config = config;
        this._parameters = config.parameters || {};
        this._cards = config.cards.map((card) => {
            const element = this._createCardElement(card);
            return element;
        });
    }

    set hass(hass) {
        this._hass = hass;

        if (!this._cards) {
            return;
        }

        for (const element of this._cards) {
            element.hass = this._hass;
        }

    }

    connectedCallback() {
        super.connectedCallback();
        if (this._config && this._updated && !this._loaded) {
            this._initialLoad();
        }
    }

    firstUpdated() {
        this._updated = true;
        if (this._config && this.isConnected && !this._loaded) {
            this._initialLoad();
        }
    }

    updated() {
      if (this.swiper) {
        this.swiper.update();
      }
    }

    render() {
        if (!this._config || !this._hass) {
            return html ``;
        }

        return html `
            <div class="swiper-container" dir="${(this._hass.translationMetadata.translations[this._hass.selectedLanguage || this._hass.language].isRTL || false) ? "rtl" : "ltr"}">
              <div class="swiper-wrapper">
                ${this._cards}
              </div>
              ${ "pagination" in this._parameters ? html`<div class="swiper-pagination"></div>` : "" }
              ${ "navigation" in this._parameters ? html`<div class="swiper-button-next"></div><div class="swiper-button-prev"></div>` : "" }
              ${ "scrollbar" in this._parameters ? html`<div class="swiper-scrollbar"></div>` : "" }
            </div>
    		`;
    }

    async _initialLoad() {
        this._loaded = true;
        const link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/gh/bramkragten/custom-ui@master/swipe-card/css/swiper.min.css';
        this.shadowRoot.appendChild(link);

        if ('pagination' in this._parameters) {
            if (this._parameters.pagination === null) {
                this._parameters.pagination = {};
            }
            this._parameters.pagination.el = this.shadowRoot.querySelector(".swiper-pagination");
        }

        if ('navigation' in this._parameters) {
            if (this._parameters.navigation === null) {
                this._parameters.navigation = {};
            }
            this._parameters.navigation.nextEl = this.shadowRoot.querySelector(".swiper-button-next");
            this._parameters.navigation.prevEl = this.shadowRoot.querySelector(".swiper-button-prev");
        }

        if ('scrollbar' in this._parameters) {
            if (this._parameters.scrollbar === null) {
                this._parameters.scrollbar = {};
            }
            this._parameters.scrollbar.el = this.shadowRoot.querySelector(".swiper-scrollbar");
        }

        if ('start_card' in this._config) {
            const start_card = this._config.start_card - 1;
            this._parameters.on = {
                init: function () {
                    this.slideTo(start_card);
                },
            };
        }

        this.swiper = new Swiper(this.shadowRoot.querySelector(".swiper-container"), this._parameters);
    }

    _createCardElement(cardConfig) {
        let element;
        let errorConfig;
        if (cardConfig.type.startsWith("custom:")) {
            const tag = config.type.substr(CUSTOM_TYPE_PREFIX.length);

            if (customElements.get(tag)) {
                element = document.createElement(`${cardConfig.type.substr("custom:".length)}`);
            } else {
                errorConfig = {
                  type: "error",
                  error: `Custom element doesn't exist: ${tag}.`,
                  cardConfig,
                }
                element = document.createElement("hui-error-card");
                element.style.display = "None";
                const timer = window.setTimeout(() => {
                  element.style.display = "";
                }, 5000);

                customElements.whenDefined(tag).then(() => {
                  clearTimeout(timer);
                  fireEvent(element, "ll-rebuild");
                });
            }
        } else {
            element = document.createElement(`hui-${cardConfig.type}-card`);
        }

        element.className = 'swiper-slide';

        if ('card_width' in this._config) {
            element.style.width = this._config.card_width;
        }

        if (errorConfig) {
            element.setConfig(errorConfig);
        } else {
            element.setConfig(cardConfig);
        }

        if (this._hass) {
            element.hass = this._hass;
        }
        element.addEventListener(
            "ll-rebuild",
            (ev) => {
                ev.stopPropagation();
                this._rebuildCard(element, cardConfig);
            }, {
                once: true
            }
        );
        return element;
    }

    _rebuildCard(
        element,
        config
    ) {
        const newCard = this._createCardElement(config);
        element.replaceWith(newCard);
        this._cards.splice(this._cards.indexOf(element), 1, newCard);
    }

    getCardSize() {
        return 2;
    }
}

customElements.define('swipe-card', SwipeCard);
