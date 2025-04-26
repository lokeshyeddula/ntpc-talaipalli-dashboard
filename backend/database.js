const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('bokbhxclupouxzvunpu1', 'uav3u2vxcgscuzwv', 'uav3u2vxcgscuzwv', {
    host: 'bokbhxclupouxzvunpu1-mysql.services.clever-cloud.com',
    dialect: 'mysql',
    logging: false
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
})();

module.exports = sequelize;
