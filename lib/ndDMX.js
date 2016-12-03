'use strict';

let dmxTypes = require('./ndDMXTypes');

class ndDMX {

  constructor(args) {
    this.data = {};
    this.devices = args.devices;
  }

  /**
   * Init all devices with a default value of 0.
   */
  init() {
    let default_input = new Array(8);
    default_input.fill(0);

    // Map data to all slave devices using the specific address
    for (var device_name in this.devices) {

      // Get the device
      var device = this.devices[device_name];

      this.updateDevice(device, default_input);

    }

  } // / init()


  /**
   * Update the channels for the specified device using an input array.
   *
   * @TODO: Add input validation
   */
  updateDevice(device, input) {

    var _address = device.address - 1;

    if (device.type === dmxTypes.TYPE_STAIRVILLE_LED_PAR) {
      // Red
      this.data[_address + 0] = input[0];
      // Green
      this.data[_address + 1] = input[1];
      // Blue
      this.data[_address + 2] = input[2];
    }

    if (device.type === dmxTypes.TYPE_STAIRVILLE_S_150) {
      // On/Off
      this.data[_address + 0] = input > 0 ? 255 : 0;
    }

  } // / updateDevice()

}

module.exports = ndDMX;
