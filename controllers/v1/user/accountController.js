'use strict';
const joi = require('joi');
const boom = require('boom');
const Util = require('util');
const Config = require('config');
const ObjectId = require('mongodb').ObjectID;
const crypto = require('../../../services/crypto');
const random = require('../../../services/random');
const prefix = '/api/v1/user';
const jwt = require('../../../services/jwt');

module.exports = [
  // user registration.
  {
    method: 'POST',
    path: `${prefix}/register`,
    config: {
      validate: {          // Route validations check
        payload: {
          name: joi.string(),
          email: joi.string().email().min(6).required(),
          password: joi.string().min(6).required(),
          confirmPassword: joi.string().valid(joi.ref('password')).required(),
          DOB: joi.string(),
          gender: joi.boolean(),
          countryCode: joi.string(),
          phone: joi.number(),
        },
        options: {abortEarly: false},
      },
      handler: (request, reply) => {
        const User = request.server.plugins['hapi-mongo-models'].User;
        const Session = request.server.plugins['hapi-mongo-models'].Session;
        let payload = request.payload;
        const device = payload.deviceType || 'desktop';
        //Crypt password
        crypto
          .hashString(payload.password)
          .then((hashData) => {

            // lower case data
            payload.email = payload.email.toLowerCase();
            payload.role = 'user';
            // User uniqueness check.

            User.findOne({
                  email: payload.email
              }, (err, user) => {

              if (err) {
                return reply({error: true, statusCode: 400, message: 'Error while registering user', data: null});

              }
              if (user) {
                reply({error: true, statusCode: 400, message: 'Email already exists.', data: null});
              } else {
                // password encryption.
                payload.salt = hashData.salt;
                payload.passwordHash = hashData.hash;

                // remove unwanted fields
                delete payload.password;
                delete payload.confirmPassword;

                // validate model
                User.validate(payload, (err, createUser) => {
                  if (err) {
                    return reply({error: true, statusCode: 400, message: 'User validation failed', data: null});
                  }

                  // default values
                  createUser.createdAt = new Date().toISOString();

                  // Create New User
                  User.insertOne(createUser, [], function (err, user) {
                    if (err) {
                      return reply({error: true, statusCode: 400, message: "Error while registering user", data: null});
                    }
                    const id = user[0]._id.toString();
                    var data = {};
                    var accessToken = jwt.sign({id: user[0]._id.toString()});
                    User.findByIdAndUpdate(ObjectId(user[0]._id),
                      {$set: {"accessToken": accessToken}},
                      function (err, data) {
                        if (err) {
                          reply({error: true, statusCode: 400, message: 'Error while registering user.', data: null});
                        }
                        user[0].accessToken = accessToken;
                        user[0].deviceType = device;
                        Session.updateSession(Session, user[0], function(result) {
                          reply({error: false, statusCode: 201, message: 'registered successfully.', data: user[0]});
                        });
                      });

                    // elastic.elasticInsert(data, (err, res) => {
                    //   if (err) {
                    //     return reply({
                    //       error: true,
                    //       statusCode: 400,
                    //       message: 'User cannot be added to elastic search',
                    //       data: null
                    //     });
                    //   }
                    //   var accessToken = jwt.sign({id: newUser[0]._id.toString()});
                    //   User.findByIdAndUpdate(ObjectId(newUser[0]._id),
                    //     {$set: {"accessToken": accessToken}},
                    //     function (err, data) {
                    //       if (err) {
                    //         reply({error: true, statusCode: 400, message: 'Error while registering user.', data: null});
                    //       }
                    //       reply({error: false, statusCode: 201, message: 'registered successfully.', data: data});
                    //
                    //     })
                    // })
                  });
                });
              }
            });
          })
          .catch(reply);
      },
    },
  },
  // get user profile
  {
    method: 'GET',
    path:   `${prefix}`,
    config: {
      auth: 'jwt',
      handler: function(request, reply){
        const id = request.auth.credentials._id;
        const User = request.server.plugins['hapi-mongo-models'].Data;
          User._collection = 'users';
          User.findData({ _id: new ObjectId(id) }, {}, 1).then(function(data) {
              return reply({error: false, statusCode:201, message: 'Successfully fetch data', data: data});
          }).catch(function(err) {
              return reply({error: true, statusCode: 400, message: 'Error while fetching user data', data: null});
          })
      }
    }
  },
  // Forgot Password Functionality
  {
    method: 'PUT',
    path: `${prefix}/forgotPassword`,
    config: {
      validate: {
        payload: {
          email: joi.string().required(),
        },
      },
      handler: function (request, reply) {
        const User = request.server.plugins['hapi-mongo-models'].User;

        var Mailer = request.server.plugins['hapi-mailer'],
          email = request.payload.email,
          onError = function (err) {
            reply('Error while sending email').code(400);
          };
        crypto
          .randomString()
          .then(function (token) {
            User.findOne({email: email}, function (err, user) {
              if (!user) {
                return reply({error: true, statusCode: 400, message: 'Email address not found', data: null});
              }
              var dt = new Date();

              var data = {
                resetPassword: {
                  token: token,
                  expires: dt.setHours(dt.getHours() + 1)
                }
              };

              function UtilFormat(placeHolders, tokenVerify) {
                var verificationLinks = Util.format(placeHolders,
                  Config.api.url,
                  encodeURIComponent(tokenVerify),
                  encodeURIComponent(user._id)
                );
                return verificationLinks;
              }

              User.findByIdAndUpdate(
                user._id,
                {$set: data},
                function (err, data) {
                  var url = UtilFormat('%s/reset-password?token=%s&id=%s', token),
                    mailContext = {
                      username: user.email,
                      url: url
                    };

                  var mailData = {
                    from: Config.mailer.noReplyEmail,
                    to: user.email,
                    subject: 'Forgot Password',
                    html: {
                      path: 'forgot.html'
                    },
                    context: {
                      url: url,
                      username: user.email,
                      firstName: user.firstName
                    }
                  };

                  Mailer.send(mailData, function (err, info) {
                    if (!err) {
                      reply({
                        error: false,
                        message: 'reset password mail has sent to you registered email id. Please check your Email.',
                        data: null
                      });
                      request.cookieAuth.clear();
                    } else {
                      reply({error: true, statusCode: 400, message: 'Sending failed', data: null});
                    }
                  });
                });
            });
          });
      }
    }
  },

  //Reset Password Functionality
  {
    method: 'PUT',
    path: `${prefix}/resetPassword`,
    config: {
      validate: {
        payload: {
          password: joi.string().required(),
          token: joi.string(),
          id: joi.string()
        },
      },
      handler: function (request, reply) {
        const User = request.server.plugins['hapi-mongo-models'].User;
        const payload = request.payload;
        User.findOne({_id: new ObjectId(payload.id)}, function (err, user) {
          if (!err) {
            if (user.resetPassword && user.resetPassword.token === decodeURIComponent(payload.token)) {
              //Crypt password
              crypto
                .hashString(payload.password)
                .then((hashData) => {
                  // password encryption.
                  payload.salt = hashData.salt;
                  payload.passwordHash = hashData.hash;

                  // remove unwanted fields
                  delete payload.password;
                  delete payload.confirmPassword;
                  delete payload.token;

                  User.findByIdAndUpdate(
                    user._id,
                    {$set: payload},
                    function (err, data) {
                      if (err) {
                        reply({error: true, statusCode: 400, message: 'Error while updating.', data: null});
                      }
                      request.cookieAuth.clear();
                      reply({error: false, statusCode: 201, message: 'Password updated successfully.', data: null});

                    }
                  );

                });

            } else {
              reply({error: true, statusCode: 400, message: 'Token has been expired', data: null});
            }
          } else {
            reply({error: true, statusCode: 400, message: 'Error while resetting password', data: null});
          }
        });
      }
    }
  },

  // Pasword Change Functionality
  {
    method: 'PUT',
    path: `${prefix}/changePassword`,
    config: {
      auth:'jwt',
      validate: {
        payload: {
          oldPassword: joi.string().min(6).required(),
          password: joi.string().min(6).required()
        },
      },
      handler: function (request, reply) {
        const User = request.server.plugins['hapi-mongo-models'].User;
        const payload = request.payload;
        const id = request.auth.credentials._id
        let reportInvalid = () => {
          reply({error: true, message: 'Old password in invalid.', data: null});
        };
        User.findOne({_id: new ObjectId(id)}, function (err, user) {
          if (!err) {
            // Check old password

            const userSalt = user.salt;
            const userPassHash = user.passwordHash;

            crypto
              .hashStringWithSalt(payload.oldPassword, userSalt)
              .then((hashData) => {
                if (userPassHash === hashData.hash) {
                  //request.cookieAuth.set({id: user._id});
                  //const data = User.sanitize(user);
                  crypto
                    .hashString(payload.password)
                    .then((hashData) => {
                      // password encryption.
                      payload.salt = hashData.salt;
                      payload.passwordHash = hashData.hash;

                      // remove unwanted fields
                      delete payload.password;
                      delete payload.token;

                      User.findByIdAndUpdate(
                        user._id,
                        {$set: payload},
                        function (err, data) {
                          if (err) {
                            reply({error: true, statusCode: 400, message: 'Error while changing password', data: null});
                          }
                          request.cookieAuth.clear();
                          reply({error: false, statusCode: 201, message: 'Password changed successfully.', data: null});
                        }
                      );
                    });
                  //Crypt password
                }
                // End check old password
                else {
                  reportInvalid();
                }
              })
              .catch(reply);
          } else {
            reply({error: true, statusCode: 400, message: 'Error while changing pass', data: null});
          }
        });
      }
    }
  },
]
