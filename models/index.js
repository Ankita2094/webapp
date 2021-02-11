const dbConfig = require("../dbConfig.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: '0',

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./users.models.js")(sequelize, Sequelize);
db.answers = require("./answer.model.js")(sequelize, Sequelize);
db.categories = require("./category.models.js")(sequelize, Sequelize);
db.questions = require("./questions.model.js")(sequelize, Sequelize);
db.file = require('./file.model.js')(sequelize,Sequelize);

db.users.hasMany(db.questions, {as: 'questions', foreignKey: 'userId'});
db.questions.hasMany(db.answers, {as: 'answers', foreignKey:'question_id'});
db.users.hasMany(db.answers, {as: 'answers', foreignKey:'userId'});
db.questions.belongsToMany(db.categories, { as: 'categories', through: 'questionCategory', foreignKey: 'question_id', otherKey: 'category_id' });
db.categories.belongsToMany(db.questions, { as:'questions', through: 'questionCategory', foreignKey: 'category_id', otherKey: 'question_id' });
db.questions.hasMany(db.file, {as: 'attachments', foreignKey:'question_id'});
db.answers.hasMany(db.file, {as: 'attachments', foreignKey:'answer_id'});


module.exports = db;

