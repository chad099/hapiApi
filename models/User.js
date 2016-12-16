'use strict';
const joi = require('joi');
const objectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const hoek = require('hoek');

const User = BaseModel.extend({
    // instance prototype
    constructor: function (attrs) {
        objectAssign(this, attrs);
    },
});

User._collection = 'users'; // the mongo collection name

User.schema = joi.object().keys({
    name:            joi.string(),
    email:           joi.string().required(),
    password:        joi.string(),
    confirmPassword: joi.string(),
    passwordHash:    joi.string(),
    salt:            joi.string(),
    DOB:             joi.string(),
    gender:          joi.boolean(),
    countryCode:     joi.string(),
    phone:           joi.number(),
    createdAt:       joi.date(),
    resetPassword:   joi.object(),
    unknownField:    joi.string(),
    role:            joi.string(),
});

User.sanitize = function (user) {
    let clone = hoek.clone(user);
    delete clone.password;
    delete clone.salt;
    delete clone.passwordHash;
    delete clone.resetPassword;

    return clone;
};

module.exports = User;
