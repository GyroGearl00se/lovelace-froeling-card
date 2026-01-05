# Froeling Card

A custom Home Assistant card for visualizing and interacting with Froeling systems. This card provides a visual representation of various Froeling components, such as boilers, pumps, and sensors, using SVG graphics and dynamic updates based on Home Assistant entities.

[![Cards Overview](img/froeling-cards.png)](#)

## Features
- Dynamic SVG updates based on Home Assistant entity states.
- Support for multiple Froeling components (e.g., boiler, buffer, circulation pump).
- Easy integration with Home Assistant Lovelace dashboards.

## Installation

### via HACS (recommended)
[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=GyroGearl00se&repository=lovelace-froeling-card&category=Dashboard)

1. Ensure that [HACS](https://hacs.xyz/) is installed in your Home Assistant setup.
3. Search for "Froeling Card" in HACS and install it.
4. Restart Home Assistant.

### Manual
- Download the latest release from: https://github.com/GyroGearl00se/lovelace-froeling-card/releases
- Copy the content of the dist folder into your Home Assistant custom cards folder /homeassistant/www/community/lovelace-froeling-card/.
- Restart Home Assistant.
- Add the cards to your dashboard.


## Usage

Add the card to your Lovelace dashboard and configure your entities accordingly.


## License

This project is licensed under the MIT License. See the LICENSE file for details.
