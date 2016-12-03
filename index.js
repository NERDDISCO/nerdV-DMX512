'use strict';

var DMX = require('DMX');
let ndDMX = require('./ndDMX');
let dmxTypes = require('./ndDMXTypes');
let ws = require('nodejs-websocket');

let port = 1338;
let debug = true;

/*
 * Configure the universe
 */
let universe = {
    name : 'dotjs',

    master : {
      driver : 'enttec-usb-dmx-pro',
      usb_device : '/dev/cu.usbserial-EN193448'
    },

    slaves : {
      light1 : {
        type : dmxTypes.TYPE_STAIRVILLE_LED_PAR,
        address : 1
      },

      light2 : {
        type : dmxTypes.TYPE_STAIRVILLE_LED_PAR,
        address : 4
      },

      fogMaschine : {
        type : dmxTypes.TYPE_STAIRVILLE_S_150,
        address : 16
      }
    }
};

// Initialize DMX
let dmx_connector = new DMX();

// Add universe for dotJS
dmx_connector.addUniverse(
  universe.name,
  universe.master.driver,
  universe.master.usb_device
);

// Reset every device at startup
dmx_connector.updateAll(universe.name, 0);



// Initialize NERDDISCO DMX helper
let NERDDISCO_dmx = new ndDMX({ devices : universe.slaves });


/*
 * Testing
 */
let test_input = [
  125, 0, 0,
  0, 255, 50
];


/**
 * Create a WebSocket server
 */
let server = ws.createServer(function (conn) {

    console.log('New connection');

    // Receive data
    conn.on('text', function (data) {
      if (debug) {
        console.log(data);
      }

      data = JSON.parse(data);

      /*
       * Update DMX devices
       */
      NERDDISCO_dmx.updateDevice(universe.slaves.light1, test_input.slice(0, 3));
      NERDDISCO_dmx.updateDevice(universe.slaves.light2, test_input.slice(3, 6));
      NERDDISCO_dmx.updateDevice(universe.slaves.fogMaschine, false);

      if (debug) {
        console.log(NERDDISCO_dmx.data);
      }

      // Update the universe
      dmx_connector.update(universe.name, NERDDISCO_dmx.data);
    });



    conn.on('close', function (code, reason) {
        console.log('Connection closed');
    });

}).listen(port);
