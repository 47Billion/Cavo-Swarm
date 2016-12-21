var log = require('src/utils/logger')(module);

var models, sequelize;
log.info('<--------<>getting models ready<>-------->');
module.exports.get = function (model) {
    return models[model];
}

module.exports.getSequelizeInstance = function () {
    return sequelize;
}


module.exports.set = function (dbModels, db) {
    models = dbModels;
    sequelize = db;
}