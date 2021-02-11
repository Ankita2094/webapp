const bcrypt = require("bcrypt");
const { UUIDV4, UUID } = require("sequelize/lib/data-types");
const uuid = require('uuid');
const uuidv4 = require('uuidv4');

module.exports = (sequelize, Sequelize) => {
    const Questions = sequelize.define("questions", {

        question_id: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            unique: true,
        },
      
        question_text: {
            type: Sequelize.STRING,
            allowNull: false
        },
      
      updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
        noUpdate: true,
        
      },
      createdAt: {
        type : Sequelize.DATE,
        noUpdate: true,
        allowNull: false
        
      }

    },{});
  
  
  // Users.beforeCreate(users => users.id = uuidv4());
//   questions.associate = function(models) {
//     questions.belongsTo(models.Users, {foreignKey: 'userId'})
//      questions.hasMany(models.answers, {foreignKey: 'answerId'})
//      questions.hasMany(models.categories, {foreignKey: 'categoryId'})
//   };
   
    return Questions;
  };