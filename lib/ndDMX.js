'use strict';

let dmxTypes = require('./ndDMXTypes');
let Color = require('color');

class ndDMX {

  constructor(args) {
    this.data = {};
    this.devices = args.devices;

    this.white = 0;
    this.yellow = 0;

    this.fog = 0;
    this.bubbles = 0;
    this.pixel = [0, 0, 0];
    this.pixel_off = false;
    this.uv = 0;
    this.strobe = 0;
    this.strobe_frequency = 0;
    this.dimmer = 255;

    this.rotation = 0;
    this.rotation_speed = 0;

  }

  /**
   * Init all devices with a default value of 0.
   */
  init() {
    // Map data to all slave devices using the specific address
    for (var device_name in this.devices) {

      // Get the device
      var device = this.devices[device_name];

      let default_input = new Array(device.channels);
      default_input.fill(0);

      this.updateDevice(device, default_input);

    }

  } // / init()


  /**
   * Update the channels for the specified device using an input array.
   *
   * @TODO: Add input validation
   */
  updateDevice(device, input) {

    let currentColor = Color({r: this.pixel[0], g: this.pixel[1], b: this.pixel[2]});

    this.white = 0;
    this.yellow = this.rangeMapping(currentColor.cmyk().round().object().y, [0, 100], [0, 255]);

    if (this.rotation === 255) {
      this._rotation_speed = this.rotation_speed;
    } else {
      this._rotation_speed = 0;
    }

    var _address = device.address - 1;



    if (device.type === dmxTypes.TYPE_CAMEO_LED_PAR) {
      // Dimmer
      this.data[_address + 0] = this.dimmer;

      let white = 0;

      // Strobe
      if (this.strobe === 255) {
        let strobe_frequency_parlight = this.rangeMapping(this.strobe_frequency, [0, 255], [1, 255]);
        this.data[_address + 1] = strobe_frequency_parlight;
        white = strobe_frequency_parlight;
      } else {
        this.data[_address + 1] = 0;
      }

      // Red
      this.data[_address + 2] = this.pixel[0];
      // Green
      this.data[_address + 3] = this.pixel[1];
      // Blue
      this.data[_address + 4] = this.pixel[2];

      // White
      this.data[_address + 5] = white;
    }



    if (device.type === dmxTypes.TYPE_STAIRVILLE_S_150) {
      // On/Off
      this.data[_address + 0] = this.fog;
    }



    if (device.type === dmxTypes.EUROLITE_B_100) {
      // Motor
      this.data[_address + 0] = this.bubbles;
      // Fan
      this.data[_address + 1] = this.bubbles;
    }



    if (device.type === dmxTypes.ADJ_STARBURST) {

      let min_color = 60;

      // Red
      if (this.pixel[0] < min_color) {
        this.data[_address + 0] = 0;
      } else {
        this.data[_address + 0] = this.pixel[0];
      }

      // Green
      if (this.pixel[1] < min_color) {
        this.data[_address + 1] = 0;
      } else {
        this.data[_address + 1] = this.pixel[1];
      }

      // Blue
      if (this.pixel[2] < min_color) {
        this.data[_address + 2] = 0;
      } else {
        this.data[_address + 2] = this.pixel[2];
      }

      // White
      this.data[_address + 3] = 0;
      // Yellow
      this.data[_address + 4] = this.yellow;
      // UV
      this.data[_address + 5] = this.uv;
      // Strobe
      this.data[_address + 6] = 15;
      // Dimmer
      this.data[_address + 7] = this.dimmer;
      // Rotation
      this.data[_address + 8] = this._rotation_speed;
    }



    if (device.type === dmxTypes.CAMEO_PIXBAR_600_PRO) {
      // Dimmer
      this.data[_address + 0] = this.dimmer;

      let white = 0;

      // Strobe
      if (this.strobe === 255) {
        let strobe_frequency_pixbar = this.rangeMapping(this.strobe_frequency, [0, 255], [128, 250]);
        this.data[_address + 1] = strobe_frequency_pixbar;
        white = strobe_frequency_pixbar;
      } else {
        this.data[_address + 1] = 0;
      }

      // Iterate over all 12 LEDs
      for (let i = 2; i <= 72; i = i + 6) {

        if (this.pixel_off) {
            this.pixel = [0, 0, 0];
        }

        // Red
        this.data[_address + i] = this.pixel[0];
        // Green
        this.data[_address + i + 1] = this.pixel[1];
        // Blue
        this.data[_address + i + 2] = this.pixel[2];
        // White
        this.data[_address + i + 3] = white;
        // Yellow / Amber
        this.data[_address + i + 4] = 0;
        // UV
        this.data[_address + i + 5] = this.uv;
      }

    }

  } // / updateDevice()


  // Linear mapping of the given "value" of range "from" into range "to"
  // for example: rangeMapping(127, [0, 127], [0, 255]) -> 255
  rangeMapping(value, from, to) {
    return Math.floor(to[0] + (value - from[0]) * (to[1] - to[0]) / (from[1] - from[0]));
  }

}

module.exports = ndDMX;
