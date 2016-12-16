var crypto  = require('crypto'),
    options = {
        saltLen: 32,
        iterations: 1000,
        keyLen: 256
    };

function sha512(salt, hash, pwd, cb) {
    'use strict';
    var digest = pwd + salt,
        i = 0;

    for (i; i < 20; i ++) {
        digest = crypto.createHash('sha512').update(digest).digest('hex');
    }

    cb(null, digest === hash);
}

function pbkdf2Pwd(salt, hash, password, cb) {
    'use strict';
    crypto.pbkdf2 ( password, salt, options.iterations, options.keyLen, function(err, hashRaw) {
        if (err) {
            return cb(err);
        }

        var hashedTxt = new Buffer(hashRaw).toString('hex');

        cb(null, hashedTxt === hash);
    });
}

exports.getHash = function (len, cb) {
    'use strict';
    if(typeof len === 'function') {
        cb = len;
        len = options.saltLen;
    }

    crypto.randomBytes (len, function ( err, buf ) {
        if (err){
            cb(err);
        } else {
            cb(null, buf.toString('hex'));
        }
    });
};

exports.encryptPassword = function ( password, cb ) {
    'use strict';
    if (!password) {
        return cb(new Error("Password argument not set!"));
    }

    exports.getHash (function ( err, salt ) {
        if (err) {
            return cb(err);
        }
        crypto.pbkdf2(password, salt, options.iterations, options.keyLen, function(err, hashRaw) {
            if (err) {
                return cb(err);
            }
            var hash = new Buffer(hashRaw).toString('hex');
            cb(null, salt, hash);
        });
    });
};

exports.decryptPassword = function (salt, hash, password, encType, cb){
    'use strict';
    if (!cb && typeof  encType === 'function') {
        cb = encType;
        encType = null;
    }

    if(!salt || !hash || !password) {
        var msg = "DecryptPassword, missing or null parameter";
        cb(msg);
        return;
    }

    if (typeof encType === 'function') {
        cb = encType;
        encType = '';
    }

    if (encType === 'sha512') {
        sha512(salt, hash, password, cb);
    } else {
        pbkdf2Pwd(salt, hash, password, cb);
    }
};
