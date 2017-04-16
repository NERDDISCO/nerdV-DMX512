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
    name : 'nye2016',

    master : {
      driver : 'enttec-usb-dmx-pro',
      usb_device : '/dev/cu.usbserial-EN193448'
    },

    slaves : {
      // 'starburst' : {
      //   type : dmxTypes.ADJ_STARBURST,
      //   address : 1,
      //   channels : 12
      // },
      //
      // 'ledBar' : {
      //   type : dmxTypes.CAMEO_PIXBAR_600_PRO,
      //   address : 13,
      //   channels : 74
      // },

      // 'fogMaschine' : {
      //   type : dmxTypes.TYPE_STAIRVILLE_S_150,
      //   address : 511,
      //   channels : 1
      // },

      'bubbleMachine' : {
        type : dmxTypes.EUROLITE_B_100,
        address : 16,
        channels : 2
      },

      'light1' : {
        type : dmxTypes.TYPE_CAMEO_LED_PAR,
        address : 100
      },

      'light2' : {
        type : dmxTypes.TYPE_CAMEO_LED_PAR,
        address : 108
      },

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
    connection.on('text', function (dmxData) {
      if (debug) {
        console.log(dmxData);
      }

      dmxData = JSON.parse(dmxData);

      if (dmxData._type === 'nerdVCommander') {
        NERDDISCO_dmx.fog = dmxData.fog;
        NERDDISCO_dmx.bubbles = dmxData.bubbles;
        NERDDISCO_dmx.uv = dmxData.uv;
        NERDDISCO_dmx.dimmer = dmxData.dimmer;
        NERDDISCO_dmx.pixel_off = dmxData.pixel_off;
        NERDDISCO_dmx.strobe = dmxData.strobe;
        NERDDISCO_dmx.strobe_frequency = dmxData.strobe_frequency;
        NERDDISCO_dmx.rotation = dmxData.rotation;
        NERDDISCO_dmx.rotation_speed = dmxData.rotation_speed;

      } else {
        NERDDISCO_dmx.pixel = dmxData.average;
      }

      /*
       * Update DMX devices
       */
      //  NERDDISCO_dmx.updateDevice(universe.slaves.ledBar, []);
      //  NERDDISCO_dmx.updateDevice(universe.slaves.starburst, []);
       NERDDISCO_dmx.updateDevice(universe.slaves.light1, []);
       NERDDISCO_dmx.updateDevice(universe.slaves.light2, []);
      //  NERDDISCO_dmx.updateDevice(universe.slaves.fogMaschine, []);
       NERDDISCO_dmx.updateDevice(universe.slaves.bubbleMachine, []);

       if (debug) {
         console.log(JSON.stringify(NERDDISCO_dmx.data));
       }

      // Update the universe
      dmx_connector.update(universe.name, NERDDISCO_dmx.data);
    });

    function broadcast(server, msg) {
    server.connections.forEach(function (conn) {
        conn.sendText(msg)
    })
  }



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
