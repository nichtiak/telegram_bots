const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
  'game_bot',
  'root',
  'root',
  {
    host: '5.188.77.173',
    port: '6432',
    dialect: 'postgres'
  }
)