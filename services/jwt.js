'use strict';

const jwt = require('jsonwebtoken');
const config = require('config');

exports.sign = (data) => {
  return jwt.sign(
    data,
    config.secret,
    { algorithm: 'HS256', expiresIn: '100d' }
  );
};

exports.verify = (token) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      token,
      config.secret,
      (err, decoded) => {
        if (err) {
          return reject(err);
        }

        resolve(decoded);
      }
    );
  })
};

