function getScript(e,t){var n=document.getElementsByTagName("head")[0],r=!1,i=document.createElement("script");i.src=e,i.onload=i.onreadystatechange=function(){!r&&(!this.readyState||this.readyState==="loaded"||this.readyState==="complete")&&(r=!0,typeof t=="function"&&t())},n.appendChild(i)};

class SwipeCard extends HTMLElement {

    set hass(hass) {
        this._hass = hass;
        if (!this.content) {
          const card = document.createElement('div');
          const link = document.createElement('link');
          link.type = 'text/css';
          link.rel = 'stylesheet';
          link.href = '/local/custom-lovelace/swipe-card/css/swiper.min.css?v=4';
          
          card.appendChild(link);
          this.container = document.createElement('div');
          this.container.className = 'swiper-container';

          this.content = document.createElement('div');
          this.content.className = 'swiper-wrapper';
          
          this.scrollbar = document.createElement('div');
          this.scrollbar.className = 'swiper-scrollbar';
          
          this.container.appendChild(this.content);
          this.container.appendChild(this.scrollbar);
          
          card.appendChild(this.container);
          this.appendChild(card);
          
          this._cards = this.config.cards.map((item) => {
              const div = document.createElement('div');
              let element;
              if (item.type.startsWith("custom:")){
                element = document.createElement(`${item.type.substr("custom:".length)}`);
              } else {
                element = document.createElement(`hui-${item.type}-card`);
              }
              element.setConfig(item);
              if(this._hass)
                element.hass = this._hass;
              element.className = 'swiper-slide';
              this.content.appendChild(element);
              return element;
            });
          
          var _this = this;
          
            getScript("/local/custom-lovelace/swipe-card/js/swiper.min.js", function(){
                    _this.swiper = new Swiper(_this.container, {
                      scrollbar: {
                        el: _this.scrollbar,
                        hide: false,
                        draggable: true,
                        snapOnRelease: true,
                      },
                      keyboard: {
                        enabled: true,
                        onlyInViewport: true,
                      },
                    });
            });
          
        }
        
        this._cards.forEach(item => {
          item.hass = hass;
        });

        if (this.swiper) {
            this.swiper.update();
        }
    }
    
  setConfig(config) {
    this.config = config;
    this.title = config.title || '';
  }
    
  getCardSize() {
    return 4;
  }
}

customElements.define('swipe-card', SwipeCard);