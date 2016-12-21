var Sequelize = require("sequelize"),
    log = require('src/utils/logger')(module),
    config = require('config').db;

var database = require('src/db');

if (!config) {
    log.error('Please provide database configurations in config.pg.');
    process.exit(1);
}

log.info('=>Database configuration - ', config);


var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    define: {
        timestamps: false // true by default
    },
    pool: {
        max: config.maxPoolSize,
        min: config.minPoolSize,
        idle: config.idleConnectionTimeout
    }
});


var models = {
    Sequelize: sequelize,
    Clusters: sequelize.import(__dirname + '/clusters'),
    Nodes: sequelize.import(__dirname + '/nodes'),
    Jobs: sequelize.import(__dirname + '/jobs')
};

module.exports = models;
// export connection
module.exports.sequelize = sequelize;

database.set(models, sequelize);