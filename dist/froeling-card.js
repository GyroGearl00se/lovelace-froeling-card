// Base Class
class BaseFroelingCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._config = null;
        this._hass = null;
        this._svgLoaded = false;
    }

    setConfig(config) {
        this._config = config;
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    padding: 16px;
                    background: var(--card-background-color, white);
                    border-radius: var(--ha-card-border-radius, 8px);
                    box-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0, 0, 0, 0.2));
                }
                svg {
                    width: 100%;
                    height: auto;
                }
            </style>
            <div id="container">
                <p>Lade SVG...</p>
            </div>
        `;
        this._loadSvg();
    }

    set hass(hass) {
        this._hass = hass;
        if (this._config && this._config.entities && this._svgLoaded) {
            this._config.entities.forEach(({ entity, id, stateClasses }) => {
                const entityState = hass.states[entity]?.state || 'N/A';
                const unit = this._hass.states[entity]?.attributes?.unit_of_measurement ?? '';

                // Only update text for elements that are intended to display text
                if (id.startsWith('txt_')) {
                    this._updateSvgText(id, entityState, unit);
                }

                // Update styles if stateClasses are defined
                if (stateClasses) {
                    this._updateSvgStyle(id, entityState, stateClasses);
                }
            });
        }
    }

    async _loadSvg() {
        try {
            const response = await fetch(this.svgUrl);
            if (!response.ok) throw new Error("SVG konnte nicht geladen werden.");
            const svgText = await response.text();
            const container = this.shadowRoot.getElementById('container');
            container.innerHTML = svgText;
            this._svgLoaded = true;

            if (this._hass && this._config && this._config.entities) {
                this._config.entities.forEach(({ entity, id, stateClasses }) => {
                    const entityState = this._hass.states[entity]?.state || 'N/A';
                    const unit = this._hass.states[entity]?.attributes?.unit_of_measurement ?? '';
                    //this._updateSvgText(id, entityState, unit);
                    if (stateClasses) {
                        this._updateSvgStyle(id, entityState, stateClasses);
                    } else {
                        this._updateSvgText(id, entityState, unit);
                    }
                });
            }
        } catch (error) {
            console.error(error);
            this.shadowRoot.getElementById('container').innerHTML = `<p>Fehler: ${error.message}</p>`;
        }
    }

    _updateSvgText(id, text, unit) {
        const svgElement = this.shadowRoot.querySelector(`#${id}`);
        if (svgElement && svgElement.tagName.toLowerCase() === 'text') {
            svgElement.textContent = text + unit;
        } else {
            console.warn(`SVG-Element mit ID '${id}' nicht gefunden oder ist kein Textelement.`);
        }
    }

    _updateSvgStyle(id, state, stateClasses) {
        const svgElement = this.shadowRoot.querySelector(`#${id}`);
        if (svgElement) {
            // Remove all classes defined in stateClasses
            Object.values(stateClasses).forEach(className => {
                svgElement.classList.remove(className);
            });

            // Add the class corresponding to the current state, or use the fallback class
            const className = stateClasses[state] || stateClasses['default'];
            if (className) {
                svgElement.classList.add(className);
            }
        } else {
            console.warn(`SVG-Element mit ID '${id}' nicht gefunden.`);
        }
    }

    getCardSize() {
        return 3;
    }

    static getConfigElement() {
        return document.createElement('froeling-card-editor');
    }
}

// Individual Cards
class FroelingKesselCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = '/local/community/lovelace-froeling-card/kessel.svg';
    }

    static getStubConfig() {
        return {
            entities: [
                {
                    id: 'txt_ash-counter',
                    entity: 'sensor.froeling_verbleibende_heizstunden_bis_zur_asche_entleeren_warnung',
                    label: 'Verbleibende Heizstunden bis zur Entleerung des Aschebehälters'
                },
                {
                    id: 'txt_fuel-level',
                    entity: 'sensor.froeling_fullstand_im_pelletsbehalter',
                    label: 'Füllstand im Pelletsbehälter'
                },
                {
                    id: 'txt_fan-rpm',
                    entity: 'sensor.froeling_saugzugdrehzahl',
                    label: 'Drehzahl des Saugzuggebläses'
                },
                {
                    id: 'txt_boiler-temp',
                    entity: 'sensor.froeling_kesseltemperatur',
                    label: 'Kesseltemperatur'
                },
                {
                    id: 'txt_flue-gas',
                    entity: 'sensor.froeling_abgastemperatur',
                    label: 'Abgastemperatur'
                },
                {
                    id: 'txt_lambda',
                    entity: 'sensor.froeling_restsauerstoffgehalt',
                    label: 'Restsauerstoffgehalt'
                },
                {
                    id: 'txt_pump-01-rpm',
                    entity: 'sensor.froeling_puffer_1_pufferpumpen_ansteuerung',
                    label: 'Pufferpumpen Ansteuerung'
                },
                {
                    id: 'obj_flame',
                    entity: 'sensor.froeling_kesselzustand',
                    label: 'Kesselzustand',
                    stateClasses: {
                        'Vorheizen': 'stHeatingOn',
                        'Heizen': 'stHeatingOn',
                        'SH Heizen': 'stHeatingOn',
                        'default': 'stHeatingOff'
                    }
                },
                {
                    id: 'obj_pump',
                    entity: 'binary_sensor.froeling_puffer_1_pumpe_an_aus',
                    label: 'Pufferpumpe AN AUS',
                    stateClasses: {
                        'on': 'stPumpActive',
                        'default': 'stPumpInActive',
                    }
                }
            ]
        };
    }
}

customElements.define('froeling-kessel-card', FroelingKesselCard);

class FroelingKesselOhnePelletsCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = '/local/community/lovelace-froeling-card/kessel_ohne_pellets.svg';
    }

    static getStubConfig() {
        return {
            entities: [
                {
                    id: 'txt_ash-counter',
                    entity: 'sensor.froeling_verbleibende_heizstunden_bis_zur_asche_entleeren_warnung',
                    label: 'Verbleibende Heizstunden bis zur Entleerung des Aschebehälters'
                },
                {
                    id: 'txt_fan-rpm',
                    entity: 'sensor.froeling_saugzugdrehzahl',
                    label: 'Drehzahl des Saugzuggebläses'
                },
                {
                    id: 'txt_boiler-temp',
                    entity: 'sensor.froeling_kesseltemperatur',
                    label: 'Kesseltemperatur'
                },
                {
                    id: 'txt_flue-gas',
                    entity: 'sensor.froeling_abgastemperatur',
                    label: 'Abgastemperatur'
                },
                {
                    id: 'txt_lambda',
                    entity: 'sensor.froeling_restsauerstoffgehalt',
                    label: 'Restsauerstoffgehalt'
                },
                {
                    id: 'txt_pump-01-rpm',
                    entity: 'sensor.froeling_puffer_1_pufferpumpen_ansteuerung',
                    label: 'Pufferpumpen Ansteuerung'
                },
                {
                    id: 'obj_flame',
                    entity: 'sensor.froeling_kesselzustand',
                    label: 'Kesselzustand',
                    stateClasses: {
                        'Vorheizen': 'stHeatingOn',
                        'Heizen': 'stHeatingOn',
                        'SH Heizen': 'stHeatingOn',
                        'default': 'stHeatingOff'
                    }
                },
                {
                    id: 'obj_pump',
                    entity: 'binary_sensor.froeling_puffer_1_pumpe_an_aus',
                    label: 'Pufferpumpe AN AUS',
                    stateClasses: {
                        'on': 'stPumpActive',
                        'default': 'stPumpInActive',
                    }
                }
            ]
        };
    }
}

customElements.define('froeling-kessel-ohne-pellets-card', FroelingKesselOhnePelletsCard);

class FroelingHeizkreisCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = '/local/community/lovelace-froeling-card/heizkreis.svg';
    }

    static getStubConfig() {
        return {
            entities: [
                {
                    id: 'txt_outside-temp',
                    entity: 'sensor.froeling_aussentemperatur',
                    label: 'Außentemperatur'
                },
                {
                    id: 'txt_flow-temp',
                    entity: 'sensor.froeling_hk01_vorlauf_isttemperatur',
                    label: 'Vorlauftemperatur'
                },
                {
                    id: 'obj_pump-01',
                    entity: 'binary_sensor.froeling_hk01_pumpe_an_aus',
                    label: 'Heizkreispumpe AN AUS',
                    stateClasses: {
                        'on': 'stPumpActive',
                        'default': 'stPumpInActive',
                    }
                }
            ]
        };
    }
}

customElements.define('froeling-heizkreis-card', FroelingHeizkreisCard);

class FroelingAustragungCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = '/local/community/lovelace-froeling-card/austragung.svg';
    }

    static getStubConfig() {
        return {
            entities: [
                {
                    id: 'txt_fuel-level',
                    entity: 'sensor.froeling_fullstand_im_pelletsbehalter',
                    label: 'Füllstand im Pelletsvorratsbehälter'
                },
                {
                    id: 'txt_consumption',
                    entity: 'sensor.froeling_pelletverbrauch_gesamt',
                    label: 'Pelletverbrauch Gesamt'
                },
                {
                    id: 'txt_storage-counter',
                    entity: 'number.froeling_pelletlager_restbestand',
                    label: 'Restbestand im Brennstofflagerraum'
                }
            ]
        };
    }
}
customElements.define('froeling-austragung-card', FroelingAustragungCard);

class FroelingBoilerCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = '/local/community/lovelace-froeling-card/boiler.svg';
    }

    static getStubConfig() {
        return {
            entities: [
                {
                    id: 'txt_pump-01-rpm',
                    entity: 'sensor.froeling_boiler_1_pumpe_ansteuerung',
                    label: 'Boiler Pumpe Ansteuerung'
                },
                {
                    id: 'txt_dhw-temp',
                    entity: 'sensor.froeling_boiler_1_temperatur_oben',
                    label: 'Boilertemperatur oben'
                },
                {
                    id: 'obj_pump-01',
                    entity: 'binary_sensor.froeling_boiler_1_pumpe_an_aus',
                    label: 'Zirkulationspumpe AN/AUS',
                    stateClasses: {
                        'on': 'stPumpActive',
                        'default': 'stPumpInActive',
                    }
                }
            ]
        };
    }
}
customElements.define('froeling-boiler-card', FroelingBoilerCard);

class FroelingPufferCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = '/local/community/lovelace-froeling-card/puffer.svg';
    }

    static getStubConfig() {
        return {
            entities: [
                {
                    id: 'txt_pump-01-rpm',
                    entity: 'sensor.froeling_puffer_1_pufferpumpen_ansteuerung',
                    label: 'Pufferpumpen Ansteuerung'
                },
                {
                    id: 'txt_buffer-load',
                    entity: 'sensor.froeling_puffer_1_ladezustand',
                    label: 'Ladezustand des Pufferspeichers'
                },
                {
                    id: 'txt_buffer-lower-sensor',
                    entity: 'sensor.froeling_puffer_1_temperatur_unten',
                    label: 'Tempertaur unten im Pufferspeicher'
                },
                {
                    id: 'txt_buffer-upper-sensor',
                    entity: 'sensor.froeling_puffer_1_temperatur_oben',
                    label: 'Tempertaur oben im Pufferspeicher'
                },
                {
                    id: 'obj_pump',
                    entity: 'binary_sensor.froeling_puffer_1_pumpe_an_aus',
                    label: 'Pufferpumpe AN AUS',
                    stateClasses: {
                        'on': 'stPumpActive',
                        'default': 'stPumpInActive',
                    }
                }
            ]
        };
    }
}
customElements.define('froeling-puffer-card', FroelingPufferCard);

class FroelingZirkulationspumpeCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = '/local/community/lovelace-froeling-card/zirkulationspumpe.svg';
    }

    static getStubConfig() {
        return {
            entities: [
                {
                    id: 'txt_circulation-pump-rpm',
                    entity: 'sensor.froeling_drehzahl_der_zirkulations_pumpe',
                    label: 'Ansteuerung der Zirkulationspumpe'
                },
                {
                    id: 'txt_circulation-temp',
                    entity: 'sensor.froeling_rucklauftemperatur_an_der_zirkulations_leitung',
                    label: 'Rücklauftemperatur an der Zirkulationsleitung'
                },
                {
                    id: 'obj_pump-01',
                    entity: 'binary_sensor.froeling_zirkulationspumpe_an_aus',
                    label: 'Zirkulationspumpe AN/AUS',
                    stateClasses: {
                        'on': 'stPumpActive',
                        'default': 'stPumpInActive',
                    }
                }
            ]
        };
    }
}
customElements.define('froeling-zirkulationspumpe-card', FroelingZirkulationspumpeCard);

class FroelingSolarthermieCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = '/local/community/lovelace-froeling-card/solarthermie.svg';
    }

    static getStubConfig() {
        return {
            entities: [
                {
                    id: 'txt_pump-01-rpm',
                    entity: 'sensor.froeling_kollektor_pumpe',
                    label: 'Ansteuerung der Kollektorpumpe'
                },
                {
                    id: 'txt_operating-hours',
                    entity: 'sensor.froeling_kollektor_pumpe_laufzeit',
                    label: 'Betriebsstunden der Kollektorpumpe'
                },
                {
                    id: 'txt_outside-temp',
                    entity: 'sensor.froeling_aussentemperatur',
                    label: 'Außentemperatur'
                },
                {
                    id: 'txt_solar-temp',
                    entity: 'sensor.froeling_kollektortemperatur',
                    label: 'Kollektortemperatur'
                },
                {
                    id: 'txt_return-temp',
                    entity: 'sensor.froeling_kollektor_rueklauftemperatur',
                    label: 'Kollektor-Rücklauftemperatur'
                },
                {
                    id: 'txt_flow-temp',
                    entity: 'sensor.froeling_kollektor_vorlauftemperatur',
                    label: 'Kollektor-Vorlauftemperatur'
                },
                {
                    id: 'obj_pump-01',
                    entity: 'binary_sensor.froeling_kollektorpumpe_an_aus',
                    label: 'Status der Kollektorpumpe',
                    stateClasses: {
                        'on': 'stPumpActive',
                        'default': 'stPumpInActive',
                    }
                }
            ]
        };
    }
}
customElements.define('froeling-solarthermie-card', FroelingSolarthermieCard);

if (window.customCards) {
    window.customCards.push(
        {
            type: "froeling-kessel-card",
            name: "Froeling Kessel Card",
            description: "Visuelle Darstellung Fröling - Kessel",
            preview: true,
            editor: "froeling-card-editor",
            documentationURL: "https://github.com/GyroGearl00se"
        },
        {
            type: "froeling-kessel-ohne-pellets-card",
            name: "Froeling Kessel ohne Pellets Card",
            description: "Visuelle Darstellung Fröling - Kessel (ohne Pellets)",
            preview: true,
            editor: "froeling-card-editor",
            documentationURL: "https://github.com/GyroGearl00se"
        },
        {
            type: "froeling-heizkreis-card",
            name: "Froeling Heizkreis Card",
            description: "Visuelle Darstellung Fröling - Heizkreis",
            preview: true,
            editor: "froeling-card-editor",
            documentationURL: "https://github.com/GyroGearl00se"
        },
        {
            type: "froeling-austragung-card",
            name: "Froeling Austragung Card",
            description: "Visuelle Darstellung Fröling - Austragung",
            preview: true,
            editor: "froeling-card-editor",
            documentationURL: "https://github.com/GyroGearl00se"
        },
        {
            type: "froeling-boiler-card",
            name: "Froeling Boiler Card",
            description: "Visuelle Darstellung Fröling - Boiler",
            preview: true,
            editor: "froeling-card-editor",
            documentationURL: "https://github.com/GyroGearl00se"
        },
        {
            type: "froeling-puffer-card",
            name: "Froeling Puffer Card",
            description: "Visuelle Darstellung Fröling - Puffer",
            preview: true,
            editor: "froeling-card-editor",
            documentationURL: "https://github.com/GyroGearl00se"
        },
        {
            type: "froeling-zirkulationspumpe-card",
            name: "Froeling Zirkulationspumpe Card",
            description: "Visuelle Darstellung Fröling - Zirkulationspumpe",
            preview: true,
            editor: "froeling-card-editor",
            documentationURL: "https://github.com/GyroGearl00se"
        },
        {
            type: "froeling-solarthermie-card",
            name: "Froeling Solarthermie Card",
            description: "Visuelle Darstellung Fröling - Solarthermie",
            preview: true,
            editor: "froeling-card-editor",
            documentationURL: "https://github.com/GyroGearl00se"
        }
    );
}

class FroelingCardEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._config = {};
        this._hass = null;
    }

    set hass(hass) {
        this._hass = hass;
        this.render();
    }

    setConfig(config) {
        this._config = JSON.parse(JSON.stringify(config)); // Deep copy
        this.render();
    }

    configChanged(newConfig) {
        this.dispatchEvent(new CustomEvent("config-changed", {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        }));
    }

    render() {
        if (!this._config || !Array.isArray(this._config.entities)) return;

        if (!this.shadowRoot.innerHTML) {
            this.shadowRoot.innerHTML = `
                <style>
                    .card-config {
                        padding: 16px;
                    }
                    .entity {
                        margin-bottom: 2px;
                        border-radius: 10px;
                        border: 2px solid #636363;
                        position: relative;
                        padding: 10px;
                    }
                    label {
                        font-weight: bold;
                        display: block;
                        margin-bottom: 4px;
                    }
                    input {
                        width: 100%;
                        padding: 8px;
                        box-sizing: border-box;
                        border-radius: 25px;
                        border: 2px solid #0288d1;
                    }
                    .autocomplete-list {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background: var(--card-background-color, #fff);
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* Subtiler Schatten */
                        max-height: 150px;
                        overflow-y: auto;
                        z-index: 10;
                        padding: 4px 0; /* Abstand innerhalb der Liste */
                    }
                    .autocomplete-item {
                        padding: 8px 12px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: background 0.2s, color 0.2s;
                    }
                    .autocomplete-item:hover {
                        background: var(--primary-color, #0288d1); /* Farbe beim Hover */
                        color: white;
                    }
                </style>
                <div class="card-config">
                    <h3>Entities</h3>
                    <div id="entities"></div>
                </div>
            `;
        }

        const container = this.shadowRoot.querySelector('#entities');
        container.innerHTML = ''; // Clear container

        this._config.entities.forEach((entity, index) => {
            const entityContainer = document.createElement('div');
            entityContainer.className = 'entity';

            const label = document.createElement('label');
            const displayLabel = entity.label || `ID: ${entity.id || `Unknown ID ${index + 1}`}`;
            label.textContent = displayLabel;
            label.htmlFor = `entity-${index}`;
            entityContainer.appendChild(label);

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `entity-${index}`;
            input.value = entity.entity || '';
            input.dataset.index = index;

            const autocompleteList = document.createElement('div');
            autocompleteList.className = 'autocomplete-list';
            autocompleteList.style.display = 'none'; // Hidden by default

            input.addEventListener('input', (e) => this._onInputChange(e, autocompleteList));
            input.addEventListener('focus', () => this._populateAutocomplete(autocompleteList));
            input.addEventListener('blur', () => {
                setTimeout(() => autocompleteList.style.display = 'none', 200); // Hide on blur with delay
            });

            autocompleteList.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Prevent losing focus
                const selectedEntity = e.target.getAttribute('data-entity');
                if (selectedEntity) {
                    this._onAutocompleteSelect(index, selectedEntity, input, autocompleteList);
                }
            });

            entityContainer.appendChild(input);
            entityContainer.appendChild(autocompleteList);
            container.appendChild(entityContainer);
        });
    }

    _onInputChange(event, autocompleteList) {
        const value = event.target.value.toLowerCase();
        this._populateAutocomplete(autocompleteList, value);
    }

    _populateAutocomplete(autocompleteList, filter = '') {
        if (!this._hass || !this._hass.states) return;

        const allEntities = Object.keys(this._hass.states);
        const filteredEntities = allEntities
        .filter((entity) => entity.toLowerCase().includes(filter))
        .slice(0, 10);

        autocompleteList.innerHTML = ''; // Clear list
        filteredEntities.forEach((entity) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.setAttribute('data-entity', entity);
            item.textContent = entity;
            autocompleteList.appendChild(item);
        });

        autocompleteList.style.display = filteredEntities.length ? 'block' : 'none';
    }

    _onAutocompleteSelect(index, selectedEntity, input, autocompleteList) {
        // Update config
        const updatedEntities = [...this._config.entities];
        updatedEntities[index] = { ...updatedEntities[index], entity: selectedEntity };

        const newConfig = { ...this._config, entities: updatedEntities };
        this._config = newConfig; // Update local config

        // Update input value
        input.value = selectedEntity;

        // Hide autocomplete
        autocompleteList.style.display = 'none';

        // Notify Home Assistant about the config change
        this.configChanged(newConfig);
    }
}

customElements.define('froeling-card-editor', FroelingCardEditor);
