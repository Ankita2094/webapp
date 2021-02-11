const bcrypt = require("bcrypt");
const { UUIDV4, UUID } = require("sequelize/lib/data-types");
const uuid = require('uuid');
const uuidv4 = require('uuidv4');

module.exports = (sequelize, Sequelize) => {
    const Users = sequelize.define("users", {

      id: {
        type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
          autoIncrement: false,
          defaultValue: Sequelize.UUIDV4
        
      },

      emailAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
        isEmail: {
        msg: "Must be a valid email address",
        }
      }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
        len: [8,12],
        
        }
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
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

    },{
      hooks: {
        beforeCreate: (users) => {
          const salt = bcrypt.genSaltSync();
          users.password = bcrypt.hashSync(users.password, salt);
        }
      },
      instanceMethods: {
        validPassword: function(password) {
          return bcrypt.compareSync(password, this.password);
        }
      }    
  });
  Users.prototype.toJSON =  function () {
    var values = Object.assign({}, this.get());
  
    delete values.password;
    return values;
  }
  // Users.beforeCreate(users => users.id = uuidv4());

   
    return Users;
  };