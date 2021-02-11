// module.exports = app => {
//   const db = require("../models");
//   const Users = db.users;
//     const users = require("../controller/users.controller.js");
    



//   var router = require("express").Router();
    
//     // for User 
//       router.post("/v1/user/self", users.create);
//       router.get("/v1/user/self",users.findOne);
//     router.put("/v1/user/self", users.update);
//     router.get("/v1/user/:id", users.findUser);
   
//      router.get("/v1/questions", users.getAllQuestions);
     
    
//       app.use(router);
//   };

const express = require('express');
const users = require("../controller/users.controller.js");

const router = express.Router();




// Create User
router.post('/', users.create);

//Get User Information
router.get('/self', users.findOne);

// Update User Information
router.put('/self', users.update);

//Get User Infromation
router.get('/:id', users.findUser);

// router.get("/v1/questions", users.getAllQuestions);

module.exports = router;