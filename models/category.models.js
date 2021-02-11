const bcrypt = require("bcrypt");
const { UUIDV4, UUID } = require("sequelize/lib/data-types");
const uuid = require('uuid');
const uuidv4 = require('uuidv4');

module.exports = (sequelize, Sequelize) => {
    const Categories = sequelize.define("categories", {

        category_id: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            unique: true,
        },
      
        category: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
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
//   questions.associate = function(models) {
//     questions.belongsTo(models.Users, {foreignKey: 'userId'})
//      questions.belongsTo(models.answers, {foreignKey: 'answerId'})
//      questions.belongsTo(models.categories, {foreignKey: 'categoryId'})
//   };
   
    return Categories;
  };