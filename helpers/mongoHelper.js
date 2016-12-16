exports.getObjectName = function (obj) {
    'use strict';
    var funcNameRegex = /function (.{1,})\(/,
        results = (funcNameRegex).exec((obj).constructor.toString());
    return (results && results.length > 1) ? results[1] : "";
};
