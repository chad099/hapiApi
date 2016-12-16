// jscs:disable
'use strict';
const joi = require('joi');
const crypto = require('../../../services/crypto');
const boom = require('boom');
const prefix = '/api/v1/user';
const ObjectId = require('mongodb').ObjectID;
const jwt = require('../../../services/jwt');

module.exports = [

// Sign in  to the app
  {
    method: 'POST',
    path: `${prefix}/login`,
    config: {
      validate: {          // Route validations check
        payload: {
          email: joi.string().email().min(6).required(),
          password: joi.string().min(6).required(),
        },
        options: {abortEarly: false},
      },
      handler: (request, reply) => {
        const User = request.server.plugins['hapi-mongo-models'].User;
        const Session = request.server.plugins['hapi-mongo-models'].Session;
        const payload = request.payload;
        const device = payload.deviceType || 'desktop';
        let reportInvalid = () => {
          reply({error: true, statusCode:400, message: 'invalid email or password.', data: null});
        };

        User.findOne({email: payload.email.toLowerCase()}, function (err, user) {
          if (err) {
            return reply({error: true, statusCode:400, message: 'Error while user login', data: null});
          }

          if (!user) {
            return reportInvalid();
          }
          var accessToken = jwt.sign({id: user._id.toString(), deviceType: device});
          User.findByIdAndUpdate(ObjectId(user._id),
            {$set: {"accessToken": accessToken}},
            function (err, data) {
              if (err) {
                reply({error: true, statusCode: 400, message: 'Error while Login.', data: null});
              }

              const userSalt = user.salt;
              const userPassHash = user.passwordHash;
              crypto
                .hashStringWithSalt(payload.password, userSalt)
                .then((hashData) => {
                  if (userPassHash === hashData.hash) {
                    const data = User.sanitize(user);
                    data.deviceType = device;
                    Session.updateSession(Session, data, function(error, response){
                        if(!response) {
                            reply({error: true, statusCode: 400, message: 'Error while Login.', data: error});
                        } else {
                            return reply({error: false, statusCode:201, message: 'Login Successfully.', data: data});
                        }

                    });

                  }
                  else {
                    reportInvalid();
                  }
                })
                .catch(reply);

            });
        });
      },
    },
  },

// User sign out
  {
    path: `${prefix}/signout`,
    method: 'DELETE',
    config: {
      handler: function (request, reply) {
        reply({error: false, statusCode:201, message: 'LogOut Successfully', data: null});
      }
    }
  },
];
