'use strict';
const joi = require('joi');
const objectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const hoek = require('hoek');

const Session = BaseModel.extend({
  // instance prototype
  constructor: function (attrs) {
    objectAssign(this, attrs);
  },
});

Session._collection = 'sessions'; // the mongo collection name

Session.schema = joi.object().keys({
  deviceType:      joi.string(),
  user_id:         joi.number(),
  api_token:       joi.string(),
  createdAt:       joi.date(),
});

Session.updateSession = function(Session, data, cb) {
  const updateData =  {user_id: data._id.toString(), deviceType: data.deviceType,  api_token: data.accessToken};
  const filter =  {user_id: data._id.toString(), deviceType: data.deviceType};
  Session.findOne(filter, [], function(err, result) {
        if(err) {
          cb(err);
        }

        if(!result) {
            Session.insertOne(updateData, [], function(err , result){
                  if(err) {
                    cb(err);
                  }
                cb(true);
            });
        } else {
          Session.updateOne(filter, {$set: updateData}, {}, function(err, result) {
                if(err) {
                  cb(err, false);
                }
                cb(true, true);
          });
        }
  });
};

module.exports = Session;
