'use strict';

var DMX = require('DMX');
let ndDMX = require('./lib/ndDMX');
let dmxTypes = require('./lib/ndDMXTypes');
let ws = require('nodejs-websocket');

let port = 1337;
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





/**
 * Create a WebSocket server
 */
 let server = ws.createServer(function (connection) {

    console.log('New connection');

    // Receive data
    connection.on('text', function (data) {
      if (debug) {
        console.log(data);
      }

      data = JSON.parse(data);

      /*
       * Update DMX devices
       */
      NERDDISCO_dmx.updateDevice(universe.slaves.light1, data.slice(0, 3));
      NERDDISCO_dmx.updateDevice(universe.slaves.light2, data.slice(3, 6));
      NERDDISCO_dmx.updateDevice(universe.slaves.fogMaschine, data.slice(6, 7));

      if (debug) {
        console.log(NERDDISCO_dmx.data);
      }

      // Update the universe
      dmx_connector.update(universe.name, NERDDISCO_dmx.data);
    });


    
    connection.on('close', function (code, reason) {
      console.log('Connection closed');
    });



    connection.on('error', function (error) {
      if (error.code !== 'ECONNRESET') {
        // Ignore ECONNRESET and re throw anything else
        throw err;
      }
    });

}).listen(port);
