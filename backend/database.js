const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('metrics_dashboard', 'root', 'Nothing@4679', {
    host: 'localhost',
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
