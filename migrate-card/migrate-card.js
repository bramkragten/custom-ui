import {
  LitElement, html,
} from 'https://unpkg.com/@polymer/lit-element@^0.5.2/lit-element.js?module';

class MigrateCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
    };
  }

  _render({ hass, config }) {
    return html`
    <style>
    ha-icon {
      display: flex;
      margin: auto;
    }
    paper-button {
      display: flex;
      margin: auto;
      text-align: center;
    }
    </style>
    <ha-card header="Migrate config" on-click="${ev => this._migrate(hass)}">
      <paper-button>
      <div>
        <ha-icon icon="mdi:playlist-edit" style="width: 40%; height: 40%; color: var(--primary-text-color);"></ha-icon>
        <span>Add ID's to 'ui-lovelace.yaml'</span>
      </div>
      </paper-button>
    </ha-card>
    `;
  }

  _migrate(hass) {
    hass.callWS({ type: "lovelace/config/migrate"}).then(
            (resp) => {
                alert("Successfully migrated!");
            },
            (err) => {
                alert("Error: " + err.message);
                console.error('Message failed!', err);
            }
    );
  }

  setConfig(config) {
    this.config = config;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return 1;
  }

}

customElements.define('migrate-card', MigrateCard);
