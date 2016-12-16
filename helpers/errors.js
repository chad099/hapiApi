exports.joiErrorMap = function (err) {
    "use strict";

    var errors = {};
    err.details.forEach(function (err) {
        errors[err.path] = err.message;
    });
    return errors;
};
