var BaseModel       = require('hapi-mongo-models').BaseModel,
    ObjectAssign    = require('object-assign'),
    Joi             = require('joi'),
    Helpers         = require('../helpers/index'),
    Promise         = require('promise'),
    _               = require('lodash'),
    ObjectID        = require('mongodb').ObjectID;


var Data = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    }
});
module.exports = Data;
Data.findData = function (query, projection, findOne) {
    "use strict";

    var self = this,
        name = "find",
        options = {};

    if (findOne) {
        name = "findOne";
    }


    return new Promise(function (resolve, reject) {
        if (_.has(query, '$limit')) {
            options.limit = parseInt(query.$limit, 10);
            delete query.$limit;
        }

        if (_.has(query, '$skip')) {
            options.skip = parseInt(query.$skip, 10);
            delete query.$skip;
        }

        if (_.has(query, '$orderby')) {
            options.sort =  query.$orderby;
            delete query.$orderby;
        }

        if (_.has(query, '$sort')) {
            options.sort =  query.$sort;
            delete query.$sort;
        }

        if (query.$query) {
            query = query.$query;
        }

        if (typeof query._id === 'string') {
            query._id =  new ObjectID(query._id);
        }


        if (query._id && query._id.$in) {
            var objArray = query._id.$in;
            for (var i in objArray) {
                objArray[i] = new ObjectID(objArray[i]);
            }
            query._id.$in = objArray;
        }


        self[name](query, (projection ? projection : {}), options, function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });
};

Data.saveData = function (model, options) {
    "use strict";

    var self = this;
    if (model._id) {
        delete model._id;
    }
    return new Promise(function(resolve, reject) {
            //var name = "insertOne";
            //if (Object.prototype.toString.call(data) == '[object Array]') {
            //    name = "insertMany";
            //}
            if (_.isArray(model)) {
                _.map(model, function (item){
                    newRecordDefaults(item);
                });
            } else {
                newRecordDefaults(model);
            }
            self.insert(model, (options ? options : {}), function (err, res) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res.ops[0]);
                    }
                });
    });
};

Data.updateData = function (idOrQuery, model, options) {
    "use strict";
    var self = this;
    return new Promise(function (resolve, reject) {
        if (!idOrQuery || !model) {
            reject("one of required param is null or empty");
        }

        if (typeof idOrQuery === 'string' || Helpers.MongoHelper.getObjectName(idOrQuery) === 'ObjectID') {
            idOrQuery = {_id: new ObjectID(idOrQuery)};
        } else if (typeof idOrQuery._id === 'string') {
            idOrQuery._id = new ObjectID(idOrQuery._id);
        }

        if (idOrQuery._id && idOrQuery._id.$in) {
            var objArray = idOrQuery._id.$in;
            for (var i in objArray) {
                objArray[i] = new ObjectID(objArray[i]);
            }
            idOrQuery._id.$in = objArray;
        }

        if (model._id) {
            delete model._id;
        }

        updateRecordDefaults(model);


        var updateObj = { $set: model};

        if (model.$inc) {
            updateObj.$inc = model.$inc;
            delete model.$inc;
        }

        if (model.$push) {
            updateObj.$push = model.$push;
            delete model.$push;
        }

        if (model.$addToSet) {
            updateObj.$addToSet = model.$addToSet;
            delete model.$addToSet;
        }

        if (model.$rename) {
            updateObj.$rename = model.$rename;
            delete model.$rename;
        }
        self
            .update(idOrQuery, updateObj, (options ? options : {}), function (err, res) {
                if (err) {
                    return reject(err);
                }

                if (!res) {
                    return reject("Unable to update data");
                }
                resolve(res.result.ok);
            });
    });
};

Data.updateById = function (id, data, options) {
    "use strict";

    var self = this;
    if (data._id) {
        delete data._id;
    }
    return new Promise(function (resolve, reject) {
        self
            .findByIdAndUpdate(id, data, options, function (err, res) {
                if (err) {
                    return reject(err);
                }

                if (!res) {
                    return reject("Unable to update data");
                }
                resolve(res);
            });
    });
};

Data.removeData = function (query) {
    "use strict";
    var self = this;
    if (typeof query._id === 'string') {
        query._id =  new ObjectID(query._id);
    }
    return new Promise(function (resolve, reject) {
        self
            .remove(query, function (err, res) {

                if (err) {
                    return reject(err);
                }

                if (!res) {
                    return reject("Unable to delete data");
                }
                resolve(res);
            });
    });
};


Data.aggregateData = function (pipeline, options) {
    "use strict";
    var self = this;
    return new Promise(function (resolve, reject) {
        self
            .aggregate(pipeline, options, function (err, res) {
                if (err) {
                    return reject(err);
                }

                if (!res) {
                    return reject("Unable to delete data");
                }
                resolve(res);
            });
    });
};

Data.countData = function(query) {
    "use strict";
    var self = this;
    return new Promise(function (resolve, reject) {
        self
            .count(query, function (err, res) {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            });
    });
};

function newRecordDefaults(obj) {
    if (obj) {
        obj.createdAt = obj.createdAt ? new Date(obj.createdAt) : new Date();
        obj.updatedAt = obj.updatedAt || null;
        obj.isDeleted = false;
    }
    return obj;
}

function updateRecordDefaults(obj) {
    obj.updatedAt = new Date();

    delete obj._id; //update not allows to have _id in model, so remove it.
    delete obj.v; //update not allows to have _id in model, so remove it.
    delete obj.isDeleted;
    delete obj.createdAt;
}
