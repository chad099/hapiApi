'use strict';

const path = require('path');
process.env.NODE_CONFIG_DIR = path.join(__dirname, 'config');

var glue = require('glue');
var manifest = require('./manifest');


const options = {
  relativeTo: __dirname,
};

glue.compose(manifest, options, (err, server) => {
  if (err) {
    throw err;
  }
  server.start((err) => {
    if (err) {
      return console.error(err);
    }

    var api = server.connections[0];
    console.log(`Api started at: ${api.info.uri}`);

  });

});
