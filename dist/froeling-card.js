// Base Class
class BaseFroelingCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
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
          background: var(--card-background-color);
          border-radius: var(--ha-card-border-radius, 8px);
        }

        .displayOff {
          display: none;
        }
      </style>
      <div id="container">Loading SVG…</div>
    `;
        this._loadSvg();
    }

    set hass(hass) {
        this._hass = hass;
        currentLang = hass.language || hass.locale?.language;
        if (!this._svgLoaded || !this._config?.entities) return;
        this._updateAll();
    }

    async _loadSvg() {
        const res = await fetch(this.svgUrl);
        const svg = await res.text();
        this.shadowRoot.getElementById("container").innerHTML = svg;
        this._svgLoaded = true;
        if (this._hass) this._updateAll();
    }

    _updateAll() {
        Object.entries(this._config.entities).forEach(([id, cfg]) => {
            const stateObj = this._hass.states[cfg.entity];
            const state = stateObj?.state ?? "N/A";
            const unit = stateObj?.attributes?.unit_of_measurement ?? "";

            if (id.startsWith("txt_")) {
                this._updateSvgText(id, state, unit);
            }

            if (cfg.stateClasses) {
                this._updateSvgStyle(id, state, cfg.stateClasses);
            }

            if (cfg.displayId) {
                this._updateDisplay(cfg.displayId, cfg.display);
            }
        });
    }

    _updateSvgText(id, value, unit) {
        const el = this.shadowRoot.querySelector(`#${id}`);
        if (el) el.textContent = `${value}${unit}`;
    }

    _updateSvgStyle(id, state, stateClasses) {
        const el = this.shadowRoot.querySelector(`#${id}`);
        if (!el) return;

        [...el.classList]
            .filter(c => c.startsWith("st"))
            .forEach(c => el.classList.remove(c));

        const cls = stateClasses[state] || stateClasses.default;
        if (cls) el.classList.add(cls);
    }



    _updateDisplay(id, display) {
        const el = this.shadowRoot.querySelector(`#${id}`);
        if (!el) return;

        const on = display === true || String(display).toLowerCase() === 'on';
        el.classList.toggle("displayOff", !on);
    }

    getCardSize() {
        return 3;
    }
}

let currentLang = 'en';
const TRANSLATIONS = {
    'de': {
        'kessel': 'Kessel',
        'kesseltemperatur': 'Kesseltemperatur',
        'abgastemperatur': 'Abgastemperatur',
        'restsauerstoff': 'Restsauerstoff',
        'saugzuggeblaese': 'Saugzuggebläse',
        'kesselzustand': 'Kesselzustand',
        'pufferpumpe': 'Pufferpumpe',
        'zweitkessel': 'Zweitkessel',
        'zweitkessel-zustand': 'Zweitkessel Zustand',
        'pumpen-ansteuerung': 'Pumpen-Ansteuerung',
        'heizkreis': 'Heizkreis',
        'aussentemperatur': 'Außentemperatur',
        'raumtemperatur': 'Raumtemperatur',
        'vorlauftemperatur': 'Vorlauftemperatur',
        'heizkreispumpe': 'Heizkreispumpe',
        'austragung': 'Austragung',
        'pellet-fuellstand': 'Pellet-Füllstand',
        'pelletverbrauch': 'Pelletverbrauch',
        'restbestand-lager': 'Restbestand Lager',
        'boilertemperatur-oben': 'Boilertemperatur oben',
        'boilerpumpe': 'Boilerpumpe',
        'boiler': 'Boiler',
        'pufferspeicher': 'Pufferspeicher',
        'temperatur-oben': 'Temperatur oben',
        'temperatur-mitte': 'Temperatur Mitte',
        'temperatur-unten': 'Temperatur unten',
        'ladezustand': 'Ladezustand',
        'zirkulationspumpe': 'Zirkulationspumpe',
        'rucklauftemperatur': 'Rücklauftemperatur',
        'solarthermie': 'Solarthermie',
        'kollektortemperatur': 'Kollektortemperatur',
        'betriebsstunden': 'Betriebsstunden',
        'kollektorpumpe': 'Kollektorpumpe',
    },
    'en': {
        'kessel': 'Boiler',
        'kesseltemperatur': 'Boiler Temperature',
        'abgastemperatur': 'Flue Gas Temperature',
        'restsauerstoff': 'Residual Oxygen',
        'saugzuggeblaese': 'Induced Draft Fan',
        'kesselzustand': 'Boiler State',
        'pufferpumpe': 'Buffer Pump',
        'zweitkessel': 'Second Boiler',
        'zweitkessel-zustand': 'Second Boiler State',
        'pumpen-ansteuerung': 'Pump Control',
        'heizkreis': 'Heating Circuit',
        'aussentemperatur': 'Outside Temperature',
        'raumtemperatur': 'Room Temperature',
        'vorlauftemperatur': 'Flow Temperature',
        'heizkreispumpe': 'Heating Circuit Pump',
        'austragung': 'Discharge',
        'pellet-fuellstand': 'Pellet Level',
        'pelletverbrauch': 'Pellet Consumption',
        'restbestand-lager': 'Remaining Stock in Storage',
        'boilertemperatur-oben': 'Boiler Temperature Top',
        'boilerpumpe': 'Boiler Pump',
        'boiler': 'Boiler',
        'pufferspeicher': 'Buffer Tank',
        'temperatur-oben': 'Temperature Top',
        'temperatur-mitte': 'Temperature Middle',
        'temperatur-unten': 'Temperature Bottom',
        'ladezustand': 'Charge Level',
        'zirkulationspumpe': 'Circulation Pump',
        'rucklauftemperatur': 'Return Temperature',
        'solarthermie': 'Solar Thermal',
        'kollektortemperatur': 'Collector Temperature',
        'betriebsstunden': 'Operating Hours',
        'kollektorpumpe': 'Collector Pump',
    }
};

const t = (key) => {
    const lang = currentLang.split('-')[0];
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
};
// SCHEMA HELPERS

// Text / Sensor Entity
const textEntity = (id, title, opts = {}) => ({
    name: id,
    title,
    type: "expandable",
    expanded: false,
    schema: [
        {
            name: "entity",
            required: true,
            selector: { entity: {} },
        },
        ...(opts.display !== false
            ? [
                {
                    name: "display",
                    title: "display",
                    selector: { boolean: {} },
                },
            ]
            : []),
    ],
});

// Binary Sensor with State Classes
const binaryEntity = (id, title) => ({
    name: id,
    title,
    type: "expandable",
    expanded: false,
    schema: [
        {
            name: "entity",
            required: true,
            selector: { entity: { domain: "binary_sensor" } },
        },
        {
            name: "stateClasses",
            title: "stateClasses",
            type: "expandable",
            expanded: false,
            schema: [
                {
                    name: 'on',
                    title: 'on',
                    selector: { text: {} },
                },
                {
                    name: 'default',
                    title: 'default',
                    selector: { text: {} },
                },
            ],
        },
    ],
});

// State Entity mit State Classes
const stateEntity = (id, title, states = []) => ({
    name: id,
    title,
    type: "expandable",
    schema: [
        {
            name: "entity",
            required: true,
            selector: { entity: {} },
        },
        {
            name: "stateClasses",
            title: "stateClasses",
            type: "expandable",
            schema: [
                ...states.map((state) => ({
                    name: state,
                    title: state,
                    selector: { text: {} },
                })),
                {
                    name: "default",
                    title: "default",
                    selector: { text: {} },
                },
            ],
        },
    ],
});


// Card Entity Group
const entityGroup = (name, label, schema) => ({
    name,
    type: "expandable",
    label,
    expanded: true,
    schema,
});

// Individual Cards
class FroelingKesselCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = "/local/community/lovelace-froeling-card/kessel.svg";
    }

    static getStubConfig() {
        return {
            entities: {
                'txt_ash-counter': {
                    entity: 'sensor.froeling_verbleibende_heizstunden_bis_zur_asche_entleeren_warnung',
                    displayId: 'ash-counter',
                    display: 'on'
                },
                'txt_fuel-level': {
                    entity: 'sensor.froeling_fullstand_im_pelletsbehalter',
                    displayId: 'fuel-level',
                    display: 'on'
                },
                'txt_fan-rpm': {
                    entity: 'sensor.froeling_saugzugdrehzahl',
                    displayId: 'fan-rpm',
                    display: 'on'
                },
                'txt_boiler-temp': {
                    entity: 'sensor.froeling_kesseltemperatur',
                    displayId: 'boiler-temp',
                    display: 'on'
                },
                'txt_flue-gas': {
                    entity: 'sensor.froeling_abgastemperatur',
                    displayId: 'flue-gas',
                    display: 'on'
                },
                'txt_lambda': {
                    entity: 'sensor.froeling_restsauerstoffgehalt',
                    displayId: 'lambda',
                    display: 'on'
                },
                'txt_pump-01-rpm': {
                    entity: 'sensor.froeling_puffer_1_pufferpumpen_ansteuerung',
                    displayId: 'pump-01-rpm',
                    display: 'on'
                },
                'obj_flame': {
                    entity: 'sensor.froeling_kesselzustand',
                    stateClasses: {
                        'Vorheizen': 'stHeatingOn',
                        'Heizen': 'stHeatingOn',
                        'SH Heizen': 'stHeatingOn',
                        'default': 'stHeatingOff'
                    }
                },
                'obj_pump': {
                    entity: 'binary_sensor.froeling_puffer_1_pumpe_an_aus',
                    stateClasses: {
                        'on': 'stPumpActive',
                        'default': 'stPumpInActive',
                    }
                }
            }
        };
    }

    static getConfigForm() {
        return {
            schema: [
                entityGroup("entities", t("kessel"), [
                    textEntity("txt_boiler-temp", t("kesseltemperatur")),
                    textEntity("txt_flue-gas", t("abgastemperatur")),
                    textEntity("txt_lambda", t("restsauerstoff")),
                    textEntity("txt_fan-rpm", t("saugzuggeblaese")),
                    stateEntity(
                        "obj_flame",
                        t("kesselzustand"),
                        ["Vorheizen", "Heizen", "SH Heizen"]
                    ),
                    binaryEntity("obj_pump", t("pufferpumpe")),
                ]),
            ],
        };
    }

}

customElements.define("froeling-kessel-card", FroelingKesselCard);

class FroelingZweitKesselCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = "/local/community/lovelace-froeling-card/kessel2.svg";
    }

    static getStubConfig() {
        return {
            entities: {
                'txt_boiler2-temp': {
                    entity: 'sensor.froeling_zweitkessel_temperatur',
                    displayId: 'boiler2-temp',
                    display: true,
                },
                'obj_flame': {
                    entity: 'sensor.froeling_zweitkessel_zustand',
                    stateClasses: {
                        'Vorheizen': 'stHeatingOn',
                        'Heizen': 'stHeatingOn',
                        'SH Heizen': 'stHeatingOn',
                        'default': 'stHeatingOff',
                    },
                },
            },
        };
    }

    static getConfigForm() {
        return {
            schema: [
                entityGroup("entities", t("zweitkessel"), [
                    textEntity("txt_boiler2-temp", "Zweitkessel Temperatur"),
                    stateEntity(
                        "obj_flame",
                        t("zweitkessel-zustand"),
                        ["Vorheizen", "Heizen", "SH Heizen"]
                    ),
                ]),
            ],
        };
    }
}

customElements.define("froeling-zweitkessel-card", FroelingZweitKesselCard);


class FroelingKesselOhnePelletsCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = "/local/community/lovelace-froeling-card/kessel_ohne_pellets.svg";
    }

    static getStubConfig() {
        return {
            entities: {
                'txt_fan-rpm': {
                    entity: 'sensor.froeling_saugzugdrehzahl',
                    displayId: 'fan-rpm',
                    display: true,
                },
                'txt_boiler-temp': {
                    entity: 'sensor.froeling_kesseltemperatur',
                    displayId: 'boiler-temp',
                    display: true,
                },
                'txt_flue-gas': {
                    entity: 'sensor.froeling_abgastemperatur',
                    displayId: 'flue-gas',
                    display: true,
                },
                'txt_lambda': {
                    entity: 'sensor.froeling_restsauerstoffgehalt',
                    displayId: 'lambda',
                    display: true,
                },
                'txt_pump-01-rpm': {
                    entity: 'sensor.froeling_puffer_1_pufferpumpen_ansteuerung',
                    displayId: 'pump-01-rpm',
                    display: true,
                },
                'obj_flame': {
                    entity: 'sensor.froeling_kesselzustand',
                    stateClasses: {
                        'Vorheizen': 'stHeatingOn',
                        'Heizen': 'stHeatingOn',
                        'SH Heizen': 'stHeatingOn',
                        'default': 'stHeatingOff',
                    },
                },
                'obj_pump': {
                    entity: 'binary_sensor.froeling_puffer_1_pumpe_an_aus',
                    stateClasses: {
                        'on': 'stPumpActive',
                        'default': 'stPumpInActive',
                    },
                },
            },
        };
    }

    static getConfigForm() {
        return {
            schema: [
                entityGroup("entities", t("kessel"), [
                    textEntity("txt_boiler-temp", t("kesseltemperatur")),
                    textEntity("txt_flue-gas", t("abgastemperatur")),
                    textEntity("txt_lambda", t("restsauerstoff")),
                    textEntity("txt_fan-rpm", t("saugzuggeblaese")),
                    textEntity("txt_pump-01-rpm", t("pumpen-ansteuerung")),
                    stateEntity(
                        "obj_flame",
                        t("kesselzustand"),
                        ["Vorheizen", "Heizen", "SH Heizen"]
                    ),
                    binaryEntity("obj_pump", t("pufferpumpe")),
                ]),
            ],
        };
    }
}

customElements.define("froeling-kessel-ohne-pellets-card", FroelingKesselOhnePelletsCard);

class FroelingHeizkreisCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = "/local/community/lovelace-froeling-card/heizkreis.svg";
    }

    static getStubConfig() {
        return {
            entities: {
                'txt_outside-temp': {
                    entity: 'sensor.froeling_aussentemperatur',
                    displayId: 'outside-temp',
                    display: 'on',
                },
                'txt_room-temp': {
                    entity: 'sensor.froeling_raumtemperatur',
                    displayId: 'room-temp',
                    display: 'on',
                },
                'txt_flow-temp': {
                    entity: 'sensor.froeling_hk01_vorlauf_isttemperatur',
                    displayId: 'flow-temp',
                    display: 'on',
                },
                'obj_pump-01': {
                    entity: 'binary_sensor.froeling_hk01_pumpe_an_aus',
                    stateClasses: {
                        'on': 'stPumpActive',
                        'default': 'stPumpInActive',
                    },
                },
            },
        };
    }

    static getConfigForm() {
        return {
            schema: [
                entityGroup("entities", t("heizkreis"), [
                    textEntity("txt_outside-temp", t("aussentemperatur")),
                    textEntity("txt_room-temp", t("raumtemperatur")),
                    textEntity("txt_flow-temp", t("vorlauftemperatur")),
                    binaryEntity("obj_pump-01", t("heizkreispumpe")),
                ]),
            ],
        };
    }

}

customElements.define("froeling-heizkreis-card", FroelingHeizkreisCard);

class FroelingAustragungCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = "/local/community/lovelace-froeling-card/austragung.svg";
    }

    static getStubConfig() {
        return {
            entities: {
                'txt_fuel-level': {
                    entity: 'sensor.froeling_fullstand_im_pelletsbehalter',
                    displayId: 'fuel-level',
                    display: true,
                },
                'txt_consumption': {
                    entity: 'sensor.froeling_pelletverbrauch_gesamt',
                    displayId: 'consumption',
                    display: true,
                },
                'txt_storage-counter': {
                    entity: 'number.froeling_pelletlager_restbestand',
                    displayId: 'storage-counter',
                    display: true,
                },
            },
        };
    }

    static getConfigForm() {
        return {
            schema: [
                entityGroup("entities", t("austragung"), [
                    textEntity("txt_fuel-level", t("pellet-fuellstand")),
                    textEntity("txt_consumption", t("pelletverbrauch")),
                    textEntity("txt_storage-counter", t("restbestand-lager")),
                ]),
            ],
        };
    }
}

customElements.define("froeling-austragung-card", FroelingAustragungCard);

class FroelingBoilerCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = "/local/community/lovelace-froeling-card/boiler.svg";
    }

    static getStubConfig() {
        return {
            entities: {
                'txt_pump-01-rpm': {
                    entity: 'sensor.froeling_boiler_1_pumpe_ansteuerung',
                    displayId: 'pump-01-rpm',
                    display: true,
                },
                'txt_dhw-temp': {
                    entity: 'sensor.froeling_boiler_1_temperatur_oben',
                    displayId: 'dhw-temp',
                    display: true,
                },
                'obj_pump-01': {
                    entity: 'binary_sensor.froeling_boiler_1_pumpe_an_aus',
                    stateClasses: {
                        'on': 'stPumpActive',
                        'default': 'stPumpInActive',
                    },
                },
            },
        };
    }

    static getConfigForm() {
        return {
            schema: [
                entityGroup("entities", t("boiler"), [
                    textEntity("txt_dhw-temp", t("boilertemperatur-oben")),
                    textEntity("txt_pump-01-rpm", t("pumpen-ansteuerung")),
                    binaryEntity("obj_pump-01", t("boilerpumpe")),
                ]),
            ],
        };
    }
}

customElements.define("froeling-boiler-card", FroelingBoilerCard);

class FroelingPufferCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = "/local/community/lovelace-froeling-card/puffer.svg";
    }

    static getStubConfig() {
        return {
            entities: {
                'txt_pump-01-rpm': {
                    entity: 'sensor.froeling_puffer_1_pufferpumpen_ansteuerung',
                    displayId: 'pump-01-rpm',
                    display: true,
                },
                'txt_buffer-load': {
                    entity: 'sensor.froeling_puffer_1_ladezustand',
                    displayId: 'buffer-load',
                    display: true,
                },
                'txt_buffer-lower-sensor': {
                    entity: 'sensor.froeling_puffer_1_temperatur_unten',
                    displayId: 'buffer-lower-sensor',
                    display: true,
                },
                'txt_buffer-middle-sensor': {
                    entity: 'sensor.froeling_puffer_1_temperatur_mitte',
                    displayId: 'buffer-middle-sensor',
                    display: true,
                },
                'txt_buffer-upper-sensor': {
                    entity: 'sensor.froeling_puffer_1_temperatur_oben',
                    displayId: 'buffer-upper-sensor',
                    display: true,
                },
                'obj_pump': {
                    entity: 'binary_sensor.froeling_puffer_1_pumpe_an_aus',
                    stateClasses: {
                        'on': 'stPumpActive',
                        'default': 'stPumpInActive',
                    },
                },
            },
        };
    }

    static getConfigForm() {
        return {
            schema: [
                entityGroup("entities", t("pufferspeicher"), [
                    textEntity("txt_buffer-upper-sensor", t("temperatur-oben")),
                    textEntity("txt_buffer-middle-sensor", t("temperatur-mitte")),
                    textEntity("txt_buffer-lower-sensor", t("temperatur-unten")),
                    textEntity("txt_buffer-load", t("ladezustand")),
                    textEntity("txt_pump-01-rpm", t("pumpen-ansteuerung")),
                    binaryEntity("obj_pump", t("pufferpumpe")),
                ]),
            ],
        };
    }
}
customElements.define("froeling-puffer-card", FroelingPufferCard);

class FroelingZirkulationspumpeCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = "/local/community/lovelace-froeling-card/zirkulationspumpe.svg";
    }

    static getStubConfig() {
        return {
            entities: {
                'txt_circulation-pump-rpm': {
                    entity: 'sensor.froeling_drehzahl_der_zirkulations_pumpe',
                    displayId: 'circulation-pump-rpm',
                    display: true,
                },
                'txt_circulation-temp': {
                    entity: 'sensor.froeling_rucklauftemperatur_an_der_zirkulations_leitung',
                    displayId: 'circulation-temp',
                    display: true,
                },
                'obj_pump-01': {
                    entity: 'binary_sensor.froeling_zirkulationspumpe_an_aus',
                    stateClasses: {
                        'on': 'stPumpActive',
                        'default': 'stPumpInActive',
                    },
                },
            },
        };
    }

    static getConfigForm() {
        return {
            schema: [
                entityGroup("entities", t("zirkulationspumpe"), [
                    textEntity("txt_circulation-temp", t("rucklauftemperatur")),
                    textEntity("txt_circulation-pump-rpm", t("pumpen-ansteuerung")),
                    binaryEntity("obj_pump-01", t("zirkulationspumpe")),
                ]),
            ],
        };
    }
}

customElements.define("froeling-zirkulationspumpe-card", FroelingZirkulationspumpeCard);

class FroelingSolarthermieCard extends BaseFroelingCard {
    constructor() {
        super();
        this.svgUrl = "/local/community/lovelace-froeling-card/solarthermie.svg";
    }

    static getStubConfig() {
        return {
            entities: {
                'txt_pump-01-rpm': {
                    entity: 'sensor.froeling_kollektor_pumpe',
                    displayId: 'pump-01-rpm',
                    display: true,
                },
                'txt_operating-hours': {
                    entity: 'sensor.froeling_kollektor_pumpe_laufzeit',
                    displayId: 'operating-hours',
                    display: true,
                },
                'txt_outside-temp': {
                    entity: 'sensor.froeling_aussentemperatur',
                    displayId: 'outside-temp',
                    display: true,
                },
                'txt_solar-temp': {
                    entity: 'sensor.froeling_kollektortemperatur',
                    displayId: 'solar-temp',
                    display: true,
                },
                'txt_return-temp': {
                    entity: 'sensor.froeling_kollektor_rueklauftemperatur',
                    displayId: 'return-temp',
                    display: true,
                },
                'txt_flow-temp': {
                    entity: 'sensor.froeling_kollektor_vorlauftemperatur',
                    displayId: 'flow-temp',
                    display: true,
                },
                'obj_pump-01': {
                    entity: 'binary_sensor.froeling_kollektorpumpe_an_aus',
                    stateClasses: {
                        'on': 'stPumpActive',
                        'default': 'stPumpInActive',
                    },
                },
            },
        };
    }

    static getConfigForm() {
        return {
            schema: [
                entityGroup("entities", t("solarthermie"), [
                    textEntity("txt_outside-temp", t("aussentemperatur")),
                    textEntity("txt_solar-temp", t("kollektortemperatur")),
                    textEntity("txt_flow-temp", t("vorlauftemperatur")),
                    textEntity("txt_return-temp", t("rucklauftemperatur")),
                    textEntity("txt_operating-hours", t("betriebsstunden")),
                    textEntity("txt_pump-01-rpm", t("pumpen-ansteuerung")),
                    binaryEntity("obj_pump-01", t("kollektorpumpe")),
                ]),
            ],
        };
    }
}
customElements.define("froeling-solarthermie-card", FroelingSolarthermieCard);

// Register cards in Lovelace

if (window.customCards) {
    window.customCards.push(
        {
            type: "froeling-kessel-card",
            name: "Froeling Kessel Card",
            description: "Visuelle Darstellung Fröling - Kessel",
            preview: true,
            documentationURL: "https://github.com/GyroGearl00se"
        },
        {
            type: "froeling-zweitkessel-card",
            name: "Froeling Zweitkessel Card",
            description: "Visuelle Darstellung Fröling - Zweitkessel",
            preview: true,
            documentationURL: "https://github.com/GyroGearl00se"
        },
        {
            type: "froeling-kessel-ohne-pellets-card",
            name: "Froeling Kessel ohne Pellets Card",
            description: "Visuelle Darstellung Fröling - Kessel (ohne Pellets)",
            preview: true,
            documentationURL: "https://github.com/GyroGearl00se"
        },
        {
            type: "froeling-heizkreis-card",
            name: "Froeling Heizkreis Card",
            description: "Visuelle Darstellung Fröling - Heizkreis",
            preview: true,
            documentationURL: "https://github.com/GyroGearl00se"
        },
        {
            type: "froeling-austragung-card",
            name: "Froeling Austragung Card",
            description: "Visuelle Darstellung Fröling - Austragung",
            preview: true,
            documentationURL: "https://github.com/GyroGearl00se"
        },
        {
            type: "froeling-boiler-card",
            name: "Froeling Boiler Card",
            description: "Visuelle Darstellung Fröling - Boiler",
            preview: true,
            documentationURL: "https://github.com/GyroGearl00se"
        },
        {
            type: "froeling-puffer-card",
            name: "Froeling Puffer Card",
            description: "Visuelle Darstellung Fröling - Puffer",
            preview: true,
            documentationURL: "https://github.com/GyroGearl00se"
        },
        {
            type: "froeling-zirkulationspumpe-card",
            name: "Froeling Zirkulationspumpe Card",
            description: "Visuelle Darstellung Fröling - Zirkulationspumpe",
            preview: true,
            documentationURL: "https://github.com/GyroGearl00se"
        },
        {
            type: "froeling-solarthermie-card",
            name: "Froeling Solarthermie Card",
            description: "Visuelle Darstellung Fröling - Solarthermie",
            preview: true,
            documentationURL: "https://github.com/GyroGearl00se"
        }
    );
}
