'use strict';

const Hoek = require('hoek');
const HapiAuthCookie = require('hapi-auth-cookie');
const ObjectId = require('mongodb').ObjectID;
const Bell = require('bell');
const Config = require('config');

const _ = require('lodash');

exports.register = function (server, options, next) {
  const settings = Hoek.clone(options);
  const env = process.env.NODE_ENV || 'development';


  //Auth
  server.register([Bell, HapiAuthCookie], function (err) {

    server.auth.strategy(
      'facebook',
      'bell',
      {
        provider: "facebook",
        password: Config.facebook.password,
        clientId: Config.facebook.clientId,
        clientSecret: Config.facebook.clientSecret,
        isSecure: false,
        location:server.info.uri
      }
    );

    server.auth.strategy(
      'twitter',
      'bell',
      {
        provider: "twitter",
        password: Config.twitter.password,
        clientId: Config.twitter.clientId,
        clientSecret: Config.twitter.clientSecret,
        isSecure: false
      }
    );

    server.auth.strategy(
      'google',
      'bell',
      {
        provider: "google",
        password: Config.google.password,
        clientId: Config.google.clientId,
        clientSecret: Config.google.clientSecret,
        isSecure: false
      }
    );

    server.auth.strategy(
      'instagram',
      'bell',
      {
        provider: "instagram",
        password: Config.instagram.password,
        clientId: Config.instagram.clientId,
        clientSecret: Config.instagram.clientSecret,
        scope: ['basic','follower_list'],
        isSecure: false
      }
    );

    server.auth.strategy(
      'session',
      'cookie',
      {
        password: settings.appSecret,
        isSecure: false,
        isHttpOnly: true,
        clearInvalid: true,
        keepAlive: true,
        ttl: (1000 * 60 * 60 ) * 24,
        validateFunc: function (request, authUser, cb) {
          const User = request.server.plugins['hapi-mongo-models'].User;

          User.findOne({_id: new ObjectId(authUser.id)}, function (err, user) {
            if(user) {
              return cb(null, true, user);
            }
            cb(err);
          });
        }
      }
    );
  });


  //Need heart-beat route to tell load-balancer that app is ok
  server.route({
    path: '/heart-beat',
    method: 'GET',
    handler: function (request, reply) {
      reply('Ok');
    }
  });

  next();

};

exports.register.attributes = {
  name: 'AppCommons'
};
