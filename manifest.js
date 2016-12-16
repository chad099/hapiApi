'use strict';
const config = require('config');
const Handlebars = require('handlebars');
const Path = require('path');
const process = require('process');


module.exports = {
  server: {},

  connections: [
    {
      host: config.api.host, port: process.env.PORT || config.api.port, labels: ['web'],
      routes: {
        files: {
          relativeTo: Path.join(__dirname, 'views/js')
        }
      }
    },
  ],

  registrations: [

    {
      plugin: {
        register: './plugins/auth',
        options: {},
      },
    },
    {
      plugin: {
        register: 'hapi-router',
        options: {
          routes: 'controllers/**/**/**/*Controller.js',
        },

      },
    },
    {
      plugin: {
        register: 'hapi-mongo-models',
        options: {
          mongodb: {
            url: config.mongoDb.url,
            options: config.mongoDb.options,
          },
          autoIndex: false,
          models: require('./models')
        },
      },
    },
    {
      plugin: {
        register: 'good',
        options: {
          reporters: {
            console: [
              {
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{log: '*', response: '*', error: '*'}]
              },
              {
                module: 'good-console',
              },
              'stdout',
            ],
          },
        },
      },
    },

  ],

};
