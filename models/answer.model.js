const bcrypt = require("bcrypt");
const { UUIDV4, UUID } = require("sequelize/lib/data-types");
const uuid = require('uuid');
const uuidv4 = require('uuidv4');

module.exports = (sequelize, Sequelize) => {
    const Answers = sequelize.define("answers", {
      answer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
  
    answer_text: {
        type: Sequelize.STRING,
        allowNull: false
    
  
  },
     
      createdAt: {
        type : Sequelize.DATE,
        noUpdate: true,
        allowNull: false
        
      },
      updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
        noUpdate: true,
        
      }

    },{});
  
  
  // Users.beforeCreate(users => users.id = uuidv4());
  // answers.associate = function(models) {
  //   answers.hasOne(models.Users, {foreignKey: 'userId'})
  //   // answers.belongsTo(models.questions, {foreignKey: 'questionId'})
  // };
   
    return Answers;
  };