import Swiper from './js/swiper.min.js?v=1';

class SwipeCard extends HTMLElement {

    constructor() {
        super();
        // Make use of shadowRoot to avoid conflicts when reusing
        this.attachShadow({ mode: 'open' });
    }

    set hass(hass) {
        if (!this.swiper) {
            this.createSwiper(hass);
        } else {
            this._cards.forEach(item => {
                item.hass = hass;
            });

            this.swiper.update();
        }
    }

    createSwiper(hass) {
        const card = document.createElement('div');
        const link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = '/local/custom-lovelace/swipe-card/css/swiper.min.css?v=8';

        card.appendChild(link);
        this.container = document.createElement('div');
        this.container.className = 'swiper-container';

        this.content = document.createElement('div');
        this.content.className = 'swiper-wrapper';
        this.container.dir = (hass.translationMetadata.translations[hass.selectedLanguage].isRTL || false) ? "rtl" : "ltr";
        this.container.appendChild(this.content);

        if ('navigation' in this.parameters) {
            if (this.parameters.navigation === null) {
                this.parameters.navigation = {};
            }

            const nextbtn = document.createElement('div');
            nextbtn.className = 'swiper-button-next';
            this.container.appendChild(nextbtn);
            this.parameters.navigation.nextEl = nextbtn;

            const prevbtn = document.createElement('div');
            prevbtn.className = 'swiper-button-prev';
            this.container.appendChild(prevbtn);
            this.parameters.navigation.prevEl = prevbtn;
        }

        if ('scrollbar' in this.parameters) {
            if (this.parameters.scrollbar === null) {
                this.parameters.scrollbar = {};
            }

            this.scrollbar = document.createElement('div');
            this.scrollbar.className = 'swiper-scrollbar';
            this.container.appendChild(this.scrollbar);
            this.parameters.scrollbar.el = this.scrollbar;
        }

        if ('pagination' in this.parameters) {
            if (this.parameters.pagination === null) {
                this.parameters.pagination = {};
            }

            this.pagination = document.createElement('div');
            this.pagination.className = 'swiper-pagination';
            this.container.appendChild(this.pagination);
            this.parameters.pagination.el = this.pagination;
        }

        card.appendChild(this.container);
        this.shadowRoot.appendChild(card);

        this._cards = this.config.cards.map(item => {
            const div = document.createElement('div');
            let element;
            if (item.type.startsWith("custom:")) {
                element = document.createElement(`${item.type.substr("custom:".length)}`);
            } else {
                element = document.createElement(`hui-${item.type}-card`);
            }
            element.setConfig(item);
            if (this._hass) element.hass = hass;
            element.className = 'swiper-slide';
            if ('card_width' in this.config) {
                element.style.width = this.config.card_width;
            }
            this.content.appendChild(element);
            return element;
        });

        if ('start_card' in this.config) {
          const start_card = this.config.start_card -1;
          this.parameters.on = {
            init: function () {
              this.slideTo(start_card);
            },
          };
        }

        this.swiper = new Swiper(this.container, this.parameters);

    }

    setConfig(config) {
        this.config = config;
        this.title = config.title || '';

        this.parameters = config.parameters || {};
    }

    getCardSize() {
        return 2;
    }
}

customElements.define('swipe-card', SwipeCard);
